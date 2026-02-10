'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.property'), href: '/propiedad' },
    { name: t('nav.spaces'), href: '/espacios' },
    { name: t('nav.experience'), href: '/experiencia' },
    { name: t('nav.activities'), href: '/actividades' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
    setLangOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-serif text-xl md:text-2xl text-emerald-800 tracking-wide font-medium">
              Hacienda La Herrería
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-emerald-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
              >
                {item.name}
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-stone-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium"
            >
              <Globe size={18} />
              {language.toUpperCase()}
            </button>

            {/* Auth Links */}
            <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
              <Link href="/login" className="text-stone-500 hover:text-emerald-600 text-sm font-medium">
                {t('login.title')}
              </Link>
              <Link
                href="/reservas"
                className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md text-sm"
              >
                {t('nav.book')}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="text-stone-500 hover:text-emerald-600 flex items-center gap-1 text-xs font-medium border border-stone-200 px-2 py-1 rounded"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-emerald-600 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-base font-medium text-stone-600 hover:text-emerald-600 hover:bg-stone-50 rounded-md"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-stone-100 mt-4 pt-4 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium text-stone-600 hover:text-emerald-600"
              >
                {t('login.title')}
              </Link>
              <Link
                href="/registro"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium text-stone-600 hover:text-emerald-600"
              >
                {t('register.title')}
              </Link>
              <Link
                href="/reservas"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-4 bg-emerald-600 text-white px-4 py-3 rounded-md hover:bg-emerald-700 font-medium"
              >
                {t('nav.book')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
