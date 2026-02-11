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
                            <span>Silvania, Cundinamarca</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-xs text-center text-stone-500">
                <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
            </div>
        </footer>
    );
}
