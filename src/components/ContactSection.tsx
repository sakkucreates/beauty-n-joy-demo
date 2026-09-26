"use client";

import { Star, MapPin, Phone, ExternalLink, Navigation, Calendar } from "lucide-react";
import businessData from "@/data/business.json";

interface ContactSectionProps {
  onOpenAppointmentModal?: () => void;
}

export default function ContactSection({ onOpenAppointmentModal }: ContactSectionProps) {
  const hasCoordinates = businessData.Latitude && businessData.Longitude;
  const mapsDirectionsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${businessData.Latitude},${businessData.Longitude}`
    : null;

  const handleBookClick = (e: React.MouseEvent) => {
    if (onOpenAppointmentModal) {
      e.preventDefault();
      onOpenAppointmentModal();
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-[#FBF7F2] border-b border-[#E5D9CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Introduction */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#C6A36A]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#927F74]">
                VISIT & CONNECT
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4D3D35] tracking-tight leading-[1.2]">
              Let's Make Your Visit Beautiful
            </h2>

            <p className="text-base sm:text-lg text-[#6A574D] font-light leading-relaxed">
              Find Beauty N Joy and connect with the salon using the verified details available below.
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={handleBookClick}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all duration-300 rounded-lg shadow-sm focus:outline-none"
              >
                <Calendar className="w-4 h-4 text-[#C6A36A]" />
                <span>BOOK APPOINTMENT</span>
              </button>

              {businessData.Phone && (
                <a
                  href={`tel:${businessData.Phone}`}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-[#6A574D] bg-transparent border border-[#B9A69A] hover:bg-[#F1E4DF] transition-all duration-300 rounded-lg"
                >
                  <Phone className="w-4 h-4 text-[#C6A36A]" />
                  <span>CALL {businessData.Phone}</span>
                </a>
              )}

              {mapsDirectionsUrl && (
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-[#6A574D] bg-transparent border border-[#B9A69A] hover:bg-[#F1E4DF] transition-all duration-300 rounded-lg"
                >
                  <Navigation className="w-4 h-4 text-[#C6A36A]" />
                  <span>GET DIRECTIONS</span>
                  <ExternalLink className="w-3 h-3 text-[#927F74]" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Verified Business Detail Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#FFF9F4] border border-[#E5D9CF] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 relative overflow-hidden">
              
              {/* Card Title & Rating Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5D9CF] pb-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#4D3D35]">
                    {businessData["Business Name"]}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-[#927F74] mt-0.5 font-medium">
                    Verified Business Details
                  </p>
                </div>

                {businessData.Rating && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F1E4DF] rounded-full border border-[#E5D9CF] shrink-0 self-start sm:self-auto">
                    <div className="flex items-center text-[#C6A36A]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-xs font-bold text-[#4D3D35]">
                        {businessData.Rating}
                      </span>
                    </div>
                    {businessData["Review Count"] && (
                      <span className="text-[11px] text-[#927F74] font-medium">
                        ({businessData["Review Count"]} Reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Information Items List */}
              <div className="space-y-4">
                
                {/* Verified Address */}
                {businessData.Address ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#C6A36A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#927F74]">
                        Location & Address
                      </h4>
                      <p className="text-sm text-[#4D3D35] font-medium mt-0.5 leading-relaxed">
                        {businessData.Address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#C6A36A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#927F74]">
                        Location
                      </h4>
                      <p className="text-sm text-[#6A574D] font-light mt-0.5">
                        Exact street address will be updated separately. Coordinates available for Google Maps navigation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Verified Phone */}
                {businessData.Phone && (
                  <div className="flex items-start gap-3 border-t border-[#E5D9CF] pt-4">
                    <div className="p-2.5 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-[#C6A36A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#927F74]">
                        Telephone
                      </h4>
                      <a
                        href={`tel:${businessData.Phone}`}
                        className="text-sm text-[#4D3D35] font-medium mt-0.5 hover:underline block"
                      >
                        {businessData.Phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Verified Coordinates & Directions Link */}
                {hasCoordinates && (
                  <div className="flex items-start gap-3 border-t border-[#E5D9CF] pt-4">
                    <div className="p-2.5 bg-[#F1E4DF] text-[#6A574D] rounded-lg shrink-0 mt-0.5">
                      <Navigation className="w-4 h-4 text-[#C6A36A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#927F74]">
                        Navigation Coordinates
                      </h4>
                      <p className="text-xs text-[#6A574D] font-mono mt-0.5">
                        {businessData.Latitude}, {businessData.Longitude}
                      </p>
                      {mapsDirectionsUrl && (
                        <a
                          href={mapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D3D35] hover:text-[#C6A36A] transition-colors mt-1"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
