import sqlite3
import threading
from contextlib import contextmanager

from backend.config import DB_PATH

_local = threading.local()

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

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city, state);
CREATE INDEX IF NOT EXISTS idx_leads_crm ON leads(crm_status);
"""


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


def init_db():
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.commit()
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
