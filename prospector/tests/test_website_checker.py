import pytest

from backend.pipeline.website_checker import check_website, _analyze_html, SiteCheckResult


@pytest.mark.asyncio
async def test_no_website():
    result = await check_website(None)
    assert result.site_status == "NO_WEBSITE"


@pytest.mark.asyncio
async def test_no_website_blank_string():
    result = await check_website("   ")
    assert result.site_status == "NO_WEBSITE"


@pytest.mark.asyncio
async def test_social_only_instagram():
    result = await check_website("https://instagram.com/escritoriosilva")
    assert result.site_status == "SOCIAL_ONLY"


@pytest.mark.asyncio
async def test_social_only_whatsapp():
    result = await check_website("https://wa.me/5531999999748")
    assert result.site_status == "SOCIAL_ONLY"


@pytest.mark.asyncio
async def test_social_only_linktree():
    result = await check_website("linktr.ee/escritorio")
    assert result.site_status == "SOCIAL_ONLY"


def test_analyze_html_full_page():
    html = """
    <html><head><title>Escritorio Silva</title>
    <meta name="viewport" content="width=device-width"></head>
    <body>
    <a href="tel:+5531999999748">Ligar</a>
    <form><input type="email"><textarea></textarea></form>
    </body></html>
    """
    result = SiteCheckResult(
        site_status="ONLINE", https=True, response_time_ms=200, page_size_bytes=50000, html=html
    )
    _analyze_html(result)
    assert result.has_title is True
    assert result.has_viewport is True
    assert result.has_contact_form is True
    assert result.phone_on_site is True
    assert result.site_tech_issues == []


def test_analyze_html_missing_everything():
    html = "<html><head></head><body>Pagina simples</body></html>"
    result = SiteCheckResult(
        site_status="ONLINE", https=False, response_time_ms=6000, page_size_bytes=3000, html=html
    )
    _analyze_html(result)
    assert result.has_title is False
    assert result.has_viewport is False
    assert "Sem HTTPS" in result.site_tech_issues
    assert "Sem tag <title>" in result.site_tech_issues
    assert "Nao responsivo (sem viewport)" in result.site_tech_issues
    assert "Site muito lento" in result.site_tech_issues
    assert "Site aparentemente muito simples/defasado" in result.site_tech_issues
