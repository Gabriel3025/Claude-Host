from datetime import date

from fastapi import APIRouter, HTTPException

from backend import db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _closed_stage(stages: list[dict]) -> dict | None:
    return next((s for s in stages if "FECHADO" in s["name"].upper()), None)


def _lost_stage(stages: list[dict]) -> dict | None:
    return next((s for s in stages if "PERDID" in s["name"].upper()), None)


def _meeting_stage(stages: list[dict]) -> dict | None:
    return next((s for s in stages if "REUNI" in s["name"].upper()), None)


@router.get("")
async def get_dashboard(start: str | None = None, end: str | None = None, niche: str | None = None):
    conn = db.get_conn()
    cur = conn.cursor()

    today = date.today().isoformat()
    start = start or today
    end = end or today

    niche_clause = " AND niche_abbr=?" if niche else ""
    cohort_params: list = [start, end]
    if niche:
        cohort_params.append(niche)

    # Cohort = every lead ever added to the CRM whose entry date (crm_added_at)
    # falls in the selected period. This is the "A FAZER" entry count the user
    # cares about: it stays fixed for the day even as cards move to other
    # columns, because crm_added_at is only set once (see crm.py add_to_crm).
    cur.execute(
        f"""SELECT id, crm_stage_id, score_class FROM leads
            WHERE crm_added_at IS NOT NULL AND date(crm_added_at) BETWEEN ? AND ?{niche_clause}""",
        cohort_params,
    )
    cohort = [dict(r) for r in cur.fetchall()]
    cohort_ids = [c["id"] for c in cohort]
    cohort_total = len(cohort)

    cur.execute("SELECT * FROM crm_stages ORDER BY position ASC")
    stages = [dict(r) for r in cur.fetchall()]

    current_counts = {s["id"]: 0 for s in stages}
    for c in cohort:
        if c["crm_stage_id"] in current_counts:
            current_counts[c["crm_stage_id"]] += 1
    removed_count = sum(1 for c in cohort if c["crm_stage_id"] is None)

    # "Ever reached" = union of (a) leads whose crm_history shows a move to a
    # stage with this name, and (b) leads currently sitting in this stage.
    # (b) matters because crm_history.to_stage_name is a text snapshot taken
    # at move time -- if a column gets renamed later (this app allows that
    # freely), old history rows stop matching the stage's current name and
    # would otherwise undercount leads who are demonstrably there right now.
    reached_ids_by_stage: dict[int, set] = {s["id"]: set() for s in stages}
    if cohort_ids:
        placeholders = ",".join("?" * len(cohort_ids))
        cur.execute(
            f"""SELECT lead_id, to_stage_name FROM crm_history
                WHERE lead_id IN ({placeholders}) AND to_stage_name IS NOT NULL""",
            cohort_ids,
        )
        reached_ids_by_name: dict[str, set] = {}
        for row in cur.fetchall():
            reached_ids_by_name.setdefault(row["to_stage_name"], set()).add(row["lead_id"])
        for s in stages:
            reached_ids_by_stage[s["id"]] |= reached_ids_by_name.get(s["name"], set())

    for c in cohort:
        if c["crm_stage_id"] in reached_ids_by_stage:
            reached_ids_by_stage[c["crm_stage_id"]].add(c["id"])

    ever_reached: dict[int, int] = {sid: len(ids) for sid, ids in reached_ids_by_stage.items()}

    funnel = [
        {
            "stage_id": s["id"],
            "name": s["name"],
            "color": s["color"],
            "ever_reached": ever_reached[s["id"]],
            "current": current_counts[s["id"]],
            "pct_of_cohort": round(ever_reached[s["id"]] / cohort_total * 100, 1) if cohort_total else 0,
        }
        for s in stages
    ]

    closed = _closed_stage(stages)
    lost = _lost_stage(stages)
    meeting = _meeting_stage(stages)

    fechados = ever_reached.get(closed["id"], 0) if closed else 0
    perdidos = ever_reached.get(lost["id"], 0) if lost else 0
    reunioes = ever_reached.get(meeting["id"], 0) if meeting else 0

    taxa_agendamento = round(reunioes / cohort_total * 100, 1) if cohort_total else 0
    taxa_fechamento = round(fechados / reunioes * 100, 1) if reunioes else 0

    fechados_atual = current_counts.get(closed["id"], 0) if closed else 0
    perdidos_atual = current_counts.get(lost["id"], 0) if lost else 0
    em_aberto = max(0, (cohort_total - removed_count) - fechados_atual - perdidos_atual)

    score_dist = {"A": 0, "B": 0, "C": 0}
    for c in cohort:
        if c["score_class"] in score_dist:
            score_dist[c["score_class"]] += 1

    cur.execute(
        """SELECT date(occurred_at) as d, COUNT(*) as n FROM crm_history
           WHERE date(occurred_at) BETWEEN ? AND ? GROUP BY date(occurred_at) ORDER BY d ASC""",
        [start, end],
    )
    daily_activity = [dict(r) for r in cur.fetchall()]

    cur.execute(
        f"SELECT COUNT(*) as n FROM leads WHERE date(first_seen_at) BETWEEN ? AND ?{niche_clause}",
        cohort_params,
    )
    collected_total = cur.fetchone()["n"]

    cur.execute("SELECT DISTINCT niche_abbr FROM leads WHERE niche_abbr IS NOT NULL ORDER BY niche_abbr")
    niches = [r["niche_abbr"] for r in cur.fetchall()]

    return {
        "period": {"start": start, "end": end, "niche": niche},
        "niches": niches,
        "stat_tiles": {
            "leads_no_crm_no_periodo": cohort_total,
            "leads_coletados_no_periodo": collected_total,
            "reunioes_agendadas": reunioes,
            "taxa_agendamento_pct": taxa_agendamento,
            "fechados": fechados,
            "taxa_fechamento_pct": taxa_fechamento,
            "perdidos": perdidos,
            "em_aberto": em_aberto,
        },
        "funnel": funnel,
        "removed_from_crm": removed_count,
        "score_distribution": score_dist,
        "daily_activity": daily_activity,
    }


@router.get("/funnel/leads")
async def get_funnel_leads(
    stage_id: int, start: str | None = None, end: str | None = None,
    niche: str | None = None, mode: str = "reached",
):
    conn = db.get_conn()
    cur = conn.cursor()

    today = date.today().isoformat()
    start = start or today
    end = end or today

    cur.execute("SELECT name FROM crm_stages WHERE id=?", (stage_id,))
    stage_row = cur.fetchone()
    if not stage_row:
        raise HTTPException(404, "Coluna nao encontrada.")
    stage_name = stage_row["name"]

    niche_clause = " AND l.niche_abbr=?" if niche else ""
    period_params: list = [start, end]
    if niche:
        period_params.append(niche)

    if mode == "current":
        cur.execute(
            f"""SELECT l.id, l.name, l.phone_e164, l.city, l.state, l.score, l.score_class
                FROM leads l WHERE l.crm_stage_id=? AND l.crm_added_at IS NOT NULL
                AND date(l.crm_added_at) BETWEEN ? AND ?{niche_clause}
                ORDER BY l.score DESC""",
            [stage_id, *period_params],
        )
    else:
        # Union of history-matched leads and leads currently sitting in this
        # stage -- see the comment in get_dashboard() about stage renames
        # making to_stage_name an unreliable sole source of truth.
        cur.execute(
            f"""SELECT l.id, l.name, l.phone_e164, l.city, l.state, l.score, l.score_class
                FROM leads l WHERE l.crm_added_at IS NOT NULL
                AND date(l.crm_added_at) BETWEEN ? AND ?{niche_clause}
                AND (l.id IN (SELECT lead_id FROM crm_history WHERE to_stage_name=?) OR l.crm_stage_id=?)
                ORDER BY l.score DESC""",
            [*period_params, stage_name, stage_id],
        )
    return [dict(r) for r in cur.fetchall()]
