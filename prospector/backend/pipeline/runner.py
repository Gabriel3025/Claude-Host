import asyncio
import json
import logging

from backend import db
from backend.config import (
    APIFY_TOKEN,
    APIFY_COST_PER_PLACE,
    APIFY_COST_START,
    SITE_CHECK_CONCURRENCY,
    MAX_LEADS_ABSOLUTE,
    MAX_SEARCH_ATTEMPTS,
    NO_SITE_STATUSES,
)
from backend.pipeline import progress
from backend.pipeline.normalize import normalize_phone, build_dedup_key
from backend.pipeline.website_checker import check_website, tech_issues_to_json
from backend.pipeline.enrichment import enrich_from_html, enrich_from_social_url
from backend.pipeline.scoring import compute_score
from backend.scoring_config import SLOW_SITE_MS, TINY_SITE_BYTES
from backend.providers.apify_provider import ApifyProvider

logger = logging.getLogger("prospector")

_cancelled: set[int] = set()


def cancel_search(search_id: int):
    _cancelled.add(search_id)


def _is_cancelled(search_id: int) -> bool:
    return search_id in _cancelled


async def run_pipeline(search_id: int, niche: str, city: str, state: str,
                        region: str | None, quantity: int, include_duplicates: bool = False,
                        no_site_only: bool = False):
    conn = db.get_conn()
    progress.start(search_id, quantity)
    from_cache_count = 0

    try:
        provider = ApifyProvider(APIFY_TOKEN)

        def on_progress(found: int):
            progress.update(search_id, found=found)

        known_place_ids = _get_known_place_ids(conn)
        known_dedup_keys = _get_known_dedup_keys(conn)
        accumulated_keys: set[str] = set()

        def split(raw_places):
            new_list, dup_list, seen = [], [], set()
            for place in raw_places:
                if place.permanently_closed:
                    continue
                phone_e164, is_mobile = normalize_phone(place.phone_raw)
                key = place.place_id or build_dedup_key(place.name, phone_e164, place.address)
                if key in seen or key in accumulated_keys:
                    continue
                seen.add(key)
                is_known = (place.place_id and place.place_id in known_place_ids) or \
                           (not place.place_id and key in known_dedup_keys)
                item = (place, phone_e164, is_mobile, key)
                if is_known and not include_duplicates:
                    dup_list.append(item)
                else:
                    new_list.append(item)
            return new_list, dup_list

        semaphore = asyncio.Semaphore(SITE_CHECK_CONCURRENCY)
        analyzed = 0

        async def process_one(item):
            nonlocal analyzed
            if _is_cancelled(search_id):
                return None
            place, phone_e164, is_mobile, dedup_key = item

            async with semaphore:
                try:
                    site_result = await check_website(place.website_url)
                    if site_result.site_status == "SOCIAL_ONLY":
                        enrichment = enrich_from_social_url(site_result.final_url)
                    else:
                        enrichment = enrich_from_html(site_result.html)
                except Exception as e:
                    logger.warning(f"Erro ao processar lead '{place.name}': {e}")
                    progress.increment_error(search_id)
                    site_result = None
                    enrichment = None

            lead_data = _build_lead_data(place, phone_e164, is_mobile, site_result, enrichment)

            analyzed += 1
            progress.update(search_id, analyzed=analyzed)
            return lead_data

        progress.set_phase(search_id, "BUSCANDO EMPRESAS")

        lead_rows: list[dict] = []
        duplicates: list[tuple] = []
        run_ids: list[str] = []
        total_scraped = 0
        target = quantity
        attempts = 0
        filtered_out_count = 0

        while len(lead_rows) < quantity and attempts < MAX_SEARCH_ATTEMPTS and not _is_cancelled(search_id):
            attempts += 1
            raw_places, run_id = await provider.search(niche, city, state, region, target, on_progress)
            total_scraped += len(raw_places)
            run_ids.append(run_id)

            new_items, dup_items = split(raw_places)
            duplicates.extend(dup_items)

            progress.set_phase(search_id, "VALIDANDO SITES")
            progress.update(search_id, total=len(lead_rows) + len(new_items))

            tasks = [process_one(item) for item in new_items]
            processed = await asyncio.gather(*tasks)
            processed = [r for r in processed if r is not None]
            for r in processed:
                accumulated_keys.add(r["dedup_key"])

            if no_site_only:
                kept = [r for r in processed if r["site_status"] in NO_SITE_STATUSES]
                filtered_out_count += len(processed) - len(kept)
            else:
                kept = processed

            lead_rows.extend(kept)

            if _is_cancelled(search_id) or len(lead_rows) >= quantity:
                break

            reason_to_retry = bool(dup_items) or (no_site_only and len(kept) < len(processed))
            if not reason_to_retry:
                break

            deficit = quantity - len(lead_rows)
            target = min(MAX_LEADS_ABSOLUTE, target + max(deficit * 2, len(dup_items), 10))
            progress.set_phase(search_id, "BUSCANDO EMPRESAS")

        lead_rows = lead_rows[:quantity]
        run_id = ",".join(run_ids)

        conn.execute("UPDATE searches SET provider_run_id=? WHERE id=?", (run_id, search_id))
        conn.commit()

        duplicate_lead_ids = _resolve_existing_lead_ids(conn, duplicates)

        if _is_cancelled(search_id):
            _finish_cancelled(search_id)
            return

        progress.set_phase(search_id, "CALCULANDO SCORE")
        for lead in lead_rows:
            score, score_class, reasons = compute_score(
                site_status=lead["site_status"],
                https=lead["https"],
                has_title=lead["has_title"],
                has_viewport=lead["has_viewport"],
                response_time_ms=lead["response_time_ms"],
                page_size_bytes=lead["page_size_bytes"],
                phone_e164=lead["phone_e164"],
                is_mobile_phone=bool(lead["is_mobile_phone"]),
                whatsapp_found=bool(lead["whatsapp_found"]),
                reviews_count=lead["reviews_count"] or 0,
                rating=lead["rating"],
                slow_site_ms=SLOW_SITE_MS,
                tiny_site_bytes=TINY_SITE_BYTES,
            )
            lead["score"] = score
            lead["score_class"] = score_class
            lead["score_reasons"] = reasons

        progress.set_phase(search_id, "FINALIZANDO")
        lead_ids = []
        for lead in lead_rows:
            lead_id = _upsert_lead(conn, lead)
            lead_ids.append(lead_id)

        lead_ids.sort(key=lambda lid: _lead_score(conn, lid), reverse=True)
        for rank, lead_id in enumerate(lead_ids, start=1):
            conn.execute(
                "INSERT OR REPLACE INTO search_leads(search_id, lead_id, rank) VALUES (?,?,?)",
                (search_id, lead_id, rank),
            )

        api_calls = total_scraped
        estimated_cost = api_calls * APIFY_COST_PER_PLACE + APIFY_COST_START * attempts
        conn.execute(
            "UPDATE searches SET status='DONE', results_count=?, from_cache_count=?, "
            "estimated_cost_usd=?, duplicate_count=?, duplicate_lead_ids=?, "
            "finished_at=datetime('now') WHERE id=?",
            (
                len(lead_ids), from_cache_count, estimated_cost,
                len(duplicate_lead_ids), json.dumps(duplicate_lead_ids), search_id,
            ),
        )
        conn.commit()

        db.increment_setting("total_searches", 1)
        db.increment_setting("total_leads_collected", len(lead_ids))
        db.increment_setting("total_api_calls", api_calls)
        db.increment_setting("total_estimated_cost_usd", estimated_cost)

        logger.info(
            f"Busca {search_id} concluida: {len(lead_ids)} leads novos, "
            f"{len(duplicate_lead_ids)} duplicados ignorados, "
            f"{filtered_out_count} descartados por ja terem site, "
            f"{attempts} chamada(s) a apify, custo ~US${estimated_cost:.4f}"
        )

    except Exception as e:
        logger.error(f"Busca {search_id} falhou: {e}")
        conn.execute(
            "UPDATE searches SET status='ERROR', error=?, finished_at=datetime('now') WHERE id=?",
            (str(e), search_id),
        )
        conn.commit()
    finally:
        progress.clear(search_id)
        _cancelled.discard(search_id)


def _finish_cancelled(search_id: int):
    conn = db.get_conn()
    conn.execute(
        "UPDATE searches SET status='CANCELLED', finished_at=datetime('now') WHERE id=?",
        (search_id,),
    )
    conn.commit()
    progress.clear(search_id)
    _cancelled.discard(search_id)


def _get_known_place_ids(conn) -> set[str]:
    cur = conn.execute("SELECT place_id FROM leads WHERE place_id IS NOT NULL")
    return {row[0] for row in cur.fetchall()}


def _get_known_dedup_keys(conn) -> set[str]:
    cur = conn.execute("SELECT dedup_key FROM leads WHERE dedup_key IS NOT NULL")
    return {row[0] for row in cur.fetchall()}


def _resolve_existing_lead_ids(conn, duplicate_items) -> list[int]:
    ids = []
    seen = set()
    for place, _phone_e164, _is_mobile, key in duplicate_items:
        cur = conn.cursor()
        row = None
        if place.place_id:
            cur.execute("SELECT id FROM leads WHERE place_id=?", (place.place_id,))
            row = cur.fetchone()
        if not row:
            cur.execute("SELECT id FROM leads WHERE dedup_key=?", (key,))
            row = cur.fetchone()
        if row and row[0] not in seen:
            seen.add(row[0])
            ids.append(row[0])
    return ids


def _build_lead_data(place, phone_e164, is_mobile, site_result, enrichment) -> dict:
    dedup_key = place.place_id or build_dedup_key(place.name, phone_e164, place.address)

    if site_result is None:
        site_status, https, response_time_ms, page_size_bytes = "NOT_CHECKED", None, None, None
        has_title = has_viewport = has_contact_form = None
        whatsapp_found = phone_on_site = False
        tech_issues = []
        final_url = place.website_url
    else:
        site_status = site_result.site_status
        https = site_result.https
        response_time_ms = site_result.response_time_ms
        page_size_bytes = site_result.page_size_bytes
        has_title = site_result.has_title
        has_viewport = site_result.has_viewport
        has_contact_form = site_result.has_contact_form
        whatsapp_found = site_result.whatsapp_found
        phone_on_site = site_result.phone_on_site
        tech_issues = site_result.site_tech_issues
        final_url = site_result.final_url or place.website_url

    return {
        "place_id": place.place_id,
        "dedup_key": dedup_key,
        "name": place.name,
        "category": place.category,
        "phone_raw": place.phone_raw,
        "phone_e164": phone_e164,
        "is_mobile_phone": int(is_mobile),
        "address": place.address,
        "city": place.city,
        "state": place.state,
        "postal_code": place.postal_code,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "google_maps_url": place.google_maps_url,
        "rating": place.rating,
        "reviews_count": place.reviews_count,
        "permanently_closed": int(place.permanently_closed),
        "temporarily_closed": int(place.temporarily_closed),
        "website_url": place.website_url,
        "final_url": final_url,
        "site_status": site_status,
        "https": None if https is None else int(https),
        "response_time_ms": response_time_ms,
        "page_size_bytes": page_size_bytes,
        "has_title": None if has_title is None else int(has_title),
        "has_viewport": None if has_viewport is None else int(has_viewport),
        "has_contact_form": None if has_contact_form is None else int(has_contact_form),
        "site_tech_issues": tech_issues_to_json(tech_issues),
        "email": enrichment.email if enrichment else None,
        "instagram": enrichment.instagram if enrichment else None,
        "facebook": enrichment.facebook if enrichment else None,
        "linkedin": enrichment.linkedin if enrichment else None,
        "whatsapp_found": int(whatsapp_found),
        "phone_on_site": int(phone_on_site),
    }


def _upsert_lead(conn, lead: dict) -> int:
    cur = conn.cursor()
    cur.execute(
        "SELECT id, crm_status, notes FROM leads WHERE place_id=? OR dedup_key=?",
        (lead["place_id"], lead["dedup_key"]),
    )
    existing = cur.fetchone()

    reasons_json = json.dumps(lead.get("score_reasons", []), ensure_ascii=False)

    if existing:
        cur.execute(
            """UPDATE leads SET
                name=?, category=?, phone_raw=?, phone_e164=?, is_mobile_phone=?,
                address=?, city=?, state=?, postal_code=?, latitude=?, longitude=?,
                google_maps_url=?, rating=?, reviews_count=?,
                permanently_closed=?, temporarily_closed=?,
                website_url=?, final_url=?, site_status=?, https=?, response_time_ms=?,
                page_size_bytes=?, has_title=?, has_viewport=?, has_contact_form=?,
                site_tech_issues=?, email=?, instagram=?, facebook=?, linkedin=?,
                whatsapp_found=?, phone_on_site=?, score=?, score_class=?, score_reasons=?,
                last_enriched_at=datetime('now'), updated_at=datetime('now')
               WHERE id=?""",
            (
                lead["name"], lead["category"], lead["phone_raw"], lead["phone_e164"],
                lead["is_mobile_phone"], lead["address"], lead["city"], lead["state"],
                lead["postal_code"], lead["latitude"], lead["longitude"],
                lead["google_maps_url"], lead["rating"], lead["reviews_count"],
                lead["permanently_closed"], lead["temporarily_closed"],
                lead["website_url"], lead["final_url"], lead["site_status"], lead["https"],
                lead["response_time_ms"], lead["page_size_bytes"], lead["has_title"],
                lead["has_viewport"], lead["has_contact_form"], lead["site_tech_issues"],
                lead["email"], lead["instagram"], lead["facebook"], lead["linkedin"],
                lead["whatsapp_found"], lead["phone_on_site"],
                lead.get("score", 0), lead.get("score_class"), reasons_json,
                existing["id"],
            ),
        )
        conn.commit()
        return existing["id"]
    else:
        cur.execute(
            """INSERT INTO leads (
                place_id, dedup_key, name, category, phone_raw, phone_e164, is_mobile_phone,
                address, city, state, postal_code, latitude, longitude, google_maps_url,
                rating, reviews_count, permanently_closed, temporarily_closed,
                website_url, final_url, site_status, https, response_time_ms, page_size_bytes,
                has_title, has_viewport, has_contact_form, site_tech_issues,
                email, instagram, facebook, linkedin, whatsapp_found, phone_on_site,
                score, score_class, score_reasons, last_enriched_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))""",
            (
                lead["place_id"], lead["dedup_key"], lead["name"], lead["category"],
                lead["phone_raw"], lead["phone_e164"], lead["is_mobile_phone"],
                lead["address"], lead["city"], lead["state"], lead["postal_code"],
                lead["latitude"], lead["longitude"], lead["google_maps_url"],
                lead["rating"], lead["reviews_count"], lead["permanently_closed"],
                lead["temporarily_closed"], lead["website_url"], lead["final_url"],
                lead["site_status"], lead["https"], lead["response_time_ms"],
                lead["page_size_bytes"], lead["has_title"], lead["has_viewport"],
                lead["has_contact_form"], lead["site_tech_issues"], lead["email"],
                lead["instagram"], lead["facebook"], lead["linkedin"],
                lead["whatsapp_found"], lead["phone_on_site"],
                lead.get("score", 0), lead.get("score_class"), reasons_json,
            ),
        )
        conn.commit()
        return cur.lastrowid


def _lead_score(conn, lead_id: int) -> int:
    cur = conn.cursor()
    cur.execute("SELECT score FROM leads WHERE id=?", (lead_id,))
    row = cur.fetchone()
    return row["score"] if row else 0
