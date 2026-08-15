import type { MetadataRoute } from "next";

import { getPublicTours } from "@/lib/public-tour-data";
import { getAppUrl } from "@/lib/server-env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl();
  const tours = await getPublicTours();
  const staticPages = ["", "/tours", "/about", "/contact", "/terms", "/privacy"];

  return [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: path === "" || path === "/tours" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : path === "/tours" ? 0.9 : 0.5,
    })),
    ...tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
