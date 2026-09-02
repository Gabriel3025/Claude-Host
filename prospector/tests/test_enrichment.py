from backend.pipeline.enrichment import enrich_from_html, enrich_from_social_url

HTML = """
<html><body>
<a href="mailto:contato@escritorio.com.br">Fale conosco</a>
<a href="https://instagram.com/escritoriosilva">Instagram</a>
<a href="https://www.facebook.com/escritoriosilva">Facebook</a>
<a href="https://linkedin.com/company/escritoriosilva">LinkedIn</a>
<a href="https://instagram.com/p/xyz123">post</a>
</body></html>
"""


def test_enrich_extracts_email():
    result = enrich_from_html(HTML)
    assert result.email == "contato@escritorio.com.br"


def test_enrich_extracts_instagram_ignores_posts():
    result = enrich_from_html(HTML)
    assert "escritoriosilva" in result.instagram
    assert "/p/" not in result.instagram


def test_enrich_extracts_facebook():
    result = enrich_from_html(HTML)
    assert "facebook.com/escritoriosilva" in result.facebook


def test_enrich_extracts_linkedin():
    result = enrich_from_html(HTML)
    assert "linkedin.com/company/escritoriosilva" in result.linkedin


def test_enrich_empty_html():
    result = enrich_from_html(None)
    assert result.email is None
    assert result.instagram is None


def test_enrich_rejects_image_as_email():
    html = '<a href="mailto:banner@sentry.io">x</a><p>logo@site.png info@example.com</p>'
    result = enrich_from_html(html)
    assert result.email is None


def test_enrich_from_social_url_instagram():
    result = enrich_from_social_url("https://www.instagram.com/fornodiorobh")
    assert result.instagram == "https://www.instagram.com/fornodiorobh"
    assert result.facebook is None


def test_enrich_from_social_url_facebook():
    result = enrich_from_social_url("https://www.facebook.com/escritoriosilva")
    assert result.facebook == "https://www.facebook.com/escritoriosilva"
    assert result.instagram is None


def test_enrich_from_social_url_whatsapp_maps_to_nothing():
    result = enrich_from_social_url("https://wa.me/5531999999748")
    assert result.instagram is None
    assert result.facebook is None
    assert result.linkedin is None


def test_enrich_from_social_url_empty():
    result = enrich_from_social_url(None)
    assert result.instagram is None
