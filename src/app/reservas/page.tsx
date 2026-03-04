'use client';
import BookingForm from '@/components/BookingForm';
import { useLanguage } from '@/context/LanguageContext';

export default function ReservasPage() {
    const { t } = useLanguage();
    return (
        <div className="py-20 px-4 bg-stone-50 dark:bg-stone-950 min-h-screen transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wider uppercase text-sm mb-4 block">{t('reserves.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 dark:text-stone-100 mb-6">{t('reserves.title')}</h1>
                    <p className="text-stone-600 dark:text-stone-400 text-lg max-w-2xl mx-auto">
                        {t('reserves.intro')}
                    </p>
                </div>

                <div className="mb-12">
                    <BookingForm />
                </div>

                <div className="max-w-2xl mx-auto mt-12">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                        <h3 className="font-serif text-2xl text-emerald-900 dark:text-emerald-400 mb-4">{t('reserves.questions.title')}</h3>
                        <p className="text-emerald-800 dark:text-emerald-300 mb-6">
                            {t('reserves.questions.text')}
                        </p>
                        <a
                            href="https://wa.me/573150322241"
                            target="_blank"
                            className="inline-flex items-center justify-center bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            Chatea con nosotros (+57 315 032 2241)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
