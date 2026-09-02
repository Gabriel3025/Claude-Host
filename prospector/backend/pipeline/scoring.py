from backend.scoring_config import WEIGHTS, CLASS_THRESHOLDS


def compute_score(
    site_status: str,
    https: bool | None,
    has_title: bool | None,
    has_viewport: bool | None,
    response_time_ms: int | None,
    page_size_bytes: int | None,
    phone_e164: str | None,
    is_mobile_phone: bool,
    whatsapp_found: bool,
    reviews_count: int,
    rating: float | None,
    slow_site_ms: int,
    tiny_site_bytes: int,
) -> tuple[int, str, list[str]]:
    score = 0
    reasons: list[str] = []

    # NECESSIDADE — mutuamente exclusivos
    if site_status == "NO_WEBSITE":
        score += WEIGHTS["NO_WEBSITE"]
        reasons.append("Sem website")
    elif site_status in ("OFFLINE", "TIMEOUT", "HTTP_ERROR", "DNS_ERROR"):
        score += WEIGHTS["SITE_DOWN"]
        reasons.append(f"Site fora do ar ({site_status})")
    elif site_status == "SOCIAL_ONLY":
        score += WEIGHTS["SOCIAL_ONLY"]
        reasons.append("Site aponta apenas para rede social")
    elif site_status == "ONLINE":
        tech_score = 0
        if https is False:
            tech_score += WEIGHTS["NO_HTTPS"]
            reasons.append("Site sem HTTPS")
        if has_title is False:
            tech_score += WEIGHTS["NO_TITLE"]
            reasons.append("Site sem tag de titulo")
        if has_viewport is False:
            tech_score += WEIGHTS["NO_VIEWPORT"]
            reasons.append("Site nao responsivo")
        if response_time_ms and response_time_ms > slow_site_ms:
            tech_score += WEIGHTS["SLOW_SITE"]
            reasons.append("Site muito lento")
        if page_size_bytes and page_size_bytes < tiny_site_bytes:
            tech_score += WEIGHTS["TINY_SITE"]
            reasons.append("Site aparentemente muito simples/defasado")
        score += min(tech_score, WEIGHTS["TECH_CAP"])

    # CONTATO
    if phone_e164:
        score += WEIGHTS["HAS_PHONE"]
        reasons.append("Telefone disponivel")
    if is_mobile_phone or whatsapp_found:
        score += WEIGHTS["HAS_WHATSAPP"]
        reasons.append("WhatsApp identificado")

    # ATIVIDADE
    review_points = 0
    if reviews_count > 10:
        review_points += WEIGHTS["REVIEWS_10"]
    if reviews_count > 50:
        review_points += WEIGHTS["REVIEWS_50"]
    if reviews_count > 100:
        review_points += WEIGHTS["REVIEWS_100"]
    if review_points:
        score += review_points
        reasons.append(f"{reviews_count} avaliacoes no Google")

    if rating is not None and rating >= 4.0 and reviews_count >= 10:
        reasons.append("Empresa aparentemente ativa")

    score = min(score, 100)

    if score >= CLASS_THRESHOLDS["A"]:
        score_class = "A"
    elif score >= CLASS_THRESHOLDS["B"]:
        score_class = "B"
    else:
        score_class = "C"

    return score, score_class, reasons
