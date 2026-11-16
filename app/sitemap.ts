import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/brand";

// Javne strani za iskalnike. Kartice lokalov (/p/<koda>) in aplikacija so namenoma izpuščene.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const routes: { path: string; priority: number; weekly?: boolean }[] = [
    { path: "", priority: 1, weekly: true },
    { path: "/partnerji", priority: 0.9, weekly: true },
    { path: "/kontakt", priority: 0.5 },
    { path: "/pogoji", priority: 0.3 },
    { path: "/zasebnost", priority: 0.3 },
    { path: "/piskotki", priority: 0.3 },
  ];
  return routes.map((r) => ({ url: `${base}${r.path}`, changeFrequency: r.weekly ? "weekly" : "monthly", priority: r.priority }));
}
