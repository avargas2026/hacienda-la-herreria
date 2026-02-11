'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function PropiedadPage() {
    const { t } = useLanguage();
    return (
        <div className="bg-stone-50 min-h-screen">
            {/* Header */}
            <div className="py-20 px-4 text-center bg-stone-100 mb-12" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('/Herreria3.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('propiedad.label')}</span>
                <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('propiedad.title')}</h1>
                <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                    {t('propiedad.intro')}
                </p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
                <section>
                    <div className="h-96 md:h-[500px] bg-stone-300 rounded-2xl overflow-hidden mb-8 relative shadow-lg">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700"
                            style={{ backgroundImage: "url('/Herreria2.jpg')" }}
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
                    </div>
                    <div className="h-80 bg-stone-300 rounded-2xl overflow-hidden relative shadow-lg">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700"
                            style={{ backgroundImage: "url('/Entorno2.jpg')" }}
                        />
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
