"use client";

import { useEffect } from "react";

import { trackConversion } from "@/lib/analytics";

const recordedViews = new Set<string>();

export function TourViewTracker({ tourSlug }: { tourSlug: string }) {
  useEffect(() => {
    if (recordedViews.has(tourSlug)) return;
    recordedViews.add(tourSlug);
    trackConversion("tour_viewed", { tourSlug });
  }, [tourSlug]);

  return null;
}
