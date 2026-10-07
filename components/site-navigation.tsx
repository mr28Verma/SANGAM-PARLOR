"use client";

import { useEffect, useRef, useState } from "react";
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
  const menuRef = useRef<HTMLDetailsElement>(null);
  const menuButtonRef = useRef<HTMLElement>(null);

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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (menuRef.current) menuRef.current.open = false;
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
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
        <details ref={menuRef} className="mobile-menu" onToggle={(event) => {
          const isOpen = event.currentTarget.open;
          setMenuOpen(isOpen);
          event.currentTarget.querySelector("summary")?.setAttribute("aria-expanded", String(isOpen));
        }}>
          <summary ref={(node) => { menuButtonRef.current = node; }} className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <Menu className="menu-open-icon" size={22}/><X className="menu-close-icon" size={22}/>
          </summary>
          <nav id="mobile-navigation" className="mobile-links" aria-label="Mobile navigation">
            <ThemeToggle compact />
            {links.map((link) => <a key={link.label} href={link.href} onClick={() => { setMenuOpen(false); if (menuRef.current) menuRef.current.open = false; }}>{link.label}</a>)}
            <a className="mobile-book-link" href="/booking" onClick={() => { setMenuOpen(false); if (menuRef.current) menuRef.current.open = false; }}>Book appointment</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
