'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import VisitorStats from '@/components/Admin/VisitorStats';
import VisitorMap from '@/components/Admin/VisitorMap';
import VisitorReport from '@/components/Admin/VisitorReport';
import ContactList from '@/components/Admin/ContactList';
import BookingCalendar from '@/components/Admin/BookingCalendar';
import SiteSettings from '@/components/Admin/SiteSettings';
import { Settings, BarChart, Calendar, Users, Map as MapIcon, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'a.vargas@mrvargas.co';

export default function AdminPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.email !== ADMIN_EMAIL) {
                router.push('/login');
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-600">Verificando acceso...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-stone-50 py-8 md:py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic">Command Center</h1>
                        <p className="text-stone-400 text-xs uppercase tracking-[0.2em] font-bold mt-2">Hacienda La Herrería • Gestión Global</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl">
                        <Settings className="w-8 h-8 text-emerald-600 animate-spin-slow" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* 1. Resumen de Métricas */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <BarChart className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Estadísticas de Tráfico</h2>
                        </div>
                        <VisitorStats mode="metrics" />
                    </section>

                    {/* 2. Ubicación de Visitantes (Mapa) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <MapIcon className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Procedencia de Visitas</h2>
                        </div>
                        <VisitorMap />
                    </section>

                    {/* 2.5 Reporte Detallado de Visitantes */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Auditoría de Tráfico</h2>
                        </div>
                        <VisitorReport />
                    </section>

                    {/* 3. Configuración del Sitio */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <Settings className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Configuración y Precios</h2>
                        </div>
                        <SiteSettings />
                    </section>

                    {/* 4. Calendario de Ocupación */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Calendario Maestro</h2>
                        </div>
                        <BookingCalendar />
                    </section>

                    {/* 5. Reporte de Contactos y Reservas */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Libro de Reservas</h2>
                        </div>
                        <ContactList />
                    </section>
                </div>
            </div>
        </div>
    );
}
