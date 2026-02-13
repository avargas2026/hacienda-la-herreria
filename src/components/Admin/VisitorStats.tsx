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

    // Group by country
    const countryStats = visits.reduce((acc, visit) => {
        acc[visit.country] = (acc[visit.country] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedCountries = Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

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
        .sort(([, a], [, b]) => b - a)
    // .slice(0, 5); // Show all sections for now, or slice if too many

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-stone-800">Resumen de Métricas</h2>
                <button
                    onClick={exportToCSV}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
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

            {/* Countries (moved down/compacted if needed, or kept) */}
            {/* ... keeping countries if desired, or replacing with more details ... */}

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-stone-800">Últimas Visitas</h2>
                    <div className="space-x-4">
                        <button
                            onClick={fetchData}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Actualizar
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="text-sm text-stone-500 hover:text-stone-700 font-medium"
                        >
                            Exportar Tabla
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-600">
                        <thead className="bg-stone-50 text-stone-800 font-medium border-b border-stone-100">
                            <tr>
                                <th className="px-6 py-3">Hace</th>
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
                                    <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : visits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                        No hay datos de visitas aún.
                                    </td>
                                </tr>
                            ) : (
                                visits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(visit.created_at), { addSuffix: true, locale: es })}
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
            </div>
        </div>
    );
}
