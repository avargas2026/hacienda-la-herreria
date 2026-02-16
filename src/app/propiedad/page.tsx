'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function PropiedadPage() {
    const { t } = useLanguage();
    return (
        <div className="bg-stone-50 min-h-screen">
            {/* Header */}
            <div className="relative py-20 px-4 text-center bg-stone-100 mb-12 min-h-[300px] flex flex-col justify-center overflow-hidden">
                <Image
                    src="/Herreria3.jpg"
                    alt="Fondo de Hacienda La Herrería"
                    fill
                    priority
                    className="object-cover opacity-10"
                />
                <div className="relative z-10">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('propiedad.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('propiedad.title')}</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        {t('propiedad.intro')}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
                <section>
                    <div className="h-96 md:h-[500px] bg-stone-300 rounded-2xl overflow-hidden mb-8 relative shadow-lg">
                        <Image
                            src="/Propiedad1.jpg"
                            alt={t('propiedad.house.title')}
                            fill
                            className="object-cover transition-transform hover:scale-105 duration-700"
                            sizes="(max-width: 896px) 100vw, 896px"
                        />
                    </div>
                    <h2 className="font-serif text-2xl text-stone-800 mb-4">{t('propiedad.house.title')}</h2>
                    <p className="text-stone-600 leading-relaxed mb-4">
                        {t('propiedad.house.text1')}
                    </p>
                    <p className="text-stone-600 leading-relaxed">
                        {t('propiedad.house.text2')}
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="font-serif text-2xl text-stone-800 mb-4">{t('propiedad.location.title')}</h2>
                        <p className="text-stone-600 leading-relaxed">
                            {t('propiedad.location.text1')}
                        </p>
                        <p className="text-stone-600 leading-relaxed mt-4">
                            {t('propiedad.location.text2')}
                        </p>

                        <div className="flex flex-col gap-2 mt-6">
                            <a
                                href="https://maps.app.goo.gl/4r1Rs2EVg1aiu8og9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                Ver ubicación exacta en Google Maps
                            </a>
                            <a
                                href="https://waze.com/ul/hd2g15202r"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-cyan-600 font-medium hover:text-cyan-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                Ver ubicación exacta en Waze
                            </a>
                        </div>
                    </div>
                    <div className="h-80 bg-stone-300 rounded-2xl overflow-hidden relative shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.369894378619!2d-74.39063992414616!3d4.405389995568858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f056d69116e01%3A0x7c8c3e6608518e0!2sFusagasuga%2C%20Cundinamarca!5e0!3m2!1ses!2sco!4v1707850000000!5m2!1ses!2sco"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación Hacienda La Herrería"
                        ></iframe>
                    </div>
                </section>

                <section className="bg-white p-8 rounded-2xl border border-stone-100 text-center">
                    <h3 className="font-serif text-2xl text-stone-800 mb-4">{t('propiedad.cta.title')}</h3>
                    <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                        {t('propiedad.cta.text')}
                    </p>
                    <Link
                        href="/reservas"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors inline-block"
                    >
                        {t('propiedad.cta.button')}
                    </Link>
                </section>
            </div>
        </div>
    );
}
