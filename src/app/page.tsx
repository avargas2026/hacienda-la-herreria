'use client';

import HeroSlider from '@/components/HeroSlider';
import Link from 'next/link';
import { ArrowRight, Leaf, Map, Sun } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSlider />

      {/* Introduction Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('home.intro.welcome')}</span>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-8 leading-tight">
            {t('home.intro.title')}
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-12">
            {t('home.intro.text')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.nature')}</h3>
              <p className="text-stone-500 text-sm">{t('home.feature.nature.desc')}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Sun className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.rest')}</h3>
              <p className="text-stone-500 text-sm">{t('home.feature.rest.desc')}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Map className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.location')}</h3>
              <p className="text-stone-500 text-sm">{t('home.feature.location.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured CTA */}

      {/* Map Section */}
      <section className="py-0">
        <div className="w-full h-96 relative bg-stone-200">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src="https://maps.google.com/maps?q=Hacienda%20La%20Herrer%C3%ADa%2C%20Silvania&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            title="Hacienda La Herrería Location"
          ></iframe>
          <div className="absolute bottom-4 left-4 right-4 md:top-4 md:right-4 md:left-auto md:bottom-auto bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-stone-100 max-w-sm mx-auto md:mx-0">
            <h3 className="font-serif text-lg text-emerald-800 font-medium mb-1">{t('home.map.title')}</h3>
            <p className="text-stone-600 text-sm mb-3">Hacienda La Herrería, Silvania</p>
            <div className="flex flex-col gap-2">
              <a
                href="https://maps.app.goo.gl/kT5UYUMJSb83XARJA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                <Map size={14} />
                Abrir en Google Maps
              </a>
              <a
                href="https://waze.com/ul?ll=4.403,-74.388&navigate=yes&q=Hacienda%20La%20Herreria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-cyan-500 hover:bg-cyan-600 px-3 py-2 rounded-lg transition-colors"
              >
                <Map size={14} />
                Abrir en Waze
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
