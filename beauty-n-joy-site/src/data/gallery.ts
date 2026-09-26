export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: "Bridal" | "Interior" | "Hair" | "Storefront";
  src: string;
  alt: string;
  aspect: "featured" | "tall" | "wide" | "square";
}

export const galleryData: GalleryItem[] = [
  {
    id: "g1",
    title: "Bridal Styling",
    caption: "Bridal Hair & Makeup Artistry",
    category: "Bridal",
    src: "/images/beauty-n-joy/hero.jpg",
    alt: "Beauty N Joy Bridal Styling and Hair Flowers",
    aspect: "featured"
  },
  {
    id: "g2",
    title: "Salon Ambiance",
    caption: "Styling Station & Gold Mirror",
    category: "Interior",
    src: "/images/beauty-n-joy/interior-mirror.jpg",
    alt: "Beauty N Joy Salon Interior Mirror",
    aspect: "tall"
  },
  {
    id: "g3",
    title: "Treatment Space",
    caption: "Shampoo & Hair Spa Area",
    category: "Interior",
    src: "/images/beauty-n-joy/interior-basins.jpg",
    alt: "Beauty N Joy Salon Basins and Treatment Area",
    aspect: "wide"
  },
  {
    id: "g4",
    title: "Bridal Detail",
    caption: "Traditional Makeup Artistry",
    category: "Bridal",
    src: "/images/beauty-n-joy/bridal-look1.jpg",
    alt: "Beauty N Joy Traditional Bridal Makeup",
    aspect: "square"
  },
  {
    id: "g5",
    title: "Bridal Heritage",
    caption: "Full Bridal Outfit & Veil Draping",
    category: "Bridal",
    src: "/images/beauty-n-joy/bridal-look2.jpg",
    alt: "Beauty N Joy Bridal Look in Carved Doorway",
    aspect: "tall"
  },
  {
    id: "g6",
    title: "Hair Artistry",
    caption: "Intricate Hair Braid & Accessories",
    category: "Hair",
    src: "/images/beauty-n-joy/hair-braid.jpg",
    alt: "Beauty N Joy Hair Braid Styling",
    aspect: "wide"
  },
  {
    id: "g7",
    title: "Hair Care",
    caption: "Hair Smoothing & Gloss Treatment",
    category: "Hair",
    src: "/images/beauty-n-joy/hair-smoothing.jpg",
    alt: "Beauty N Joy Hair Smoothing Transformation",
    aspect: "square"
  },
  {
    id: "g8",
    title: "Salon Exterior",
    caption: "Beauty N Joy Signboard & Entrance",
    category: "Storefront",
    src: "/images/beauty-n-joy/storefront.jpg",
    alt: "Beauty N Joy Salon Exterior Signboard",
    aspect: "wide"
  },
  {
    id: "g9",
    title: "Interior Artwork",
    caption: "Traditional Salon Wall Mural",
    category: "Interior",
    src: "/images/beauty-n-joy/interior-mural.jpg",
    alt: "Beauty N Joy Interior Mural Artwork",
    aspect: "wide"
  }
];
