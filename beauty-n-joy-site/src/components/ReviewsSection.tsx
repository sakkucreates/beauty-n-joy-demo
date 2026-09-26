"use client";

import { useState, useMemo } from "react";
import { Star, Quote, ChevronDown, ChevronUp } from "lucide-react";
import businessData from "@/data/business.json";
import rawReviews from "@/data/reviews.json";

interface RawReview {
  "Author Name": string | null;
  Rating: number;
  Comment: string;
}

interface ProcessedReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export default function ReviewsSection() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Display-layer deduplication & filtering logic
  const displayReviews = useMemo(() => {
    const map = new Map<string, ProcessedReview>();
    let idCounter = 1;

    (rawReviews as RawReview[]).forEach((item) => {
      if (!item.Comment || item.Rating < 4) return;

      const normalizedComment = item.Comment.trim().toLowerCase();
      const existing = map.get(normalizedComment);

      if (!existing) {
        if (item["Author Name"]) {
          map.set(normalizedComment, {
            id: `rev-${idCounter++}`,
            author: item["Author Name"],
            rating: item.Rating,
            comment: item.Comment.trim()
          });
        }
      } else if (!existing.author && item["Author Name"]) {
        existing.author = item["Author Name"];
      }
    });

    return Array.from(map.values());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="reviews" className="py-16 sm:py-20 md:py-24 bg-[#FBF7F2] border-b border-[#E5D9CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#927F74]">
              CLIENT EXPERIENCES
            </span>
            <span className="w-8 h-[1px] bg-[#C6A36A]" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4D3D35] tracking-tight">
            Words of Appreciation
          </h2>

          <p className="text-sm sm:text-base text-[#806F66] font-light max-w-xl mx-auto leading-relaxed">
            Real experiences shared by Beauty N Joy clients.
          </p>

          {/* Business Rating Summary Badge */}
          {businessData.Rating && (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#F1E4DF] border border-[#E5D9CF] rounded-full mt-2">
              <div className="flex items-center text-[#C6A36A]">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1.5 text-sm font-bold text-[#4D3D35]">
                  {businessData.Rating}
                </span>
              </div>
              <span className="w-[1px] h-4 bg-[#E5D9CF]" />
              <span className="text-xs font-medium text-[#6A574D]">
                {businessData["Review Count"] ? `${businessData["Review Count"]} Verified Google Reviews` : "Verified Reviews"}
              </span>
            </div>
          )}
        </div>

        {/* Reviews Grid (2-column Desktop, 1-column Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {displayReviews.map((rev) => {
            const isLong = rev.comment.length > 140;
            const isExpanded = expandedItems[rev.id];
            const displayedComment = isLong && !isExpanded
              ? `${rev.comment.slice(0, 140)}...`
              : rev.comment;

            return (
              <div
                key={rev.id}
                className="bg-[#FFF9F4] border border-[#E5D9CF] p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative"
              >
                {/* Quote Decorative Mark */}
                <Quote className="w-8 h-8 text-[#E5D9CF] absolute top-6 right-6 opacity-70 pointer-events-none" />

                <div className="space-y-4">
                  {/* Star Rating Display */}
                  <div
                    className="flex items-center text-[#C6A36A] space-x-1"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <div className="text-sm sm:text-base text-[#6A574D] font-light leading-relaxed">
                    <p className="italic">"{displayedComment}"</p>
                    
                    {/* Read More / Show Less Toggle */}
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(rev.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D3D35] hover:text-[#C6A36A] transition-colors mt-2 focus:outline-none"
                      >
                        <span>{isExpanded ? "SHOW LESS" : "READ MORE"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Author Metadata */}
                <div className="pt-4 mt-4 border-t border-[#E5D9CF] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#4D3D35]">
                      {rev.author}
                    </h3>
                    <p className="text-[11px] uppercase tracking-wider text-[#927F74]">
                      Verified Client
                    </p>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-[#6A574D] font-medium bg-[#F1E4DF] px-2.5 py-1 rounded-full border border-[#E5D9CF]">
                    Google Review
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section CTA */}
        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-4 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all duration-300 rounded-lg shadow-sm hover:shadow-md text-center"
          >
            VISIT BEAUTY N JOY
          </a>
        </div>

      </div>
    </section>
  );
}
