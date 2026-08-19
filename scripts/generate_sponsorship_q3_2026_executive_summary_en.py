from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "sponsorship-q3-2026-executive-summary-en.pdf"

W, H = landscape(A4)
M = 34
CONTENT_W = W - 2 * M

NAVY = HexColor("#071A33")
NAVY_2 = HexColor("#10395E")
NAVY_3 = HexColor("#174A73")
GOLD = HexColor("#D4A640")
GOLD_PALE = HexColor("#F7EED8")
PAPER = HexColor("#F5F7F5")
WHITE = HexColor("#FFFFFF")
INK = HexColor("#15243A")
MUTED = HexColor("#617086")
LINE = HexColor("#D9E1E6")
GREEN = HexColor("#08734F")
GREEN_PALE = HexColor("#E7F4EE")
BLUE_PALE = HexColor("#EAF1F7")
ORANGE = HexColor("#F47B20")

pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegoeBold", r"C:\Windows\Fonts\segoeuib.ttf"))


def style(name, size, color=INK, leading=None, bold=False, align=TA_LEFT):
    return ParagraphStyle(
        name,
        fontName="SegoeBold" if bold else "Segoe",
        fontSize=size,
        leading=leading or size * 1.28,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )


def para(c, text, x, top, width, paragraph_style, max_height=500):
    item = Paragraph(text, paragraph_style)
    _, height = item.wrap(width, max_height)
    item.drawOn(c, x, top - height)
    return top - height


def box(c, x, y, width, height, fill, stroke=LINE, radius=12, line_width=0.8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line_width)
    c.roundRect(x, y, width, height, radius, fill=1, stroke=1)


def brand(c, x, y, width=125, dark=False):
    asset = "_raw-logo-horizontal-light.png" if dark else "alsagri-logo-horizontal-dark.png"
    c.drawImage(
        str(ROOT / "assets" / asset),
        x,
        y,
        width=width,
        height=31,
        preserveAspectRatio=True,
        anchor="sw",
        mask="auto",
    )


def footer(c, page_number, dark=False):
    line_color = HexColor("#36516D") if dark else LINE
    text_color = HexColor("#C3D0DC") if dark else MUTED
    c.setStrokeColor(line_color)
    c.setLineWidth(0.55)
    c.line(M, 35, W - M, 35)
    para(
        c,
        "MOBILE  +966 505713333  |  EMAIL  alsagricapital@gmail.com  |  X  @AlsagriCapital",
        M,
        27,
        540,
        style(f"footer-contact-{page_number}", 6.8, text_color, 8.5, True),
    )
    para(
        c,
        f"Q3 2026 SAUDI EARNINGS SEASON  |  {page_number} / 2",
        W - M - 220,
        27,
        220,
        style(f"footer-page-{page_number}", 6.6, text_color, 8.5, True, TA_RIGHT),
    )


def metric_card(c, x, y, width, value, label, note, featured=False):
    fill = NAVY if featured else WHITE
    stroke = NAVY if featured else LINE
    value_color = GOLD if featured else NAVY
    label_color = HexColor("#D8E2EC") if featured else MUTED
    note_color = HexColor("#B6C7D7") if featured else MUTED
    box(c, x, y, width, 88, fill, stroke, 11, 0.8)
    para(c, value, x + 8, y + 69, width - 16, style(f"metric-v-{value}", 22, value_color, 24, True, TA_CENTER))
    para(c, label, x + 8, y + 39, width - 16, style(f"metric-l-{value}", 7.3, label_color, 9.4, True, TA_CENTER))
    para(c, note, x + 8, y + 17, width - 16, style(f"metric-n-{value}", 6.3, note_color, 8, False, TA_CENTER))


def bullet(c, text, x, top, width, color=INK, size=8.1):
    c.setFillColor(GOLD)
    c.circle(x + 3, top - 6, 2.1, fill=1, stroke=0)
    return para(c, text, x + 13, top, width - 13, style(f"bullet-{text[:8]}", size, color, size * 1.36))


def page_one(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    hero_y = 403
    hero_h = H - hero_y
    c.setFillColor(NAVY)
    c.rect(0, hero_y, W, hero_h, fill=1, stroke=0)
    c.setFillColor(NAVY_2)
    c.circle(W - 20, H - 30, 145, fill=1, stroke=0)
    c.setFillColor(NAVY_3)
    c.circle(W - 12, H - 28, 93, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, H - 5, W, 5, fill=1, stroke=0)

    brand(c, M, H - 49, 142, dark=True)
    para(c, "EXECUTIVE SPONSORSHIP BRIEF  |  Q3 2026", M, H - 73, 480, style("p1-kicker", 8.2, GOLD, 10, True))
    para(c, "Own the Saudi earnings season.", M, H - 98, 530, style("p1-title", 29, WHITE, 33, True))
    para(
        c,
        "Exclusive sponsorship of the only X account dedicated to covering earnings calls of Saudi-listed companies.",
        M,
        H - 139,
        548,
        style("p1-subtitle", 10.2, HexColor("#D6E1EB"), 14),
    )

    price_x = W - M - 166
    box(c, price_x, hero_y + 40, 146, 92, HexColor("#102E4D"), HexColor("#41607D"), 13)
    para(c, "EXCLUSIVE PACKAGE", price_x + 10, hero_y + 111, 126, style("price-label", 7.3, GOLD, 9, True, TA_CENTER))
    para(c, "SAR 95,000", price_x + 10, hero_y + 83, 126, style("price", 23, WHITE, 26, True, TA_CENTER))
    para(c, "One partner for the season", price_x + 10, hero_y + 51, 126, style("price-note", 6.8, HexColor("#C5D4E2"), 8.5, False, TA_CENTER))

    para(c, "SEASON TWO PERFORMANCE", M, 383, CONTENT_W, style("p1-perf-kicker", 7.8, GREEN, 10, True))
    para(c, "Proven attention. Focused audience. Repeated brand exposure.", M, 365, CONTENT_W, style("p1-perf-title", 14.5, NAVY, 17.5, True))
    gap = 10
    card_w = (CONTENT_W - gap * 3) / 4
    y = 252
    metric_card(c, M, y, card_w, "81K", "AVERAGE VIEWS PER CALL", "Q2 coverage benchmark", True)
    metric_card(c, M + card_w + gap, y, card_w, "4.2M", "TOTAL SERIES VIEWS", "Historical series performance")
    metric_card(c, M + (card_w + gap) * 2, y, card_w, "16M", "ACCOUNT VIEWS", "Across the campaign period")
    metric_card(c, M + (card_w + gap) * 3, y, card_w, "45+", "PUBLISHED COVERAGES", "Minimum season commitment")

    panel_y = 66
    panel_h = 158
    left_w = 487
    box(c, M, panel_y, left_w, panel_h, WHITE, LINE, 14)
    para(c, "THE EXECUTIVE CASE", M + 18, panel_y + panel_h - 17, left_w - 36, style("case-kicker", 7.8, GREEN, 10, True))
    para(
        c,
        "This is not a one-post media buy. It is a season-long association with the moments investors actively seek: company results, management guidance, and analyst questions.",
        M + 18,
        panel_y + panel_h - 40,
        left_w - 36,
        style("case-copy", 11.2, NAVY, 15.2, True),
    )
    yb = panel_y + 64
    yb = bullet(c, "91+ core brand placements across the opening post and the coverage series.", M + 18, yb, left_w - 36, MUTED, 7.9) - 4
    bullet(c, "Interim and final reporting make performance visible and the campaign optimizable.", M + 18, yb, left_w - 36, MUTED, 7.9)

    right_x = M + left_w + 12
    right_w = CONTENT_W - left_w - 12
    box(c, right_x, panel_y, right_w, panel_h, GREEN_PALE, HexColor("#B9DCCA"), 14)
    para(c, "WHY IT MATTERS", right_x + 18, panel_y + panel_h - 17, right_w - 36, style("matter-kicker", 7.8, GREEN, 10, True))
    para(
        c,
        "One sponsor.<br/>One credible financial audience.<br/>A presence that compounds with every call covered.",
        right_x + 18,
        panel_y + panel_h - 43,
        right_w - 36,
        style("matter-title", 13.2, NAVY, 16.5, True),
    )
    para(c, "TERM", right_x + 18, panel_y + 31, 44, style("term-label", 6.5, GREEN, 8, True))
    para(c, "From signing through the start of Q4 earnings season.", right_x + 62, panel_y + 31, right_w - 80, style("term-value", 7.5, INK, 9.6, True))

    footer(c, 1)


def placement_card(c, x, y, width, number, title, body, proof):
    box(c, x, y, width, 137, WHITE, LINE, 12)
    box(c, x + 14, y + 94, 32, 29, NAVY, NAVY, 7, 0)
    para(c, number, x + 14, y + 114, 32, style(f"place-num-{number}", 9, GOLD, 11, True, TA_CENTER))
    para(c, title, x + 57, y + 116, width - 71, style(f"place-title-{number}", 10.5, NAVY, 13, True))
    para(c, body, x + 14, y + 80, width - 28, style(f"place-body-{number}", 7.6, MUTED, 10.2))
    box(c, x + 14, y + 14, width - 28, 28, BLUE_PALE, BLUE_PALE, 7, 0)
    para(c, proof, x + 20, y + 33, width - 40, style(f"place-proof-{number}", 6.8, NAVY, 8.5, True, TA_CENTER))


def page_two(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, H - 7, W, 7, fill=1, stroke=0)

    brand(c, M, H - 47, 127, dark=False)
    para(c, "PACKAGE ARCHITECTURE", M, H - 79, 350, style("p2-kicker", 7.8, GREEN, 10, True))
    para(c, "What the exclusive sponsor owns", M, H - 99, 480, style("p2-title", 23, NAVY, 27, True))
    para(
        c,
        "Three high-value placements connect the sponsor to the entire earnings season, supported by measurable reporting and a focused Saudi financial audience.",
        M,
        H - 134,
        555,
        style("p2-subtitle", 8.8, MUTED, 12),
    )

    proof_x = W - M - 205
    box(c, proof_x, H - 137, 205, 78, WHITE, HexColor("#F3C49D"), 11)
    para(c, "MARKET PROOF", proof_x + 13, H - 75, 98, style("proof-kicker", 6.8, ORANGE, 8.5, True))
    para(c, "Argaam sponsored the Q2 2026 earnings-call series.", proof_x + 13, H - 93, 118, style("proof-copy", 7.8, NAVY, 9.8, True))
    c.drawImage(
        str(ROOT / "assets" / "sponsorship" / "argaam-logo.png"),
        proof_x + 139,
        H - 123,
        width=52,
        height=35,
        preserveAspectRatio=True,
        anchor="sw",
        mask="auto",
    )

    card_gap = 11
    card_w = (CONTENT_W - card_gap * 2) / 3
    cards_y = 283
    placement_card(c, M, cards_y, card_w, "01", "Opening post", "The season hub launches the series and connects every earnings-call coverage in one reference point.", "1 placement  |  Q1 opener 325K  |  Q2 opener 400K")
    placement_card(c, M + card_w + card_gap, cards_y, card_w, "02", "Every coverage banner", "The sponsor logo is integrated into every published earnings-call cover image throughout the season.", "45+ placements  |  81K average views per call")
    placement_card(c, M + (card_w + card_gap) * 2, cards_y, card_w, "03", "Exclusive partner introduction", "The sponsor is presented before the full coverage, creating repeated context-rich brand association.", "45+ placements  |  Exclusive category presence")

    box(c, M, 246, CONTENT_W, 25, GOLD_PALE, HexColor("#E5CE96"), 8)
    para(c, "91+ CORE BRAND PLACEMENTS MINIMUM ACROSS THE EARNINGS-CALL SERIES", M + 14, 263, CONTENT_W - 28, style("placement-total", 8.2, NAVY, 10, True, TA_CENTER))

    lower_y = 65
    lower_h = 165
    left_w = 471
    box(c, M, lower_y, left_w, lower_h, WHITE, LINE, 12)
    para(c, "PACKAGE INCLUSIONS", M + 16, lower_y + lower_h - 16, left_w - 32, style("incl-kicker", 7.6, GREEN, 9.5, True))
    col_gap = 18
    col_w = (left_w - 50) / 2
    left_items = [
        "No competing sponsor inside the Saudi earnings series.",
        "Logo in every coverage banner and in the opening post.",
        "Sponsor presented as the exclusive season partner.",
        "At least 45 published coverages during the season.",
    ]
    right_items = [
        "Sponsor X account tagged in every published coverage.",
        "One mutually agreed call to action.",
        "Interim report after 15-20 coverages and a final report.",
    ]
    yl = lower_y + lower_h - 40
    for item in left_items:
        yl = bullet(c, item, M + 16, yl, col_w, MUTED, 7.25) - 5
    yr = lower_y + lower_h - 40
    for item in right_items:
        yr = bullet(c, item, M + 16 + col_w + col_gap, yr, col_w, MUTED, 7.25) - 5

    right_x = M + left_w + 12
    right_w = CONTENT_W - left_w - 12
    box(c, right_x, lower_y, right_w, lower_h, NAVY, NAVY, 12, 0)
    para(c, "AUDIENCE + MEASUREMENT", right_x + 16, lower_y + lower_h - 16, right_w - 32, style("aud-kicker", 7.6, GOLD, 9.5, True))
    audience = [("53K", "FOLLOWERS"), ("95%", "SAUDI AUDIENCE"), ("47%", "NON-FOLLOWER REACH")]
    stat_w = (right_w - 32) / 3
    for i, (value, label) in enumerate(audience):
        x = right_x + 16 + i * stat_w
        para(c, value, x, lower_y + 116, stat_w, style(f"aud-v-{value}", 15, WHITE, 18, True, TA_CENTER))
        para(c, label, x, lower_y + 93, stat_w, style(f"aud-l-{value}", 5.8, HexColor("#BFD0DF"), 7.5, True, TA_CENTER))
    c.setStrokeColor(HexColor("#34516D"))
    c.line(right_x + 16, lower_y + 77, right_x + right_w - 16, lower_y + 77)
    para(c, "Measured campaign: interim optimization, final performance report, X tags, and an agreed call to action.", right_x + 16, lower_y + 63, right_w - 32, style("aud-copy", 7.5, HexColor("#D5E0EA"), 10.2))
    para(c, "INVESTMENT  SAR 95,000", right_x + 16, lower_y + 24, right_w - 32, style("p2-price", 9, GOLD, 11, True, TA_CENTER))

    para(
        c,
        "Source: X analytics and available account data, snapshot August 20, 2026. Historical performance does not guarantee a minimum view count.",
        M,
        48,
        CONTENT_W,
        style("source-note", 5.8, MUTED, 7.2),
    )

    footer(c, 2)


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Q3 2026 Saudi Earnings Season - Executive Sponsorship Brief")
    c.setAuthor("Alsagri Capital")
    c.setSubject("Exclusive sponsorship of Saudi earnings-call coverage")
    page_one(c)
    c.showPage()
    page_two(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
