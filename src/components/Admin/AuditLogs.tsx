'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import {
    History,
    Filter,
    Download,
    User,
    Calendar,
    Info,
    Search,
    Database,
    Clock,
    UserCircle
} from 'lucide-react';
import { ListSkeleton } from '@/components/Skeletons';

interface AuditLog {
    id: string;
    created_at: string;
    user_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data: any;
    new_data: any;
    ip_address: string;
    user_agent: string;
    metadata: any;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (filterAction !== 'all') {
            query = query.eq('action', filterAction);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching audit logs:', error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    }, [filterAction]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log =>
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Fecha', 'Usuario', 'Acción', 'Entidad', 'ID Entidad', 'IP', 'User Agent'];
        const rows = filteredLogs.map(log => [
            format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            log.user_email,
            log.action,
            log.entity_type,
            log.entity_id,
            log.ip_address,
            log.user_agent
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `auditoria_herreria_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 dark:bg-red-950/30';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
        if (action.includes('APPROVE') || action.includes('INSERT')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
        return 'text-stone-600 bg-stone-50 dark:bg-stone-900/50';
    };

    const getChangeDescription = (log: AuditLog) => {
        if (log.action.includes('DELETE')) {
            return `Eliminación permanente de ${log.entity_type === 'bookings' ? 'la reserva' : 'la reseña'}.`;
        }

        if (log.action === 'UPDATE_BOOKING' && log.old_data && log.new_data) {
            const changes = [];
            if (log.old_data.status !== log.new_data.status) {
                changes.push(`Estado cambiado de "${log.old_data.status}" a "${log.new_data.status}"`);
            }
            if (log.old_data.total !== log.new_data.total) {
                changes.push(`Monto actualizado de ${log.old_data.total} a ${log.new_data.total}`);
            }
            if (log.old_data.start_date !== log.new_data.start_date || log.old_data.end_date !== log.new_data.end_date) {
                changes.push(`Fechas de estadía modificadas`);
            }
            if (log.old_data.guests !== log.new_data.guests) {
                changes.push(`Número de huéspedes cambiado de ${log.old_data.guests} a ${log.new_data.guests}`);
            }
            return changes.length > 0 ? changes.join(' • ') : 'Actualización de metadatos de reserva.';
        }

        if (log.action === 'APPROVE_REVIEW') return 'Reseña aprobada para publicación dinámica.';
        if (log.action === 'REJECT_REVIEW') return 'Reseña rechazada (oculta del sitio público).';
        if (log.action === 'FEATURE_REVIEW') return 'Reseña marcada como destacada.';
        if (log.action === 'UNFEATURE_REVIEW') return 'Reseña quitada de destacados.';

        return 'Cambio administrativo procesado.';
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header & Controls */}
            <div className="bg-white dark:bg-stone-900 rounded-[32px] p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-stone-800 dark:text-stone-100 italic">Auditoría del Sistema</h3>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Trazabilidad de Cambios</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar usuario o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-stone-50 dark:bg-stone-800 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">Todas las Acciones</option>
                        <option value="UPDATE_BOOKING">Actualizar Reserva</option>
                        <option value="DELETE_BOOKING">Eliminar Reserva</option>
                        <option value="APPROVE_REVIEW">Aprobar Reseña</option>
                        <option value="REJECT_REVIEW">Rechazar Reseña</option>
                        <option value="DELETE_REVIEW">Eliminar Reseña</option>
                    </select>
                    <button
                        onClick={exportToCSV}
                        className="bg-stone-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800">
                    <ListSkeleton />
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 p-20 rounded-[40px] border border-stone-100 dark:border-stone-800 text-center">
                    <Database className="w-12 h-12 text-stone-100 dark:text-stone-800 mx-auto mb-4" />
                    <p className="text-stone-400 italic">No se encontraron registros de auditoría.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-300 p-6">
                            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                                {/* Date & Action */}
                                <div className="flex items-center gap-4 lg:w-1/4">
                                    <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-400">
                                        <Clock className="w-4 h-4 mb-0.5" />
                                        <span className="text-[8px] font-bold uppercase">{format(parseISO(log.created_at), 'HH:mm')}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-stone-400 mb-1">{format(parseISO(log.created_at), 'dd MMM, yyyy')}</p>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-3 lg:w-1/4">
                                    <div className="w-10 h-10 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-300">
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Realizado por</p>
                                        <p className="text-xs font-bold text-stone-700 dark:text-stone-200 truncate">{log.user_email || 'Sistema'}</p>
                                    </div>
                                </div>

                                {/* Entity Info */}
                                <div className="flex items-center gap-3 lg:w-1/4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-full flex items-center justify-center text-indigo-400">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{log.entity_type}</p>
                                        <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">{log.entity_id}</p>
                                    </div>
                                </div>

                                {/* Extra Info (IP/Browser) */}
                                <div className="lg:w-1/4 flex flex-col lg:items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-bold">
                                        <Info className="w-3 h-3" />
                                        IP: {log.ip_address || 'Desconocida'}
                                    </div>
                                    <div className="text-[9px] text-stone-400 truncate max-w-[200px] italic">
                                        {log.user_agent || 'User Agent no disponible'}
                                    </div>
                                </div>
                            </div>

                            {/* Change Description */}
                            <div className="mt-4 pt-4 border-t border-stone-50 dark:border-stone-800/50">
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Info className="w-3 h-3 text-indigo-400" /> Detalle del cambio
                                </p>
                                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                                    {getChangeDescription(log)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
