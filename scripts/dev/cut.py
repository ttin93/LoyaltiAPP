# Izreže en predmet iz lista na belem ozadju v prosojno sliko: python cut.py src cols rows index out size [holes]
# Z dodatnim argumentom "holes" odstrani tudi zaprte otoke čiste bele podlage med predmeti (npr. v ročaju pokala).
# Beli deli predmetov ostanejo, ker so osenčeni (povprečje pod 249), podlaga pa je skoraj čista bela.
import sys, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
src, cols, rows, idx, out, size = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], int(sys.argv[6])
holes = len(sys.argv) > 7 and sys.argv[7] == "holes"
img = cv2.imread(src); H, W = img.shape[:2]; ch, cw = H // rows, W // cols
r, c = divmod(idx, cols)
cell = img[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].astype(np.float32)
mn = cell.min(axis=2)
near_white = mn > 236
lab, n = ndi.label(near_white)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, border[border > 0])
if holes and n:
    idxs = np.arange(1, n + 1)
    areas = ndi.sum(near_white, lab, idxs)
    means = ndi.mean(mn, lab, idxs)
    inner = [int(k) for k, a, m in zip(idxs, areas, means) if a > 300 and m > 249 and k not in border]
    bg |= np.isin(lab, inner)
fg = ~bg
fg = ndi.binary_opening(fg, iterations=1)
lab2, n2 = ndi.label(fg)
sizes = ndi.sum(fg, lab2, range(1, n2 + 1))
keep = np.isin(lab2, [k + 1 for k, s in enumerate(sizes) if s > 400])
alpha = cv2.GaussianBlur(cv2.erode(keep.astype(np.float32), np.ones((3, 3), np.uint8), iterations=1), (0, 0), 1.2)
a = np.clip(alpha, 0, 1)[..., None]
rgb = np.clip(np.where(a > 0.02, (cell - (1 - a) * 255.0) / np.maximum(a, 0.02), cell), 0, 255)
rgba = np.dstack([rgb[..., ::-1], a[..., 0] * 255]).astype(np.uint8)
ys, xs = np.where(a[..., 0] > 0.05)
im = Image.fromarray(rgba, "RGBA").crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
side = max(im.size); sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
sq = sq.resize((size, size), Image.LANCZOS)
if out.endswith(".png"): sq.save(out, "PNG", optimize=True)
else: sq.save(out, "WEBP", quality=92, method=6)
print(out, sq.size)
