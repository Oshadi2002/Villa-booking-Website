import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Sinharaja Collection Lankagama | Curated Villas, Camping & Rainforest Stays",
  description: "Official boutique travel collection for Lankagama, Sinharaja. Reserve verified river-edge villas, rent expedition camping gear, and hire certified native naturalists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#14231B] text-[#F5F2EB] selection:bg-[#D4AF37] selection:text-[#14231B]">
        {children}
      </body>
    </html>
  );
}
