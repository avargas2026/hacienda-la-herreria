'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-serif text-2xl text-stone-100 mb-4 tracking-wide">Hacienda La Herrería</h3>
                    <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                        {t('footer.desc')}
                    </p>
                </div>

                <div>
                    <h4 className="text-stone-100 font-medium mb-4 uppercase tracking-wider text-sm">{t('footer.nav.title')}</h4>
                    <ul className="space-y-2 text-sm">
                        {['nav.home', 'nav.property', 'nav.spaces', 'nav.experience', 'nav.activities', 'nav.book'].map((key) => (
                            <li key={key}>
                                <Link href={key === 'nav.home' ? '/' : `/${t(key).toLowerCase().replace(' ', '')}`} className="hover:text-emerald-400 transition-colors">
                                    {t(key)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-stone-100 font-medium mb-4 uppercase tracking-wider text-sm">{t('footer.contact.title')}</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <Mail size={16} className="text-emerald-500" />
                            <a href="mailto:info@laherreria.co" className="hover:text-white transition-colors">info@laherreria.co</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={16} className="text-emerald-500" />
                            <a href="https://wa.me/573150322241" className="hover:text-white transition-colors">+57 315 032 2241</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" />
                            <a href="https://waze.com/ul/hd2g15202r" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                Silvania, Cundinamarca
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 gap-4">
                <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
                <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
                    <Link href="/politica-de-privacidad" className="hover:text-stone-300 transition-colors">
                        {t('footer.privacy')}
                    </Link>
                    <Link href="/politica-de-privacidad" className="hover:text-stone-300 transition-colors">
                        {t('footer.cookies')}
                    </Link>
                    <Link href="/terminos-y-condiciones" className="hover:text-stone-300 transition-colors">
                        {t('footer.terms')}
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 py-6 text-center text-xs border-t border-stone-800">
                <p className="text-stone-400">
                    <span className="opacity-70">Ver. 1.3.0</span>
                    <span className="mx-3 text-stone-700">|</span>
                    <span className="font-medium text-stone-200">¿Desea contactar al desarrollador?</span>
                    <span className="block sm:inline mt-1 sm:mt-0 sm:ml-2">
                        Favor escribir a: <a href="mailto:admin@mrvargas.co" className="text-emerald-400 hover:text-emerald-300 font-bold tracking-wide transition-colors uppercase">admin@mrvargas.co</a>
                    </span>
                </p>
            </div>
        </footer>
    );
}
