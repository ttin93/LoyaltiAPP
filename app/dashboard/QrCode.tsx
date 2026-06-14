"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ path, accent }: { path: string; accent: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = `${window.location.origin}${path}`;
    setFullUrl(url);
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: "#171717", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => {});
  }, [path]);

  return (
    <div className="flex flex-col items-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR koda" className="h-48 w-48 rounded-xl border border-neutral-200" />
      ) : (
        <div className="h-48 w-48 animate-pulse rounded-xl bg-neutral-100" />
      )}
      <div className="mt-4 flex gap-2">
        <a
          href={dataUrl || "#"}
          download="zvestoba-qr.png"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          Prenesi PNG
        </a>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          {copied ? "Kopirano ✓" : "Kopiraj povezavo"}
        </button>
      </div>
      <p className="mt-3 break-all text-center text-xs text-neutral-400">{fullUrl}</p>
    </div>
  );
}
