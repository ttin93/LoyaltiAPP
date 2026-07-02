import type { MetadataRoute } from "next";

// Iskalnikom: javne strani da, zasebne/administrativne ne.
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://loyavi.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/superadmin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
