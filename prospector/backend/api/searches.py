import asyncio
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend import db
from backend.config import (
    MAX_LEADS_CONFIRM_THRESHOLD,
    MAX_LEADS_ABSOLUTE,
    APIFY_COST_PER_PLACE,
    CACHE_TTL_DAYS,
)
from backend.pipeline import progress, runner

logger = logging.getLogger("prospector")
router = APIRouter(prefix="/api/searches", tags=["searches"])


class SearchCreate(BaseModel):
    niche: str
    city: str
    state: str
    region: str | None = None
    quantity: int
    confirmed: bool = False
    reuse: bool = True


@router.post("")
async def create_search(payload: SearchCreate):
    niche = payload.niche.strip()
    city = payload.city.strip()
    state = payload.state.strip().upper()

    if not niche or not city or not state:
        raise HTTPException(400, "Nicho, cidade e estado sao obrigatorios.")
    if payload.quantity < 1 or payload.quantity > MAX_LEADS_ABSOLUTE:
        raise HTTPException(400, f"Quantidade deve ser entre 1 e {MAX_LEADS_ABSOLUTE}.")

    if payload.quantity > MAX_LEADS_CONFIRM_THRESHOLD and not payload.confirmed:
        est_cost = payload.quantity * APIFY_COST_PER_PLACE
        return {
            "warning": "CONFIRM_LARGE_SEARCH",
            "message": f"Voce esta prestes a solicitar {payload.quantity} leads "
                       f"(~US$ {est_cost:.2f}). Confirmar?",
        }

    if payload.reuse:
        cutoff = (datetime.utcnow() - timedelta(days=CACHE_TTL_DAYS)).isoformat()
        conn = db.get_conn()
        cur = conn.cursor()
        cur.execute(
            """SELECT id, created_at, results_count FROM searches
               WHERE niche=? AND city=? AND state=? AND status='DONE'
               AND created_at >= ? ORDER BY created_at DESC LIMIT 1""",
            (niche, city, state, cutoff),
        )
        recent = cur.fetchone()
        if recent:
            return {
                "warning": "RECENT_SEARCH_EXISTS",
                "message": f"Ja existe uma busca igual feita em {recent['created_at'][:10]} "
                           f"com {recent['results_count']} leads.",
                "existing_search_id": recent["id"],
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
        runner.run_pipeline(search_id, niche, city, state, payload.region, payload.quantity)
    )

    return {"search_id": search_id}


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
