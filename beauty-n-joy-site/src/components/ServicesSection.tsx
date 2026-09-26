import Image from "next/image";
import { Check } from "lucide-react";
import { servicesData } from "@/data/services";

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 bg-[#FBF7F2] border-b border-[#E5D9CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#927F74]">
              WHAT WE OFFER
            </span>
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4D3D35] tracking-tight">
            Services & Offerings
          </h2>

          <p className="text-sm sm:text-base text-[#806F66] font-light max-w-xl mx-auto leading-relaxed">
            Thoughtfully curated beauty, hair, and makeup services tailored to highlight your natural style.
          </p>
        </div>

        {/* Service Cards Grid (Desktop: 3-column, Mobile: 1-column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="group bg-[#FFF9F4] border border-[#E5D9CF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:border-[#D8C6BC]"
            >
              {/* Image Header */}
              <div className="relative aspect-[16/10] sm:aspect-[16/10] overflow-hidden bg-[#F4EDE5]">
                <Image
                  src={service.image}
                  alt={`Beauty N Joy ${service.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4D3D35]/35 via-transparent to-transparent opacity-60" />
                
                {/* Category Badge overlay */}
                <div className="absolute top-3 left-3 bg-[#FFF9F4]/90 backdrop-blur-sm px-3 py-1 rounded-full border border-[#E5D9CF]">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6A574D]">
                    Salon Service
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-[#4D3D35] group-hover:text-[#6A574D] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#806F66] font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Service Highlights List */}
                {service.highlights && service.highlights.length > 0 && (
                  <div className="pt-3 border-t border-[#E5D9CF] space-y-2">
                    {service.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#6A574D]">
                        <Check className="w-3.5 h-3.5 text-[#C6A36A] shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
