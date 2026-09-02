import re
from dataclasses import dataclass

from selectolax.parser import HTMLParser

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
BAD_EMAIL_SUFFIXES = (".png", ".jpg", ".jpeg", ".webp", ".css", ".js", ".gif", ".svg")
BAD_EMAIL_DOMAINS = ("example.", "sentry.", "wixpress", "schema.org", "godaddy")


@dataclass
class EnrichmentResult:
    email: str | None = None
    instagram: str | None = None
    facebook: str | None = None
    linkedin: str | None = None


def enrich_from_html(html: str | None) -> EnrichmentResult:
    result = EnrichmentResult()
    if not html:
        return result

    try:
        tree = HTMLParser(html)
    except Exception:
        return result

    hrefs = [a.attributes.get("href", "") or "" for a in tree.css("a[href]")]

    for href in hrefs:
        if href.startswith("mailto:"):
            candidate = href[len("mailto:"):].split("?")[0].strip()
            if _is_valid_email(candidate):
                result.email = candidate
                break

    if not result.email:
        text = tree.body.text(separator=" ", strip=True) if tree.body else ""
        for match in EMAIL_RE.findall(text):
            if _is_valid_email(match):
                result.email = match
                break

    for href in hrefs:
        low = href.lower()
        if "instagram.com" in low and not result.instagram:
            if not any(seg in low for seg in ("/p/", "/reel/", "/explore/")):
                result.instagram = _normalize_url(href)
        elif ("facebook.com" in low or "fb.com" in low) and not result.facebook:
            if not any(seg in low for seg in ("/sharer", "/share.php", "/plugins")):
                result.facebook = _normalize_url(href)
        elif "linkedin.com" in low and not result.linkedin:
            if "/company/" in low or "/in/" in low:
                result.linkedin = _normalize_url(href)

    return result


def _is_valid_email(email: str) -> bool:
    if not email or "@" not in email:
        return False
    low = email.lower()
    if any(low.endswith(suf) for suf in BAD_EMAIL_SUFFIXES):
        return False
    if any(dom in low for dom in BAD_EMAIL_DOMAINS):
        return False
    return True


def _normalize_url(href: str) -> str:
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("http"):
        return href
    return "https://" + href.lstrip("/")
