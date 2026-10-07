export const photographs = {
  salon: { src: "/images/salon-location-women.jpg", alt: "Women working at salon styling stations, reflected in the mirrors" },
  heroPoster: { src: "/images/salon-hair.jpg", alt: "A woman stylist finishing a client's blowout in a bright salon" },
  hair: { src: "/images/salon-service-hair-4x3.jpg", alt: "A woman stylist blow-drying a client's hair in a warm salon" },
  skin: { src: "/images/salon-service-skin-4x3.jpg", alt: "A woman receiving a professional facial treatment" },
  makeup: { src: "/images/salon-service-makeup-4x3.jpg", alt: "A woman makeup artist applying eye makeup to her client" },
  bridal: { src: "/images/salon-service-bridal-4x3.jpg", alt: "A woman makeup artist finishing an Indian bride's look" },
  bridalPortrait: { src: "/images/salon-gallery-bridal-4x3.jpg", alt: "A bride wearing a finished hairstyle and makeup look" },
  introHair: { src: "/images/salon-gallery-cut.jpg", alt: "A woman relaxing during a salon hair wash" },
  introMakeup: { src: "/images/salon-makeup.jpg", alt: "A woman makeup artist preparing a client" },
  experience: { src: "/images/salon-experience-hair.png", alt: "A woman stylist caring for a client in a warmly lit salon" },
  galleryStyle: { src: "/images/salon-gallery-style-4x3.jpg", alt: "A woman checking her finished hairstyle in a mirror" },
  galleryMakeup: { src: "/images/salon-gallery-makeup-4x3.jpg", alt: "A stylist consulting with a client during a salon appointment" },
  galleryIndiaMakeup: { src: "/images/salon-gallery-india-makeup-4x3.jpg", alt: "A woman makeup artist applying eye makeup to a client" },
  galleryBraid: { src: "/images/salon-gallery-braid-4x3.jpg", alt: "A woman stylist braiding a client's long hair in a warm salon" },
} as const;

export const heroFilm = {
  src: "/videos/gemini_generated_video_703cd73c.mp4",
  poster: photographs.heroPoster,
} as const;

export const services = [
  { number: "01", name: "Hair", description: "Personalized care for the style and finish you have in mind.", details: "ENQUIRE ABOUT HAIR SERVICES", photo: photographs.hair },
  { number: "02", name: "Skin", description: "A considered beauty ritual, chosen around you.", details: "ENQUIRE ABOUT SKIN SERVICES", photo: photographs.skin },
  { number: "03", name: "Makeup", description: "A polished look for a moment that matters to you.", details: "ENQUIRE ABOUT MAKEUP SERVICES", photo: photographs.makeup },
  { number: "04", name: "Bridal", description: "A considered look for one of life’s special moments.", details: "ENQUIRE ABOUT BRIDAL SERVICES", photo: photographs.bridal },
] as const;

export const offers: ReadonlyArray<{ label: string; title: string; photo: (typeof photographs)[keyof typeof photographs] }> = [];

export const inspiration = [
  { label: "MAKEUP · INDIA", photo: photographs.galleryIndiaMakeup },
  { label: "HAIR · BRAIDING", photo: photographs.galleryBraid },
] as const;

export const gallery = [
  { label: "HAIR · FINISHING", photo: photographs.galleryStyle },
  { label: "BRIDAL · FINISH", photo: photographs.bridalPortrait },
] as const;

export const values = ["Professional care", "Quality", "Personal attention", "Thoughtful service"] as const;

export const testimonials: ReadonlyArray<{ quote: string; name: string; service: string }> = [];

export const contact = {
  address: "24, Guru Nanak Colony Rd, Guru Nanak Colony, Dafarpur, Punjab 140201",
  hours: [
    { day: "Wednesday", time: "10:00 AM – 7:30 PM" },
    { day: "Thursday", time: "8:30 AM – 8:00 PM" },
    { day: "Friday", time: "10:00 AM – 12:00 AM" },
    { day: "Saturday", time: "12:00 AM – 7:30 AM and 9:00 AM – 8:30 PM" },
    { day: "Sunday", time: "5:00 AM – 8:00 PM" },
    { day: "Monday", time: "10:00 AM – 7:30 PM" },
    { day: "Tuesday", time: "8:30 AM – 8:00 PM" },
  ],
  hoursNeedConfirmation: true,
  phone: "9034849654",
  whatsapp: "919034849654",
  directions: "https://maps.app.goo.gl/u1whSSBizmMdXUtn7",
  instagram: "",
} as const;
