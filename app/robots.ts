import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/brand";

// Iskalnikom: javne strani da, zasebne in upravljalske ne.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/superadmin", "/app", "/partner", "/prijava", "/odjava", "/s/", "/api/"] }],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
