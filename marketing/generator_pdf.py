# -*- coding: utf-8 -*-
# Loyavi prodajni PDF v3 — knjižna slovenščina (vikanje) + angleška različica.
# Zagon:  python marketing/generator_pdf.py   →  ustvari SL + EN PDF v marketing/.
import math, os
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

DIR = os.path.dirname(os.path.abspath(__file__))
pdfmetrics.registerFont(TTFont("Seg", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegB", r"C:\Windows\Fonts\segoeuib.ttf"))

W, H = A4
INK = HexColor("#2A241D"); CREAM = HexColor("#FBF7F0"); PAPER = HexColor("#FBF3E6")
CORAL = HexColor("#C4623D"); AMBER = HexColor("#E2A04A"); GREEN = HexColor("#5E7F52")
MUTED = HexColor("#6E6253"); BORD = HexColor("#EFE6D6"); WHITE = HexColor("#FFFFFF")
LIGHTAMBER = HexColor("#FCEFD8"); DARKTXT = HexColor("#F8F3EA"); SOFT = HexColor("#9A8F80")

# ─────────────────────────── BESEDILA ───────────────────────────
SL = dict(
    out="Loyavi-predstavitev.pdf",
    title="Loyavi — kartica zvestobe za lokale",
    p1_label="predstavitev za lokale", p2_label="kolo sreče in marketing", p3_label="pilotna ponudba",
    footer_left="Loyavi — kartica zvestobe za lokale",
    p1_kicker="STROJ ZA OCENE NA GOOGLU",
    p1_h1="Več zvezdic na Googlu.", p1_h2="Več novih gostov.",
    p1_intro="Gostje danes lokal izberejo na podlagi ocen na Googlu. Loyavi po vsakem obisku gosta povabi, naj obisk oceni — in ocene pametno loči: dobre gredo na Google, slabe ostanejo pri vas, zasebno.",
    card_name="Kavarna Lipa", card_sub="kartica zvestobe", card_note="še 3 obiski do brezplačne kave",
    box1_t="3 zvezdice ali manj",
    box1_d="Ocena ostane pri vas kot zasebna povratna informacija — gost ne gre na Google. Vi pa izveste, kaj je treba popraviti, preden gre zgodba v javnost.",
    box2_t="4 ali 5 zvezdic",
    box2_d="Gost jo z enim dotikom objavi na Googlu. Vaša povprečna ocena in število ocen tako rasteta vsak dan — samodejno, brez prošenj.",
    p1_bullets=[
        "Prestreže nezadovoljne goste, preden svoje mnenje objavijo javno.",
        "Zadovoljne z enim dotikom usmeri naravnost na Google.",
        "Vsa zasebna mnenja so zbrana v vaši nadzorni plošči.",
    ],
    stats_kicker="ŠTEVILKE, KI ŠTEJEJO",
    stats=[
        ("93 %", "gostov pred obiskom preveri ocene na Googlu*", CORAL, False),
        ("+0,3", "že nekoliko višja ocena opazno poveča obisk*", AMBER, True),
        ("3×", "več ocen na Googlu kot brez sistema**", GREEN, False),
        ("67 %", "več porabi stalni gost v primerjavi z novim*", INK, False),
    ],
    stats_foot="* panožne raziskave (BrightLocal, Harvard Business Review)    ** cilj pilotnega obdobja — svoje številke spremljate v nadzorni plošči",
    p2_kicker="KOLO SREČE",
    p2_h="Kako gosta sploh pridobite? Z darilom.",
    p2_intro="Najtežji del vsakega programa zvestobe je prvi korak. Loyavi ga reši z igro: nov gost ob prvem obisku zavrti kolo sreče — in vedno nekaj zadene.",
    wheel_bullets=[
        "Gost vedno zadene — nagrade in verjetnosti določite vi.",
        "Kupon se aktivira šele ob prvem skeniranem računu —",
        "nihče ne dobi nagrade brez pravega obiska.",
        "Ob vrtenju se gost registrira in je takoj v vaši bazi.",
        "Kolo lahko vgradite tudi na svojo spletno stran.",
    ],
    wheel_pill="BREZPLAČNA KAVA",
    steps_kicker="KAKO POTEKA — ZA GOSTA",
    steps=[
        ("01", "Skenira QR-kodo na mizi", "Odpre vašo stran zvestobe. Brez aplikacije in brez prenosa."),
        ("02", "Skenira račun", "QR-koda z računa prinese žig in točke. Traja deset sekund."),
        ("03", "Se vrača", "Poln kartonček pomeni nagrado. Vi pa gosta poznate in ga znate priklicati nazaj."),
    ],
    mkt_kicker="NEPOSREDNI MARKETING",
    mkt_h="Pošljite ponudbo naravnost v žep svojih gostov",
    mkt_cards=[
        ("Kampanje s kuponi", "Popusti, darila, akcije 2 za 1 — ustvarite in pošljete v minuti."),
        ("Pametni segmenti", "Najboljši gosti, neaktivni, novi — ali segment po vaši meri."),
        ("Avtomatizacije", "Vrnitev gostov, rojstni dnevi, obletnice — sporočila se pošljejo sama."),
        ("Merljiv učinek", "Vidite, kdo je kupon odprl, ga unovčil in se vrnil."),
    ],
    mkt_foot="Primer avtomatizacije: gost ne pride tri tedne → sistem mu sam pošlje sporočilo »pogrešamo te« s kuponom. Vi spite, sistem prodaja.",
    roi_kicker="PRIMER: KAVARNA Z 80 RAČUNI NA DAN",
    roi_l1="≈ 720 vključenih gostov na mesec    →    ≈ 430 dodatnih obiskov",
    roi_l2="≈ 1.700 € dodatnega prihodka na mesec (pri povprečnem računu 4 €)",
    roi_foot="Konzervativna ocena: vključi se približno 30 % gostov, vsak opravi približno 0,6 obiska več na mesec.",
    pilot_badge="PONUDBA ZA PRVE LOKALE",
    pilot_h="Cel mesec brezplačno. Vse nastavim jaz.",
    pilot_items=[
        "Celotno postavitev uredim jaz — kartico, nagrade, kolo sreče in QR-kode za mize.",
        "Zraven dobite natisnjen plakat s QR-kodo za mize.",
        "Brez kreditne kartice, brez vezave, brez drobnega tiska — odpoveste kadar koli.",
        "Osebna podpora: če se karkoli zatakne, sem dosegljiv na telefon.",
        "Po enem mesecu skupaj pogledamo vaše številke — odločitev je vaša.",
    ],
    pilot_foot="Če vam Loyavi ne prinese vrednosti, se preprosto razidemo — brez drame in brez stroškov.",
    pricing="Po pilotnem obdobju:  Start 49,99 €/mesec  ·  Grow 79,99 €/mesec  ·  letno plačilo = 2 meseca brezplačno  ·  brez vezave",
    demo_h="Preizkusite kot gost — zdaj, na svojem telefonu",
    demo_d="Skenirajte QR-kodo (ali odprite loyavi.app/p/demo): zavrtite kolo sreče, poglejte kartonček in preizkusite, kako poteka skeniranje računa. Točno to vidijo vaši gostje.",
    demo_link="Predstavitvena nadzorna plošča: loyavi.app/demo",
)

EN = dict(
    out="Loyavi-presentation-EN.pdf",
    title="Loyavi — the loyalty card for hospitality",
    p1_label="for cafés and restaurants", p2_label="lucky wheel and marketing", p3_label="pilot offer",
    footer_left="Loyavi — the loyalty card for hospitality",
    p1_kicker="THE GOOGLE REVIEWS ENGINE",
    p1_h1="More stars on Google.", p1_h2="More new customers.",
    p1_intro="Guests choose where to go based on Google reviews. After every visit, Loyavi invites your guest to rate their experience — and routes it smartly: good ratings go to Google, bad ones stay private, with you.",
    card_name="Café Lipa", card_sub="loyalty card", card_note="3 visits to a free coffee",
    box1_t="3 stars or fewer",
    box1_d="Stays with you as private feedback — the guest never reaches Google. You learn what needs fixing before it goes public.",
    box2_t="4 or 5 stars",
    box2_d="One tap posts it to Google. Your average rating and review count grow every single day — automatically, no begging.",
    p1_bullets=[
        "Intercepts unhappy guests before they post publicly.",
        "Sends happy guests straight to Google in one tap.",
        "All private feedback collected in your dashboard.",
    ],
    stats_kicker="NUMBERS THAT MATTER",
    stats=[
        ("93%", "of guests check Google reviews before visiting*", CORAL, False),
        ("+0.3", "even a slightly higher rating measurably lifts traffic*", AMBER, True),
        ("3×", "more Google reviews than without a system**", GREEN, False),
        ("67%", "more spent by a regular guest vs. a new one*", INK, False),
    ],
    stats_foot="* industry research (BrightLocal, Harvard Business Review)    ** pilot target — you track your own numbers in the dashboard",
    p2_kicker="THE LUCKY WHEEL",
    p2_h="How do you win a guest? With a gift.",
    p2_intro="The hardest part of any loyalty programme is the first step. Loyavi solves it with play: on their first visit, a new guest spins the lucky wheel — and always wins something.",
    wheel_bullets=[
        "Guests always win — you set the prizes and the odds.",
        "The coupon activates only after the first scanned receipt —",
        "nobody gets a reward without a real visit.",
        "Spinning registers the guest — instantly in your database.",
        "You can also embed the wheel on your own website.",
    ],
    wheel_pill="FREE COFFEE",
    steps_kicker="HOW IT WORKS — FOR THE GUEST",
    steps=[
        ("01", "Scans the table QR", "Opens your loyalty page. No app, no download."),
        ("02", "Scans the receipt", "The QR code on the receipt earns a stamp and points. Takes ten seconds."),
        ("03", "Keeps coming back", "A full card means a reward. And you know the guest — and how to bring them back."),
    ],
    mkt_kicker="DIRECT MARKETING",
    mkt_h="Send offers straight to your guests' pockets",
    mkt_cards=[
        ("Coupon campaigns", "Discounts, gifts, 2-for-1 — created and sent in a minute."),
        ("Smart segments", "Best guests, inactive, new — or fully custom."),
        ("Automations", "Win-back, birthdays, anniversaries — messages send themselves."),
        ("Measurable impact", "See who opened, redeemed and came back."),
    ],
    mkt_foot="Example: no visit in three weeks → a “we miss you” coupon goes out automatically. You sleep, the system sells.",
    roi_kicker="EXAMPLE: A CAFÉ WITH 80 RECEIPTS A DAY",
    roi_l1="≈ 720 enrolled guests a month    →    ≈ 430 extra visits",
    roi_l2="≈ €1,700 in extra revenue per month (at a €4 average ticket)",
    roi_foot="Conservative estimate: about 30% of guests enrol, each making about 0.6 extra visits a month.",
    pilot_badge="OFFER FOR FOUNDING VENUES",
    pilot_h="A full month free. I set everything up.",
    pilot_items=[
        "I do the entire setup — card, rewards, lucky wheel and table QR codes.",
        "You get a printed table poster with your QR code.",
        "No credit card, no contract, no fine print — cancel anytime.",
        "Personal support: if anything gets stuck, I'm a phone call away.",
        "After one month we review your numbers together — the decision is yours.",
    ],
    pilot_foot="If Loyavi doesn't earn its keep, we simply part ways — no drama, no cost.",
    pricing="After the pilot:  Start €49.99/month  ·  Grow €79.99/month  ·  annual billing = 2 months free  ·  no contract",
    demo_h="Try it as a guest — right now, on your phone",
    demo_d="Scan the QR code (or open loyavi.app/p/demo): spin the lucky wheel, view the stamp card and see how receipt scanning works. This is exactly what your guests see.",
    demo_link="Dashboard demo: loyavi.app/demo",
)

# ─────────────────────────── RISANJE ───────────────────────────
def build(S):
    out = os.path.join(DIR, S["out"])
    c = canvas.Canvas(out, pagesize=A4)
    c.setTitle(S["title"])

    def bg(): c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)

    def rrect(x, y, w, h, r, fill, stroke=None, sw=1):
        c.saveState()
        if stroke: c.setStrokeColor(stroke); c.setLineWidth(sw)
        c.setFillColor(fill)
        c.roundRect(x, y, w, h, r, stroke=1 if stroke else 0, fill=1)
        c.restoreState()

    def text(x, y, s, font="Seg", size=10, col=INK, align="left"):
        c.setFont(font, size); c.setFillColor(col)
        if align == "center": c.drawCentredString(x, y, s)
        elif align == "right": c.drawRightString(x, y, s)
        else: c.drawString(x, y, s)

    def wrap(x, y, s, width, font="Seg", size=10, col=MUTED, leading=None):
        leading = leading or size * 1.45
        words = s.split(); line = ""; yy = y
        for wrd in words:
            t = (line + " " + wrd).strip()
            if pdfmetrics.stringWidth(t, font, size) <= width: line = t
            else:
                text(x, yy, line, font, size, col); yy -= leading; line = wrd
        if line: text(x, yy, line, font, size, col)
        return yy - leading

    def cup(cx, cy, s, col):
        c.saveState(); c.setStrokeColor(col); c.setLineWidth(s * 0.14); c.setLineCap(1)
        b = s
        p = c.beginPath()
        p.moveTo(cx - b * 0.55, cy + b * 0.35); p.lineTo(cx + b * 0.35, cy + b * 0.35)
        p.lineTo(cx + b * 0.35, cy - b * 0.05)
        p.curveTo(cx + b * 0.35, cy - b * 0.5, cx - b * 0.55, cy - b * 0.5, cx - b * 0.55, cy - b * 0.05)
        p.close(); c.drawPath(p, stroke=1, fill=0)
        c.circle(cx + b * 0.55, cy + b * 0.02, b * 0.22, stroke=1, fill=0)
        c.restoreState()

    def star(cx, cy, r, fill):
        p = c.beginPath()
        for i in range(10):
            ang = math.pi / 2 + i * math.pi / 5
            rad = r if i % 2 == 0 else r * 0.42
            xx, yy = cx + rad * math.cos(ang), cy + rad * math.sin(ang)
            (p.moveTo if i == 0 else p.lineTo)(xx, yy)
        p.close(); c.setFillColor(fill); c.drawPath(p, stroke=0, fill=1)

    def stars_row(x, y, n, size, gap, fill, empty, total=5):
        for i in range(total):
            star(x + i * (size * 2 + gap), y, size, fill if i < n else empty)

    def check(x, y, s, col):
        c.saveState(); c.setStrokeColor(col); c.setLineWidth(s * 0.28); c.setLineCap(1); c.setLineJoin(1)
        p = c.beginPath(); p.moveTo(x - s * 0.5, y); p.lineTo(x - s * 0.1, y - s * 0.4); p.lineTo(x + s * 0.55, y + s * 0.45)
        c.drawPath(p, stroke=1, fill=0); c.restoreState()

    def wheel(cx, cy, r):
        cols = [CORAL, WHITE, AMBER, WHITE, GREEN, WHITE, AMBER, WHITE]
        for i, colw in enumerate(cols):
            c.saveState(); c.setFillColor(colw); c.setStrokeColor(BORD); c.setLineWidth(0.8)
            c.wedge(cx - r, cy - r, cx + r, cy + r, i * 45, 45, stroke=1, fill=1)
            c.restoreState()
        c.setStrokeColor(INK); c.setLineWidth(3)
        c.circle(cx, cy, r, stroke=1, fill=0)
        c.setFillColor(INK); c.circle(cx, cy, r * 0.22, stroke=0, fill=1)
        cup(cx, cy, r * 0.13, PAPER)
        p = c.beginPath(); p.moveTo(cx - 8, cy + r + 8); p.lineTo(cx + 8, cy + r + 8); p.lineTo(cx, cy + r - 6); p.close()
        c.setFillColor(INK); c.drawPath(p, stroke=0, fill=1)

    def logo(x, y, s=30):
        rrect(x, y, s, s, s * 0.3, INK)
        cup(x + s / 2, y + s / 2 - s * 0.02, s * 0.36, PAPER)
        text(x + s + 10, y + s * 0.28, "Loyavi", "SegB", s * 0.62, INK)

    def header(page_label):
        logo(46, H - 76, 30)
        text(W - 46, H - 62, "loyavi.app", "SegB", 11, CORAL, "right")
        text(W - 46, H - 76, page_label, "Seg", 8.5, SOFT, "right")

    def footer():
        c.setStrokeColor(BORD); c.setLineWidth(1); c.line(46, 52, W - 46, 52)
        text(46, 38, S["footer_left"], "Seg", 8.5, SOFT)
        text(W - 46, 38, "tin.suklje93@gmail.com   ·   loyavi.app", "Seg", 8.5, SOFT, "right")

    # ── STRAN 1 ──
    bg(); header(S["p1_label"])
    text(46, H - 128, S["p1_kicker"], "SegB", 10, CORAL)
    text(46, H - 158, S["p1_h1"], "SegB", 28, INK)
    text(46, H - 192, S["p1_h2"], "SegB", 28, CORAL)
    wrap(46, H - 218, S["p1_intro"], 330, "Seg", 11, MUTED)

    cw, ch = 150, 120; cx0, cy0 = W - 46 - cw, H - 262
    c.saveState(); c.translate(cx0 + cw/2, cy0 + ch/2); c.rotate(-3); c.translate(-(cx0 + cw/2), -(cy0 + ch/2))
    rrect(cx0, cy0, cw, ch, 14, WHITE, BORD, 1)
    rrect(cx0 + 12, cy0 + ch - 38, 26, 26, 8, INK); cup(cx0 + 25, cy0 + ch - 25, 9, PAPER)
    text(cx0 + 44, cy0 + ch - 28, S["card_name"], "SegB", 9.5, INK)
    text(cx0 + 44, cy0 + ch - 39, S["card_sub"], "Seg", 7, SOFT)
    for i in range(10):
        col_i = i % 5; row_i = i // 5
        sx = cx0 + 22 + col_i * 24; sy = cy0 + 50 - row_i * 22
        filled = i < 7
        c.setStrokeColor(CORAL if filled else BORD); c.setLineWidth(1.4)
        c.setFillColor(HexColor("#FBEFE9") if filled else CREAM)
        c.circle(sx, sy, 8, stroke=1, fill=1)
        if filled: cup(sx, sy, 4.5, CORAL)
    text(cx0 + cw/2, cy0 + 9, S["card_note"], "Seg", 6.5, SOFT, "center")
    c.restoreState()

    bw = (W - 92 - 14) / 2; by = H - 430
    rrect(46, by, bw, 122, 14, WHITE, BORD, 1)
    stars_row(46 + 26, by + 122 - 32, 2, 7, 5, SOFT, BORD)
    text(46 + 18, by + 122 - 56, S["box1_t"], "SegB", 12, INK)
    wrap(46 + 18, by + 122 - 74, S["box1_d"], bw - 36, "Seg", 8.5, MUTED, 11.5)

    rrect(46 + bw + 14, by, bw, 122, 14, AMBER)
    stars_row(46 + bw + 14 + 26, by + 122 - 32, 5, 7, 5, INK, HexColor("#C98A3B"))
    text(46 + bw + 14 + 18, by + 122 - 56, S["box2_t"], "SegB", 12, INK)
    wrap(46 + bw + 14 + 18, by + 122 - 74, S["box2_d"], bw - 36, "Seg", 8.5, HexColor("#5C4218"), 11.5)

    bl_y = H - 470
    for i, b in enumerate(S["p1_bullets"]):
        check(60, bl_y - i * 24 + 3, 7, GREEN)
        text(76, bl_y - i * 24, b, "SegB", 10.5, INK)

    text(46, H - 580, S["stats_kicker"], "SegB", 10, CORAL)
    nw = (W - 92 - 36) / 4
    for i, (v, l, colv, with_star) in enumerate(S["stats"]):
        x = 46 + i * (nw + 12); y = H - 700
        rrect(x, y, nw, 104, 12, WHITE, BORD, 1)
        text(x + 14, y + 58, v, "SegB", 23, colv)
        if with_star:
            star(x + 14 + pdfmetrics.stringWidth(v, "SegB", 23) + 12, y + 66, 9, AMBER)
        wrap(x + 14, y + 40, l, nw - 26, "Seg", 7.6, MUTED, 10.5)
    text(46, H - 720, S["stats_foot"], "Seg", 7, SOFT)
    footer(); c.showPage()

    # ── STRAN 2 ──
    bg(); header(S["p2_label"])
    text(46, H - 120, S["p2_kicker"], "SegB", 10, CORAL)
    text(46, H - 148, S["p2_h"], "SegB", 21, INK)
    wrap(46, H - 172, S["p2_intro"], 330, "Seg", 10.5, MUTED)

    wheel(W - 46 - 92, H - 260, 62)
    rrect(W - 46 - 152, H - 352, 120, 22, 11, LIGHTAMBER)
    text(W - 46 - 92, H - 345, S["wheel_pill"], "SegB", 8, HexColor("#8A5B14"), "center")

    wl_y = H - 232
    for i, b in enumerate(S["wheel_bullets"]):
        if i == 2:
            text(76, wl_y - i * 22, b, "SegB", 10, INK)
        else:
            check(60, wl_y - i * 22 + 3, 7, GREEN)
            text(76, wl_y - i * 22, b, "SegB", 10, INK)

    text(46, H - 400, S["steps_kicker"], "SegB", 10, CORAL)
    sw_ = (W - 92 - 24) / 3
    for i, (n, t, d) in enumerate(S["steps"]):
        x = 46 + i * (sw_ + 12); y = H - 510
        rrect(x, y, sw_, 96, 12, WHITE, BORD, 1)
        text(x + sw_ - 12, y + 96 - 28, n, "SegB", 20, HexColor("#EAD9BC"), "right")
        text(x + 14, y + 96 - 32, t, "SegB", 10.5, INK)
        wrap(x + 14, y + 96 - 50, d, sw_ - 28, "Seg", 8.2, MUTED, 11)

    text(46, H - 552, S["mkt_kicker"], "SegB", 10, CORAL)
    text(46, H - 578, S["mkt_h"], "SegB", 17, INK)
    fw = (W - 92 - 36) / 4
    for i, (t, d) in enumerate(S["mkt_cards"]):
        x = 46 + i * (fw + 12); y = H - 700
        rrect(x, y, fw, 108, 12, WHITE, BORD, 1)
        rrect(x + 12, y + 108 - 38, 25, 25, 8, LIGHTAMBER); cup(x + 24.5, y + 108 - 25.5, 7.5, CORAL)
        text(x + 12, y + 108 - 54, t, "SegB", 8.5, INK)
        wrap(x + 12, y + 108 - 69, d, fw - 24, "Seg", 7.4, MUTED, 10)
    text(46, H - 726, S["mkt_foot"], "SegB", 9, MUTED)
    footer(); c.showPage()

    # ── STRAN 3 ──
    bg(); header(S["p3_label"])
    ry = H - 210
    rrect(46, ry, W - 92, 100, 14, INK)
    text(66, ry + 100 - 28, S["roi_kicker"], "SegB", 9, AMBER)
    text(66, ry + 100 - 52, S["roi_l1"], "SegB", 13, DARKTXT)
    text(66, ry + 100 - 74, S["roi_l2"], "SegB", 13, HexColor("#9DBE8E"))
    text(66, ry + 12, S["roi_foot"], "Seg", 7.5, HexColor("#B7A488"))

    py = H - 500
    rrect(46, py, W - 92, 250, 16, WHITE, AMBER, 2.5)
    bw2 = pdfmetrics.stringWidth(S["pilot_badge"], "SegB", 8.5) + 36
    rrect(66, py + 250 - 40, bw2, 24, 12, LIGHTAMBER)
    text(66 + bw2 / 2, py + 250 - 33, S["pilot_badge"], "SegB", 8.5, HexColor("#8A5B14"), "center")
    text(66, py + 250 - 74, S["pilot_h"], "SegB", 20, INK)
    yy = py + 250 - 104
    for it in S["pilot_items"]:
        check(80, yy + 3, 7, GREEN)
        text(96, yy, it, "Seg", 10.5, INK)
        yy -= 24
    text(66, py + 16, S["pilot_foot"], "SegB", 9, MUTED)

    text(46, py - 30, S["pricing"], "SegB", 9.5, MUTED)

    qy = 78
    qr_img = qrcode.make("https://loyavi.app/p/demo", border=1)
    qr_path = os.path.join(DIR, "_demo_qr.png")
    qr_img.save(qr_path)
    rrect(46, qy, W - 92, 130, 14, PAPER, BORD, 1)
    c.drawImage(ImageReader(qr_path), 66, qy + 15, 100, 100, mask="auto")
    text(186, qy + 130 - 38, S["demo_h"], "SegB", 13, INK)
    wrap(186, qy + 130 - 58, S["demo_d"], W - 92 - 160, "Seg", 9.5, MUTED)
    text(186, qy + 22, S["demo_link"], "SegB", 9.5, CORAL)
    footer()
    c.save()
    os.remove(qr_path)
    print("OK:", out)

build(SL)
build(EN)
