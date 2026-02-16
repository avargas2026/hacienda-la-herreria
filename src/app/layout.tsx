import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Providers } from '@/components/Providers';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import VisitorTracker from '@/components/VisitorTracker';
import CookieBanner from '@/components/CookieBanner';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Hacienda La Herrería | Refugio Natural en Fusagasugá',
  description: 'Descubre Hacienda La Herrería, un refugio natural exclusivo en Fusagasugá, Cundinamarca. Glamping de lujo y habitaciones campestres para desconectarse y reconectar con la naturaleza.',
  keywords: 'Hacienda La Herrería, Glamping Fusagasugá, Glamping Cundinamarca, Glamping cerca de Bogotá, Hotel Campestre Fusagasugá, Turismo rural Colombia, Alojamiento de lujo Fusagasugá',
  authors: [{ name: 'Hacienda La Herrería' }],
  metadataBase: new URL('https://www.laherreria.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hacienda La Herrería | Refugio Natural en Fusagasugá',
    description: 'Un espacio exclusivo de naturaleza y desconexión en el corazón de Cundinamarca.',
    url: 'https://laherreria.co',
    siteName: 'Hacienda La Herrería',
    images: [
      {
        url: 'https://laherreria.co/logo.jpeg',
        width: 500,
        height: 500,
        alt: 'Logo Hacienda La Herrería',
      },
      {
        url: 'https://laherreria.co/Herreria1.jpg',
        width: 1200,
        height: 630,
        alt: 'Vista principal de la Hacienda La Herrería',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hacienda La Herrería | Refugio Natural',
    description: 'El refugio perfecto para descansar cerca de Bogotá.',
    images: ['https://laherreria.co/logo.jpeg'],
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
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'La Herrería Admin',
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Hacienda La Herrería",
  "image": "https://laherreria.co/Herreria1.jpg",
  "description": "Exclusivo refugio natural en Fusagasugá, Cundinamarca, ofreciendo glamping de lujo y experiencias de desconexión.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Fusagasugá",
    "addressRegion": "Cundinamarca",
    "addressCountry": "CO"
  },
  "url": "https://laherreria.co",
  "telephone": "+573150322241",
  "email": "reservas@laherreria.co",
  "priceRange": "$$$",
  "hasMap": "https://www.google.com/maps?q=Hacienda+La+Herreria+Fusagasuga"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-800 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-xl"
        >
          Saltar al contenido principal / Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>
          <Suspense fallback={null}>
            <VisitorTracker />
          </Suspense>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main id="main-content" className="flex-grow outline-none" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
          <WhatsAppButton />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
