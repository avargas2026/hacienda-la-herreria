'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

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
        sections?: Record<string, number>;
    };
}

export default function VisitorStats() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [bookingCount, setBookingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const itemsPerPage = 10;

    const fetchData = async () => {
        setLoading(true);

        // Fetch Visits
        const { data: visitsData, error: visitsError } = await supabase
            .from('visits')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (visitsError) console.error('Error fetching visits:', visitsError);
        else setVisits(visitsData || []);

        // Fetch Total Bookings for Conversion Rate
        const { count, error: bookingsError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });

        if (bookingsError) console.error('Error fetching bookings count:', bookingsError);
        else setBookingCount(count || 0);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const uniqueVisitors = new Set(visits.map(v => v.ip)).size;
    const conversionRate = uniqueVisitors > 0 ? ((bookingCount / uniqueVisitors) * 100).toFixed(1) : '0';

    // Group by Referrer
    const referrerStats = visits.reduce((acc, visit) => {
        const source = visit.referrer || 'Directo / Desconocido';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedReferrers = Object.entries(referrerStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Calculate Average Duration
    const totalDuration = visits.reduce((acc, visit) => acc + (visit.duration || 0), 0);
    const avgDuration = visits.length > 0 ? Math.round(totalDuration / visits.length) : 0;

    // Calculate Top Sections
    const sectionStats: Record<string, number> = {};
    visits.forEach(visit => {
        if (visit.metadata?.sections) {
            Object.entries(visit.metadata.sections).forEach(([section, time]) => {
                sectionStats[section] = (sectionStats[section] || 0) + (time as number);
            });
        }
    });

    const sortedSections = Object.entries(sectionStats)
        .sort(([, a], [, b]) => b - a);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
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

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analiticas_laherreria_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === visits.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(visits.map(v => v.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} visitas seleccionadas?`)) return;

        try {
            const { error } = await supabase
                .from('visits')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            alert('✅ Visitas eliminadas exitosamente!');
            setSelectedIds(new Set());
            fetchData();
        } catch (error) {
            console.error('Error deleting visits:', error);
            alert('❌ Error al eliminar visitas');
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(visits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVisits = visits.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-stone-800">Resumen de Métricas</h2>
                <button
                    onClick={exportToCSV}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                    Descargar CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Tasa de Conversión</h3>
                    <p className="text-3xl font-serif text-emerald-600 mt-2">{conversionRate}%</p>
                    <p className="text-xs text-stone-400 mt-1">{bookingCount} reservas / {uniqueVisitors} visitantes</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Visitantes Únicos</h3>
                    <p className="text-3xl font-serif text-stone-800 mt-2">{uniqueVisitors}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Tiempo Promedio</h3>
                    <p className="text-3xl font-serif text-stone-800 mt-2">{formatDuration(avgDuration)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Fuente Principal</h3>
                    <p className="text-xl font-serif text-stone-800 mt-2 truncate">
                        {sortedReferrers.length > 0 ? sortedReferrers[0][0] : 'N/A'}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                        {sortedReferrers.length > 0 ? Math.round((sortedReferrers[0][1] / visits.length) * 100) : 0}% del tráfico
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">Fuentes de Tráfico</h3>
                    <div className="space-y-3">
                        {sortedReferrers.map(([source, count]) => (
                            <div key={source} className="flex justify-between text-sm items-center">
                                <span className="text-stone-600 font-medium truncate max-w-[60%]">{source}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${(count / visits.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-xs text-stone-400 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                        {visits.length === 0 && <p className="text-sm text-stone-400 italic">No hay datos de tráfico.</p>}
                    </div>
                </div>

                {/* Sections */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">Engagement por Sección (Tiempo Total)</h3>
                    <div className="space-y-3">
                        {sortedSections.slice(0, 5).map(([section, time]) => (
                            <div key={section} className="flex justify-between text-sm items-center">
                                <span className="text-stone-600 font-medium capitalize">{section.replace(/-/g, ' ')}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-stone-400">{formatDuration(time)}</span>
                                </div>
                            </div>
                        ))}
                        {sortedSections.length === 0 && <p className="text-sm text-stone-400 italic">No hay datos de secciones aún.</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-stone-800">Últimas Visitas</h2>
                    <div className="space-x-4 flex items-center">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Eliminar ({selectedIds.size})
                            </button>
                        )}
                        <button
                            onClick={fetchData}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Actualizar
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Exportar Tabla
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-600">
                        <thead className="bg-stone-50 text-stone-800 font-medium border-b border-stone-100">
                            <tr>
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size > 0 && selectedIds.size === visits.length}
                                        onChange={toggleSelectAll}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                </th>
                                <th className="px-6 py-3">Fecha/Hora</th>
                                <th className="px-6 py-3">Fuente</th>
                                <th className="px-6 py-3">Ubicación</th>
                                <th className="px-6 py-3">IP</th>
                                <th className="px-6 py-3">Dispositivo</th>
                                <th className="px-6 py-3">Duración</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-stone-400">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : currentVisits.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-stone-400">
                                        No hay datos de visitas aún.
                                    </td>
                                </tr>
                            ) : (
                                currentVisits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(visit.id)}
                                                onChange={() => toggleSelect(visit.id)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="font-medium text-stone-800">
                                                {format(new Date(visit.created_at), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-xs text-stone-500">
                                                {format(new Date(visit.created_at), 'HH:mm:ss')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 max-w-[150px] truncate" title={visit.referrer}>
                                            {visit.referrer || 'Directo'}
                                        </td>
                                        <td className="px-6 py-3">
                                            {visit.city}, {visit.country}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-stone-400">
                                            {visit.ip}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-800">
                                                {visit.device}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-emerald-600">
                                            {formatDuration(visit.duration || 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && visits.length > itemsPerPage && (
                    <div className="p-4 border-t border-stone-100 flex justify-between items-center">
                        <div className="text-sm text-stone-600">
                            Mostrando {startIndex + 1} - {Math.min(endIndex, visits.length)} de {visits.length} visitas
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
