import businessData from "@/data/business.json";
import { Star } from "lucide-react";

export default function Footer() {
  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-[#E8D8C8] border-t border-[#E5D9CF] py-12 sm:py-16 text-[#4D3D35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left pb-10 border-b border-[#D8C6BC]">
          
          {/* Brand Info */}
          <div className="space-y-2">
            <a
              href="#hero"
              className="text-2xl font-serif font-bold text-[#4D3D35] hover:text-[#6A574D] transition-colors"
            >
              {businessData["Business Name"]}
            </a>
            <p className="text-xs sm:text-sm text-[#806F66] font-light max-w-sm">
              Beauty, hair and styling experiences.
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer Navigation">
            <ul className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs font-semibold tracking-wider uppercase text-[#6A574D] hover:text-[#C6A36A] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Rating Summary Pill */}
          {businessData.Rating && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF9F4] rounded-full border border-[#D8C6BC]">
              <div className="flex items-center text-[#C6A36A]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="ml-1 text-xs font-bold text-[#4D3D35]">
                  {businessData.Rating}
                </span>
              </div>
              <span className="w-[1px] h-3.5 bg-[#E5D9CF]" />
              <span className="text-[11px] font-medium text-[#806F66]">
                {businessData["Review Count"] ? `${businessData["Review Count"]} Reviews` : "Google Reviews"}
              </span>
            </div>
          )}

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#806F66] font-light">
          <p>© {new Date().getFullYear()} {businessData["Business Name"]}. All rights reserved.</p>

          {/* Demo Note */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF9F4] rounded-md border border-[#D8C6BC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A36A]" />
            <span className="text-[11px] font-medium text-[#6A574D]">Beauty N Joy • Demo Website</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
