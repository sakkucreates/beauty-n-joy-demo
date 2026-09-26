export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  highlights: string[];
}

export const servicesData: ServiceCategory[] = [
  {
    id: "bridal-makeup",
    title: "Bridal & Occasion Makeup",
    description: "Customized bridal styling and makeup tailored to reflect elegance and individual grace for your special day.",
    image: "/images/beauty-n-joy/bridal-look1.jpg",
    highlights: ["Bridal Makeover", "Occasion Makeup", "Traditional Hair & Beauty"]
  },
  {
    id: "hair-styling",
    title: "Hair Styling & Design",
    description: "Artistic hair braiding, elegant updos, and occasion styling created with care and precision.",
    image: "/images/beauty-n-joy/hair-braid.jpg",
    highlights: ["Event Hair Styling", "Intricate Braids", "Occasion Updos"]
  },
  {
    id: "hair-care",
    title: "Hair Care & Treatments",
    description: "Nurturing hair spa routines, hair smoothing, and professional conditioning treatments for healthy shine.",
    image: "/images/beauty-n-joy/hair-smoothing.jpg",
    highlights: ["Hair Spa & Conditioning", "Smoothing Treatments", "Gloss & Texture Care"]
  },
  {
    id: "skin-beauty",
    title: "Skin & Beauty Care",
    description: "Attentive beauty routines and soothing skin care services performed in a welcoming salon setting.",
    image: "/images/beauty-n-joy/interior-basins.jpg",
    highlights: ["Facial & Skin Care", "Beauty Refresh", "Clean & Hygienic Environment"]
  },
  {
    id: "bridal-heritage",
    title: "Bridal Heritage Artistry",
    description: "Complete traditional bridal ensembles crafted with harmony between makeup, jewelry, and draped veil.",
    image: "/images/beauty-n-joy/bridal-look2.jpg",
    highlights: ["Traditional Bridal Looks", "Ornate Veil & Jewelry Draping", "Personalized Consultation"]
  },
  {
    id: "nail-academy",
    title: "Nail Care & Academy",
    description: "Creative nail art design, nail care, and structured academy training for aspiring beauty professionals.",
    image: "/images/beauty-n-joy/storefront.jpg",
    highlights: ["Nail Art & Styling", "Hand & Foot Care", "Professional Training Courses"]
  }
];
