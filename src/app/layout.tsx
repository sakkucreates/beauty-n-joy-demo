import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beauty N Joy | Salon & Beauty Experience",
  description: "Official Beauty N Joy website showcasing salon services, hair styling, skin care, and bridal makeup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#FAF6F0] text-[#1C1817] antialiased">
        {children}
      </body>
    </html>
  );
}
