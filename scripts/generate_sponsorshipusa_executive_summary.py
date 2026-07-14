from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "sponsorshipusa-q2-2026-executive-summary.pdf"

W, H = A4
M = 40
CONTENT_W = W - (M * 2)

NAVY = HexColor("#071A33")
NAVY_2 = HexColor("#0D2D50")
GOLD = HexColor("#D3A447")
GOLD_LIGHT = HexColor("#F2E6C8")
CREAM = HexColor("#F7F5EF")
WHITE = HexColor("#FFFFFF")
INK = HexColor("#142238")
MUTED = HexColor("#5D6979")
LINE = HexColor("#DDE2E6")
GREEN = HexColor("#16834D")
GREEN_LIGHT = HexColor("#E6F4EC")
BLUE_LIGHT = HexColor("#EAF0F7")


pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegoeBold", r"C:\Windows\Fonts\segoeuib.ttf"))


def style(name, size, color=INK, leading=None, bold=False, align=TA_LEFT):
    return ParagraphStyle(
        name,
        fontName="SegoeBold" if bold else "Segoe",
        fontSize=size,
        leading=leading or size * 1.32,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )


S_KICKER = style("kicker", 8.5, GOLD, 11, True)
S_TITLE = style("title", 26, WHITE, 31, True)
S_SUBTITLE = style("subtitle", 11, HexColor("#D9E3EE"), 16)
S_H1 = style("h1", 23, NAVY, 28, True)
S_H2 = style("h2", 14, NAVY, 18, True)
S_BODY = style("body", 9.6, MUTED, 14)
S_BODY_DARK = style("bodyDark", 9.6, INK, 14)
S_SMALL = style("small", 7.5, MUTED, 10.5)
S_SMALL_WHITE = style("smallWhite", 7.8, HexColor("#D8E3EE"), 10.5)
S_CARD_VALUE = style("cardValue", 20, GOLD, 23, True, TA_CENTER)
S_CARD_LABEL = style("cardLabel", 7.6, MUTED, 10.5, True, TA_CENTER)
S_WHITE_H = style("whiteH", 13, WHITE, 17, True)


def draw_paragraph(c, text, x, y_top, width, paragraph_style, max_height=1000):
    p = Paragraph(text, paragraph_style)
    _, height = p.wrap(width, max_height)
    p.drawOn(c, x, y_top - height)
    return y_top - height


def rounded_box(c, x, y, width, height, fill, stroke=LINE, radius=10, stroke_width=0.8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(stroke_width)
    c.roundRect(x, y, width, height, radius, fill=1, stroke=1)


def draw_brand(c):
    rounded_box(c, M, H - 73, 42, 34, WHITE, LINE, 8)
    c.drawImage(
        str(ROOT / "assets" / "alsagri-as-mark.png"),
        M + 5,
        H - 68,
        width=32,
        height=23,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )
    c.setFont("SegoeBold", 11)
    c.setFillColor(NAVY)
    c.drawString(M + 52, H - 52, "ALSAGRI CAPITAL")
    c.setFont("Segoe", 7.5)
    c.setFillColor(MUTED)
    c.drawString(M + 52, H - 64, "@AlsagriCapital  |  Verified on X  |  Mawthooq license 618383")


def draw_footer(c, page_number):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(M, 28, W - M, 28)
    c.setFont("Segoe", 7)
    c.setFillColor(MUTED)
    c.drawString(M, 16, "alsagricapital.com/sponsorshipusa-q2-2026.html")
    c.drawRightString(W - M, 16, f"EXECUTIVE SUMMARY  |  JULY 14, 2026  |  {page_number} / 3")


def draw_page_base(c, page_number):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_brand(c)
    draw_footer(c, page_number)


def draw_kpi(c, x, y, width, height, value, label, dark=False):
    rounded_box(c, x, y, width, height, NAVY if dark else WHITE, NAVY if dark else LINE, 10)
    value_style = style("kpiValue", 18, GOLD, 21, True, TA_CENTER)
    label_style = style("kpiLabel", 7.3, HexColor("#D8E3EE") if dark else MUTED, 9.5, True, TA_CENTER)
    draw_paragraph(c, value, x + 8, y + height - 18, width - 16, value_style)
    draw_paragraph(c, label, x + 8, y + 27, width - 16, label_style)


def draw_bullet(c, text, x, y_top, width, font_size=9, color=MUTED):
    c.setFillColor(GOLD)
    c.circle(x + 4, y_top - 6, 2.2, fill=1, stroke=0)
    bullet_style = style(f"bullet-{font_size}", font_size, color, font_size * 1.42)
    return draw_paragraph(c, text, x + 14, y_top, width - 14, bullet_style)


def draw_chip(c, x, y, width, text, fill=BLUE_LIGHT, text_color=NAVY):
    rounded_box(c, x, y, width, 22, fill, fill, 11, 0)
    c.setFont("SegoeBold", 7.2)
    c.setFillColor(text_color)
    c.drawCentredString(x + width / 2, y + 7.5, text)


def page_one(c):
    draw_page_base(c, 1)

    hero_y = 500
    hero_h = 252
    rounded_box(c, M, hero_y, CONTENT_W, hero_h, NAVY, NAVY, 18, 0)
    c.setFillColor(NAVY_2)
    c.circle(W - 70, hero_y + 210, 105, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(M, hero_y + hero_h - 5, CONTENT_W, 5, fill=1, stroke=0)

    draw_paragraph(c, "EXECUTIVE SUMMARY  |  U.S. EARNINGS SEASON 2026", M + 24, hero_y + 220, 450, S_KICKER)
    draw_paragraph(c, "Become the exclusive sponsor of Alsagri's U.S. earnings season", M + 24, hero_y + 187, 455, S_TITLE)
    draw_paragraph(
        c,
        "The only account publishing Arabic-language earnings-call coverage for U.S.-listed companies. Sponsorship starts on the signing date and continues through September 15, 2026.",
        M + 24,
        hero_y + 106,
        460,
        S_SUBTITLE,
    )
    rounded_box(c, M + 24, hero_y + 24, 230, 34, HexColor("#102F52"), HexColor("#294A6E"), 8)
    c.setFillColor(HexColor("#4AD58A"))
    c.circle(M + 39, hero_y + 41, 3.2, fill=1, stroke=0)
    c.setFont("SegoeBold", 9)
    c.setFillColor(WHITE)
    c.drawString(M + 49, hero_y + 37.5, "CURRENTLY AVAILABLE")

    gap = 10
    kpi_w = (CONTENT_W - gap * 3) / 4
    y = 394
    draw_kpi(c, M, y, kpi_w, 84, "SAR 60,000", "SPONSORSHIP CONSIDERATION", True)
    draw_kpi(c, M + (kpi_w + gap), y, kpi_w, 84, "35+", "PUBLISHED COVERAGES")
    draw_kpi(c, M + (kpi_w + gap) * 2, y, kpi_w, 84, "71+", "CORE BRAND PLACEMENTS")
    draw_kpi(c, M + (kpi_w + gap) * 3, y, kpi_w, 84, "SEP 15", "AGREEMENT END DATE")

    y_top = 365
    draw_paragraph(c, "THE OPPORTUNITY", M, y_top, CONTENT_W, S_KICKER)
    y_top = draw_paragraph(c, "Own the season - with no competing sponsor inside the series", M, y_top - 17, CONTENT_W, S_H1)
    y_top = draw_paragraph(
        c,
        "No other sponsor will appear within the U.S. earnings series throughout the agreement term. Your brand is repeatedly placed inside serious financial content followed by investors, traders, executives, and market participants.",
        M,
        y_top - 10,
        CONTENT_W,
        S_BODY,
    )

    rounded_box(c, M, 176, CONTENT_W, 82, GOLD_LIGHT, HexColor("#E0C583"), 12)
    draw_paragraph(c, "WHAT THE COVERAGE DELIVERS", M + 16, 241, 220, style("goldPanelH", 10, NAVY, 13, True))
    draw_paragraph(
        c,
        "Alsagri turns leading earnings calls into structured Arabic coverage highlighting key figures, management guidance, and analyst questions.",
        M + 16,
        222,
        CONTENT_W - 32,
        S_BODY_DARK,
    )
    draw_paragraph(
        c,
        "Historical performance indicates total views may exceed 2.5 million, with no guaranteed minimum view count.",
        M + 16,
        194,
        CONTENT_W - 32,
        S_SMALL,
    )

    draw_paragraph(c, "PROMINENT COMPANIES EXPECTED IN SEASON COVERAGE", M, 148, CONTENT_W, S_KICKER)
    tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "MU", "META", "GOOGL", "AMD", "NFLX"]
    chip_gap = 6
    chip_w = (CONTENT_W - chip_gap * 9) / 10
    for i, ticker in enumerate(tickers):
        draw_chip(c, M + i * (chip_w + chip_gap), 104, chip_w, ticker)
    draw_paragraph(
        c,
        "The list may change based on earnings-call schedules and the significance of results.",
        M,
        94,
        CONTENT_W,
        S_SMALL,
    )


def page_two(c):
    draw_page_base(c, 2)
    draw_paragraph(c, "AUDIENCE AND PERFORMANCE", M, H - 105, CONTENT_W, S_KICKER)
    draw_paragraph(c, "A focused financial audience, backed by verified performance", M, H - 128, CONTENT_W, S_H1)
    draw_paragraph(c, "Actual account analytics and previous-season results, with clearly defined measurement periods.", M, H - 196, CONTENT_W, S_BODY)

    y = 510
    gap = 10
    card_w = (CONTENT_W - gap * 2) / 3
    draw_kpi(c, M, y, card_w, 94, "52K", "FOLLOWERS  |  JULY 13, 2026", True)
    draw_kpi(c, M + card_w + gap, y, card_w, 94, "95%", "AUDIENCE IN SAUDI ARABIA")
    draw_kpi(c, M + (card_w + gap) * 2, y, card_w, 94, "47%", "REACH FROM NON-FOLLOWERS")
    draw_paragraph(c, "Top interests: Saudi market, U.S. market, company results, investing, and trading.", M, 496, CONTENT_W, S_SMALL)

    draw_paragraph(c, "VERIFIED PERFORMANCE", M, 462, CONTENT_W, S_KICKER)
    perf = [
        ("13.2M", "Account impressions", "April 13 to July 13, 2026"),
        ("65K", "Average views per coverage", "Across 27 published coverages"),
        ("322K", "Previous season opener", "Historical result; no guarantee"),
    ]
    perf_y = 348
    for i, (value, label, note) in enumerate(perf):
        x = M + i * (card_w + gap)
        rounded_box(c, x, perf_y, card_w, 92, WHITE, LINE, 10)
        draw_paragraph(c, value, x + 10, perf_y + 72, card_w - 20, S_CARD_VALUE)
        draw_paragraph(c, label, x + 10, perf_y + 44, card_w - 20, S_CARD_LABEL)
        draw_paragraph(c, note, x + 10, perf_y + 19, card_w - 20, style(f"note{i}", 7.1, MUTED, 9.5, False, TA_CENTER))
    draw_paragraph(
        c,
        "Source: X analytics, data dated July 13, 2026. Impressions are the total number of times account posts were displayed during the stated period.",
        M,
        333,
        CONTENT_W,
        S_SMALL,
    )

    draw_paragraph(c, "BRAND PLACEMENT", M, 294, CONTENT_W, S_KICKER)
    draw_paragraph(c, "71+ core brand placements, plus one dedicated promotional post", M, 273, CONTENT_W, S_H2)
    placement_rows = [
        ("01", "Opening post - the series hub", "One opener links the season's coverage. The previous opener achieved 322K views; similar performance is targeted without guarantee.", "1 PLACEMENT"),
        ("02", "Every published coverage banner", "The sponsor logo is integrated into the cover image for every earnings-call coverage.", "35 PLACEMENTS  |  65K AVG."),
        ("03", "Beginning of every coverage", "The sponsor is presented as the exclusive season partner before the full coverage begins.", "35 PLACEMENTS"),
    ]
    row_y = 194
    for idx, (number, title, body, metric) in enumerate(placement_rows):
        y0 = row_y - idx * 63
        rounded_box(c, M, y0, CONTENT_W, 54, WHITE, LINE, 9)
        rounded_box(c, M + 12, y0 + 10, 34, 34, NAVY, NAVY, 8, 0)
        c.setFont("SegoeBold", 11)
        c.setFillColor(GOLD)
        c.drawCentredString(M + 29, y0 + 21.5, number)
        draw_paragraph(c, title, M + 58, y0 + 43, 252, style(f"placeTitle{idx}", 9.5, NAVY, 12, True))
        draw_paragraph(c, body, M + 58, y0 + 25, 326, style(f"placeBody{idx}", 7, MUTED, 9.2))
        rounded_box(c, W - M - 118, y0 + 15, 106, 24, GOLD_LIGHT, GOLD_LIGHT, 12, 0)
        c.setFont("SegoeBold", 6.8)
        c.setFillColor(NAVY)
        c.drawCentredString(W - M - 65, y0 + 23.5, metric)


def page_three(c):
    draw_page_base(c, 3)
    draw_paragraph(c, "EXCLUSIVE PACKAGE", M, H - 105, CONTENT_W, S_KICKER)
    draw_paragraph(c, "A measurable sponsorship designed to compound with every coverage", M, H - 128, CONTENT_W, S_H1)

    benefits = [
        ("Focused financial audience", "Investors and traders, not a general audience. Every view has context and value."),
        ("Persistent series reference", "The opening post links all season coverage, extending presence beyond a single post."),
        ("Repeated brand exposure", "The brand appears throughout at least 35 published coverages."),
        ("Measurable and optimizable", "An interim report supports message improvement before the final performance report."),
    ]
    gap = 10
    box_w = (CONTENT_W - gap) / 2
    start_y = 585
    for i, (title, body) in enumerate(benefits):
        col = i % 2
        row = i // 2
        x = M + col * (box_w + gap)
        y = start_y - row * 91
        rounded_box(c, x, y, box_w, 78, WHITE, LINE, 10)
        c.setFillColor(GOLD)
        c.rect(x, y, 4, 78, fill=1, stroke=0)
        draw_paragraph(c, title, x + 16, y + 61, box_w - 28, style(f"benefitTitle{i}", 10, NAVY, 13, True))
        draw_paragraph(c, body, x + 16, y + 39, box_w - 28, style(f"benefitBody{i}", 7.7, MUTED, 10.2))

    draw_paragraph(c, "PACKAGE INCLUSIONS", M, 466, CONTENT_W, S_KICKER)
    left_items = [
        "No competing sponsor inside the U.S. earnings series for the full agreement term.",
        "Sponsor visibility in the opening post.",
        "Logo inside the main banner of every published coverage.",
        "Sponsor presented as the exclusive season partner at the beginning of every coverage.",
        "At least 35 published coverages during the season.",
    ]
    right_items = [
        "Tagging the sponsor's X account in every published coverage (35+ times).",
        "One dedicated promotional post with mutually agreed copy.",
        "A mutually agreed call to action, such as Download the app or Learn about the service.",
        "Interim performance report after the first 15 to 20 coverages, followed by a final report after the season.",
    ]
    col_gap = 20
    col_w = (CONTENT_W - col_gap) / 2
    y_left = 442
    for item in left_items:
        y_left = draw_bullet(c, item, M, y_left, col_w, 8.1) - 7
    y_right = 442
    for item in right_items:
        y_right = draw_bullet(c, item, M + col_w + col_gap, y_right, col_w, 8.1) - 7

    panel_y = 178
    rounded_box(c, M, panel_y, CONTENT_W, 104, NAVY, NAVY, 13, 0)
    draw_paragraph(c, "SPONSORSHIP CONSIDERATION", M + 18, panel_y + 82, 230, S_KICKER)
    draw_paragraph(c, "SAR 60,000", M + 18, panel_y + 60, 200, style("price", 22, WHITE, 25, True))
    draw_paragraph(
        c,
        "VAT is not charged because the service provider was not registered for VAT as of the date this proposal was issued.",
        M + 18,
        panel_y + 31,
        250,
        S_SMALL_WHITE,
    )
    draw_paragraph(c, "EDITORIAL INDEPENDENCE", M + 298, panel_y + 82, 190, S_KICKER)
    draw_paragraph(
        c,
        "Alsagri retains full editorial independence in coverage and analysis. The sponsor pre-approves use of its identity and advertising message.",
        M + 298,
        panel_y + 58,
        190,
        S_SMALL_WHITE,
    )

    draw_paragraph(c, "DISCUSS THE SPONSORSHIP", M, 151, CONTENT_W, S_KICKER)
    rounded_box(c, M, 65, CONTENT_W, 68, GREEN_LIGHT, HexColor("#B9DDC8"), 11)
    c.setFillColor(GREEN)
    c.circle(M + 19, 114, 3.2, fill=1, stroke=0)
    c.setFont("SegoeBold", 9)
    c.drawString(M + 30, 110.5, "CURRENTLY AVAILABLE")
    c.setFont("SegoeBold", 9.2)
    c.setFillColor(NAVY)
    c.drawString(M + 16, 86, "X: @AlsagriCapital")
    c.drawString(M + 172, 86, "WhatsApp: +966 55 073 4332")
    c.drawString(M + 366, 86, "alsagricapital@gmail.com")


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Alsagri U.S. Earnings Season 2026 - Executive Summary")
    c.setAuthor("Alsagri Capital")
    c.setSubject("Exclusive sponsorship opportunity for U.S. earnings season coverage")

    page_one(c)
    c.showPage()
    page_two(c)
    c.showPage()
    page_three(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
