import type { MetadataRoute } from "next";
import { BRAND_DESCRIPTION } from "@/lib/brand";

// Namestljiva spletna aplikacija: gost jo doda na začetni zaslon in odpre denarnico.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loyavi",
    short_name: "Loyavi",
    description: BRAND_DESCRIPTION,
    lang: "sl",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFDFE",
    theme_color: "#FDFDFE",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
