import type { MetadataRoute } from "next";

// Javne strani za iskalnike (gostove /p/<code> strani so namenoma izpuščene — zasebne kartice).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://loyavi.app";
  const routes = ["", "/cenik", "/kontakt", "/demo", "/partner", "/pogoji", "/zasebnost", "/piskotki"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/cenik" ? 0.8 : 0.5,
  }));
}
