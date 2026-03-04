'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';
import ErrorModal from '@/components/ErrorModal';

interface Visit {
    id: string;
    created_at: string;
    ip: string;
    city: string;
    country: string;
    browser: string;
    os: string;
    device: string;
    duration: number;
    referrer?: string;
    metadata: {
        last_path?: string;
        paths?: string[];
        sections?: Record<string, number>;
    };
}

interface VisitorStatsProps {
    mode?: 'all' | 'metrics' | 'table';
}

export default function VisitorStats({ mode = 'all' }: VisitorStatsProps) {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [bookingCount, setBookingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
    const itemsPerPage = 10;

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: visitsData, error: visitsError } = await supabase
                .from('visits')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);

            if (visitsError) throw visitsError;
            setVisits(visitsData || []);

            const { count, error: bookingsError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true });

            if (bookingsError) throw bookingsError;
            setBookingCount(count || 0);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const uniqueVisitors = new Set(visits.map(v => v.ip)).size;
    const conversionRate = uniqueVisitors > 0 ? ((bookingCount / uniqueVisitors) * 100).toFixed(1) : '0';

    const referrerStats = visits.reduce((acc, visit) => {
        const source = visit.referrer || 'Directo';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedReferrers = Object.entries(referrerStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds < 0) return "0s";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Fecha', 'Ubicación', 'Dispositivo', 'Navegador', 'Duración', 'Fuente', 'IP'];
        const rows = visits.map(v => [
            v.id,
            format(new Date(v.created_at), 'yyyy-MM-dd HH:mm'),
            `${v.city}, ${v.country}`,
            v.device,
            v.browser,
            v.duration,
            v.referrer || 'N/A',
            v.ip
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analiticas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const executeBulkDelete = async () => {
        try {
            const { error } = await supabase
                .from('visits')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;
            setConfirmDelete(false);
            setSelectedIds(new Set());
            fetchData();
            setSuccessModal({ isOpen: true, message: `Eliminado correctamente.` });
        } catch (error: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'No se pudo eliminar.' });
        }
    };

    const totalPages = Math.ceil(visits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVisits = visits.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6 font-sans">
            {(mode === 'all' || mode === 'metrics') && (
                <>
                    <div className="flex justify-between items-center">
                        <div />
                        <button
                            onClick={exportToCSV}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>📊</span> Log CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors">
                            <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Conversión</h3>
                            <p className="text-3xl font-serif text-emerald-600 dark:text-emerald-400 font-bold mt-2">{conversionRate}%</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase">{bookingCount} Reservas</p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors">
                            <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Visitantes Únicos</h3>
                            <p className="text-3xl font-serif text-stone-800 dark:text-stone-100 font-bold mt-2">{uniqueVisitors}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase">Alcance Total</p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors">
                            <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Permanencia Promedio</h3>
                            <p className="text-3xl font-serif text-stone-800 dark:text-stone-100 font-bold mt-2">
                                {formatDuration(visits.reduce((acc, v) => acc + (v.duration || 0), 0) / (visits.length || 1))}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase">Engagement Local</p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors">
                            <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Referencia Top</h3>
                            <p className="text-xl font-serif text-stone-800 dark:text-stone-100 font-bold mt-2 truncate">{sortedReferrers[0]?.[0] || 'Directo'}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase">Fuente de Tráfico</p>
                        </div>
                    </div>
                </>
            )}

            {(mode === 'all' || mode === 'table') && (
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50/50 dark:bg-stone-800/30">
                        <div>
                            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 italic">Origen de Visitas</h2>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-widest font-bold">Registro Técnico de Tráfico</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            {selectedIds.size > 0 && (
                                <button onClick={() => setConfirmDelete(true)} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">Eliminar</button>
                            )}
                            <button onClick={fetchData} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">Actualizar</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-stone-600 dark:text-stone-400 min-w-[850px]">
                            <thead>
                                <tr className="bg-stone-50 dark:bg-stone-800/50 text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-widest border-b border-stone-100 dark:border-stone-800">
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Momento</th>
                                    <th className="px-6 py-4">Referencia</th>
                                    <th className="px-6 py-4">Página / Sección Actual</th>
                                    <th className="px-6 py-4">Ubicación</th>
                                    <th className="px-6 py-4">Permanencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-300 italic">Actualizando información...</td></tr>
                                ) : currentVisits.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-300 italic">No se encontraron registros.</td></tr>
                                ) : (
                                    currentVisits.map((v) => (
                                        <tr key={v.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} className="rounded-full text-emerald-600 border-stone-300 dark:border-stone-700 bg-transparent" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-stone-800 dark:text-stone-100">{format(new Date(v.created_at), 'dd/MM/yy')}</div>
                                                <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tracking-tighter">{format(new Date(v.created_at), 'HH:mm:ss')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[140px]">{v.referrer || 'Directo'}</div>
                                                <div className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-bold">{v.device}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xs truncate max-w-[180px]">
                                                    {v.metadata?.last_path || '/home'}
                                                </div>
                                                <div className="text-[9px] text-stone-400 dark:text-stone-500 italic">
                                                    Sec: {Object.keys(v.metadata?.sections || {}).slice(-1)[0] || 'En Navegación'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-stone-800 dark:text-stone-100 font-semibold">{v.city || 'Ubicación'}</div>
                                                <div className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-tight">{v.country || 'Desconocido'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg font-mono text-xs font-bold ${v.duration > 30 ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
                                                    {formatDuration(v.duration || 0)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && totalPages > 1 && (
                        <div className="p-5 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/20 dark:bg-stone-800/10 transition-colors">
                            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Página {currentPage} de {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl text-xs font-bold dark:text-stone-100 disabled:opacity-30 active:scale-95 transition-all">Anterior</button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl text-xs font-bold dark:text-stone-100 disabled:opacity-30 active:scale-95 transition-all">Siguiente</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={executeBulkDelete} title="Eliminar Registro" message="Se borrará de forma permanente." type="danger" />
            <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })} message={successModal.message} />
            <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title} message={errorModal.message} />
        </div>
    );
}
