'use client';

import Slider from 'react-slick';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSlider() {
    const { t } = useLanguage();

    const settings = {
        dots: true,
        infinite: true,
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        fade: true,
        pauseOnHover: false,
        arrows: false,
    };

    const slides = [
        {
            image: '/Herreria2.jpg',
            title: t('hero.title'),
            subtitle: t('hero.subtitle')
        },
        {
            image: '/Herreria1.jpg',
            title: t('slider.slide2.title'),
            subtitle: t('slider.slide2.subtitle')
        },
        {
            image: '/Herreria3.jpg',
            title: t('slider.slide3.title'),
            subtitle: t('slider.slide3.subtitle')
        }
    ];

    return (
        <div className="relative h-screen min-h-[600px] overflow-hidden">
            <Slider {...settings} className="h-full hero-slider">
                {slides.map((slide, index) => (
                    <div key={index} className="relative h-screen min-h-[600px] outline-none">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        >
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 tracking-wide drop-shadow-md">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-stone-100 mb-10 font-light max-w-2xl mx-auto drop-shadow-sm">
                                {slide.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/reservas"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    {t('nav.book')}
                                </Link>
                                <Link
                                    href="/propiedad"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/50 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300"
                                >
                                    {t('hero.more')}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70 z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
