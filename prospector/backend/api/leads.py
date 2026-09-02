from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend import db
from backend.config import CRM_STATUSES

router = APIRouter(prefix="/api", tags=["leads"])

SORT_FIELDS = {
    "score": "score",
    "reviews": "reviews_count",
    "name": "name",
    "created": "first_seen_at",
}

SITE_STATUS_GROUPS = {
    "sem_site": ["NO_WEBSITE"],
    "fora_do_ar": ["OFFLINE", "TIMEOUT", "HTTP_ERROR", "DNS_ERROR"],
    "social_only": ["SOCIAL_ONLY"],
    "online": ["ONLINE"],
}


def _build_filters(
    search_id, score_class, site_status, has_phone, has_whatsapp,
    city, state, crm_status, min_reviews, min_score, max_score, q,
):
    clauses = [
        "(EXISTS (SELECT 1 FROM search_leads sl JOIN searches s ON sl.search_id=s.id "
        "WHERE sl.lead_id=l.id AND s.is_deleted=0) OR l.crm_stage_id IS NOT NULL)"
    ]
    params: list = []

    if search_id is not None:
        clauses.append("l.id IN (SELECT lead_id FROM search_leads WHERE search_id=?)")
        params.append(search_id)
    if score_class:
        clauses.append("l.score_class=?")
        params.append(score_class)
    if site_status:
        statuses = SITE_STATUS_GROUPS.get(site_status, [site_status])
        placeholders = ",".join("?" for _ in statuses)
        clauses.append(f"l.site_status IN ({placeholders})")
        params.extend(statuses)
    if has_phone:
        clauses.append("l.phone_e164 IS NOT NULL")
    if has_whatsapp:
        clauses.append("(l.is_mobile_phone=1 OR l.whatsapp_found=1)")
    if city:
        clauses.append("l.city LIKE ?")
        params.append(f"%{city}%")
    if state:
        clauses.append("l.state=?")
        params.append(state.upper())
    if crm_status:
        clauses.append("l.crm_status=?")
        params.append(crm_status)
    if min_reviews is not None:
        clauses.append("l.reviews_count >= ?")
        params.append(min_reviews)
    if min_score is not None:
        clauses.append("l.score >= ?")
        params.append(min_score)
    if max_score is not None:
        clauses.append("l.score <= ?")
        params.append(max_score)
    if q:
        clauses.append("l.name LIKE ?")
        params.append(f"%{q}%")

    where = " AND ".join(clauses) if clauses else "1=1"
    return where, params


@router.get("/leads")
async def list_leads(
    search_id: int | None = None,
    score_class: str | None = None,
    site_status: str | None = None,
    has_phone: bool = False,
    has_whatsapp: bool = False,
    city: str | None = None,
    state: str | None = None,
    crm_status: str | None = None,
    min_reviews: int | None = None,
    min_score: int | None = None,
    max_score: int | None = None,
    q: str | None = None,
    sort: str = "score",
    order: str = "desc",
    page: int = 1,
    page_size: int = 50,
):
    where, params = _build_filters(
        search_id, score_class, site_status, has_phone, has_whatsapp,
        city, state, crm_status, min_reviews, min_score, max_score, q,
    )

    sort_field = SORT_FIELDS.get(sort, "score")
    order_sql = "ASC" if order.lower() == "asc" else "DESC"

    conn = db.get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT COUNT(*) as total FROM leads l WHERE {where}", params)
    total = cur.fetchone()["total"]

    offset = max(page - 1, 0) * page_size
    cur.execute(
        f"""SELECT l.* FROM leads l WHERE {where}
            ORDER BY l.{sort_field} {order_sql} LIMIT ? OFFSET ?""",
        params + [page_size, offset],
    )
    items = [dict(r) for r in cur.fetchall()]

    cur.execute(
        f"""SELECT
                COUNT(*) as collected,
                COALESCE(SUM(CASE WHEN score_class='A' THEN 1 ELSE 0 END),0) as score_a,
                COALESCE(SUM(CASE WHEN score_class='B' THEN 1 ELSE 0 END),0) as score_b,
                COALESCE(SUM(CASE WHEN score_class='C' THEN 1 ELSE 0 END),0) as score_c,
                COALESCE(SUM(CASE WHEN site_status='NO_WEBSITE' THEN 1 ELSE 0 END),0) as no_website,
                COALESCE(SUM(CASE WHEN site_status IN ('OFFLINE','TIMEOUT','HTTP_ERROR','DNS_ERROR') THEN 1 ELSE 0 END),0) as site_down,
                COALESCE(SUM(CASE WHEN phone_e164 IS NOT NULL THEN 1 ELSE 0 END),0) as with_phone
            FROM leads l WHERE {where}""",
        params,
    )
    stats = dict(cur.fetchone())

    return {"items": items, "total": total, "stats": stats}


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: int):
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM leads WHERE id=?", (lead_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Lead nao encontrado.")
    return dict(row)


class LeadUpdate(BaseModel):
    crm_status: str | None = None
    notes: str | None = None


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: int, payload: LeadUpdate):
    if payload.crm_status is not None and payload.crm_status not in CRM_STATUSES:
        raise HTTPException(400, "Status comercial invalido.")

    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM leads WHERE id=?", (lead_id,))
    if not cur.fetchone():
        raise HTTPException(404, "Lead nao encontrado.")

    updates = []
    params = []
    if payload.crm_status is not None:
        updates.append("crm_status=?")
        params.append(payload.crm_status)
    if payload.notes is not None:
        updates.append("notes=?")
        params.append(payload.notes)

    if updates:
        updates.append("updated_at=datetime('now')")
        params.append(lead_id)
        cur.execute(f"UPDATE leads SET {', '.join(updates)} WHERE id=?", params)
        conn.commit()

    cur.execute("SELECT * FROM leads WHERE id=?", (lead_id,))
    return dict(cur.fetchone())


@router.get("/stats")
async def global_stats(search_id: int | None = None):
    where, params = _build_filters(
        search_id, None, None, False, False, None, None, None, None, None, None, None
    )
    conn = db.get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT
                COUNT(*) as collected,
                COALESCE(SUM(CASE WHEN score_class='A' THEN 1 ELSE 0 END),0) as score_a,
                COALESCE(SUM(CASE WHEN score_class='B' THEN 1 ELSE 0 END),0) as score_b,
                COALESCE(SUM(CASE WHEN score_class='C' THEN 1 ELSE 0 END),0) as score_c,
                COALESCE(SUM(CASE WHEN site_status='NO_WEBSITE' THEN 1 ELSE 0 END),0) as no_website,
                COALESCE(SUM(CASE WHEN site_status IN ('OFFLINE','TIMEOUT','HTTP_ERROR','DNS_ERROR') THEN 1 ELSE 0 END),0) as site_down,
                COALESCE(SUM(CASE WHEN phone_e164 IS NOT NULL THEN 1 ELSE 0 END),0) as with_phone
            FROM leads l WHERE {where}""",
        params,
    )
    return dict(cur.fetchone())
