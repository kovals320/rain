import type { MetadataRoute } from "next";

// Makes the site installable as an app on phones ("Add to home screen" / "Install app").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "משקעים ניר אליהו",
    short_name: "משקעים",
    description: "נתוני הגשם של קיבוץ ניר אליהו",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eef6fb",
    theme_color: "#eef6fb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
