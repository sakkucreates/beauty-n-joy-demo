"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { galleryData, GalleryItem } from "@/data/gallery";

export default function GallerySection() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Prevent background scrolling when lightbox is active
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  return (
    <section id="gallery" className="py-16 sm:py-20 md:py-24 bg-[#FBF7F2] border-b border-[#E5D9CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#927F74]">
              OUR WORK
            </span>
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4D3D35] tracking-tight">
            Beauty In Every Detail
          </h2>

          <p className="text-sm sm:text-base text-[#806F66] font-light max-w-xl mx-auto leading-relaxed">
            A glimpse of Beauty N Joy's beauty, hair and bridal artistry.
          </p>
        </div>

        {/* Gallery Grid Composition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Featured Large Hero Image */}
          <div
            onClick={() => setSelectedItem(galleryData[0])}
            className="sm:col-span-2 lg:col-span-7 group relative aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-[#F4EDE5] border border-[#E5D9CF] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Image
              src={galleryData[0].src}
              alt={galleryData[0].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            
            {/* Zoom Icon indicator */}
            <div className="absolute top-4 right-4 p-2 bg-[#FFF9F4]/90 backdrop-blur-sm rounded-full text-[#4D3D35] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="w-4 h-4" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-[#C6A36A] text-[#FFF9F4] px-2.5 py-0.5 rounded-full inline-block">
                Featured Work
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#FFF9F4]">{galleryData[0].title}</h3>
              <p className="text-xs text-slate-200 font-light">{galleryData[0].caption}</p>
            </div>
          </div>

          {/* Top Right Stack */}
          <div className="sm:col-span-1 lg:col-span-5 grid grid-cols-1 gap-4 sm:gap-6">
            {galleryData.slice(1, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-[#F4EDE5] border border-[#E5D9CF] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/70 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
                
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-sm font-serif font-semibold text-[#FFF9F4]">{item.title}</h3>
                  <p className="text-[11px] text-slate-200 font-light">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining Supporting Gallery Grid */}
          {galleryData.slice(3).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="sm:col-span-1 lg:col-span-4 group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F4EDE5] border border-[#E5D9CF] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/70 via-transparent to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-sm font-serif font-semibold text-[#FFF9F4]">{item.title}</h3>
                <p className="text-[11px] text-slate-200 font-light">{item.caption}</p>
              </div>
            </div>
          ))}

        </div>

        {/* Gallery CTA */}
        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-3.5 text-xs font-semibold tracking-widest uppercase text-[#6A574D] bg-transparent border border-[#B9A69A] hover:bg-[#F1E4DF] transition-all duration-300 rounded-lg text-center"
          >
            <span>EXPLORE BEAUTY N JOY</span>
          </a>
        </div>

      </div>

      {/* Accessible Lightbox Modal Overlay */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer for ${selectedItem.title}`}
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-[#4D3D35]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-[#FFF9F4]/20 text-[#FFF9F4] hover:bg-[#FFF9F4]/40 transition-colors focus:outline-none"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[85vh] bg-[#FFF9F4] rounded-xl overflow-hidden shadow-2xl border border-[#E5D9CF] flex flex-col"
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#4D3D35]">
              <Image
                src={selectedItem.src}
                alt={selectedItem.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 85vw"
                className="object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 bg-[#FFF9F4] border-t border-[#E5D9CF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-lg font-serif font-bold text-[#4D3D35]">
                  {selectedItem.title}
                </h4>
                <p className="text-xs text-[#806F66] font-light">
                  {selectedItem.caption}
                </p>
              </div>

              <span className="text-[10px] uppercase font-medium tracking-wider text-[#6A574D] px-3 py-1 bg-[#F1E4DF] rounded-full border border-[#E5D9CF] shrink-0 self-start sm:self-auto">
                Beauty N Joy Portfolio
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
