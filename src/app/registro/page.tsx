'use client';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function RegisterPage() {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // We now delegate user creation and email notification to the server
            // so we can send a TRULY custom confirmation email via Resend
            const response = await fetch('/api/auth/register-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === 'already_exists') {
                    setError('Este correo ya está registrado. ¿Quieres iniciar sesión?');
                } else {
                    setError(result.error || 'Fallo en el registro del servidor');
                }
                return;
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("Registration error:", err);
            setError('Error de conexión. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-stone-900 p-10 rounded-xl shadow-lg border border-stone-100 dark:border-stone-800 transition-colors">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                        {t('auth.register.title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
                        {t('auth.register.hasaccount')}{' '}
                        <Link href="/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 underline">
                            {t('auth.register.login')}
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                            Registro exitoso. ¡Revisa tu correo para confirmar!
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">{t('auth.name')}</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 dark:border-stone-700 placeholder-stone-400 text-stone-900 dark:text-stone-100 dark:bg-stone-800 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.name.placeholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t('auth.email')}</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                pattern=".+@.+\.(com|co)$"
                                title="Por favor usa un correo válido (.com o .co)"
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 dark:border-stone-700 placeholder-stone-400 text-stone-900 dark:text-stone-100 dark:bg-stone-800 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.email.placeholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" title={t('auth.password')} className="sr-only">{t('auth.password')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 dark:border-stone-700 placeholder-stone-400 text-stone-900 dark:text-stone-100 dark:bg-stone-800 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.password.placeholder')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Registrando...' : t('auth.submit.register')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
