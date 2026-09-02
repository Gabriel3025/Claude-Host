from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend import db

router = APIRouter(prefix="/api/crm", tags=["crm"])


# ---------- Stages (columns) ----------

@router.get("/stages")
async def list_stages():
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM crm_stages ORDER BY position ASC")
    return [dict(r) for r in cur.fetchall()]


class StageCreate(BaseModel):
    name: str


@router.post("/stages")
async def create_stage(payload: StageCreate):
    name = payload.name.strip()
    if not name:
        raise HTTPException(400, "Nome da coluna nao pode ser vazio.")
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM crm_stages")
    next_pos = cur.fetchone()["next_pos"]
    cur.execute("INSERT INTO crm_stages (name, position) VALUES (?, ?)", (name, next_pos))
    conn.commit()
    cur.execute("SELECT * FROM crm_stages WHERE id=?", (cur.lastrowid,))
    return dict(cur.fetchone())


class StageUpdate(BaseModel):
    name: str | None = None


@router.patch("/stages/{stage_id}")
async def update_stage(stage_id: int, payload: StageUpdate):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM crm_stages WHERE id=?", (stage_id,))
    if not cur.fetchone():
        raise HTTPException(404, "Coluna nao encontrada.")
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(400, "Nome da coluna nao pode ser vazio.")
        cur.execute("UPDATE crm_stages SET name=? WHERE id=?", (name, stage_id))
        conn.commit()
    cur.execute("SELECT * FROM crm_stages WHERE id=?", (stage_id,))
    return dict(cur.fetchone())


class StagesReorder(BaseModel):
    stage_ids: list[int]


@router.post("/stages/reorder")
async def reorder_stages(payload: StagesReorder):
    conn = db.get_conn()
    cur = conn.cursor()
    for position, stage_id in enumerate(payload.stage_ids):
        cur.execute("UPDATE crm_stages SET position=? WHERE id=?", (position, stage_id))
    conn.commit()
    return {"ok": True}


@router.delete("/stages/{stage_id}")
async def delete_stage(stage_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as n FROM leads WHERE crm_stage_id=?", (stage_id,))
    if cur.fetchone()["n"] > 0:
        raise HTTPException(400, "Mova os leads desta coluna antes de excluí-la.")
    cur.execute("DELETE FROM crm_stages WHERE id=?", (stage_id,))
    conn.commit()
    return {"ok": True}


# ---------- Board ----------

@router.get("/board")
async def get_board():
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM crm_stages ORDER BY position ASC")
    stages = [dict(r) for r in cur.fetchall()]

    cur.execute(
        "SELECT * FROM leads WHERE crm_stage_id IS NOT NULL "
        "ORDER BY crm_stage_id ASC, crm_position ASC"
    )
    leads = [dict(r) for r in cur.fetchall()]

    by_stage: dict[int, list] = {s["id"]: [] for s in stages}
    for lead in leads:
        by_stage.setdefault(lead["crm_stage_id"], []).append(lead)

    for stage in stages:
        stage["cards"] = by_stage.get(stage["id"], [])

    return {"stages": stages}


# ---------- Cards (leads inside the CRM) ----------

class AddToCrm(BaseModel):
    lead_ids: list[int]
    stage_id: int | None = None


@router.post("/cards")
async def add_to_crm(payload: AddToCrm):
    if not payload.lead_ids:
        raise HTTPException(400, "Nenhum lead selecionado.")

    conn = db.get_conn()
    cur = conn.cursor()

    if payload.stage_id:
        cur.execute("SELECT id, name FROM crm_stages WHERE id=?", (payload.stage_id,))
        stage = cur.fetchone()
        if not stage:
            raise HTTPException(404, "Coluna nao encontrada.")
    else:
        cur.execute("SELECT id, name FROM crm_stages ORDER BY position ASC LIMIT 1")
        stage = cur.fetchone()
        if not stage:
            raise HTTPException(400, "Nenhuma coluna de CRM configurada.")

    added = []
    for lead_id in payload.lead_ids:
        cur.execute("SELECT id, crm_stage_id FROM leads WHERE id=?", (lead_id,))
        lead = cur.fetchone()
        if not lead or lead["crm_stage_id"] is not None:
            continue

        cur.execute(
            "SELECT COALESCE(MAX(crm_position), -1) + 1 as next_pos FROM leads WHERE crm_stage_id=?",
            (stage["id"],),
        )
        next_pos = cur.fetchone()["next_pos"]

        cur.execute(
            "UPDATE leads SET crm_stage_id=?, crm_position=?, crm_added_at=datetime('now'), "
            "updated_at=datetime('now') WHERE id=?",
            (stage["id"], next_pos, lead_id),
        )
        cur.execute(
            "INSERT INTO crm_history (lead_id, event_type, to_stage_name) VALUES (?, 'ADDED_TO_CRM', ?)",
            (lead_id, stage["name"]),
        )
        added.append(lead_id)

    conn.commit()
    return {"added": added}


@router.delete("/cards/{lead_id}")
async def remove_from_crm(lead_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT crm_stage_id FROM leads WHERE id=?", (lead_id,))
    lead = cur.fetchone()
    if not lead:
        raise HTTPException(404, "Lead nao encontrado.")
    if lead["crm_stage_id"] is None:
        raise HTTPException(400, "Lead nao esta no CRM.")

    cur.execute("SELECT name FROM crm_stages WHERE id=?", (lead["crm_stage_id"],))
    stage_row = cur.fetchone()
    from_name = stage_row["name"] if stage_row else None

    cur.execute(
        "UPDATE leads SET crm_stage_id=NULL, crm_position=NULL, updated_at=datetime('now') WHERE id=?",
        (lead_id,),
    )
    cur.execute(
        "INSERT INTO crm_history (lead_id, event_type, from_stage_name) VALUES (?, 'REMOVED_FROM_CRM', ?)",
        (lead_id, from_name),
    )
    conn.commit()
    return {"ok": True}


class MoveCard(BaseModel):
    stage_id: int
    position: int | None = None


@router.patch("/cards/{lead_id}")
async def move_card(lead_id: int, payload: MoveCard):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, crm_stage_id FROM leads WHERE id=?", (lead_id,))
    lead = cur.fetchone()
    if not lead:
        raise HTTPException(404, "Lead nao encontrado.")
    if lead["crm_stage_id"] is None:
        raise HTTPException(400, "Lead nao esta no CRM.")

    cur.execute("SELECT id, name FROM crm_stages WHERE id=?", (payload.stage_id,))
    new_stage = cur.fetchone()
    if not new_stage:
        raise HTTPException(404, "Coluna nao encontrada.")

    cur.execute("SELECT name FROM crm_stages WHERE id=?", (lead["crm_stage_id"],))
    old_stage_row = cur.fetchone()
    old_stage_name = old_stage_row["name"] if old_stage_row else None

    if payload.position is not None:
        position = payload.position
    else:
        cur.execute(
            "SELECT COALESCE(MAX(crm_position), -1) + 1 as next_pos FROM leads WHERE crm_stage_id=?",
            (new_stage["id"],),
        )
        position = cur.fetchone()["next_pos"]

    cur.execute(
        "UPDATE leads SET crm_stage_id=?, crm_position=?, updated_at=datetime('now') WHERE id=?",
        (new_stage["id"], position, lead_id),
    )

    if old_stage_name != new_stage["name"]:
        cur.execute(
            "INSERT INTO crm_history (lead_id, event_type, from_stage_name, to_stage_name) "
            "VALUES (?, 'STAGE_CHANGED', ?, ?)",
            (lead_id, old_stage_name, new_stage["name"]),
        )

    conn.commit()
    cur.execute("SELECT * FROM leads WHERE id=?", (lead_id,))
    return dict(cur.fetchone())


class CardColorUpdate(BaseModel):
    color: str | None = None


@router.patch("/cards/{lead_id}/color")
async def set_card_color(lead_id: int, payload: CardColorUpdate):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM leads WHERE id=?", (lead_id,))
    if not cur.fetchone():
        raise HTTPException(404, "Lead nao encontrado.")
    cur.execute(
        "UPDATE leads SET crm_card_color=?, updated_at=datetime('now') WHERE id=?",
        (payload.color, lead_id),
    )
    conn.commit()
    cur.execute("SELECT * FROM leads WHERE id=?", (lead_id,))
    return dict(cur.fetchone())


@router.get("/cards/{lead_id}/history")
async def get_history(lead_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM leads WHERE id=?", (lead_id,))
    if not cur.fetchone():
        raise HTTPException(404, "Lead nao encontrado.")
    cur.execute(
        "SELECT * FROM crm_history WHERE lead_id=? ORDER BY occurred_at ASC", (lead_id,)
    )
    return [dict(r) for r in cur.fetchall()]
