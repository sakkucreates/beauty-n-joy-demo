"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Sparkles, CheckCircle2, User, Phone } from "lucide-react";
import businessData from "@/data/business.json";
import { servicesData } from "@/data/services";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  defaultServiceId = "",
}: AppointmentModalProps) {
  const [selectedService, setSelectedService] = useState(defaultServiceId || servicesData[0]?.title || "");
  const [selectedShift, setSelectedShift] = useState("Morning Shift (10:00 AM - 1:00 PM)");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Set today's date as min date
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const shifts = [
    { id: "morning", label: "Morning Shift", time: "10:00 AM – 1:00 PM" },
    { id: "afternoon", label: "Afternoon Shift", time: "1:00 PM – 4:00 PM" },
    { id: "evening", label: "Evening Shift", time: "4:00 PM – 7:00 PM" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book an Appointment with Beauty N Joy"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#4D3D35]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#FFF9F4] rounded-2xl shadow-2xl border border-[#E5D9CF] overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-[#F4EDE5] px-6 py-5 border-b border-[#E5D9CF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F1E4DF] rounded-lg text-[#6A574D]">
              <Sparkles className="w-4 h-4 text-[#C6A36A]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#4D3D35]">
                {businessData["Business Name"]}
              </h3>
              <p className="text-[11px] uppercase tracking-wider text-[#927F74] font-medium">
                Appointment Request
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#6A574D] hover:bg-[#E8D8C8] transition-colors focus:outline-none"
            aria-label="Close appointment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {submitted ? (
            /* Confirmation State */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-[#F1E4DF] text-[#C6A36A] rounded-full flex items-center justify-center mx-auto border border-[#E5D9CF]">
                <CheckCircle2 className="w-8 h-8 text-[#C6A36A]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-serif font-bold text-[#4D3D35]">
                  Request Received!
                </h4>
                <p className="text-sm text-[#806F66] font-light max-w-xs mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-[#4D3D35]">{clientName || "Valued Client"}</span>. Your appointment request for <span className="font-semibold text-[#4D3D35]">{selectedService}</span> has been logged.
                </p>
              </div>

              {/* Summary Pill */}
              <div className="bg-[#FBF7F2] border border-[#E5D9CF] p-4 rounded-xl text-left space-y-2 text-xs text-[#6A574D]">
                <div className="flex items-center justify-between">
                  <span className="text-[#927F74]">Preferred Shift:</span>
                  <span className="font-semibold text-[#4D3D35]">{selectedShift}</span>
                </div>
                {appointmentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#927F74]">Preferred Date:</span>
                    <span className="font-semibold text-[#4D3D35]">{appointmentDate}</span>
                  </div>
                )}
                {clientPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#927F74]">Contact Phone:</span>
                    <span className="font-semibold text-[#4D3D35]">{clientPhone}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all rounded-lg shadow-sm"
              >
                DONE
              </button>
            </div>
          ) : (
            /* Booking Request Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Select Service / Appointment Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#927F74]">
                  1. Select Service / Treatment
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F2] border border-[#E5D9CF] rounded-lg text-[#4D3D35] focus:outline-none focus:border-[#C6A36A] focus:ring-1 focus:ring-[#C6A36A]"
                  required
                >
                  {servicesData.map((svc) => (
                    <option key={svc.id} value={svc.title}>
                      {svc.title}
                    </option>
                  ))}
                  <option value="General Beauty Consultation">General Beauty Consultation</option>
                </select>
              </div>

              {/* 2. Select Preferred Shift */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#927F74] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C6A36A]" />
                  2. Preferred Shift & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {shifts.map((s) => {
                    const isSelected = selectedShift.startsWith(s.label);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedShift(`${s.label} (${s.time})`)}
                        className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                          isSelected
                            ? "bg-[#F1E4DF] border-[#C6A36A] text-[#4D3D35] font-semibold shadow-xs"
                            : "bg-[#FBF7F2] border-[#E5D9CF] text-[#6A574D] hover:bg-[#F4EDE5]"
                        }`}
                      >
                        <div className="font-medium text-[11px]">{s.label}</div>
                        <div className="text-[10px] text-[#927F74] mt-0.5">{s.time}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Preferred Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#927F74] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C6A36A]" />
                  3. Preferred Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F2] border border-[#E5D9CF] rounded-lg text-[#4D3D35] focus:outline-none focus:border-[#C6A36A] focus:ring-1 focus:ring-[#C6A36A]"
                  required
                />
              </div>

              {/* 4. Client Details (Name & Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E5D9CF]/60">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#927F74] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#C6A36A]" /> Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FBF7F2] border border-[#E5D9CF] rounded-lg text-[#4D3D35] placeholder-[#927F74]/60 focus:outline-none focus:border-[#C6A36A]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#927F74] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#C6A36A]" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FBF7F2] border border-[#E5D9CF] rounded-lg text-[#4D3D35] placeholder-[#927F74]/60 focus:outline-none focus:border-[#C6A36A]"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full min-h-[44px] py-3.5 text-xs font-semibold tracking-widest uppercase text-[#FFF9F4] bg-[#6A574D] hover:bg-[#4D3D35] transition-all rounded-lg shadow-sm hover:shadow"
              >
                REQUEST APPOINTMENT
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
