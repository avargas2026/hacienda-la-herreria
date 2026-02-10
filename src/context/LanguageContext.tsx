'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    es: {
        'nav.home': 'Inicio',
        'nav.property': 'La Propiedad',
        'nav.spaces': 'Espacios',
        'nav.experience': 'Experiencia',
        'nav.activities': 'Actividades',
        'nav.book': 'Reservar',
        'hero.title': 'Un refugio natural para desconectarse y reconectar',
        'hero.subtitle': 'Descubre Hacienda La Herrería. Naturaleza, descanso y experiencias auténticas en Silvania.',
        'hero.cta': 'Reservar Ahora',
        'hero.more': 'Conocer Más',
        'login.title': 'Iniciar Sesión',
        'register.title': 'Registrarse',
    },
    en: {
        'nav.home': 'Home',
        'nav.property': 'The Property',
        'nav.spaces': 'Spaces',
        'nav.experience': 'Experience',
        'nav.activities': 'Activities',
        'nav.book': 'Book Now',
        'hero.title': 'A natural refuge to disconnect and reconnect',
        'hero.subtitle': 'Discover Hacienda La Herrería. Nature, rest, and authentic experiences in Silvania.',
        'hero.cta': 'Book Now',
        'hero.more': 'Learn More',
        'login.title': 'Log In',
        'register.title': 'Sign Up',
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('es');

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['es']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
