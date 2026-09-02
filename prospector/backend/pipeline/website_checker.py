import asyncio
import json
import logging
from dataclasses import dataclass, field
from urllib.parse import urlparse

import httpx
from selectolax.parser import HTMLParser

from backend.config import (
    SITE_CHECK_CONCURRENCY,
    SITE_CHECK_TIMEOUT_S,
    SITE_CHECK_RETRIES,
    SITE_MAX_BYTES,
    SOCIAL_DOMAINS,
)
from backend.scoring_config import SLOW_SITE_MS, TINY_SITE_BYTES

logger = logging.getLogger("prospector")

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


@dataclass
class SiteCheckResult:
    site_status: str = "NOT_CHECKED"
    final_url: str | None = None
    https: bool | None = None
    response_time_ms: int | None = None
    page_size_bytes: int | None = None
    has_title: bool | None = None
    has_viewport: bool | None = None
    has_contact_form: bool | None = None
    phone_on_site: bool = False
    whatsapp_found: bool = False
    site_tech_issues: list[str] = field(default_factory=list)
    html: str | None = None
    error: str | None = None


def _host_is_social(url: str) -> bool:
    try:
        host = urlparse(url).netloc.lower()
        host = host.split(":")[0]
        if host.startswith("www."):
            host = host[4:]
    except Exception:
        return False
    return any(host == d or host.endswith("." + d) for d in SOCIAL_DOMAINS)


async def check_website(url: str | None) -> SiteCheckResult:
    if not url or not url.strip():
        return SiteCheckResult(site_status="NO_WEBSITE")

    url = url.strip()
    if not urlparse(url).scheme:
        url = "https://" + url

    if _host_is_social(url):
        return SiteCheckResult(site_status="SOCIAL_ONLY", final_url=url)

    result = await _fetch(url)

    if result.final_url and _host_is_social(result.final_url):
        result.site_status = "SOCIAL_ONLY"
        return result

    if result.site_status == "ONLINE":
        _analyze_html(result)

    return result


async def _fetch(url: str) -> SiteCheckResult:
    attempts = SITE_CHECK_RETRIES + 1
    last_error = None
    schemes_to_try = [url]
    if url.startswith("https://"):
        schemes_to_try.append("http://" + url[len("https://"):])

    for candidate in schemes_to_try:
        for attempt in range(attempts):
            try:
                start = asyncio.get_event_loop().time()
                async with httpx.AsyncClient(
                    follow_redirects=True,
                    timeout=SITE_CHECK_TIMEOUT_S,
                    headers={"User-Agent": USER_AGENT},
                ) as client:
                    async with client.stream("GET", candidate) as resp:
                        body = b""
                        async for chunk in resp.aiter_bytes():
                            body += chunk
                            if len(body) >= SITE_MAX_BYTES:
                                break
                        elapsed_ms = int((asyncio.get_event_loop().time() - start) * 1000)
                        final_url = str(resp.url)
                        status_ok = 200 <= resp.status_code < 400

                        if not status_ok:
                            return SiteCheckResult(
                                site_status="HTTP_ERROR",
                                final_url=final_url,
                                https=final_url.startswith("https://"),
                                response_time_ms=elapsed_ms,
                            )

                        return SiteCheckResult(
                            site_status="ONLINE",
                            final_url=final_url,
                            https=final_url.startswith("https://"),
                            response_time_ms=elapsed_ms,
                            page_size_bytes=len(body),
                            html=body.decode(resp.encoding or "utf-8", errors="ignore"),
                        )
            except httpx.ConnectTimeout:
                last_error = "TIMEOUT"
            except httpx.TimeoutException:
                last_error = "TIMEOUT"
            except httpx.ConnectError as e:
                msg = str(e).lower()
                last_error = "DNS_ERROR" if "getaddrinfo" in msg or "name or service" in msg else "OFFLINE"
            except Exception as e:
                last_error = "OFFLINE"
                logger.debug(f"Website check error for {candidate}: {e}")

    return SiteCheckResult(site_status=last_error or "OFFLINE", error=last_error)


def _analyze_html(result: SiteCheckResult):
    if not result.html:
        return
    try:
        tree = HTMLParser(result.html)
    except Exception:
        return

    title_node = tree.css_first("title")
    result.has_title = bool(title_node and title_node.text(strip=True))

    viewport_node = tree.css_first('meta[name="viewport"]')
    result.has_viewport = bool(viewport_node)

    forms = tree.css("form")
    has_form = False
    for form in forms:
        if form.css_first('input[type="email"], input[type="tel"], textarea'):
            has_form = True
            break
    result.has_contact_form = has_form

    text_content = tree.body.text(separator=" ", strip=True) if tree.body else ""
    if any(m.startswith("tel:") for m in _hrefs(tree)) or _has_phone_pattern(text_content):
        result.phone_on_site = True

    if any("wa.me" in h or "api.whatsapp.com" in h for h in _hrefs(tree)):
        result.whatsapp_found = True

    issues = []
    if result.https is False:
        issues.append("Sem HTTPS")
    if result.has_title is False:
        issues.append("Sem tag <title>")
    if result.has_viewport is False:
        issues.append("Nao responsivo (sem viewport)")
    if result.response_time_ms and result.response_time_ms > SLOW_SITE_MS:
        issues.append("Site muito lento")
    if result.page_size_bytes and result.page_size_bytes < TINY_SITE_BYTES:
        issues.append("Site aparentemente muito simples/defasado")
    result.site_tech_issues = issues


def _hrefs(tree: HTMLParser) -> list[str]:
    return [a.attributes.get("href", "") or "" for a in tree.css("a[href]")]


def _has_phone_pattern(text: str) -> bool:
    import re
    return bool(re.search(r"\(\d{2}\)\s?\d{4,5}-?\d{4}", text))


def tech_issues_to_json(issues: list[str]) -> str:
    return json.dumps(issues, ensure_ascii=False)
