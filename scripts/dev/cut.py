# Izreže en predmet iz lista na belem ozadju v prosojno sliko: python cut.py src cols rows index out size
import sys, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
src, cols, rows, idx, out, size = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], int(sys.argv[6])
img = cv2.imread(src); H, W = img.shape[:2]; ch, cw = H // rows, W // cols
r, c = divmod(idx, cols)
cell = img[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].astype(np.float32)
near_white = cell.min(axis=2) > 236
lab, n = ndi.label(near_white)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
fg = ~np.isin(lab, border[border > 0])
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
