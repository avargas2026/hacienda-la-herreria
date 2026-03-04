'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { Monitor, Smartphone, Tablet, Globe, Navigation, Clock, Shield, Trash2, Download, CheckSquare, Square } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import SuccessModal from '@/components/SuccessModal';
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

export default function VisitorReport() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState({ isOpen: false, title: '', message: '' });

    const fetchVisits = async () => {
        setLoading(true);
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('visits')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) console.error('Error fetching visitor report:', error);
        else {
            setVisits(data || []);
            if (count !== null) setTotalCount(count);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVisits();
        const interval = setInterval(fetchVisits, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [currentPage]);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === visits.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(visits.map(v => v.id)));
    };

    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from('visits')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setIsConfirmOpen(false);
            setSelectedIds(new Set());
            setIsSuccessOpen(true);
            fetchVisits();
        } catch (err: any) {
            setIsConfirmOpen(false);
            setIsErrorOpen({ isOpen: true, title: 'Error', message: err.message || 'No se pudo completar el borrado.' });
        }
    };

    const exportToCSV = () => {
        const headers = ['IP', 'Fecha', 'Ubicación', 'Dispositivo', 'SO', 'Navegador', 'Duración', 'Fuente', 'Páginas'];
        const rows = visits.map(v => [
            v.ip,
            format(new Date(v.created_at), 'yyyy-MM-dd HH:mm'),
            `${v.city || '?'}, ${v.country || '?'}`,
            v.device,
            v.os,
            v.browser,
            v.duration,
            v.referrer || 'Directo',
            v.metadata?.paths?.length || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `visitas_herreria_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getDeviceIcon = (device: string) => {
        const d = device.toLowerCase();
        if (d.includes('mobile') || d.includes('android') || d.includes('iphone')) return <Smartphone className="w-4 h-4" />;
        if (d.includes('tablet') || d.includes('ipad')) return <Tablet className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0s';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const getSourceType = (referrer: string) => {
        const ref = referrer.toLowerCase();
        if (ref === 'directo' || ref === 'direct') return { label: 'Directo', color: 'bg-stone-100 text-stone-600' };
        if (ref.includes('google')) return { label: 'Google', color: 'bg-blue-50 text-blue-600' };
        if (ref.includes('instagram')) return { label: 'Instagram', color: 'bg-pink-50 text-pink-600' };
        if (ref.includes('facebook')) return { label: 'Facebook', color: 'bg-indigo-50 text-indigo-600' };
        if (ref.includes('whatsapp')) return { label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-600' };
        return { label: referrer, color: 'bg-stone-50 text-stone-500' };
    };

    return (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden relative font-sans transition-colors">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/30 dark:bg-stone-800/20">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 italic">Auditoría de Tráfico en Vivo</h2>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-bold">Registro detallado de visitantes</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => setIsConfirmOpen(true)}
                            className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                            Borrar ({selectedIds.size})
                        </button>
                    )}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 border border-emerald-100 dark:border-emerald-900/30"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                    <button
                        onClick={fetchVisits}
                        className="p-2 hover:bg-white dark:hover:bg-stone-800 rounded-full transition-all active:scale-95 border border-transparent hover:border-stone-100 dark:hover:border-stone-700"
                    >
                        🔄
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50/50 dark:bg-stone-800/50 text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-widest">
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 w-10 text-center">
                                <button onClick={toggleAll} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors text-center inline-flex items-center justify-center">
                                    {selectedIds.size === visits.length ? <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Square className="w-4 h-4 text-stone-300 dark:text-stone-600" />}
                                </button>
                            </th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Visitante / IP</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Ubicación</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Dispositivo / SO</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Navegador</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Permanencia</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Fuente</th>
                            <th className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">Actividad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-stone-300 italic">Cargando reporte...</td>
                            </tr>
                        ) : visits.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-stone-300 italic">Sin datos de tráfico recientes</td>
                            </tr>
                        ) : (
                            visits.map((v) => {
                                const source = getSourceType(v.referrer || 'Directo');
                                return (
                                    <tr key={v.id} className={`hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors ${selectedIds.has(v.id) ? 'bg-emerald-50/30 dark:bg-emerald-900/20' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleSelect(v.id)} className="p-1 inline-flex items-center justify-center">
                                                {selectedIds.has(v.id) ? <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Square className="w-4 h-4 text-stone-200 dark:text-stone-700" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-stone-800 dark:text-stone-100 font-mono tracking-tight">{v.ip}</span>
                                                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">{format(new Date(v.created_at), 'HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{v.city || 'Desconocida'}</span>
                                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold">{v.country || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-400 transition-colors">
                                                    {getDeviceIcon(v.device)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 capitalize">{v.device}</span>
                                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{v.os}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md truncate block max-w-[120px] transition-colors"
                                                title={v.browser}
                                            >
                                                {v.browser.length > 60 ? v.browser.substring(0, 57) + '...' : v.browser}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-emerald-500" />
                                                <span className={`text-xs font-bold font-mono ${v.duration > 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                                                    {formatDuration(v.duration)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${source.color === 'bg-stone-100 text-stone-600' ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400' :
                                                source.color === 'bg-blue-50 text-blue-600' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                    source.color === 'bg-pink-50 text-pink-600' ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' :
                                                        source.color === 'bg-indigo-50 text-indigo-600' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                                            source.color === 'bg-emerald-50 text-emerald-600' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                                'bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400'
                                                }`}>
                                                {source.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[150px]">
                                                <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 truncate">{v.metadata?.last_path || '/'}</span>
                                                    <span className="text-[9px] text-stone-400 dark:text-stone-500 truncate">Vistas: {v.metadata?.paths?.length || 1} pág.</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-stone-50/50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">
                    Mostrando {visits.length} de {totalCount} visitantes registrados
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 disabled:opacity-30 transition-all active:scale-95"
                    >
                        Anterior
                    </button>
                    <span className="text-xs font-bold text-stone-400 dark:text-stone-500 px-4">
                        Página {currentPage} de {Math.ceil(totalCount / pageSize) || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                        className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 disabled:opacity-30 transition-all active:scale-95"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="¿Eliminar registros?"
                message={`Estás a punto de borrar ${selectedIds.size} registros de visitas. Esta acción no se puede deshacer.`}
                type="danger"
            />

            <SuccessModal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Borrado Exitoso"
                message="Los registros del tracker han sido eliminados correctamente."
            />

            <ErrorModal
                isOpen={isErrorOpen.isOpen}
                onClose={() => setIsErrorOpen({ ...isErrorOpen, isOpen: false })}
                title={isErrorOpen.title}
                message={isErrorOpen.message}
            />
        </div>
    );
}
