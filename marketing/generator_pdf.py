# -*- coding: utf-8 -*-
# Loyavi prodajni PDF v2 — fokus: (1) Google ocene, (2) kolo sreče, (3) pilot zastonj.
import math, os
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

OUT = r"C:\Users\YouN\Documents\Ai Projekti\Loyalti App\marketing\Loyavi-predstavitev.pdf"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

pdfmetrics.registerFont(TTFont("Seg", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegB", r"C:\Windows\Fonts\segoeuib.ttf"))

W, H = A4
INK = HexColor("#2A241D"); CREAM = HexColor("#FBF7F0"); PAPER = HexColor("#FBF3E6")
CORAL = HexColor("#C4623D"); AMBER = HexColor("#E2A04A"); GREEN = HexColor("#5E7F52")
MUTED = HexColor("#6E6253"); BORD = HexColor("#EFE6D6"); WHITE = HexColor("#FFFFFF")
LIGHTAMBER = HexColor("#FCEFD8"); DARKTXT = HexColor("#F8F3EA"); SOFT = HexColor("#9A8F80")

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Loyavi — kartica zvestobe za lokale")

def bg():
    c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)

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

def wrap(x, y, s, width, font="Seg", size=10, col=MUTED, leading=None, align="left"):
    leading = leading or size * 1.45
    words = s.split(); line = ""; yy = y
    for wrd in words:
        t = (line + " " + wrd).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width: line = t
        else:
            text(x, yy, line, font, size, col, align); yy -= leading; line = wrd
    if line: text(x, yy, line, font, size, col, align)
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
        x, y = cx + rad * math.cos(ang), cy + rad * math.sin(ang)
        (p.moveTo if i == 0 else p.lineTo)(x, y)
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
    c.setStrokeColor(INK); c.setLineWidth(3); c.setFillColor(WHITE)
    c.circle(cx, cy, r, stroke=1, fill=0)
    c.setFillColor(INK); c.circle(cx, cy, r * 0.22, stroke=0, fill=1)
    cup(cx, cy, r * 0.13, PAPER)
    # kazalec zgoraj
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
    text(46, 38, "Loyavi — kartica zvestobe za lokale", "Seg", 8.5, SOFT)
    text(W - 46, 38, "tin.suklje93@gmail.com   ·   loyavi.app", "Seg", 8.5, SOFT, "right")

# ═══════════ STRAN 1 — GOOGLE OCENE (glavni fokus) ═══════════
bg(); header("Google ocene = novi gostje")

text(46, H - 128, "STROJ ZA GOOGLE OCENE", "SegB", 10, CORAL)
text(46, H - 158, "Več zvezdic na Googlu.", "SegB", 28, INK)
text(46, H - 192, "Več novih gostov.", "SegB", 28, CORAL)
wrap(46, H - 218, "Gostje danes izberejo lokal po Google ocenah. Loyavi po vsakem obisku gosta povabi k oceni — in pametno loči: dobre gredo na Google, slabe ostanejo pri tebi, zasebno.", 330, "Seg", 11, MUTED)

# desno: mini kartonček
cw, ch = 150, 120; cx0, cy0 = W - 46 - cw, H - 262
c.saveState(); c.translate(cx0 + cw/2, cy0 + ch/2); c.rotate(-3); c.translate(-(cx0 + cw/2), -(cy0 + ch/2))
rrect(cx0, cy0, cw, ch, 14, WHITE, BORD, 1)
rrect(cx0 + 12, cy0 + ch - 38, 26, 26, 8, INK); cup(cx0 + 25, cy0 + ch - 25, 9, PAPER)
text(cx0 + 44, cy0 + ch - 28, "Kavarna Lipa", "SegB", 9.5, INK)
text(cx0 + 44, cy0 + ch - 39, "kartica zvestobe", "Seg", 7, SOFT)
for i in range(10):
    col_i = i % 5; row_i = i // 5
    sx = cx0 + 22 + col_i * 24; sy = cy0 + 50 - row_i * 22
    filled = i < 7
    c.setStrokeColor(CORAL if filled else BORD); c.setLineWidth(1.4)
    c.setFillColor(HexColor("#FBEFE9") if filled else CREAM)
    c.circle(sx, sy, 8, stroke=1, fill=1)
    if filled: cup(sx, sy, 4.5, CORAL)
text(cx0 + cw/2, cy0 + 9, "še 3 obiski do brezplačne kave", "Seg", 6.5, SOFT, "center")
c.restoreState()

# dve škatli: <=3 in 4-5
bw = (W - 92 - 14) / 2; by = H - 430
rrect(46, by, bw, 122, 14, WHITE, BORD, 1)
stars_row(46 + 26, by + 122 - 32, 2, 7, 5, SOFT, BORD)
text(46 + 18, by + 122 - 56, "3 zvezdice ali manj", "SegB", 12, INK)
wrap(46 + 18, by + 122 - 74, "Ostane pri tebi kot zasebna povratna informacija. Gost NE gre na Google — ti pa izveš, kaj popraviti, preden gre v javnost.", bw - 36, "Seg", 8.5, MUTED, 11.5)

rrect(46 + bw + 14, by, bw, 122, 14, AMBER)
stars_row(46 + bw + 14 + 26, by + 122 - 32, 5, 7, 5, INK, HexColor("#C98A3B"))
text(46 + bw + 14 + 18, by + 122 - 56, "4 ali 5 zvezdic", "SegB", 12, INK)
wrap(46 + bw + 14 + 18, by + 122 - 74, "Z enim dotikom objavi na Googlu. Tvoja povprečna ocena in število ocen rasteta vsak dan — avtomatsko, brez prošenj.", bw - 36, "Seg", 8.5, HexColor("#5C4218"), 11.5)

# 3 bullets
bl_y = H - 470
for i, b in enumerate([
    "Prestreže nezadovoljne, preden objavijo javno",
    "Zadovoljne usmeri naravnost na Google z enim dotikom",
    "Vsa zasebna mnenja zbrana v tvoji nadzorni plošči",
]):
    check(60, bl_y - i * 24 + 3, 7, GREEN)
    text(76, bl_y - i * 24, b, "SegB", 10.5, INK)

# STATISTIKE — večje, več
text(46, H - 580, "ŠTEVILKE, KI ŠTEJEJO", "SegB", 10, CORAL)
nums = [
    ("93 %", "gostov pred obiskom preveri Google ocene*", CORAL, False),
    ("+0,3", "višja ocena opazno dvigne obisk lokala*", AMBER, True),
    ("3×", "več Google ocen kot brez sistema**", GREEN, False),
    ("67 %", "več zapravi stalni gost kot nov*", INK, False),
]
nw = (W - 92 - 36) / 4
for i, (v, l, colv, with_star) in enumerate(nums):
    x = 46 + i * (nw + 12); y = H - 700
    rrect(x, y, nw, 104, 12, WHITE, BORD, 1)
    text(x + 14, y + 58, v, "SegB", 23, colv)
    if with_star:
        star(x + 14 + pdfmetrics.stringWidth(v, "SegB", 23) + 12, y + 66, 9, AMBER)
    wrap(x + 14, y + 40, l, nw - 26, "Seg", 7.6, MUTED, 10.5)
text(46, H - 720, "* panožne raziskave (BrightLocal, Harvard Business Review)   ** cilj pilota — tvoje številke vidiš v svoji nadzorni plošči", "Seg", 7, SOFT)

footer(); c.showPage()

# ═══════════ STRAN 2 — KOLO SREČE + KAKO + MARKETING ═══════════
bg(); header("kolo sreče + marketing")

text(46, H - 120, "KOLO SREČE", "SegB", 10, CORAL)
text(46, H - 148, "Kako gosta sploh pridobiš? Z darilom.", "SegB", 21, INK)
wrap(46, H - 172, "Največja ovira vsake zvestobe je prvi korak. Loyavi ga reši z igro: nov gost ob prvem obisku zavrti kolo sreče — in vedno nekaj zadene.", 330, "Seg", 10.5, MUTED)

# kolo desno
wheel(W - 46 - 92, H - 260, 62)
rrect(W - 46 - 152, H - 352, 120, 22, 11, LIGHTAMBER)
text(W - 46 - 92, H - 345, "BREZPLAČNA KAVA", "SegB", 8, HexColor("#8A5B14"), "center")

wl_y = H - 232
for i, b in enumerate([
    "Gost VEDNO zadene — nagrado in verjetnosti določiš ti.",
    "Kupon se aktivira šele ob prvem skeniranem računu —",
    "nihče ne dobi nagrade brez pravega obiska.",
    "Ob vrtenju se registrira → takoj je v tvoji bazi gostov.",
    "Kolo lahko vgradiš tudi na svojo spletno stran.",
]):
    if i == 2:
        text(76, wl_y - i * 22, b, "SegB", 10, INK)
    else:
        check(60, wl_y - i * 22 + 3, 7, GREEN)
        text(76, wl_y - i * 22, b, "SegB", 10, INK)

# KAKO DELUJE
text(46, H - 400, "KAKO DELUJE — ZA GOSTA", "SegB", 10, CORAL)
steps = [
    ("01", "Skenira QR na mizi", "Odpre tvojo stran zvestobe. Brez aplikacije, brez prenosa."),
    ("02", "Skenira račun", "Fiskalni QR z računa = žig + točke. Traja 10 sekund."),
    ("03", "Se vrača", "Poln kartonček = nagrada. Ti pa ga poznaš in ga znaš priklicati."),
]
sw_ = (W - 92 - 24) / 3
for i, (n, t, d) in enumerate(steps):
    x = 46 + i * (sw_ + 12); y = H - 510
    rrect(x, y, sw_, 96, 12, WHITE, BORD, 1)
    text(x + sw_ - 12, y + 96 - 28, n, "SegB", 20, HexColor("#EAD9BC"), "right")
    text(x + 14, y + 96 - 32, t, "SegB", 10.5, INK)
    wrap(x + 14, y + 96 - 50, d, sw_ - 28, "Seg", 8.2, MUTED, 11)

# MARKETING
text(46, H - 552, "DIREKTEN MARKETING", "SegB", 10, CORAL)
text(46, H - 578, "Pošlji ponudbo naravnost v žep svojih gostov", "SegB", 17, INK)
feats = [
    ("Kampanje s kuponi", "Popusti, darila, 2-za-1 — ustvariš in pošlješ v minuti."),
    ("Pametni segmenti", "Najboljši gosti, neaktivni, novi — ali po meri."),
    ("Avtomatizacije", "Win-back, rojstni dan, obletnica — pošljejo se SAME."),
    ("Merljiv učinek", "Vidiš, kdo je kupon odprl, prišel in unovčil."),
]
fw = (W - 92 - 36) / 4
for i, (t, d) in enumerate(feats):
    x = 46 + i * (fw + 12); y = H - 700
    rrect(x, y, fw, 108, 12, WHITE, BORD, 1)
    rrect(x + 12, y + 108 - 38, 25, 25, 8, LIGHTAMBER); cup(x + 24.5, y + 108 - 25.5, 7.5, CORAL)
    text(x + 12, y + 108 - 54, t, "SegB", 8.5, INK)
    wrap(x + 12, y + 108 - 69, d, fw - 24, "Seg", 7.4, MUTED, 10)

text(46, H - 726, "Primer avtomatizacije: gost ne pride 3 tedne → sistem mu SAM pošlje »pogrešamo te« s kuponom. Ti spiš, sistem prodaja.", "SegB", 9, MUTED)

footer(); c.showPage()

# ═══════════ STRAN 3 — ROI + PILOT (zastonj!) + demo ═══════════
bg(); header("pilotna ponudba")

# ROI primer
ry = H - 210
rrect(46, ry, W - 92, 100, 14, INK)
text(66, ry + 100 - 28, "PRIMER: kavarna z 80 računi na dan", "SegB", 9, AMBER)
text(66, ry + 100 - 52, "≈ 720 vključenih gostov / mesec   →   ≈ +430 dodatnih obiskov", "SegB", 13, DARKTXT)
text(66, ry + 100 - 74, "≈ +1.700 € dodatnega prihodka na mesec (pri 4 € povprečnem računu)", "SegB", 13, HexColor("#9DBE8E"))
text(66, ry + 12, "Konzervativna ocena: ~30 % gostov se vključi, vsak pride ~0,6× več. Svoje prave številke vidiš v plošči.", "Seg", 7.5, HexColor("#B7A488"))

# PILOT — glavna zvezda
py = H - 500
rrect(46, py, W - 92, 250, 16, WHITE, AMBER, 2.5)
rrect(66, py + 250 - 40, 190, 24, 12, LIGHTAMBER)
text(66 + 95, py + 250 - 33, "PONUDBA ZA PRVE LOKALE", "SegB", 8.5, HexColor("#8A5B14"), "center")
text(66, py + 250 - 74, "Cel mesec ZASTONJ. Jaz vse nastavim.", "SegB", 20, INK)
pilot_items = [
    "Celotno postavitev naredim jaz — kartica, nagrade, kolo sreče, QR za mize",
    "Natisnjen QR plakat za mize dobiš zraven",
    "Brez kartice, brez vezave, brez drobnega tiska — prekličeš kadarkoli",
    "Osebna podpora: karkoli se zatakne, sem na telefonu",
    "Po mesecu skupaj pogledava TVOJE številke — in se odločiš",
]
yy = py + 250 - 104
for it in pilot_items:
    check(80, yy + 3, 7, GREEN)
    text(96, yy, it, "Seg", 10.5, INK)
    yy -= 24
text(66, py + 16, "Če ti ne prinese vrednosti, se enostavno posloviva. Brez drame, brez stroškov.", "SegB", 9, MUTED)

# cenik — ena vrstica
text(46, py - 30, "Po pilotu (če se odločiš ostati):  Start 49,99 €/mes  ·  Grow 79,99 €/mes  ·  letno = 2 meseca gratis  ·  brez vezave", "SegB", 9.5, MUTED)

# DEMO QR
qy = 78
qr_img = qrcode.make("https://loyavi.app/p/demo", border=1)
qr_path = os.path.join(os.path.dirname(OUT), "_demo_qr.png")
qr_img.save(qr_path)
rrect(46, qy, W - 92, 130, 14, PAPER, BORD, 1)
c.drawImage(ImageReader(qr_path), 66, qy + 15, 100, 100, mask="auto")
text(186, qy + 130 - 38, "Preizkusi kot gost — zdaj, na svojem telefonu", "SegB", 13, INK)
wrap(186, qy + 130 - 58, "Skeniraj QR (ali odpri loyavi.app/p/demo): zavrti kolo sreče, poglej kartonček in kako izgleda skeniranje računa. Točno to vidijo tvoji gostje.", W - 92 - 160, "Seg", 9.5, MUTED)
text(186, qy + 22, "Demo nadzorne plošče: loyavi.app/demo", "SegB", 9.5, CORAL)

footer()
c.save()
os.remove(qr_path)
print("OK:", OUT)
