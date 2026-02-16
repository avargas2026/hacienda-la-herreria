'use client';
import { ShieldCheck, Heart, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function ExperienciaPage() {
    const { t } = useLanguage();
    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('experience.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('experience.title')}</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        {t('experience.intro')}
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Rules & Mood */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h2 className="font-serif text-2xl text-stone-800 mb-6 flex items-center gap-3">
                            <Heart className="text-emerald-500" />
                            {t('experience.philosophy.title')}
                        </h2>
                        <p className="text-stone-600 leading-relaxed mb-6">
                            {t('experience.philosophy.text')}
                        </p>
                    </section>

                    {/* Service & Staff */}
                    <section>
                        <h2 className="font-serif text-2xl text-stone-800 mb-6">{t('experience.service.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="order-2 md:order-1">
                                <p className="text-stone-600 leading-relaxed mb-4">
                                    {t('experience.service.text')}
                                </p>
                                <ul className="space-y-2 text-stone-600 text-sm">
                                    <li className="flex items-center gap-2">✔ {t('experience.service.list1')}</li>
                                    <li className="flex items-center gap-2">✔ {t('experience.service.list2')}</li>
                                    <li className="flex items-center gap-2">✔ {t('experience.service.list3')}</li>
                                </ul>
                            </div>
                            <div className="h-64 bg-stone-300 rounded-2xl overflow-hidden relative order-1 md:order-2">
                                <Image
                                    src="/Refugio1.jpg"
                                    alt={t('experience.service.title')}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Restrictions */}
                    <section className="bg-stone-100 p-8 rounded-2xl border border-stone-200">
                        <h3 className="font-serif text-xl text-stone-800 mb-4">{t('experience.notes.title')}</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                            <li>• {t('experience.notes.list2')}</li>
                            <li>• {t('experience.notes.list3')}</li>
                            <li>• {t('experience.notes.list4')}</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
