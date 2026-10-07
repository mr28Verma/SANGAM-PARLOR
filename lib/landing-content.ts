export const photographs = {
  salon: { src: "/images/salon-hero.jpg", alt: "Stylist caring for a client in a contemporary salon" },
  hair: { src: "/images/salon-hair.jpg", alt: "Hair stylist finishing a client’s blowout" },
  skin: { src: "/images/salon-skin.jpg", alt: "A client receiving a professional facial treatment" },
  makeup: { src: "/images/salon-makeup.jpg", alt: "Makeup artist working with a client at a vanity" },
  bridal: { src: "/images/salon-bridal.jpg", alt: "Bride with a finished makeup and hair look" },
  galleryStyle: { src: "/images/salon-gallery-style.jpg", alt: "A client checking her finished updo in a salon mirror" },
  galleryMakeup: { src: "/images/salon-gallery-makeup.jpg", alt: "A makeup professional preparing a client in a light-filled studio" },
  galleryCut: { src: "/images/salon-gallery-cut.jpg", alt: "A client receiving a relaxing hair wash at a salon" },
  galleryBraid: { src: "/images/salon-gallery-braid.jpg", alt: "Two women working together on a braided hairstyle" },
  galleryIndiaMakeup: { src: "/images/salon-gallery-india-makeup.jpg", alt: "A makeup artist applying eye makeup to a client in Patna, India" },
} as const;

export const heroFilm = {
  src: "/videos/gemini_generated_video_703cd73c.mp4",
  poster: photographs.salon,
} as const;

export const services = [
  { number: "01", name: "Hair", description: "Personalized care for the style and finish you have in mind.", details: "ENQUIRE ABOUT HAIR SERVICES", photo: photographs.hair },
  { number: "02", name: "Skin", description: "A considered beauty ritual, chosen around you.", details: "ENQUIRE ABOUT SKIN SERVICES", photo: photographs.skin },
  { number: "03", name: "Makeup", description: "A polished look for a moment that matters to you.", details: "ENQUIRE ABOUT MAKEUP SERVICES", photo: photographs.makeup },
  { number: "04", name: "Bridal", description: "A considered look for one of life’s special moments.", details: "ENQUIRE ABOUT BRIDAL SERVICES", photo: photographs.bridal },
] as const;

export const offers: ReadonlyArray<{ label: string; title: string; photo: (typeof photographs)[keyof typeof photographs] }> = [];

export const gallery = [
  { label: "HAIR · FINISHING", photo: photographs.galleryStyle },
  { label: "MAKEUP · PREPARATION", photo: photographs.galleryMakeup },
  { label: "HAIR · CARE", photo: photographs.galleryCut },
  { label: "BRAIDING · DETAIL", photo: photographs.galleryBraid },
  { label: "MAKEUP · INDIA", photo: photographs.galleryIndiaMakeup },
] as const;

export const values = ["Professional care", "Quality", "Personal attention", "Thoughtful service"] as const;

export const testimonials: ReadonlyArray<{ quote: string; name: string; service: string }> = [];

export const contact = {
  address: "",
  hours: "",
  phone: "",
  whatsapp: "",
  directions: "",
  instagram: "",
} as const;
