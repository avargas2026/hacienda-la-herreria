'use client';

import HeroSlider from '@/components/HeroSlider';
import Link from 'next/link';
import { ArrowRight, Leaf, Map, Sun } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import MotionWrapper from '@/components/MotionWrapper';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSlider />

      {/* Introduction Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <MotionWrapper delay={0.1}>
            <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('home.intro.welcome')}</span>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-8 leading-tight">
              {t('home.intro.title')}
            </h2>
          </MotionWrapper>

          <MotionWrapper delay={0.3}>
            <p className="text-stone-600 text-lg leading-relaxed mb-12">
              {t('home.intro.text')}
            </p>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <MotionWrapper delay={0.4} direction="up" className="h-full">
              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full border border-stone-100">
                <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.nature')}</h3>
                <p className="text-stone-500 text-sm">{t('home.feature.nature.desc')}</p>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.5} direction="up" className="h-full">
              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full border border-stone-100">
                <Sun className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.rest')}</h3>
                <p className="text-stone-500 text-sm">{t('home.feature.rest.desc')}</p>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.6} direction="up" className="h-full">
              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full border border-stone-100">
                <Map className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-serif text-xl mb-2 text-stone-700">{t('home.feature.location')}</h3>
                <p className="text-stone-500 text-sm">{t('home.feature.location.desc')}</p>
              </div>
            </MotionWrapper>
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
            src="https://maps.google.com/maps?q=Hacienda%20La%20Herrer%C3%ADa%2C%20Fusagasuga&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            title="Hacienda La Herrería Location"
          ></iframe>
          <div className="absolute bottom-4 left-4 right-4 md:top-4 md:right-4 md:left-auto md:bottom-auto bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-stone-100 max-w-sm mx-auto md:mx-0">
            <h3 className="font-serif text-lg text-emerald-800 font-medium mb-1">{t('home.map.title')}</h3>
            <p className="text-stone-600 text-sm mb-3">Hacienda La Herrería, Fusagasuga, Vereda Usatama Baja, Cundinamarca</p>
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
                href="https://waze.com/ul/hd2g15202r"
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
