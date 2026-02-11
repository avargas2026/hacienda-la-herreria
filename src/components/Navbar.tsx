'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(' ')[0]); // Get first name
      }
    };
    checkUser();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(' ')[0]);
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName(null);
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

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
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-emerald-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.jpeg"
                  alt="Logo Hacienda La Herrería"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl md:text-2xl text-emerald-900 tracking-tight font-bold leading-none group-hover:text-emerald-700 transition-colors">
                  HACIENDA
                </span>
                <span className="font-sans text-[0.65rem] md:text-xs text-stone-500 tracking-[0.2em] uppercase font-light pl-0.5 group-hover:text-stone-700 transition-colors">
                  LA HERRERÍA
                </span>
              </div>
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

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="text-stone-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium focus:outline-none"
              >
                <Globe size={18} />
                {language === 'es' ? 'ES' : 'EN'}
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 border border-stone-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={() => { setLanguage('es'); setLangOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 ${language === 'es' ? 'font-bold text-emerald-600' : ''}`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 ${language === 'en' ? 'font-bold text-emerald-600' : ''}`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Auth Links */}
            <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-medium text-sm">
                    {t('nav.welcome')}, {userName || 'Usuario'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                    title={t('nav.logout')}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-stone-500 hover:text-emerald-600 text-sm font-medium">
                  {t('login.title')}
                </Link>
              )}

              <Link
                href="/reservas"
                className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md text-sm ml-2"
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
        <div className="md:hidden bg-white border-t border-stone-100 absolute w-full shadow-lg h-screen">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {user && (
              <div className="py-3 px-3 border-b border-stone-100 mb-2 flex justify-between items-center">
                <span className="text-emerald-700 font-medium">
                  {t('nav.welcome')}, {userName || 'Usuario'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}

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
              {!user && (
                <>
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
                </>
              )}

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
