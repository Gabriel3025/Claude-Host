import re
import unicodedata


def normalize_phone(phone_raw: str | None) -> tuple[str | None, bool]:
    """Returns (phone_e164, is_mobile_phone)."""
    if not phone_raw:
        return None, False

    digits = re.sub(r"\D", "", phone_raw)

    if digits.startswith("55") and 12 <= len(digits) <= 13:
        national = digits[2:]
    elif 10 <= len(digits) <= 11:
        national = digits
    else:
        return None, False

    if len(national) not in (10, 11):
        return None, False

    phone_e164 = "+55" + national
    is_mobile = len(national) == 11 and national[2] == "9"
    return phone_e164, is_mobile


def format_phone_display(phone_e164: str | None) -> str | None:
    if not phone_e164:
        return None
    national = phone_e164[3:]
    ddd = national[:2]
    rest = national[2:]
    if len(rest) == 9:
        return f"({ddd}) {rest[:5]}-{rest[5:]}"
    if len(rest) == 8:
        return f"({ddd}) {rest[:4]}-{rest[4:]}"
    return phone_e164


def slugify(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text.strip("-")


def build_dedup_key(name: str, phone_e164: str | None, address: str | None) -> str:
    name_slug = slugify(name)
    tail = phone_e164 or slugify(address or "")
    return f"{name_slug}|{tail}"
