import { contact } from "@/lib/landing-content";

export function SiteFooter({ homeLinks = false }: { homeLinks?: boolean }) {
  const rootHref = (href: string) => homeLinks ? `/${href}` : href;

  return (
    <footer className="site-footer">
      <div className="footer-main section-wrap">
        <div className="footer-brand-column">
          <a className="brand-lockup footer-logo" href={rootHref("#home")}><span>SANGAM</span><small>PARLOUR</small></a>
          <p>Beauty, thoughtfully<br/>done your way.</p>
          {contact.instagram && <div className="footer-socials"><a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a></div>}
        </div>
        <nav className="footer-links footer-quick-links" aria-label="Footer navigation">
          <h2>QUICK LINKS</h2>
          <div className="footer-link-list"><a href={rootHref("#home")}>Home</a><a href={rootHref("#services")}>Services</a><a href={rootHref("#about")}>About</a><a href={rootHref("#gallery")}>Gallery</a><a href={rootHref("#offers")}>Offers</a><a href={rootHref("#contact")}>Contact</a></div>
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
      <div className="footer-bottom section-wrap"><span>© 2026 SANGAM PARLOUR</span><a href={rootHref("#home")}>BACK TO TOP</a></div>
    </footer>
  );
}
