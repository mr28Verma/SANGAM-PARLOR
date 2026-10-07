"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const links = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Offers", href: "#offers" },
  { label: "Contact", href: "#contact" },
];

export function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const pageRoot = document.querySelector<HTMLElement>(".site-page") ?? document.body;
    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return;

      gsap.utils.toArray<HTMLElement>("[data-reveal]", pageRoot).forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 14 }, {
          autoAlpha: 1, y: 0, duration: 0.48, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-image-reveal]", pageRoot).forEach((element) => {
        gsap.fromTo(element, { clipPath: "inset(0 0 12% 0)", scale: 1.015 }, {
          clipPath: "inset(0)", scale: 1, duration: 0.68, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: element, start: "top 94%", once: true },
        });
      });
    }, pageRoot);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : " is-on-hero"}`}>
      <div className="nav-inner">
        <a className="brand-lockup" href="#home" aria-label="Sangam Parlour home"><span>SANGAM</span><small>PARLOUR</small></a>
        <nav className="desktop-links" aria-label="Main navigation">
          {links.map((link) => <a href={link.href} key={link.label}>{link.label}</a>)}
        </nav>
        <ThemeToggle />
        <a className="nav-booking" href="/booking">Book appointment</a>
        <button className="menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false}>
        {menuOpen && <motion.nav id="mobile-navigation" className="mobile-links" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
          <ThemeToggle compact />
          {links.map((link, index) => <motion.a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>{link.label}</motion.a>)}
          <a className="mobile-book-link" href="/booking" onClick={() => setMenuOpen(false)}>Book appointment</a>
        </motion.nav>}
      </AnimatePresence>
      </MotionConfig>
    </header>
  );
}
