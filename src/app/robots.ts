import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/server-env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
