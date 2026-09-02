from backend.pipeline.normalize import normalize_phone, format_phone_display, build_dedup_key, slugify


def test_normalize_mobile_with_country_code():
    e164, mobile = normalize_phone("+55 31 99999-9748")
    assert e164 == "+5531999999748"
    assert mobile is True


def test_normalize_mobile_without_country_code():
    e164, mobile = normalize_phone("(31) 99999-9748")
    assert e164 == "+5531999999748"
    assert mobile is True


def test_normalize_landline():
    e164, mobile = normalize_phone("(31) 3213-4567")
    assert e164 == "+553132134567"
    assert mobile is False


def test_normalize_invalid_short():
    e164, mobile = normalize_phone("12345")
    assert e164 is None
    assert mobile is False


def test_normalize_empty():
    e164, mobile = normalize_phone(None)
    assert e164 is None
    assert mobile is False


def test_format_phone_display_mobile():
    assert format_phone_display("+5531999999748") == "(31) 99999-9748"


def test_format_phone_display_landline():
    assert format_phone_display("+553132134567") == "(31) 3213-4567"


def test_slugify():
    assert slugify("Silva & Almeida Advocacia") == "silva-almeida-advocacia"


def test_build_dedup_key_with_phone():
    key = build_dedup_key("Silva Advocacia", "+5531999999748", "Rua X, 100")
    assert key == "silva-advocacia|+5531999999748"


def test_build_dedup_key_without_phone():
    key = build_dedup_key("Silva Advocacia", None, "Rua X, 100")
    assert key == "silva-advocacia|rua-x-100"
