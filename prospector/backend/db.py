import shutil
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime

from backend.config import DB_PATH, DATA_DIR

_local = threading.local()

BACKUPS_DIR = DATA_DIR / "backups"
MAX_BACKUPS = 30

SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id TEXT UNIQUE,
    dedup_key TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    phone_raw TEXT,
    phone_e164 TEXT,
    is_mobile_phone INTEGER DEFAULT 0,
    address TEXT,
    city TEXT, state TEXT, postal_code TEXT,
    latitude REAL, longitude REAL,
    google_maps_url TEXT,
    rating REAL, reviews_count INTEGER DEFAULT 0,
    permanently_closed INTEGER DEFAULT 0,
    temporarily_closed INTEGER DEFAULT 0,

    website_url TEXT,
    final_url TEXT,
    site_status TEXT DEFAULT 'NOT_CHECKED',
    https INTEGER,
    response_time_ms INTEGER,
    page_size_bytes INTEGER,
    has_title INTEGER, has_viewport INTEGER,
    has_contact_form INTEGER,
    site_tech_issues TEXT,

    email TEXT, instagram TEXT, facebook TEXT, linkedin TEXT,
    whatsapp_found INTEGER DEFAULT 0,
    phone_on_site INTEGER DEFAULT 0,

    score INTEGER DEFAULT 0,
    score_class TEXT,
    score_reasons TEXT,

    crm_status TEXT DEFAULT 'NOVO',
    notes TEXT DEFAULT '',

    enrich_error TEXT,
    first_seen_at TEXT DEFAULT (datetime('now')),
    last_enriched_at TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    niche TEXT NOT NULL,
    city TEXT NOT NULL, state TEXT NOT NULL, region TEXT,
    requested_count INTEGER NOT NULL,
    status TEXT DEFAULT 'RUNNING',
    provider TEXT DEFAULT 'apify',
    provider_run_id TEXT,
    results_count INTEGER DEFAULT 0,
    from_cache_count INTEGER DEFAULT 0,
    estimated_cost_usd REAL DEFAULT 0,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    finished_at TEXT
);

CREATE TABLE IF NOT EXISTS search_leads (
    search_id INTEGER REFERENCES searches(id),
    lead_id INTEGER REFERENCES leads(id),
    rank INTEGER,
    PRIMARY KEY (search_id, lead_id)
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS crm_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crm_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id),
    event_type TEXT NOT NULL,
    from_stage_name TEXT,
    to_stage_name TEXT,
    occurred_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lead_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id),
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city, state);
CREATE INDEX IF NOT EXISTS idx_leads_crm ON leads(crm_status);
CREATE INDEX IF NOT EXISTS idx_crm_history_lead ON crm_history(lead_id);
"""

DEFAULT_STAGES = [
    "A FAZER", "EM CONTATO", "REUNIAO AGENDADA", "ENVIAR PROPOSTA",
    "EM FECHAMENTO", "FECHADO",
]

NICHE_ABBR_BY_NAME = {
    "escritório de advocacia": "ADV",
    "escritorio de advocacia": "ADV",
    "clínica médica": "CLI",
    "clinica medica": "CLI",
    "dentista": "ODO",
    "imobiliária": "IMO",
    "imobiliaria": "IMO",
    "contabilidade": "CONT",
    "academia": "ACAD",
    "restaurante": "REST",
}


def _guess_niche_abbr(niche: str) -> str:
    known = NICHE_ABBR_BY_NAME.get(niche.strip().lower())
    if known:
        return known
    words = [w for w in niche.strip().split() if w.lower() not in ("de", "da", "do", "e")]
    abbr = "".join(w[0] for w in words[:4]).upper()
    return abbr[:6] or "GERAL"


def get_conn() -> sqlite3.Connection:
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        _local.conn = conn
    return conn


@contextmanager
def db_cursor(commit: bool = False):
    conn = get_conn()
    cur = conn.cursor()
    try:
        yield cur
        if commit:
            conn.commit()
    finally:
        cur.close()


def _column_exists(conn, table: str, column: str) -> bool:
    cur = conn.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())


def _migrate(conn):
    if not _column_exists(conn, "leads", "crm_stage_id"):
        conn.execute("ALTER TABLE leads ADD COLUMN crm_stage_id INTEGER")
    if not _column_exists(conn, "leads", "crm_position"):
        conn.execute("ALTER TABLE leads ADD COLUMN crm_position INTEGER")
    if not _column_exists(conn, "leads", "crm_added_at"):
        conn.execute("ALTER TABLE leads ADD COLUMN crm_added_at TEXT")
    if not _column_exists(conn, "leads", "crm_card_color"):
        conn.execute("ALTER TABLE leads ADD COLUMN crm_card_color TEXT")
    if not _column_exists(conn, "searches", "duplicate_count"):
        conn.execute("ALTER TABLE searches ADD COLUMN duplicate_count INTEGER DEFAULT 0")
    if not _column_exists(conn, "searches", "duplicate_lead_ids"):
        conn.execute("ALTER TABLE searches ADD COLUMN duplicate_lead_ids TEXT DEFAULT '[]'")
    if not _column_exists(conn, "crm_stages", "color"):
        conn.execute("ALTER TABLE crm_stages ADD COLUMN color TEXT")
    if not _column_exists(conn, "searches", "is_deleted"):
        conn.execute("ALTER TABLE searches ADD COLUMN is_deleted INTEGER DEFAULT 0")
    if not _column_exists(conn, "searches", "niche_abbr"):
        conn.execute("ALTER TABLE searches ADD COLUMN niche_abbr TEXT")
    if not _column_exists(conn, "leads", "niche_abbr"):
        conn.execute("ALTER TABLE leads ADD COLUMN niche_abbr TEXT")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_crm_stage ON leads(crm_stage_id)")
    conn.commit()

    cur = conn.execute("SELECT COUNT(*) FROM crm_stages")
    if cur.fetchone()[0] == 0:
        for i, name in enumerate(DEFAULT_STAGES):
            conn.execute(
                "INSERT INTO crm_stages (name, position) VALUES (?, ?)", (name, i)
            )
        conn.commit()

    _backfill_niche_abbr(conn)
    _backfill_legacy_notes(conn)


def _backfill_legacy_notes(conn):
    """One-time migration: leads.notes was a single free-text field before the
    timestamped lead_notes log existed. Move any leftover text into the log so
    nothing already written by the user is lost."""
    cur = conn.execute(
        """SELECT l.id, l.notes, l.updated_at, l.first_seen_at FROM leads l
           WHERE l.notes IS NOT NULL AND l.notes != ''
           AND NOT EXISTS (SELECT 1 FROM lead_notes n WHERE n.lead_id = l.id)"""
    )
    rows = cur.fetchall()
    for row in rows:
        when = row["updated_at"] or row["first_seen_at"]
        conn.execute(
            "INSERT INTO lead_notes (lead_id, text, created_at) VALUES (?, ?, ?)",
            (row["id"], row["notes"], when),
        )
    if rows:
        conn.commit()


def _backfill_niche_abbr(conn):
    cur = conn.execute("SELECT id, niche FROM searches WHERE niche_abbr IS NULL")
    for row in cur.fetchall():
        abbr = _guess_niche_abbr(row[1])
        conn.execute("UPDATE searches SET niche_abbr=? WHERE id=?", (abbr, row[0]))
    conn.commit()

    cur = conn.execute("SELECT id FROM leads WHERE niche_abbr IS NULL")
    lead_ids = [row[0] for row in cur.fetchall()]
    for lead_id in lead_ids:
        cur2 = conn.execute(
            """SELECT s.niche_abbr FROM search_leads sl
               JOIN searches s ON sl.search_id = s.id
               WHERE sl.lead_id=? ORDER BY s.created_at DESC LIMIT 1""",
            (lead_id,),
        )
        row = cur2.fetchone()
        if row and row[0]:
            conn.execute("UPDATE leads SET niche_abbr=? WHERE id=?", (row[0], lead_id))
    conn.commit()


def backup_now(label: str = "auto") -> str | None:
    """Copies the current database file to data/backups/ before any risky operation.
    Never deletes real data -- only adds timestamped snapshots, pruned to MAX_BACKUPS."""
    if not DB_PATH.exists():
        return None
    BACKUPS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = BACKUPS_DIR / f"prospector_{timestamp}_{label}.db"
    shutil.copyfile(DB_PATH, dest)

    backups = sorted(BACKUPS_DIR.glob("prospector_*.db"), key=lambda p: p.stat().st_mtime)
    while len(backups) > MAX_BACKUPS:
        oldest = backups.pop(0)
        oldest.unlink(missing_ok=True)

    return str(dest)


def list_backups() -> list[dict]:
    if not BACKUPS_DIR.exists():
        return []
    backups = sorted(BACKUPS_DIR.glob("prospector_*.db"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [
        {"filename": p.name, "size_bytes": p.stat().st_size,
         "modified_at": datetime.fromtimestamp(p.stat().st_mtime).isoformat()}
        for p in backups
    ]


def init_db():
    backup_now(label="startup")
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.commit()
    _migrate(conn)
    # Reset any RUNNING search left orphaned by a previous crash/restart
    conn.execute(
        "UPDATE searches SET status='ERROR', error='Interrompida por reinicio do servidor' "
        "WHERE status='RUNNING'"
    )
    conn.commit()


def get_setting(key: str, default: str = "0") -> str:
    with db_cursor() as cur:
        cur.execute("SELECT value FROM app_settings WHERE key=?", (key,))
        row = cur.fetchone()
        return row["value"] if row else default


def set_setting(key: str, value: str):
    with db_cursor(commit=True) as cur:
        cur.execute(
            "INSERT INTO app_settings(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, str(value)),
        )


def increment_setting(key: str, amount: float):
    current = get_setting(key, "0")
    try:
        new_val = float(current) + amount
    except ValueError:
        new_val = amount
    if new_val == int(new_val):
        new_val = int(new_val)
    set_setting(key, str(new_val))
