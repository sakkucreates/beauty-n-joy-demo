"use client";

import Image from "next/image";
import { Star, Calendar } from "lucide-react";
import businessData from "@/data/business.json";

interface HeroProps {
  onOpenAppointmentModal?: () => void;
}

export default function Hero({ onOpenAppointmentModal }: HeroProps) {
  const handleBookClick = (e: React.MouseEvent) => {
    if (onOpenAppointmentModal) {
      e.preventDefault();
      onOpenAppointmentModal();
    }
  };

  return (
    <section id="hero" className="relative bg-[#FBF7F2] overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 border-b border-[#E5D9CF] scroll-mt-20">
      <div id="home" className="absolute top-0 left-0 w-0 h-0" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 z-10 pr-0 lg:pr-4">
            
            {/* Tag / Category Badge */}
            <div className="flex flex-wrap items-center gap-3 text-xs tracking-widest uppercase">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F1E4DF] text-[#6A574D] font-medium tracking-wider rounded-full border border-[#E5D9CF]">
                Salon & Beauty Experience
              </span>
            </div>

            {/* Headings */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#4D3D35] tracking-tight leading-[1.15]">
                {businessData["Business Name"]}
              </h1>
              <p className="text-lg sm:text-2xl md:text-3xl font-serif italic text-[#6A574D] font-normal leading-snug">
                Professional salon care, hair styling & bridal beauty artistry.
              </p>
            </div>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base md:text-lg text-[#806F66] font-light max-w-2xl leading-relaxed">
              Elevating personal care through attentive styling, elegant makeup, and curated salon services designed to bring out your natural confidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={handleBookClick}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-8 py-3.5 sm:py-4 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all duration-300 rounded-lg shadow-sm hover:shadow-md text-center focus:outline-none"
              >
                <Calendar className="w-4 h-4 text-[#C6A36A]" />
                <span>BOOK APPOINTMENT</span>
              </button>
              <a
                href="#services"
                className="inline-flex items-center justify-center min-h-[44px] px-8 py-3.5 sm:py-4 text-xs font-semibold tracking-widest uppercase text-[#6A574D] bg-transparent border border-[#B9A69A] hover:bg-[#F1E4DF] transition-all duration-300 rounded-lg text-center"
              >
                EXPLORE SERVICES
              </a>
            </div>

            {/* Verified Rating Element */}
            {businessData.Rating && (
              <div className="pt-4 border-t border-[#E5D9CF] flex items-center gap-3 sm:gap-4">
                <div className="flex items-center text-[#C6A36A] space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#4D3D35]">
                  <span className="font-semibold text-base sm:text-lg">{businessData.Rating}</span>
                  {businessData["Review Count"] && (
                    <span className="text-[#806F66] ml-1.5">
                      ({businessData["Review Count"]} Verified Google Reviews)
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Editorial Real Photography */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="absolute -inset-2.5 sm:-inset-3 bg-[#E8D8C8]/60 rounded-2xl transform rotate-1 sm:rotate-2 transition-transform duration-500"></div>
              
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#F4EDE5] shadow-md border border-[#E5D9CF]">
                <Image
                  src="/images/beauty-n-joy/hero.jpg"
                  alt={`${businessData["Business Name"]} Bridal & Beauty Styling`}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Editorial Quality Caption */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-[#FFF9F4] p-3 sm:p-4 rounded-lg shadow-md border border-[#E5D9CF]">
                <p className="text-xs sm:text-sm font-serif italic text-[#6A574D]">Real Client Work</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#927F74] font-medium mt-0.5">Beauty N Joy Salon</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
