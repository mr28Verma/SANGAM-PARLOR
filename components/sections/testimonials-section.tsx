type Testimonial = { quote: string; name: string; service: string };

export function TestimonialsSection({ items }: { items: ReadonlyArray<Testimonial> }) {
  return (
    <section className="testimonial-section section-wrap" aria-labelledby="testimonial-title">
      <div className="section-overline" data-reveal><span>07 / KIND WORDS</span><span>SHARED WITH PERMISSION</span></div>
      <div className="testimonial-header" data-reveal><div><p className="eyebrow">A NOTE FROM OUR GUESTS</p><h2 id="testimonial-title">What our clients <em>say.</em></h2></div></div>
      {items.length > 0 ? <div className="testimonial-grid">
        {items.map((item) => <blockquote className="testimonial" key={`${item.name}-${item.service}`} data-reveal><p>{item.quote}</p><footer><span>{item.name}</span><small>{item.service}</small></footer></blockquote>)}
      </div> : <div className="reviews-empty" data-reveal><p>Verified guest testimonials will appear here once Sangam has reviews to share.</p><small>NO CUSTOMER QUOTES ARE PUBLISHED YET</small></div>}
    </section>
  );
}
