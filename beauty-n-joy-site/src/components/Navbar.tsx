"use client";

import { useState } from "react";
import { Menu, X, Calendar } from "lucide-react";
import businessData from "@/data/business.json";

interface NavbarProps {
  onOpenAppointmentModal?: () => void;
}

export default function Navbar({ onOpenAppointmentModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  const handleBookClick = (e: React.MouseEvent) => {
    if (onOpenAppointmentModal) {
      e.preventDefault();
      onOpenAppointmentModal();
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF7F2]/95 backdrop-blur-md border-b border-[#E5D9CF] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Brand Logo */}
          <a
            href="#hero"
            className="group flex items-center gap-2 text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#4D3D35] hover:text-[#6A574D] transition-colors duration-200"
          >
            <span>{businessData["Business Name"]}</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs lg:text-sm font-medium tracking-wider uppercase text-[#6A574D] hover:text-[#C6A36A] relative py-1 transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#C6A36A] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Desktop CTA: BOOK APPOINTMENT */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={handleBookClick}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all duration-300 rounded-lg shadow-sm hover:shadow focus:outline-none"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>BOOK APPOINTMENT</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#4D3D35] hover:text-[#6A574D] hover:bg-[#F4EDE5] focus:outline-none transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5D9CF] bg-[#FBF7F2] px-4 pt-2 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium tracking-wide uppercase text-[#4D3D35] hover:bg-[#F4EDE5] transition-colors rounded-md"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E5D9CF]">
            <button
              type="button"
              onClick={handleBookClick}
              className="flex items-center justify-center gap-2 w-full min-h-[44px] px-5 py-3 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-colors rounded-lg text-center focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-[#C6A36A]" />
              <span>BOOK APPOINTMENT</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
