type IconDef = { paths?: string[]; circles?: [number, number, number, boolean?][] };

const ICONS: Record<string, IconDef> = {
  cup: {
    paths: [
      "M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z",
      "M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15",
      "M7.8 6c0-1 .9-1 .9-2M11.2 6c0-1 .9-1 .9-2",
    ],
  },
  camera: {
    paths: [
      "M4 8.6A2.6 2.6 0 0 1 6.6 6h1.5l1.5-2h4.8l1.5 2h1.5A2.6 2.6 0 0 1 20 8.6v7.8A2.6 2.6 0 0 1 17.4 19H6.6A2.6 2.6 0 0 1 4 16.4V8.6Z",
    ],
    circles: [[12, 12.7, 3.4]],
  },
  croissant: { paths: ["M19.5 13.5A8 8 0 1 1 10.5 4.5a6.2 6.2 0 0 0 9 9Z"] },
  cake: {
    paths: ["M5 12.5h14V19H5z", "M5 15.2c2.3 1.8 4.4-1.8 7 0s4.7 1.8 7 0", "M12 12.5V9.8"],
    circles: [[12, 7.8, 1]],
  },
  clock: { paths: ["M12 8v4.4l2.8 2"], circles: [[12, 12, 8.5]] },
  chart: { paths: ["M5 19v-8", "M12 19V5", "M19 19v-6"] },
  qr: {
    paths: [
      "M4.5 4.5h5.5V10H4.5z",
      "M14 4.5h5.5V10H14z",
      "M4.5 14h5.5v5.5H4.5z",
      "M14 14h2.3v2.3H14z",
      "M17.4 17.4h2.1v2.1h-2.1z",
    ],
  },
  mega: { paths: ["M18 6 7 9.8H4.5v4.4H7L18 18V6Z", "M8.5 14.8 9.6 19h2"] },
  sliders: {
    paths: ["M4 7.5h16", "M4 12h16", "M4 16.5h16"],
    circles: [
      [15, 7.5, 2.1, true],
      [8.5, 12, 2.1, true],
      [16, 16.5, 2.1, true],
    ],
  },
  check: { paths: ["M5.5 12.5l4.2 4.2L18.5 7.5"] },
  x: { paths: ["M6.5 6.5l11 11M17.5 6.5l-11 11"] },
  receipt: { paths: ["M7 3.5h10V20l-2-1.4-1.7 1.4-1.6-1.4L10 20l-1.5-1.4L7 20V3.5Z", "M9.5 8h5M9.5 11h5"] },
  chevronR: { paths: ["m9.5 5.5 6.5 6.5-6.5 6.5"] },
  chevronL: { paths: ["M14.5 5.5 8 12l6.5 6.5"] },
  chevronD: { paths: ["m5.5 9.5 6.5 6.5 6.5-6.5"] },
  copy: { paths: ["M9 9h10v10H9z", "M5 15V5h10"] },
  gift: { paths: ["M5 11h14v8H5zM5 8h14v3H5zM12 8v11", "M12 8S10.5 4 8.5 4.8 9.5 8 12 8ZM12 8s1.5-4 3.5-3.2S14.5 8 12 8Z"] },
  ticket: { paths: ["M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z", "M14 6v12"] },
  star: { paths: ["M12 4l2.3 5.2 5.7.5-4.3 3.8 1.3 5.5L12 16.6 7 19l1.3-5.5L4 9.7l5.7-.5z"] },
  sparkles: { paths: ["M12 5l1.4 3.6L17 10l-3.6 1.4L12 15l-1.4-3.6L7 10l3.6-1.4z", "M18 4l.7 1.8L20.5 6.5l-1.8.7L18 9l-.7-1.8L15.5 6.5l1.8-.7z"] },
  users: { paths: ["M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19", "M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4"], circles: [[10, 8, 3], [16.5, 8, 2.4]] },
  send: { paths: ["M20 4 3.5 11l6.5 2.2M20 4l-5 16-4.9-6.8M20 4l-9.9 9.2"] },
  plus: { paths: ["M12 5v14M5 12h14"] },
  trash: { paths: ["M5 7h14M9 7V5h6v2M7 7l.8 12h8.4L17 7"] },
  pencil: { paths: ["M5 19h3l9-9-3-3-9 9v3Z", "M13.5 6.5l3 3"] },
  link: { paths: ["M9.5 14.5 14.5 9.5", "M10.5 7.5 12 6a3.5 3.5 0 0 1 5 5l-1.5 1.5M13.5 16.5 12 18a3.5 3.5 0 0 1-5-5l1.5-1.5"] },
  palette: { paths: ["M12 4a8 8 0 0 0 0 16c1.3 0 2-1 2-2 0-1.3-1-1.5-1-2.5s.8-1.5 2-1.5h1a3 3 0 0 0 3-3 7 7 0 0 0-7-7Z"], circles: [[8.5, 10, 1, true], [12, 7.5, 1, true], [15.5, 10, 1, true]] },
  download: { paths: ["M12 4v10M8 11l4 4 4-4M5 19h14"] },
  lock: { paths: ["M7 11V8a5 5 0 0 1 10 0v3", "M5 11h14v8H5z"] },
  store: { paths: ["M4 9l1-4h14l1 4M4 9h16M4 9v10h16V9M9 19v-5h6v5"] },
  bell: { paths: ["M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0"] },
  euro: { paths: ["M16 6.5A5.5 5.5 0 1 0 16 17.5M5 10h7M5 13.5h7"] },
  shield: { paths: ["M12 3.5l6.5 2.5v5c0 4.3-2.8 7.4-6.5 9-3.7-1.6-6.5-4.7-6.5-9v-5z", "M9.3 12l2 2 3.4-3.6"] },
  home: { paths: ["M4 20V9l8-5 8 5v11", "M9 20v-6h6v6"] },
  arrowR: { paths: ["M5 12h14M13 6l6 6-6 6"] },
  star2: { paths: ["M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"] },
};

export function Icon({
  name,
  color = "currentColor",
  size = 22,
  strokeWidth = 1.9,
}: {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const def = ICONS[name];
  if (!def) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      {def.paths?.map((d, i) => (
        <path key={"p" + i} d={d} />
      ))}
      {def.circles?.map(([cx, cy, r, solid], i) => (
        <circle key={"c" + i} cx={cx} cy={cy} r={r} fill={solid ? "#FFFCF6" : "none"} />
      ))}
    </svg>
  );
}

/** Dekorativna "QR" mreža (deterministična), kot v designu. */
export function FakeQr({ px = 150, seed = 7 }: { px?: number; seed?: number }) {
  const n = 21;
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inF = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      let on;
      if (inF) {
        const rr = r >= n - 7 ? r - (n - 7) : r;
        const cc = c >= n - 7 ? c - (n - 7) : c;
        on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
      } else {
        on = rnd() > 0.52;
      }
      cells.push(<div key={r + "-" + c} style={{ background: on ? "#2B1D17" : "transparent" }} />);
    }
  }
  return (
    <div style={{ width: px, height: px, display: "grid", gridTemplateColumns: "repeat(21,1fr)", gridTemplateRows: "repeat(21,1fr)" }}>
      {cells}
    </div>
  );
}
