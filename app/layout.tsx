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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lakagama.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "The Sinharaja Collection Lankagama | Curated Villas, Camping & Rainforest Stays",
    template: "%s | The Sinharaja Collection Lankagama"
  },
  description: "Official boutique travel collection for Lankagama, Sinharaja. Reserve verified river-edge villas, rent expedition camping gear, and hire certified native naturalists in Lankagama, Sri Lanka.",
  keywords: [
    "lakagama",
    "lakagama.com",
    "lankagama",
    "lankagama travel",
    "lankagama villas",
    "sinharaja",
    "sinharaja rainforest",
    "sinharaja villas",
    "lankagama camping",
    "brahmana ella",
    "duwili ella",
    "kithul treacle",
    "gin ganga stays",
    "sri lanka eco resort"
  ],
  authors: [{ name: "The Sinharaja Collection Lankagama" }],
  creator: "The Sinharaja Collection",
  publisher: "The Sinharaja Collection Lankagama",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "The Sinharaja Collection Lankagama | Rainforest Stays & Villas",
    description: "Curated riverside villas, camping gear rentals, pure kithul delivery, and certified native rainforest guides in Lankagama.",
    url: BASE_URL,
    siteName: "The Sinharaja Collection Lankagama",
    images: [
      {
        url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "The Sinharaja Collection Lankagama"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Sinharaja Collection Lankagama | Rainforest Stays & Villas",
    description: "Curated riverside villas, camping gear rentals, pure kithul, and guided waterfall trekking in Lankagama.",
    images: ["https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "The Sinharaja Collection Lankagama",
    "url": BASE_URL,
    "description": "Boutique collection of riverside eco-villas, camping equipment rentals, pure kithul, and guided rainforest experiences in Lankagama.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lankagama",
      "addressRegion": "Southern Province",
      "addressCountry": "LK"
    },
    "telephone": "+94767976081"
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body 
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-[#14231B] text-[#F5F2EB] selection:bg-[#D4AF37] selection:text-[#14231B]"
      >
        {children}
      </body>
    </html>
  );
}
