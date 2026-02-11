import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Providers } from '@/components/Providers';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Hacienda La Herrería | Refugio Natural',
  description: 'Un refugio natural para desconectarse y reconectar en Silvania, Cundinamarca.',
  icons: {
    icon: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-800 antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <WhatsAppButton />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
