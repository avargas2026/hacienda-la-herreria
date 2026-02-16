'use client';
import { useLanguage } from '@/context/LanguageContext';
import SimpleSlider from '@/components/SimpleSlider';
import MotionWrapper from '@/components/MotionWrapper';

export default function EspaciosPage() {
    const { t } = useLanguage();
    const spaces = [
        {
            title: t('spaces.item1.title'),
            description: t('spaces.item1.desc'),
            images: [
                '/Empedrados1.jpg',
                '/Empedrados2.jpg',
                '/Empedrados3.jpg',
                '/Empedrados4.jpg'
            ]
        },
        {
            title: t('spaces.item2.title'),
            description: t('spaces.item2.desc'),
            images: [
                '/Jardines1.jpg',
                '/Jardines2.jpg',
                '/Jardines3.jpg'
            ]
        },
        {
            title: t('spaces.item3.title'),
            description: t('spaces.item3.desc'),
            images: [
                '/Habitacion1.jpg',
                '/Habitacion2.jpg',
                '/Habitacion3.jpg'
            ]
        },
        {
            title: t('spaces.item4.title'),
            description: t('spaces.item4.desc'),
            images: [
                '/Agua1.jpg',
                '/Agua2.jpg',
                '/Agua3.jpg'
            ]
        }
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <MotionWrapper delay={0.1}>
                        <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">{t('spaces.label')}</span>
                    </MotionWrapper>
                    <MotionWrapper delay={0.2}>
                        <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">{t('spaces.title')}</h1>
                    </MotionWrapper>
                    <MotionWrapper delay={0.3}>
                        <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                            {t('spaces.intro')}
                        </p>
                    </MotionWrapper>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {spaces.map((space, index) => (
                        <MotionWrapper key={index} delay={0.2 + (index * 0.1)} direction="up">
                            <div className="group cursor-pointer">
                                <div className="mb-6">
                                    <SimpleSlider images={space.images} />
                                </div>
                                <h3 className="font-serif text-2xl text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">{space.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{space.description}</p>
                            </div>
                        </MotionWrapper>
                    ))}
                </div>
            </div>
        </div>
    );
}
