'use client';
import BookingForm from '@/components/BookingForm';
import { useLanguage } from '@/context/LanguageContext';

export default function ReservasPage() {
    const { t } = useLanguage();
    return (
        <div className="py-20 px-4 bg-stone-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('reserves.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('reserves.title')}</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        {t('reserves.intro')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div>
                        <BookingForm />
                    </div>

                    <div className="space-y-8 mt-8 md:mt-0">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                            <h3 className="font-serif text-xl text-stone-800 mb-4">{t('reserves.info.title')}</h3>
                            <ul className="space-y-4 text-stone-600 text-sm">
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    {t('reserves.info.checkin')}
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    {t('reserves.info.capacity')}
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    {t('reserves.info.pet')}
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    {t('reserves.info.party')}
                                </li>
                            </ul>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                            <h3 className="font-serif text-xl text-emerald-800 mb-2">{t('reserves.questions.title')}</h3>
                            <p className="text-emerald-700 text-sm mb-4">
                                {t('reserves.questions.text')}
                            </p>
                            <a
                                href="https://wa.me/573150322241"
                                target="_blank"
                                className="text-emerald-700 font-medium hover:underline"
                            >
                                {t('reserves.questions.chat')} &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
