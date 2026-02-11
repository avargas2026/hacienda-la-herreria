'use client';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RecoverPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRecover = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const { error: recoverError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/actualizar-password`,
            });

            if (recoverError) throw recoverError;

            setMessage(t('auth.recover.success'));
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-stone-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 font-serif">
                        {t('auth.recover.title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-600">
                        {t('auth.recover.desc')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRecover}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                            {message}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t('auth.email')}</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.email.placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : t('auth.recover.submit')}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 text-sm">
                            {t('auth.recover.back')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
