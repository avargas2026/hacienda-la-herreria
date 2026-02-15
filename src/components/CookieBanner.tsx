'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, X, Check } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [preferences, setPreferences] = useState({ essential: true, analytics: true });

    useEffect(() => {
        const stored = localStorage.getItem('cookiePreferences');
        if (!stored) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const prefs = { essential: true, analytics: true };
        localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
        setIsVisible(false);
    };

    const handleReject = () => {
        const prefs = { essential: true, analytics: false };
        localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
        setIsVisible(false);
    };

    const handleSaveConfig = () => {
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-stone-900 text-stone-300 rounded-2xl shadow-2xl border border-stone-800 pointer-events-auto overflow-hidden">
                {!showConfig ? (
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-sm space-y-2">
                            <p className="font-semibold text-stone-100 flex items-center gap-2">
                                🍪 Tu privacidad es importante
                            </p>
                            <p className="leading-relaxed text-stone-400">
                                Usamos cookies para mejorar tu experiencia y analizar el uso del sitio.
                                Puedes aceptar todas o personalizar tus preferencias.
                                Más información en nuestra <Link href="/politica-de-privacidad" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Política de Privacidad</Link>.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm font-medium shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => setShowConfig(true)}
                                className="px-4 py-2.5 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors text-stone-300 flex items-center justify-center gap-2"
                            >
                                <Settings size={16} /> Configurar
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2.5 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors text-stone-300"
                            >
                                Rechazar no esenciales
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                            >
                                Aceptar todas
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                            <h3 className="font-serif text-lg text-stone-100">Configuración de Cookies</h3>
                            <button onClick={() => setShowConfig(false)} className="text-stone-500 hover:text-stone-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between p-4 bg-stone-800/50 rounded-lg border border-stone-700">
                                <div>
                                    <p className="font-medium text-stone-200">Esenciales (Requeridas)</p>
                                    <p className="text-xs text-stone-400 mt-1">Necesarias para funciones básicas como reservas y seguridad.</p>
                                </div>
                                <div className="text-emerald-500">
                                    <Check size={20} />
                                </div>
                            </div>

                            <div className="flex items-start justify-between p-4 bg-stone-800/50 rounded-lg border border-stone-700">
                                <div>
                                    <p className="font-medium text-stone-200">Analíticas y Rendimiento</p>
                                    <p className="text-xs text-stone-400 mt-1">Nos ayudan a entender cómo usas el sitio para mejorarlo.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                            <button
                                onClick={handleReject} // Reject creates strictly essential
                                className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200"
                            >
                                Rechazar todo
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                            >
                                Guardar preferencias
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
