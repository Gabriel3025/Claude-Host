import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
(DATA_DIR / "logs").mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / ".env")

DB_PATH = DATA_DIR / "prospector.db"
LOG_PATH = DATA_DIR / "logs" / "app.log"

APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
PORT = int(os.getenv("PORT", "8517"))

APIFY_ACTOR_ID = "compass/crawler-google-places"
APIFY_COST_PER_PLACE = 0.004
APIFY_COST_START = 0.0001
APIFY_CALL_TIMEOUT_S = 900

CACHE_TTL_DAYS = 30

SITE_CHECK_CONCURRENCY = 10
SITE_CHECK_TIMEOUT_S = 10
SITE_CHECK_RETRIES = 1
SITE_MAX_BYTES = 500_000

MAX_LEADS_CONFIRM_THRESHOLD = 500
MAX_LEADS_ABSOLUTE = 1000

SOCIAL_DOMAINS = {
    "instagram.com", "facebook.com", "fb.com", "m.facebook.com",
    "wa.me", "api.whatsapp.com", "whatsapp.com", "chat.whatsapp.com",
    "linktr.ee", "linktree.com", "bio.link", "beacons.ai", "lnk.bio",
    "taplink.cc", "t.me", "tiktok.com", "x.com", "twitter.com",
    "youtube.com", "youtu.be",
}

CRM_STATUSES = [
    "NOVO", "LIGAR", "TENTATIVA 1", "TENTATIVA 2", "CONTATO REALIZADO",
    "INTERESSADO", "PROPOSTA", "CLIENTE", "SEM INTERESSE",
]
