'use client';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-stone-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 font-serif">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-600">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Nombre Completo</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder="Nombre Completo"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder="Correo electrónico"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md"
                        >
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
