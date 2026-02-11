'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function EspaciosPage() {
    const { t } = useLanguage();
    const spaces = [
        {
            title: t('spaces.item1.title'),
            description: t('spaces.item1.desc'),
            image: "https://images.unsplash.com/photo-1596131499596-1c4f52e5057b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: t('spaces.item2.title'),
            description: t('spaces.item2.desc'),
            image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2032&auto=format&fit=crop"
        },
        {
            title: t('spaces.item3.title'),
            description: t('spaces.item3.desc'),
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032&auto=format&fit=crop"
        },
        {
            title: t('spaces.item4.title'),
            description: t('spaces.item4.desc'),
            image: "https://images.unsplash.com/photo-1533630230537-8d0ce782e3c0?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('spaces.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('spaces.title')}</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        {t('spaces.intro')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {spaces.map((space, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="h-80 bg-stone-300 rounded-2xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${space.image}')` }}
                                />
                            </div>
                            <h3 className="font-serif text-2xl text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">{space.title}</h3>
                            <p className="text-stone-600 leading-relaxed">{space.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
