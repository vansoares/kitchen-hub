import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KitchenHub",
    short_name: "KitchenHub",
    description: "Gerencie a despensa de casa de qualquer lugar",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f2ea",
    theme_color: "#1e5f8c",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
