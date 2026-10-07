import Image from "next/image";
import type { offers as offerContent, photographs } from "@/lib/landing-content";

type Offers = typeof offerContent;
type Photograph = (typeof photographs)[keyof typeof photographs];

export function OffersSection({ offers, editorialPhoto }: { offers: Offers; editorialPhoto: Photograph }) {
  return (
    <section className="offers-section section-wrap" id="offers">
      <div className="section-overline" data-reveal><span>04 / SANGAM UPDATES</span><span>OFFERS & SEASONAL SERVICES</span></div>
      <div className="section-heading offers-heading" data-reveal><div><p className="eyebrow">A LITTLE SOMETHING EXTRA</p><h2>Current <em>offers.</em></h2></div><span className="offer-status">SHARED WHEN CONFIRMED</span></div>
      {offers.length > 0 ? <div className="offers-grid">
        {offers.map((offer, index) => <article className={`offer-item offer-${index + 1}`} key={offer.label} data-reveal>
          <div className="offer-image" data-image-reveal><Image src={offer.photo.src} alt={offer.photo.alt} fill sizes="(max-width: 760px) 84vw, 30vw" /></div>
          <div className="offer-copy"><span>{offer.label}</span><h3>{offer.title}</h3></div>
        </article>)}
      </div> : <div className="offers-empty" data-reveal>
        <div className="offers-empty-photo" data-image-reveal><Image src={editorialPhoto.src} alt={editorialPhoto.alt} fill sizes="(max-width: 760px) 100vw, 48vw" /></div>
        <div className="offers-empty-copy"><p className="eyebrow">SANGAM NOTICES</p><h3>Offers will be shared here.</h3><p>We’ll publish confirmed salon promotions in this space. No discounts or dates are listed until they’re verified.</p><a className="underlined-link" href="#contact">CONTACT SANGAM</a></div>
      </div>}
    </section>
  );
}
