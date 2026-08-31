import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BaliXperience",
    short_name: "BaliXperience",
    description: "Private Bali driver days with clear IDR pricing and written booking details.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDE7DA",
    theme_color: "#294238",
  };
}
