import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { ServicesShowcase } from "@/components/services-showcase";
import { HeroMedia } from "@/components/hero-media";
import { OffersSection } from "@/components/sections/offers-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { contact, gallery, heroFilm, offers, photographs, services, testimonials, values } from "@/lib/landing-content";

export default function Home() {
  return (
    <>
      <div className="site-page">
      <SiteNavigation />
      <main>
        <section className="hero" id="home">
          <HeroMedia src={heroFilm.src} poster={heroFilm.poster.src} posterAlt={heroFilm.poster.alt}/>
          <div className="hero-shade" aria-hidden="true"/>
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">A MORE PERSONAL BEAUTY EXPERIENCE</p>
            <h1 className="hero-title"><span className="hero-title-line">BEAUTY.</span><span className="hero-title-line">YOUR WAY.</span></h1>
            <p className="hero-description">Professional hair, skin and beauty services, thoughtfully crafted around you.</p>
            <div className="hero-actions">
              <a className="button button-light hero-booking" href="/booking">BOOK APPOINTMENT <ArrowRight size={16}/></a>
              <a className="simple-link hero-explore" href="#services">EXPLORE SERVICES <ArrowDown size={14} strokeWidth={1.7}/></a>
            </div>
          </div>
        </section>

        <section className="intro section-wrap" id="about">
          <div className="section-overline" data-reveal><span>01 / A LITTLE ABOUT US</span><span>THE SANGAM EXPERIENCE</span></div>
          <div className="intro-grid">
            <div className="intro-images">
              <figure className="intro-photo intro-main" data-image-reveal><Image src={photographs.hair.src} alt={photographs.hair.alt} fill sizes="(max-width: 760px) 84vw, 42vw" /></figure>
              <figure className="intro-photo intro-detail" data-image-reveal><Image src={photographs.makeup.src} alt={photographs.makeup.alt} fill sizes="(max-width: 760px) 43vw, 20vw" /></figure>
              <span className="photo-caption">ILLUSTRATIVE STOCK PHOTOS · NOT SANGAM CLIENT WORK</span>
            </div>
            <div className="intro-copy" data-reveal>
              <p className="eyebrow">THE SANGAM EXPERIENCE</p>
              <h2>Beauty is personal.<br/><em>Our approach is too.</em></h2>
              <p>Good beauty begins with listening. At Sangam Parlour, we take the time to understand what feels right for you, then bring care, craft and a thoughtful eye to every appointment.</p>
              <p>Come in for a refresh, a special occasion, or simply a moment that’s yours.</p>
              <a className="underlined-link" href="#contact">A LITTLE MORE ABOUT SANGAM</a>
              <span className="intro-index">SANGAM · A PERSONAL BEAUTY EXPERIENCE</span>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-wrap services-inner">
            <div className="section-overline" data-reveal><span>02 / FIND YOUR SERVICE</span><span>EXPERT CARE, MADE PERSONAL</span></div>
            <div className="section-heading" data-reveal><div><p className="eyebrow">THE SANGAM SERVICE MENU</p><h2>Feel good in<br/><em>your own way.</em></h2></div><p>From the everyday to the once-in-a-lifetime, find the care that feels like you.</p></div>
            <ServicesShowcase items={services}/>
            <p className="photo-disclaimer">Service photographs are illustrative stock images, not Sangam Parlour clients or salon work.</p>
          </div>
        </section>

        <section className="experience-section section-wrap" id="experience">
          <div className="section-overline" data-reveal><span>03 / THE SALON EXPERIENCE</span><span>CARE, AT YOUR OWN PACE</span></div>
          <div className="experience-grid">
            <div className="experience-copy" data-reveal>
              <p className="eyebrow">A MOMENT TO YOURSELF</p>
              <h2>Feel at ease.<br/><span>Leave feeling like you.</span></h2>
              <p>Every appointment starts with a conversation. We listen to what you want, talk through the options, and shape the service around you.</p>
              <a className="underlined-link" href="#contact">TALK WITH SANGAM</a>
            </div>
            <figure className="experience-photo" data-image-reveal>
              <Image src={photographs.salon.src} alt="Illustrative stock photograph of a stylist caring for a salon guest" fill sizes="(max-width: 760px) 100vw, 48vw" />
              <figcaption>ILLUSTRATIVE STOCK PHOTOGRAPHY</figcaption>
            </figure>
          </div>
        </section>

        <OffersSection offers={offers} editorialPhoto={photographs.galleryIndiaMakeup}/>

        <section className="gallery-section section-wrap" id="gallery">
          <div className="section-overline" data-reveal><span>05 / BEAUTY INSPIRATION</span><span>ILLUSTRATIVE STOCK PHOTOGRAPHY</span></div>
          <div className="section-heading gallery-heading" data-reveal><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2>The art of<br/>transformation.</h2></div><p>Explore hair and beauty looks for inspiration. These photographs are illustrative and do not depict Sangam Parlour clients.</p></div>
          <div className="gallery-grid">
            {gallery.map((item) => <figure className="gallery-item" key={item.label} data-reveal><div className="gallery-photo" data-image-reveal><Image src={item.photo.src} alt={item.photo.alt} fill sizes="(max-width: 600px) 44vw, (max-width: 1000px) 30vw, 27vw" /></div><figcaption>{item.label}</figcaption></figure>)}
          </div>
          <div className="gallery-link-row" data-reveal><p>For Sangam’s own salon work and client photos, please check back soon.</p><a className="underlined-link" href="#contact">ASK ABOUT A LOOK</a></div>
        </section>

        <section className="values-section">
          <div className="section-wrap values-inner">
            <div className="values-intro" data-reveal><p className="eyebrow">06 / THE SANGAM PROMISE</p><h2>Care is in<br/><em>the details.</em></h2><p>Every visit is guided by the same simple promise: listen well, work thoughtfully, and help you feel at ease.</p></div>
            <div className="values-list">{values.map((value) => <div className="value-item" key={value} data-reveal><h3>{value}</h3></div>)}</div>
          </div>
        </section>

        <TestimonialsSection items={testimonials}/>

        <section className="location-section section-wrap" id="contact">
          <div className="section-overline" data-reveal><span>08 / COME SAY HELLO</span><span>WE’RE HERE FOR YOU</span></div>
          <div className="location-grid">
            <div className="location-photo" data-image-reveal><Image src={photographs.salon.src} alt="Illustrative stock photograph of stylists working with clients at a salon" fill sizes="(max-width: 760px) 100vw, 52vw" /><span className="location-photo-note">ILLUSTRATIVE STOCK PHOTOGRAPHY</span></div>
            <div className="location-copy" data-reveal><p className="eyebrow">YOUR NEIGHBOURHOOD BEAUTY DESTINATION</p><h2>Find your way<br/>to <em>Sangam.</em></h2>
              <div className="contact-list">
                {contact.address && <div><span><small>ADDRESS</small>{contact.address}</span></div>}
                {contact.hours && <div><span><small>OPENING HOURS</small>{contact.hours}</span></div>}
                {contact.phone && <div><span><small>PHONE</small><a href={`tel:${contact.phone}`}>{contact.phone}</a></span></div>}
                {contact.whatsapp && <div><span><small>WHATSAPP</small><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">MESSAGE SANGAM</a></span></div>}
                {!contact.address && !contact.hours && !contact.phone && !contact.whatsapp && <p className="contact-pending">Verified address and contact details will be added here.</p>}
              </div>
              {contact.directions && <a className="button button-outline" href={contact.directions} target="_blank" rel="noreferrer">Get directions</a>}
            </div>
          </div>
        </section>

        <section className="booking-cta">
          <div className="booking-image" data-image-reveal><Image src={photographs.bridal.src} alt="Illustrative stock photograph of a bride with finished hair and makeup" fill sizes="100vw" /></div>
          <div className="booking-overlay"/>
          <div className="booking-content" data-reveal><p className="eyebrow">WE’D LOVE TO WELCOME YOU</p><h2>Ready for your<br/><em>next look?</em></h2><p>Book your appointment and let us take care of the rest.</p><div className="booking-actions"><a className="button button-light" href="/booking">Book appointment <ArrowRight size={16}/></a><a className="booking-contact" href="#contact">Contact us</a></div></div>
          <span className="booking-caption">ILLUSTRATIVE STOCK PHOTOGRAPHY · SANGAM PARLOUR</span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap"><div className="footer-brand-column"><a className="brand-lockup footer-logo" href="#home"><span>SANGAM</span><small>PARLOUR</small></a><p>Beauty, thoughtfully<br/>done your way.</p>
          <div className="footer-socials">{contact.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a>}{contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}</div></div>
          <div className="footer-links"><h2>QUICK LINKS</h2><a href="#home">Home</a><a href="#services">Services</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href="#offers">Offers</a><a href="#contact">Contact</a></div>
          <div className="footer-links"><h2>CONNECT</h2>{contact.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a>}{contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}{contact.directions && <a href={contact.directions} target="_blank" rel="noreferrer">Google Maps</a>}{!contact.instagram && !contact.whatsapp && !contact.directions && <a href="#contact">Contact details to come</a>}</div>
          <div className="footer-hours"><h2>OPENING HOURS</h2><p>{contact.hours || "Hours to be confirmed."}</p><a href="/booking">Plan your visit</a></div>
        </div>
        <div className="footer-bottom section-wrap"><span>© 2026 SANGAM PARLOUR</span><span>BEAUTY, YOUR WAY.</span><a href="#home">BACK TO TOP</a></div>
      </footer>
      </div>
    </>
  );
}
