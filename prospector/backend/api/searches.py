import asyncio
import json
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend import db
from backend.config import (
    MAX_LEADS_CONFIRM_THRESHOLD,
    MAX_LEADS_ABSOLUTE,
    APIFY_COST_PER_PLACE,
)
from backend.pipeline import progress, runner

logger = logging.getLogger("prospector")
router = APIRouter(prefix="/api/searches", tags=["searches"])


class SearchCreate(BaseModel):
    niche: str
    city: str | None = None
    state: str
    region: str | None = None
    quantity: int
    confirmed: bool = False
    include_duplicates: bool = False


@router.post("")
async def create_search(payload: SearchCreate):
    niche = payload.niche.strip()
    city = (payload.city or "").strip()
    state = payload.state.strip().upper()

    if not niche or not state:
        raise HTTPException(400, "Nicho e estado sao obrigatorios.")
    if payload.quantity < 1 or payload.quantity > MAX_LEADS_ABSOLUTE:
        raise HTTPException(400, f"Quantidade deve ser entre 1 e {MAX_LEADS_ABSOLUTE}.")

    if payload.quantity > MAX_LEADS_CONFIRM_THRESHOLD and not payload.confirmed:
        est_cost = payload.quantity * APIFY_COST_PER_PLACE
        return {
            "warning": "CONFIRM_LARGE_SEARCH",
            "message": f"Voce esta prestes a solicitar {payload.quantity} leads "
                       f"(~US$ {est_cost:.2f}). Confirmar?",
        }

    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO searches (niche, city, state, region, requested_count) VALUES (?,?,?,?,?)",
        (niche, city, state, payload.region, payload.quantity),
    )
    conn.commit()
    search_id = cur.lastrowid

    asyncio.create_task(
        runner.run_pipeline(
            search_id, niche, city, state, payload.region, payload.quantity,
            include_duplicates=payload.include_duplicates,
        )
    )

    return {"search_id": search_id}


@router.post("/{search_id}/include-duplicates")
async def include_duplicates_route(search_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT duplicate_lead_ids, status FROM searches WHERE id=?", (search_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Busca nao encontrada.")
    if row["status"] != "DONE":
        raise HTTPException(400, "Busca ainda nao foi concluida.")

    dup_ids = json.loads(row["duplicate_lead_ids"] or "[]")
    if not dup_ids:
        return {"added": 0}

    cur.execute("SELECT COALESCE(MAX(rank), 0) as max_rank FROM search_leads WHERE search_id=?", (search_id,))
    rank = cur.fetchone()["max_rank"]

    added = 0
    for lead_id in dup_ids:
        cur.execute("SELECT 1 FROM search_leads WHERE search_id=? AND lead_id=?", (search_id, lead_id))
        if cur.fetchone():
            continue
        rank += 1
        cur.execute(
            "INSERT INTO search_leads (search_id, lead_id, rank) VALUES (?, ?, ?)",
            (search_id, lead_id, rank),
        )
        added += 1

    cur.execute(
        "UPDATE searches SET results_count = results_count + ?, duplicate_lead_ids='[]' WHERE id=?",
        (added, search_id),
    )
    conn.commit()
    return {"added": added}


@router.get("/{search_id}")
async def get_search(search_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM searches WHERE id=?", (search_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Busca nao encontrada.")

    result = dict(row)
    live_progress = progress.get(search_id)
    if live_progress:
        result["progress"] = live_progress
    else:
        result["progress"] = {
            "phase": "FINALIZANDO" if row["status"] == "DONE" else row["status"],
            "phase_index": 4,
            "found": row["results_count"],
            "analyzed": row["results_count"],
            "total": row["requested_count"],
            "errors_count": 0,
        }
    return result


@router.get("")
async def list_searches():
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM searches ORDER BY created_at DESC LIMIT 200")
    return [dict(r) for r in cur.fetchall()]


@router.post("/{search_id}/cancel")
async def cancel_search_route(search_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT status FROM searches WHERE id=?", (search_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Busca nao encontrada.")
    if row["status"] != "RUNNING":
        raise HTTPException(400, "Busca nao esta em execucao.")
    runner.cancel_search(search_id)
    return {"ok": True}
