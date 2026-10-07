import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Sangam Parlour — Beauty, your way",
  description: "Professional hair, skin, makeup and bridal services, thoughtfully crafted around you at Sangam Parlour.",
};

const themeBootScript = `(() => {
  try {
    const saved = localStorage.getItem("sangam-theme");
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme = saved === "light" || saved === "dark" ? saved : systemPrefersLight ? "light" : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
