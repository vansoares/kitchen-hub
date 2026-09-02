import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KitchenHub",
    short_name: "KitchenHub",
    description: "Gerencie a despensa de casa de qualquer lugar",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f1fc",
    theme_color: "#5b3ee8",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    // Atalhos ao segurar o icone do app na tela inicial (Android/desktop).
    // PantryApp le "?open=..." no primeiro render pra abrir o painel certo.
    shortcuts: [
      {
        name: "Lista de compras",
        short_name: "Lista",
        url: "/?open=lista",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Novo item",
        short_name: "Novo item",
        url: "/?open=novo",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Receitas",
        short_name: "Receitas",
        url: "/receitas",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    ],
  };
}
