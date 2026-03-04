'use client';
import { ShieldCheck, Heart, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

import Testimonials from '@/components/Testimonials';

export default function ExperienciaPage() {
    const { t } = useLanguage();
    return (
        <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-20 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wider uppercase text-sm mb-4 block">{t('experience.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 dark:text-stone-100 mb-6">{t('experience.title')}</h1>
                    <p className="text-stone-600 dark:text-stone-400 text-lg max-w-2xl mx-auto">
                        {t('experience.intro')}
                    </p>
                </div>

                <div className="space-y-24">
                    {/* Rules & Mood */}
                    <section className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-[40px] shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
                        <h2 className="font-serif text-3xl text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3 italic">
                            <Heart className="text-emerald-500 fill-emerald-50" />
                            {t('experience.philosophy.title')}
                        </h2>
                        <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
                            {t('experience.philosophy.text')}
                        </p>
                    </section>

                    {/* Service & Staff */}
                    <section>
                        <h2 className="font-serif text-3xl text-stone-800 dark:text-stone-100 mb-8 italic">{t('experience.service.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 space-y-6">
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
                                    {t('experience.service.text')}
                                </p>
                                <ul className="space-y-4 text-stone-600 dark:text-stone-400">
                                    <li className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">1</div>
                                        <span>{t('experience.service.list1')}</span>
                                    </li>
                                    <li className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">2</div>
                                        <span>{t('experience.service.list2')}</span>
                                    </li>
                                    <li className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">3</div>
                                        <span>{t('experience.service.list3')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="h-[450px] bg-stone-100 dark:bg-stone-800 rounded-[48px] overflow-hidden relative order-1 md:order-2 shadow-2xl shadow-stone-200/50 dark:shadow-none">
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
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="mt-24">
                <Testimonials />
            </div>
        </div>
    );
}
