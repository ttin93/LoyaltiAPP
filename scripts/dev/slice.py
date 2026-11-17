import sys, os
import numpy as np
import cv2
from scipy import ndimage as ndi
from PIL import Image

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
SHEETS = [
    ("gen/sheet-a.jpg", 4, 4, ["kavarna", "restavracija", "bar", "slascicarna", "pekarna", "hitra-hrana", "frizer", "lepota", "cvetlicarna", "avtopralnica", "trgovina", "fitnes", "hisni-ljubljencki", "drugo", "darilo", "zvezda"]),
    ("gen/sheet-b.jpg", 4, 3, ["kupon", "kolo", "torta", "zig", "telefon", "denarnica", "konfeti", "megafon", "zvonec", "srce", "pokal", "kartice"]),
]
preview = []
for path, cols, rows, names in SHEETS:
    img = cv2.imread(path)  # BGR
    H, W = img.shape[:2]
    ch, cw = H // rows, W // cols
    for i, name in enumerate(names):
        r, c = divmod(i, cols)
        cell = img[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].astype(np.float32)
        mn = cell.min(axis=2)
        near_white = mn > 236
        lab, n = ndi.label(near_white)
        border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        bg = np.isin(lab, border[border > 0])
        fg = ~bg
        # odstrani drobne pike šuma, zapolni luknjice
        fg = ndi.binary_opening(fg, iterations=1)
        lab2, n2 = ndi.label(fg)
        if n2:
            sizes = ndi.sum(fg, lab2, range(1, n2 + 1))
            keep = np.isin(lab2, [k + 1 for k, s in enumerate(sizes) if s > 400])
        else:
            keep = fg
        alpha = keep.astype(np.float32)
        alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), iterations=1)
        alpha = cv2.GaussianBlur(alpha, (0, 0), 1.4)
        a = np.clip(alpha, 0, 1)[..., None]
        # odstrani bel sij z robov (barva je bila pomešana z belo podlago)
        rgb = np.where(a > 0.02, (cell - (1 - a) * 255.0) / np.maximum(a, 0.02), cell)
        rgb = np.clip(rgb, 0, 255)
        rgba = np.dstack([rgb[..., ::-1], a[..., 0] * 255]).astype(np.uint8)
        ys, xs = np.where(a[..., 0] > 0.05)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        im = Image.fromarray(rgba, "RGBA").crop((x0, y0, x1 + 1, y1 + 1))
        side = max(im.size)
        sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
        sq = sq.resize((512, 512), Image.LANCZOS)
        sq.save(os.path.join(out, name + ".webp"), "WEBP", quality=92, method=6)
        preview.append((name, sq))
        print(name, os.path.getsize(os.path.join(out, name + ".webp")) // 1024, "KB")
# pregled na temni in svetli podlagi
cols = 7
sheet = Image.new("RGB", (cols * 160, ((len(preview) + cols - 1) // cols) * 160), (31, 139, 245))
for i, (n, im) in enumerate(preview):
    t = im.resize((150, 150), Image.LANCZOS)
    bgc = (31, 139, 245) if (i // cols) % 2 == 0 else (245, 247, 251)
    tile = Image.new("RGB", (160, 160), bgc)
    tile.paste(t, (5, 5), t)
    sheet.paste(tile, ((i % cols) * 160, (i // cols) * 160))
sheet.save("shots/3d-preview.jpg", quality=85)
