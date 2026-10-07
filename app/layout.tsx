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
  const root = document.documentElement;
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("sangam-theme", theme);
    } catch {
      // The theme still applies for this visit when storage is unavailable.
    }
  };

  try {
    const saved = localStorage.getItem("sangam-theme");
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    root.dataset.theme = saved === "light" || saved === "dark" ? saved : systemPrefersLight ? "light" : "dark";
  } catch {
    root.dataset.theme = "dark";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("[data-theme-toggle]")) {
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
      return;
    }

    const menu = document.querySelector(".mobile-menu");
    const summary = target.closest(".mobile-menu > summary");
    if (summary && menu) {
      window.setTimeout(() => summary.setAttribute("aria-expanded", String(menu.open)), 0);
    }

    if (target.closest("#mobile-navigation a") && menu) {
      menu.open = false;
      menu.querySelector("summary")?.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "sangam-theme") return;
    if (event.newValue === "light" || event.newValue === "dark") {
      root.dataset.theme = event.newValue;
    }
  });
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
