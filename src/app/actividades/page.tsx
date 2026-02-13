'use client';
import { Mountain, Flame, Bike, Users, Tent, Trophy, Target, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ActividadesPage() {
    const { t } = useLanguage();

    const activities = [
        {
            icon: <Mountain className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item1.title'),
            description: t('activities.item1.desc')
        },
        {
            icon: <Bike className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item2.title'),
            description: t('activities.item2.desc')
        },
        {
            icon: <Flame className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item3.title'),
            description: t('activities.item3.desc')
        },
        {
            icon: <Users className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item4.title'),
            description: t('activities.item4.desc')
        },
        {
            icon: <Tent className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item5.title'),
            description: t('activities.item5.desc')
        },
        {
            icon: <Trophy className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item6.title'),
            description: t('activities.item6.desc')
        },
        {
            icon: <Target className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item7.title'),
            description: t('activities.item7.desc')
        },
        {
            icon: <Gamepad2 className="w-8 h-8 text-emerald-500" />,
            title: t('activities.item8.title'),
            description: t('activities.item8.desc')
        }
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('activities.label')}</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('activities.title')}</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        {t('activities.intro')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {activities.map((activity, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                {activity.icon}
                            </div>
                            <h3 className="font-serif text-xl text-stone-800 mb-3">{activity.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{activity.description}</p>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 bg-emerald-900 rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">{t('activities.cta.title')}</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                            {t('activities.cta.text')}
                        </p>
                        <a
                            href="/reservas"
                            className="bg-white text-emerald-900 px-8 py-3 rounded-full text-lg font-medium hover:bg-emerald-50 transition-colors inline-block"
                        >
                            {t('activities.cta.button')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
