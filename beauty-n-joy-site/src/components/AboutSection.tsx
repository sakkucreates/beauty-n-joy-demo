import Image from "next/image";
import { Star, Sparkles, ShieldCheck } from "lucide-react";
import businessData from "@/data/business.json";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 bg-[#FBF7F2] border-b border-[#E5D9CF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Image Column (Mobile: First) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Warm Background Card */}
              <div className="absolute -inset-3 bg-[#F1E4DF] rounded-2xl transform -rotate-1 sm:-rotate-2 transition-transform duration-500" />
              
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] sm:aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-[#E5D9CF] bg-[#F4EDE5]">
                <Image
                  src="/images/beauty-n-joy/interior-mirror.jpg"
                  alt="Beauty N Joy Salon Interior and Styling Mirror"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Verified Trust Pill */}
              <div className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 bg-[#FFF9F4] border border-[#E5D9CF] p-3.5 sm:p-4 rounded-xl shadow-md max-w-[200px] sm:max-w-[220px]">
                <div className="flex items-center gap-1.5 text-[#C6A36A] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-serif font-bold text-[#4D3D35]">
                  {businessData.Rating || 4.7} Rating
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[#927F74] mt-0.5 font-medium">
                  {businessData["Review Count"] ? `${businessData["Review Count"]} Verified Reviews` : "Client Reviews"}
                </p>
              </div>

            </div>
          </div>

          {/* Text Content Column (Mobile: Second) */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7 pt-4 lg:pt-0">
            
            {/* Small Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#C6A36A]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#927F74]">
                ABOUT BEAUTY N JOY
              </span>
            </div>

            {/* Main Editorial Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4D3D35] tracking-tight leading-[1.2]">
              Beauty, Styled With Intention
            </h2>

            {/* Factual Statement */}
            <p className="text-base sm:text-lg text-[#6A574D] font-normal leading-relaxed">
              Beauty N Joy is a beauty and styling destination offering professional beauty, hair and makeup services designed around personal care, comfort, and natural elegance.
            </p>

            {/* Concise Supporting Narrative */}
            <p className="text-sm sm:text-base text-[#806F66] font-light leading-relaxed">
              From signature bridal styling to daily hair treatments and skin care, our approach focuses on thoughtful detail and attentive service to make every client feel valued and confident.
            </p>

            {/* Factual Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5D9CF]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4D3D35]">
                    Tailored Artistry
                  </h3>
                  <p className="text-xs text-[#806F66] mt-0.5 font-light">
                    Services customized to individual style and preference.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#C6A36A]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4D3D35]">
                    Clean & Hygienic
                  </h3>
                  <p className="text-xs text-[#806F66] mt-0.5 font-light">
                    Well-maintained environment prioritizing client comfort.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
