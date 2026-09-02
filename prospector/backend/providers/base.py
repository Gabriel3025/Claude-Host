from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Callable, Optional


@dataclass
class RawPlace:
    """Neutral representation of a business returned by any search provider."""
    place_id: Optional[str] = None
    name: str = ""
    category: Optional[str] = None
    phone_raw: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    website_url: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: int = 0
    permanently_closed: bool = False
    temporarily_closed: bool = False


class SearchProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def search(
        self,
        niche: str,
        city: str,
        state: str,
        region: Optional[str],
        limit: int,
        progress_cb: Callable[[int], None],
    ) -> tuple[list[RawPlace], str]:
        """Returns (places, provider_run_id)."""
        raise NotImplementedError
