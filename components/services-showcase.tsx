import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { contact } from "@/lib/landing-content";
import type { services } from "@/lib/landing-content";

type Services = typeof services;

export function ServicesShowcase({ items }: { items: Services }) {
  return (
    <div className="services-showcase">
      {items.map((service) => {
        const enquiry = `Hello Sangam Parlour, I’d like to enquire about ${service.name} services.`;
        const enquiryHref = contact.whatsapp
          ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(enquiry)}`
          : "/booking";

        return (
          <article className="service-card" key={service.number} data-reveal>
            <figure className="service-card-photo" data-image-reveal>
              <Image
                src={service.photo.src}
                alt={service.photo.alt}
                fill
                sizes="(max-width: 640px) 88vw, (max-width: 980px) 42vw, 28vw"
              />
              <figcaption>
                <span>{service.number}</span>
                <span>ILLUSTRATIVE PHOTOGRAPHY</span>
              </figcaption>
            </figure>
            <div className="service-card-copy">
              <span className="service-card-index">{service.number} / {String(items.length).padStart(2, "0")}</span>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <a
                className="service-card-action"
                href={enquiryHref}
                target={contact.whatsapp ? "_blank" : undefined}
                rel={contact.whatsapp ? "noreferrer" : undefined}
                aria-label={`${contact.whatsapp ? "Enquire about" : "Book"} ${service.name} services${contact.whatsapp ? " on WhatsApp" : ""}`}
              >
                <span>{contact.whatsapp ? "Enquire on WhatsApp" : "Book this service"}</span>
                <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
