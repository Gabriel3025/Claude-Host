import asyncio
import logging
from typing import Callable, Optional

from apify_client import ApifyClient

from backend.config import APIFY_ACTOR_ID, APIFY_CALL_TIMEOUT_S
from backend.providers.base import RawPlace, SearchProvider

logger = logging.getLogger("prospector")

TERMINAL_STATUSES = {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}


class ApifyProvider(SearchProvider):
    name = "apify"

    def __init__(self, token: str):
        if not token:
            raise ValueError(
                "Token da Apify nao configurado. Abra Configuracoes e informe o APIFY_TOKEN."
            )
        self.client = ApifyClient(token)

    async def search(
        self,
        niche: str,
        city: str,
        state: str,
        region: Optional[str],
        limit: int,
        progress_cb: Callable[[int], None],
    ) -> tuple[list[RawPlace], str]:
        location_parts = [p for p in [region, city, state] if p]
        location_query = ", ".join(location_parts) + ", Brazil"

        run_input = {
            "searchStringsArray": [niche],
            "locationQuery": location_query,
            "maxCrawledPlacesPerSearch": limit,
            "language": "pt-BR",
            "countryCode": "br",
            "website": "allPlaces",
            "skipClosedPlaces": False,
            "scrapePlaceDetailPage": False,
            "scrapeContacts": False,
            "maxReviews": 0,
            "maxImages": 0,
            "maxQuestions": 0,
            "maximumLeadsEnrichmentRecords": 0,
        }

        actor_client = self.client.actor(APIFY_ACTOR_ID)

        run = await asyncio.to_thread(actor_client.start, run_input=run_input)
        run_id = run.id
        logger.info(f"Apify run started: {run_id} niche={niche} location={location_query}")

        dataset_id = run.default_dataset_id
        run_client = self.client.run(run_id)

        elapsed = 0
        poll_interval = 5
        status = run.status or "RUNNING"

        while status not in TERMINAL_STATUSES and elapsed < APIFY_CALL_TIMEOUT_S:
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
            run_info = await asyncio.to_thread(run_client.get)
            if run_info is not None:
                status = run_info.status or status
                dataset_id = run_info.default_dataset_id or dataset_id
            if dataset_id:
                try:
                    count_info = await asyncio.to_thread(
                        self.client.dataset(dataset_id).list_items, limit=0
                    )
                    progress_cb(count_info.total or 0)
                except Exception:
                    pass

        if status != "SUCCEEDED":
            raise RuntimeError(f"Apify run terminou com status {status} (run_id={run_id})")

        items = []
        if dataset_id:
            page = await asyncio.to_thread(
                self.client.dataset(dataset_id).list_items
            )
            items = page.items

        places = [self._map_item(item) for item in items]
        progress_cb(len(places))
        return places, run_id

    @staticmethod
    def _map_item(item: dict) -> RawPlace:
        location = item.get("location") or {}
        phone = item.get("phoneUnformatted") or item.get("phone")
        return RawPlace(
            place_id=item.get("placeId"),
            name=item.get("title") or "",
            category=item.get("categoryName"),
            phone_raw=phone,
            address=item.get("address"),
            city=item.get("city"),
            state=item.get("state"),
            postal_code=item.get("postalCode"),
            latitude=location.get("lat"),
            longitude=location.get("lng"),
            google_maps_url=item.get("url"),
            website_url=item.get("website"),
            rating=item.get("totalScore"),
            reviews_count=item.get("reviewsCount") or 0,
            permanently_closed=bool(item.get("permanentlyClosed")),
            temporarily_closed=bool(item.get("temporarilyClosed")),
        )
