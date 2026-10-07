import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { ServicesShowcase } from "@/components/services-showcase";
import { HeroMedia } from "@/components/hero-media";
import { OffersSection } from "@/components/sections/offers-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { contact, gallery, heroFilm, inspiration, offers, photographs, services, testimonials, values } from "@/lib/landing-content";

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
          <div className="section-overline" data-reveal>
            <span className="section-overline-primary"><span className="section-number" aria-hidden="true">01</span><span>A LITTLE ABOUT US</span></span>
            <span className="section-overline-secondary">THE SANGAM EXPERIENCE</span>
          </div>
          <div className="intro-grid">
            <div className="intro-images">
              <figure className="intro-photo intro-main" data-image-reveal><Image src={photographs.introHair.src} alt={photographs.introHair.alt} fill sizes="(max-width: 760px) 84vw, 42vw" /></figure>
              <figure className="intro-photo intro-detail" data-image-reveal><Image src={photographs.introMakeup.src} alt={photographs.introMakeup.alt} fill sizes="(max-width: 760px) 43vw, 20vw" /></figure>
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
            <div className="section-overline" data-reveal><span className="section-overline-primary"><span className="section-number" aria-hidden="true">02</span><span>FIND YOUR SERVICE</span></span><span className="section-overline-secondary">EXPERT CARE, MADE PERSONAL</span></div>
            <div className="section-heading" data-reveal><div><p className="eyebrow">THE SANGAM SERVICE MENU</p><h2>Feel good in<br/><em>your own way.</em></h2></div><p>From the everyday to the once-in-a-lifetime, find the care that feels like you.</p></div>
            <ServicesShowcase items={services}/>
            <p className="photo-disclaimer">Service photographs are illustrative stock images, not Sangam Parlour clients or salon work.</p>
          </div>
        </section>

        <section className="experience-section section-wrap" id="experience">
          <div className="section-overline" data-reveal><span className="section-overline-primary"><span className="section-number" aria-hidden="true">03</span><span>THE SALON EXPERIENCE</span></span><span className="section-overline-secondary">CARE, AT YOUR OWN PACE</span></div>
          <div className="experience-grid">
            <div className="experience-copy" data-reveal>
              <p className="eyebrow">A MOMENT TO YOURSELF</p>
              <h2>Feel at ease.<br/><span>Leave feeling like you.</span></h2>
              <p>Every appointment starts with a conversation. We listen to what you want, talk through the options, and shape the service around you.</p>
              <a className="underlined-link" href="#contact">TALK WITH SANGAM</a>
            </div>
            <figure className="experience-photo" data-image-reveal>
              <Image src={photographs.experience.src} alt={photographs.experience.alt} fill sizes="(max-width: 760px) 100vw, 48vw" />
              <figcaption>ILLUSTRATIVE STOCK PHOTOGRAPHY</figcaption>
            </figure>
          </div>
        </section>

        <OffersSection offers={offers} editorialPhoto={photographs.galleryMakeup}/>

        <section className="inspiration-section section-wrap" id="inspiration">
          <div className="section-overline" data-reveal><span className="section-overline-primary"><span className="section-number" aria-hidden="true">05</span><span>BEAUTY INSPIRATION</span></span><span className="section-overline-secondary">ILLUSTRATIVE STOCK PHOTOGRAPHY</span></div>
          <div className="section-heading inspiration-heading" data-reveal><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2>The art of<br/>transformation.</h2></div><p>Explore hair and beauty looks for inspiration. These photographs are illustrative and do not depict Sangam Parlour clients.</p></div>
          <div className="inspiration-grid">
            {inspiration.map((item) => <figure className="gallery-item" key={item.label} data-reveal><div className="gallery-photo" data-image-reveal><Image src={item.photo.src} alt={item.photo.alt} fill sizes="(max-width: 760px) 88vw, 44vw" /></div><figcaption>{item.label}</figcaption></figure>)}
          </div>
        </section>

        <section className="gallery-section section-wrap" id="gallery" aria-label="Gallery">
          <div className="section-overline" data-reveal><span className="section-overline-primary"><span>THE SANGAM GALLERY</span></span><span className="section-overline-secondary">ILLUSTRATIVE STOCK PHOTOGRAPHY</span></div>
          <div className="gallery-grid">
            {gallery.map((item) => <figure className="gallery-item" key={item.label} data-reveal><div className="gallery-photo" data-image-reveal><Image src={item.photo.src} alt={item.photo.alt} fill sizes="(max-width: 760px) 88vw, 44vw" /></div><figcaption>{item.label}</figcaption></figure>)}
          </div>
          <div className="gallery-link-row" data-reveal><p>For Sangam’s own salon work and client photos, please check back soon.</p><a className="underlined-link" href="#contact">ASK ABOUT A LOOK</a></div>
        </section>

        <section className="values-section">
          <div className="section-wrap values-inner">
            <div className="values-intro" data-reveal><p className="eyebrow numbered-eyebrow"><span className="section-number" aria-hidden="true">06</span><span>THE SANGAM PROMISE</span></p><h2>Care is in<br/><em>the details.</em></h2><p>Every visit is guided by the same simple promise: listen well, work thoughtfully, and help you feel at ease.</p></div>
            <div className="values-list">{values.map((value) => <div className="value-item" key={value} data-reveal><h3>{value}</h3></div>)}</div>
          </div>
        </section>

        <TestimonialsSection items={testimonials}/>

        <section className="booking-cta">
          <div className="booking-image" data-image-reveal><Image src={photographs.bridal.src} alt={photographs.bridal.alt} fill sizes="100vw" /></div>
          <div className="booking-overlay"/>
          <div className="booking-content" data-reveal><p className="eyebrow">WE’D LOVE TO WELCOME YOU</p><h2>Ready for your<br/><em>next look?</em></h2><p>Book your appointment and let us take care of the rest.</p><div className="booking-actions"><a className="button button-light" href="/booking">Book appointment <ArrowRight size={16}/></a><a className="booking-contact" href="#contact">Contact us</a></div></div>
          <span className="booking-caption">ILLUSTRATIVE STOCK PHOTOGRAPHY · SANGAM PARLOUR</span>
        </section>
        <section className="location-section section-wrap" id="contact">
        <div className="section-overline" data-reveal><span className="section-overline-primary"><span className="section-number" aria-hidden="true">08</span><span>COME SAY HELLO</span></span><span className="section-overline-secondary">WE’RE HERE FOR YOU</span></div>
        <div className="section-heading location-heading" data-reveal><div><p className="eyebrow">YOUR NEIGHBOURHOOD BEAUTY DESTINATION</p><h2>Visit <em>Sangam Parlour.</em></h2></div><p>We look forward to welcoming you. Find our verified location and plan your visit below.</p></div>
        <div className="location-grid">
          <div className="location-map">
            <a className="location-map-image" href={contact.directions} target="_blank" rel="noopener noreferrer">
              <Image src="/images/sangam-location-map.png" alt="Map showing the location of Sangam Parlour" fill sizes="(max-width: 760px) 88vw, 48vw" />
            </a>
          </div>
          <div className="location-copy" data-reveal>
            <div className="contact-list">
              <div><span><small>ADDRESS</small>{contact.address || <em>Salon address to be added</em>}</span></div>
              <div className="contact-hours-row"><div><small>GOOGLE MAPS HOURS · NOT YET CONFIRMED</small><ul className="contact-hours-list">{contact.hours.map(({ day, time }) => <li key={day}><span>{day}</span><span>{time}</span></li>)}</ul>{contact.hoursNeedConfirmation && <p className="contact-hours-note">Friday–Sunday entries are unusual. Please confirm the schedule with Sangam before visiting.</p>}</div></div>
              <div><span><small>CONTACT</small>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : <em>Phone number to be added</em>}</span></div>
              <div><span><small>WHATSAPP</small>{contact.whatsapp ? <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">MESSAGE SANGAM</a> : <em>WhatsApp number to be added</em>}</span></div>
            </div>
            {contact.directions ? <a className="button button-outline" href={contact.directions} target="_blank" rel="noreferrer">Get Directions <ArrowRight size={15}/></a> : <p className="location-directions-note">Directions will be available once the verified address is added.</p>}
          </div>
        </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <div className="footer-brand-column">
            <a className="brand-lockup footer-logo" href="#home"><span>SANGAM</span><small>PARLOUR</small></a>
            <p>Beauty, thoughtfully<br/>done your way.</p>
            {contact.instagram && <div className="footer-socials"><a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a></div>}
          </div>
          <nav className="footer-links footer-quick-links" aria-label="Footer navigation">
            <h2>QUICK LINKS</h2>
            <div className="footer-link-list"><a href="#home">Home</a><a href="#services">Services</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href="#offers">Offers</a><a href="#contact">Contact</a></div>
          </nav>
          <div className="footer-action-column">
            <h2>PLAN YOUR VISIT</h2>
            <a className="footer-booking" href="/booking">Book appointment</a>
            {(contact.address || contact.hours || contact.phone || contact.whatsapp || contact.directions) && <div className="footer-contact-details">
              {contact.address && <p><small>ADDRESS</small><span>{contact.address}</span></p>}
              {contact.hours.length > 0 && <p><small>OPENING HOURS</small><span>See Visit section · confirm before visiting</span></p>}
              {contact.phone && <p><small>PHONE</small><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}
              {contact.whatsapp && <p><small>WHATSAPP</small><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">Message Sangam</a></p>}
              {contact.directions && <p><small>DIRECTIONS</small><a href={contact.directions} target="_blank" rel="noreferrer">Get directions</a></p>}
            </div>}
          </div>
        </div>
        <div className="footer-bottom section-wrap"><span>© 2026 SANGAM PARLOUR</span><a href="#home">BACK TO TOP</a></div>
      </footer>
      </div>
    </>
  );
}
