"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AppointmentModal from "@/components/AppointmentModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex flex-col font-sans text-[#4D3D35] selection:bg-[#E8D8C8] selection:text-[#4D3D35]">
      {/* 1. Navbar */}
      <Navbar onOpenAppointmentModal={handleOpenModal} />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero onOpenAppointmentModal={handleOpenModal} />

        {/* 3. About Section */}
        <AboutSection />

        {/* 4. Services Section */}
        <ServicesSection />

        {/* 5. Gallery Section */}
        <GallerySection />

        {/* 6. Reviews Section */}
        <ReviewsSection />

        {/* 7. Contact Section */}
        <ContactSection onOpenAppointmentModal={handleOpenModal} />
      </main>

      {/* 8. Final Footer */}
      <Footer />

      {/* Interactive Appointment Modal Pop-Up */}
      <AppointmentModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
