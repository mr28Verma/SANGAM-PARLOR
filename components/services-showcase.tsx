"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { services } from "@/lib/landing-content";

type Services = typeof services;

export function ServicesShowcase({ items }: { items: Services }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeService = items[activeIndex];

  return (
    <div className="services-showcase">
      <div className="service-list" role="list" aria-label="Explore services">
        {items.map((service, index) => (
          <a
            href="#contact"
            className={`service-row${activeIndex === index ? " is-active" : ""}`}
            data-reveal
            key={service.number}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onTouchStart={() => setActiveIndex(index)}
            role="listitem"
          >
            <span className="service-row-main"><strong>{service.name}</strong><small>{service.description}</small><em>{service.details}</em></span>
          </a>
        ))}
        <a className="underlined-link service-discover" href="#contact">ASK ABOUT A SERVICE</a>
      </div>
      <div className="service-preview" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure className="service-preview-frame" key={activeService.number} initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 1.015 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <Image src={activeService.photo.src} alt={activeService.photo.alt} fill sizes="(max-width: 760px) 88vw, 43vw" />
            <figcaption><span>0{activeIndex + 1} / 04</span><span>{activeService.name.toUpperCase()} AT SANGAM</span></figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
    </div>
  );
}
