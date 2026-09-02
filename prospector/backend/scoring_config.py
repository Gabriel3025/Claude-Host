# scoring_config.py — pesos do score comercial (0-100).
# Alterar aqui reflete em todo o sistema. Nao duplicar valores em outro arquivo.

WEIGHTS = {
    # NECESSIDADE (mutuamente exclusivos entre si)
    "NO_WEBSITE": 45,
    "SITE_DOWN": 40,
    "SOCIAL_ONLY": 35,

    # NECESSIDADE (so quando site ONLINE; cumulativos, cap em TECH_CAP)
    "NO_HTTPS": 15,
    "NO_TITLE": 5,
    "NO_VIEWPORT": 10,
    "SLOW_SITE": 5,
    "TINY_SITE": 10,
    "TECH_CAP": 30,

    # POSSIBILIDADE DE CONTATO
    "HAS_PHONE": 15,
    "HAS_WHATSAPP": 5,

    # NEGOCIO ATIVO
    "REVIEWS_10": 5,
    "REVIEWS_50": 5,
    "REVIEWS_100": 5,
}

CLASS_THRESHOLDS = {"A": 75, "B": 50}

SLOW_SITE_MS = 5000
TINY_SITE_BYTES = 15000
