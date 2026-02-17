'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import VisitorStats from '@/components/Admin/VisitorStats';
import VisitorMap from '@/components/Admin/VisitorMap';
import VisitorReport from '@/components/Admin/VisitorReport';
import ContactList from '@/components/Admin/ContactList';
import BookingCalendar from '@/components/Admin/BookingCalendar';
import SiteSettings from '@/components/Admin/SiteSettings';
import {
    Settings,
    BarChart3,
    Calendar,
    Users,
    Map as MapIcon,
    ShieldAlert,
    LayoutDashboard,
    ChevronRight,
    Search,
    Bell,
    UserCircle,
    Zap,
    FlaskConical
} from 'lucide-react';
import BreBSimulator from '@/components/Admin/BreBSimulator';

const ADMIN_EMAIL = 'a.vargas@mrvargas.co';

type AdminTab = 'analytics' | 'operations' | 'tests' | 'settings';

export default function AdminPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

    const [pendingReportCount, setPendingReportCount] = useState(0);

    useEffect(() => {
        const fetchPendingReports = async () => {
            const { count } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'payment_reported');
            setPendingReportCount(count || 0);
        };
        fetchPendingReports();
        const interval = setInterval(fetchPendingReports, 30000);
        return () => clearInterval(interval);
    }, []);

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
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <div className="text-stone-400 font-bold uppercase tracking-widest text-xs">Autenticando Command Center...</div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    const navItems = [
        { id: 'analytics', label: 'Gestión de Tráfico', icon: BarChart3 },
        { id: 'operations', label: 'Gestión de Reservas', icon: LayoutDashboard, badge: pendingReportCount > 0 ? pendingReportCount : null },
        { id: 'tests', label: 'Pruebas', icon: FlaskConical },
        { id: 'settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row font-sans">
            {/* Sidebar Overlay for Mobile */}
            <div className="md:hidden bg-white border-b border-stone-100 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-serif italic font-bold text-stone-800">La Herrería</span>
                </div>
                <div className="flex items-center gap-3">
                    {pendingReportCount > 0 && (
                        <div className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">
                            {pendingReportCount} PAGO
                        </div>
                    )}
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                        className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                    >
                        {navItems.map(item => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-stone-100 flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-stone-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-serif text-xl font-bold text-stone-800 italic">Command</h1>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Center v1.5.0</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as AdminTab)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'group-hover:text-stone-500'}`} />
                                        {item.badge && (
                                            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-stone-50">
                    <div className="bg-stone-50 rounded-2xl p-4 flex items-center gap-3">
                        <UserCircle className="w-10 h-10 text-stone-300" />
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Administrador</p>
                            <p className="text-xs font-bold text-stone-700 truncate">{ADMIN_EMAIL}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 p-4 md:p-12 overflow-y-auto">
                {/* Header */}
                <header className="hidden md:flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-serif text-stone-800 italic">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Gestión de Hacienda La Herrería</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <Search className="w-4 h-4 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar en el sistema..."
                                className="bg-stone-100/50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all w-64"
                            />
                        </div>
                        <button className="p-3 bg-white border border-stone-100 rounded-2xl text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'analytics' && (
                        <div className="space-y-12">
                            <section>
                                <VisitorStats mode="metrics" />
                            </section>
                            <section>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <MapIcon className="w-5 h-5 text-emerald-600" />
                                            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Procedencia</h3>
                                        </div>
                                        <VisitorMap />
                                    </div>
                                    <div className="space-y-12">
                                        <VisitorReport />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'operations' && (
                        <div className="space-y-12">
                            <section className="bg-white p-4 md:p-10 rounded-[40px] border border-stone-100 shadow-sm">
                                <BookingCalendar />
                            </section>
                            <section>
                                <ContactList />
                            </section>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div className="space-y-12">
                            <section className="max-w-4xl mx-auto">
                                <div className="mb-8 p-8 bg-indigo-50 border border-indigo-100 rounded-[40px]">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <FlaskConical className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-serif text-stone-800 italic">Laboratorio de Pruebas</h3>
                                            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Ambiente Controlado para Validar Flujos</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-stone-600 leading-relaxed">
                                        Utiliza este simulador para recrear la experiencia del cliente con <strong>Bre-B</strong>.
                                        Puedes seleccionar una reserva real o simular una nueva. Las reservas realizadas aquí se reflejarán en el calendario
                                        como <strong>"Pago Reportado"</strong> (Indigo) para que valides el proceso de confirmación manual.
                                    </p>
                                </div>
                                <BreBSimulator />
                            </section>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <section>
                            <SiteSettings />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
