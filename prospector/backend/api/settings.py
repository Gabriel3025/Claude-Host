from fastapi import APIRouter
from pydantic import BaseModel

from backend import config, db

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _mask_token(token: str) -> str:
    if not token:
        return ""
    if len(token) <= 8:
        return "*" * len(token)
    return token[:4] + "*" * (len(token) - 8) + token[-4:]


@router.get("")
async def get_settings():
    return {
        "provider": "apify",
        "token_configured": bool(config.APIFY_TOKEN),
        "token_masked": _mask_token(config.APIFY_TOKEN),
        "total_searches": int(float(db.get_setting("total_searches", "0"))),
        "total_leads_collected": int(float(db.get_setting("total_leads_collected", "0"))),
        "total_api_calls": int(float(db.get_setting("total_api_calls", "0"))),
        "total_estimated_cost_usd": float(db.get_setting("total_estimated_cost_usd", "0")),
        "cache_ttl_days": config.CACHE_TTL_DAYS,
        "site_check_concurrency": config.SITE_CHECK_CONCURRENCY,
        "max_leads_confirm_threshold": config.MAX_LEADS_CONFIRM_THRESHOLD,
        "cost_per_place_usd": config.APIFY_COST_PER_PLACE,
    }


class TokenUpdate(BaseModel):
    apify_token: str


@router.put("")
async def update_settings(payload: TokenUpdate):
    env_path = config.ROOT_DIR / ".env"
    lines = []
    found = False
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("APIFY_TOKEN="):
                lines.append(f"APIFY_TOKEN={payload.apify_token}")
                found = True
            else:
                lines.append(line)
    if not found:
        lines.append(f"APIFY_TOKEN={payload.apify_token}")
    env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    config.APIFY_TOKEN = payload.apify_token
    return {"ok": True}


@router.post("/test-token")
async def test_token():
    if not config.APIFY_TOKEN:
        return {"ok": False, "message": "Token nao configurado."}
    try:
        from apify_client import ApifyClient

        client = ApifyClient(config.APIFY_TOKEN)
        user = client.user().get()
        return {"ok": True, "username": getattr(user, "username", "")}
    except Exception as e:
        return {"ok": False, "message": str(e)}
