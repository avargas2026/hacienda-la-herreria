'use client';
import { useLanguage } from '@/context/LanguageContext';
import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = loading

    useEffect(() => {
        // The /api/auth/callback has already exchanged the code and set a session cookie.
        // We just need to confirm the session exists.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log('✅ Session confirmed on password update page.');
                setIsAuthorized(true);
            } else {
                console.warn('⚠️ No session found on password update page.');
                setIsAuthorized(false);
            }
        };

        // Also listen for PASSWORD_RECOVERY event (the official Supabase way)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                setIsAuthorized(true);
            }
        });

        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) throw updateError;

            setMessage('¡Contraseña actualizada correctamente! Redirigiendo...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-stone-600 text-sm">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Unauthorized state — session was not established
    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg border border-stone-100 text-center">
                    <h2 className="text-2xl font-bold text-stone-900 font-serif mb-4">Enlace Inválido</h2>
                    <p className="text-stone-600 mb-6">
                        El enlace de recuperación es inválido, ya fue utilizado, o ha expirado.<br />Por favor solicita uno nuevo.
                    </p>
                    <Link
                        href="/recuperar-password"
                        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    // Authorized — show the form
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-stone-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 font-serif">
                        {t('auth.update.title')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
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
                            <label htmlFor="password" className="sr-only">{t('auth.password')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.password.placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Actualizando...' : t('auth.update.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
