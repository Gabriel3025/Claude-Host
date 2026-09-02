from backend.pipeline.scoring import compute_score
from backend.scoring_config import SLOW_SITE_MS, TINY_SITE_BYTES


def score(**kwargs):
    defaults = dict(
        site_status="NO_WEBSITE",
        https=None, has_title=None, has_viewport=None,
        response_time_ms=None, page_size_bytes=None,
        phone_e164=None, is_mobile_phone=False, whatsapp_found=False,
        reviews_count=0, rating=None,
        slow_site_ms=SLOW_SITE_MS, tiny_site_bytes=TINY_SITE_BYTES,
    )
    defaults.update(kwargs)
    return compute_score(**defaults)


def test_no_website_alone():
    s, cls, reasons = score(site_status="NO_WEBSITE")
    assert s == 45
    assert cls == "C"
    assert "Sem website" in reasons


def test_site_down():
    s, cls, reasons = score(site_status="OFFLINE")
    assert s == 40
    assert any("fora do ar" in r for r in reasons)


def test_social_only():
    s, cls, reasons = score(site_status="SOCIAL_ONLY")
    assert s == 35


def test_needs_are_mutually_exclusive():
    # Only one of NO_WEBSITE/SITE_DOWN/SOCIAL_ONLY/tech-issues applies
    s, _, _ = score(site_status="SOCIAL_ONLY", https=False)
    assert s == 35  # https flag ignored, since site isn't ONLINE


def test_online_tech_cap():
    s, cls, reasons = score(
        site_status="ONLINE", https=False, has_title=False,
        has_viewport=False, response_time_ms=6000, page_size_bytes=5000,
    )
    # 15+5+10+5+10 = 45, capped at 30
    assert s == 30


def test_has_phone():
    s, _, reasons = score(site_status="NO_WEBSITE", phone_e164="+5531999999748")
    assert s == 60
    assert "Telefone disponivel" in reasons


def test_whatsapp_mobile():
    s, _, reasons = score(
        site_status="NO_WEBSITE", phone_e164="+5531999999748", is_mobile_phone=True
    )
    assert s == 65
    assert "WhatsApp identificado" in reasons


def test_reviews_tiers():
    s, _, _ = score(site_status="NO_WEBSITE", reviews_count=11)
    assert s == 50
    s, _, _ = score(site_status="NO_WEBSITE", reviews_count=51)
    assert s == 55
    s, _, _ = score(site_status="NO_WEBSITE", reviews_count=101)
    assert s == 60


def test_score_cap_100():
    s, cls, _ = score(
        site_status="NO_WEBSITE", phone_e164="+5531999999748",
        is_mobile_phone=True, reviews_count=200, rating=5.0,
    )
    assert s <= 100
    assert cls == "A"


def test_high_opportunity_example():
    # Sem site + telefone celular + 127 avaliacoes + rating alto
    s, cls, reasons = score(
        site_status="NO_WEBSITE",
        phone_e164="+5531999999748", is_mobile_phone=True,
        reviews_count=127, rating=4.8,
    )
    assert s == 45 + 15 + 5 + 5 + 5 + 5  # 80
    assert cls == "A"
    assert "Empresa aparentemente ativa" in reasons


def test_canonical_example_score_75():
    s, cls, _ = score(
        site_status="NO_WEBSITE", phone_e164="+5531999999748",
        is_mobile_phone=True, reviews_count=87,
    )
    assert s == 75
    assert cls == "A"


def test_class_thresholds():
    _, cls_a, _ = score(site_status="NO_WEBSITE", phone_e164="+5531999999748",
                         is_mobile_phone=True, reviews_count=101)
    assert cls_a == "A"
    _, cls_b, _ = score(site_status="SOCIAL_ONLY", phone_e164="+5531999999748")
    assert cls_b == "B"
    _, cls_c, _ = score(site_status="ONLINE")
    assert cls_c == "C"
