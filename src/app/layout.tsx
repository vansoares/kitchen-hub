import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KitchenHub",
  description: "Gerencie a despensa de casa de qualquer lugar",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "KitchenHub" },
};

export const viewport: Viewport = {
  themeColor: "#1e5f8c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Roda antes da hidratacao pra decidir claro/escuro sem "flash" de tema
// errado: usa a preferencia salva, senao cai pro tema do sistema.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-cream font-sans text-brand-900 antialiased dark:bg-brand-900 dark:text-cream">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
