'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ErrorModal from '@/components/ErrorModal';
import ConfirmModal from '@/components/ConfirmModal';
import SuccessModal from '@/components/SuccessModal';
import { ListSkeleton } from '@/components/Skeletons';

interface Booking {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string;
    name: string;
    email: string;
    phone: string;
    guests: number;
    total: string;
    status: string;
    feedback_token?: string;
    feedback_sent?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function ContactList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [formData, setFormData] = useState<Partial<Booking>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [sendingFeedbackId, setSendingFeedbackId] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string>('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) setAdminEmail(session.user.email);
        };
        getSession();
    }, []);

    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title?: string;
        message?: string;
        details?: Array<{ field: string; message: string }>;
    }>({ isOpen: false });

    const [confirmWhatsApp, setConfirmWhatsApp] = useState<{
        isOpen: boolean;
        booking: Booking | null;
    }>({ isOpen: false, booking: null });

    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching bookings:', error);
        else setBookings(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const exportToCSV = () => {
        const headers = ['ID', 'Fecha Registro', 'Nombre', 'Email', 'Teléfono', 'Desde', 'Hasta', 'Huéspedes', 'Total', 'Estado'];
        const rows = bookings.map(b => [
            b.id,
            format(parseISO(b.created_at), 'yyyy-MM-dd'),
            b.name,
            b.email,
            b.phone,
            b.start_date,
            b.end_date,
            b.guests,
            b.total.replace(/[^0-9.]/g, ''),
            b.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reservas_herreria_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToICAL = () => {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Hacienda La Herreria//NONSGML v1.0//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

        bookings.forEach(b => {
            const startStr = b.start_date.replace(/-/g, '');
            // End date in iCal is exclusive, but we usually want to show the full last day
            // For simplicity, we'll just format it as YYYYMMDD
            const endStr = b.end_date.replace(/-/g, '');

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `UID:booking-${b.id}@laherreria.co\n`;
            icsContent += `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}\n`;
            icsContent += `DTSTART;VALUE=DATE:${startStr}\n`;
            icsContent += `DTEND;VALUE=DATE:${endStr}\n`;
            icsContent += `SUMMARY:Reserva: ${b.name}\n`;
            icsContent += `DESCRIPTION:Total: ${b.total} | Email: ${b.email} | Tel: ${b.phone}\n`;
            icsContent += "END:VEVENT\n";
        });

        icsContent += "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `calendario_herreria.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const executeWhatsAppConfirm = async () => {
        const booking = confirmWhatsApp.booking;
        if (!booking) return;

        try {
            const response = await fetch('/api/bookings/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, status: 'confirmed', adminEmail })
            });

            const data = await response.json();

            if (data.warning) {
                setErrorModal({
                    isOpen: true,
                    title: 'Aviso: Email no enviado',
                    message: `${data.warning} (${data.emailError})`,
                    details: [{ field: 'Correo', message: 'Por favor notifique al cliente manualmente por WhatsApp.' }]
                });
            }

            const cleanName = booking.name.replace(/ \[EN\]/i, '').trim();
            let message = `Hola ${cleanName}, nos complace informarte que tu reserva en *Hacienda La Herrería* ha sido *CONFIRMADA* ✅\n\n`;
            message += `📅 Fechas: ${format(parseISO(booking.start_date), 'dd MMM')} - ${format(parseISO(booking.end_date), 'dd MMM yyyy')}\n`;
            message += `👥 Huéspedes: ${booking.guests}\n`;
            message += `💰 Total: ${booking.total}\n\n`;
            message += `¡Te esperamos! 🌿\n\n`;
            message += `Estamos emocionados de recibirle. Si tiene alguna pregunta adicional, no dude en responder a este correo (reservas@laherreria.co) o escribirnos por WhatsApp al +57 315 032 2241.`;

            const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            setConfirmWhatsApp({ isOpen: false, booking: null });
            fetchBookings();
        } catch (error: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: error.message });
        }
    };

    const handleDirectWhatsApp = (booking: any) => {
        const cleanName = booking.name.replace(/ \[EN\]/i, '').trim();
        let message = `Hola ${cleanName}, te contactamos de *Hacienda La Herrería* 🌿\n\n`;
        message += `Queríamos confirmar los detalles de tu estancia:\n`;
        message += `📅 Fechas: ${format(parseISO(booking.start_date), 'dd MMM')} - ${format(parseISO(booking.end_date), 'dd MMM yyyy')}\n`;
        message += `💰 Valor: ${booking.total}\n\n`;
        message += `Estamos emocionados de recibirle. Si tiene alguna pregunta adicional, no dude en responder a este mensaje o al correo reservas@laherreria.co`;

        const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    const handleSaveEdit = async () => {
        if (!editingBooking) return;
        try {
            const response = await fetch('/api/bookings/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, bookingId: editingBooking.id, adminEmail })
            });

            const data = await response.json();
            if (response.ok) {
                setEditingBooking(null);
                fetchBookings();

                if (data.warning) {
                    setErrorModal({
                        isOpen: true,
                        title: 'Parcialmente guardado',
                        message: `Los datos se guardaron pero el correo falló: ${data.emailError}`
                    });
                } else {
                    setSuccessModal({ isOpen: true, title: 'Éxito', message: 'Reserva actualizada correctamente.' });
                }
            } else {
                setErrorModal({ isOpen: true, title: 'Error', message: data.error, details: data.details });
            }
        } catch (error) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'Fallo de conexión.' });
        }
    };

    const handleDelete = async () => {
        if (!deletingBooking) return;
        try {
            const response = await fetch('/api/bookings/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: deletingBooking.id, adminEmail })
            });
            if (response.ok) {
                setDeletingBooking(null);
                fetchBookings();
                setSuccessModal({ isOpen: true, title: 'Borrado', message: 'Reserva eliminada satisfactoriamente.' });
            } else {
                const data = await response.json();
                setErrorModal({ isOpen: true, title: 'Error', message: data.error || 'No se pudo eliminar la reserva.' });
                setDeletingBooking(null);
            }
        } catch (error) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'Fallo de conexión con el servidor.' });
            setDeletingBooking(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        setConfirmBulkDelete(false);
        try {
            const response = await fetch('/api/bookings/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds), adminEmail })
            });
            if (response.ok) {
                setSelectedIds(new Set());
                fetchBookings();
                setSuccessModal({ isOpen: true, title: 'Borrado Múltiple', message: 'Registros eliminados correctamente.' });
            } else {
                const data = await response.json();
                setErrorModal({ isOpen: true, title: 'Error', message: data.error || 'Error al eliminar múltiples registros.' });
            }
        } catch (error) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'Error de red al intentar el borrado múltiple.' });
        }
    };

    const handleSendFeedback = async (bookingId: string) => {
        setSendingFeedbackId(bookingId);
        try {
            const response = await fetch('/api/admin/send-feedback-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();
            if (response.ok) {
                if (data.warning) {
                    setErrorModal({
                        isOpen: true,
                        title: 'Aviso: Email no enviado',
                        message: data.warning,
                        details: [{ field: 'Correo', message: data.emailError }]
                    });
                } else {
                    setSuccessModal({ isOpen: true, title: 'Éxito', message: 'Solicitud de feedback enviada por correo.' });
                }
                fetchBookings();
            } else {
                setErrorModal({ isOpen: true, title: 'Error', message: data.error });
            }
        } catch (error) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'Fallo de conexión.' });
        } finally {
            setSendingFeedbackId(null);
        }
    };

    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50/30 dark:bg-stone-800/20">
                    <div>
                        <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 italic">Gestión de Reservas</h2>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-widest font-bold">Solicitudes y Contactos</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {selectedIds.size > 0 && (
                            <button onClick={() => setConfirmBulkDelete(true)} className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                                Eliminar ({selectedIds.size})
                            </button>
                        )}
                        <button onClick={fetchBookings} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                            Actualizar
                        </button>
                        <button onClick={exportToCSV} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                            CSV
                        </button>
                        <button onClick={exportToICAL} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                            iCal
                        </button>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-600 dark:text-stone-400 min-w-full">
                        <thead className="bg-stone-50 dark:bg-stone-800/50 text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-widest border-b border-stone-100 dark:border-stone-800">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Estadía</th>
                                <th className="px-6 py-4">Monto</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4">
                                        <ListSkeleton />
                                    </td>
                                </tr>
                            ) : paginatedBookings.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600 italic">No hay reservas registradas.</td></tr>
                            ) : paginatedBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} className="rounded-full text-emerald-600 border-stone-300 dark:border-stone-700 bg-transparent" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-stone-800 dark:text-stone-100">{b.name}</div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">{b.id}</div>
                                            <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono italic">Reg: {format(parseISO(b.created_at), 'dd/MM/yy')}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-stone-600 dark:text-stone-300 font-medium">{b.email}</div>
                                        <div className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">{b.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-stone-700 dark:text-stone-300">{format(parseISO(b.start_date), 'dd MMM')} - {format(parseISO(b.end_date), 'dd MMM')}</div>
                                        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold">{b.guests} huéspedes</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">{b.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                            b.status === 'payment_reported' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {b.status === 'confirmed' ? 'Confirmada' :
                                                b.status === 'payment_reported' ? 'Pago Reportado' :
                                                    'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {b.status !== 'confirmed' && (
                                                <button
                                                    onClick={() => setConfirmWhatsApp({ isOpen: true, booking: b })}
                                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${b.status === 'payment_reported' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' : 'hover:bg-emerald-50 text-emerald-600'
                                                        }`}
                                                    title={b.status === 'payment_reported' ? "Validar y Confirmar Pago" : "Aprobar y Confirmar"}
                                                >
                                                    {b.status === 'payment_reported' ? '🏦 Verificar' : '✅'}
                                                </button>
                                            )}
                                            <button onClick={() => handleDirectWhatsApp(b)} className="p-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl transition-all active:scale-90" title="Enviar WhatsApp Directo">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                            </button>
                                            {b.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleSendFeedback(b.id)}
                                                    disabled={sendingFeedbackId === b.id}
                                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${b.feedback_sent ? 'text-blue-500 bg-blue-50' : 'text-stone-400 hover:text-blue-600 hover:bg-blue-50'
                                                        }`}
                                                    title={b.feedback_sent ? "Volver a enviar Feedack" : "Solicitar Feedback"}
                                                >
                                                    {sendingFeedbackId === b.id ? '⌛' : '📩'}
                                                </button>
                                            )}
                                            <button onClick={() => { setEditingBooking(b); setFormData(b); }} className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all active:scale-90" title="Editar">✏️</button>
                                            <button onClick={() => setDeletingBooking(b)} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-90" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-stone-100">
                    {loading ? (
                        <div className="p-5">
                            <ListSkeleton />
                        </div>
                    ) : paginatedBookings.map((b) => (
                        <div key={b.id} className="p-5 flex flex-col gap-4 bg-white dark:bg-stone-900">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} className="mt-1 rounded-full text-emerald-600 border-stone-300 dark:border-stone-700 bg-transparent" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-base">{b.name}</h3>
                                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter bg-emerald-50 px-1.5 rounded">{b.id.split('-').pop()}</span>
                                        </div>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">{b.email} • {b.phone}</p>
                                        <div className="text-[9px] text-stone-400 font-mono italic">Ref: {b.id}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                                    b.status === 'payment_reported' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' :
                                        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {b.status === 'confirmed' ? 'CONF' : b.status === 'payment_reported' ? 'PAGO' : 'PEND'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1">Estadía</p>
                                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">{format(parseISO(b.start_date), 'dd MMM')} - {format(parseISO(b.end_date), 'dd MMM')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1">Monto</p>
                                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{b.total}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {b.status !== 'confirmed' && (
                                    <button onClick={() => setConfirmWhatsApp({ isOpen: true, booking: b })} className="flex-1 min-w-[120px] py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform font-sans">Aprobar ✅</button>
                                )}
                                <button onClick={() => handleDirectWhatsApp(b)} className="flex-1 min-w-[120px] py-3 bg-green-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 font-sans">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                    WhatsApp
                                </button>
                                <button onClick={() => { setEditingBooking(b); setFormData(b); }} className="flex-1 min-w-[120px] py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform font-sans">Editar ✏️</button>
                                {b.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleSendFeedback(b.id)}
                                        disabled={sendingFeedbackId === b.id}
                                        className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl active:scale-95 transition-transform shadow-sm"
                                        title="Solicitar Feedback"
                                    >
                                        {sendingFeedbackId === b.id ? '⌛' : '📩'}
                                    </button>
                                )}
                                <button onClick={() => setDeletingBooking(b)} className="p-3 bg-white dark:bg-stone-800 border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 rounded-xl active:scale-95 transition-transform shadow-sm">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/20 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Página {currentPage} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl text-xs font-bold dark:text-stone-100 disabled:opacity-30 active:scale-95 transition-all">Anterior</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl text-xs font-bold dark:text-stone-100 disabled:opacity-30 active:scale-95 transition-all">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Editar */}
            {editingBooking && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative transition-colors">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
                        <button onClick={() => setEditingBooking(null)} className="absolute top-6 right-6 text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">✕</button>
                        <h3 className="text-2xl font-serif text-stone-800 dark:text-stone-100 mb-6 font-bold italic text-center md:text-left">Modificar Reserva</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Nombre Completo</label>
                                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-700 focus:border-emerald-300 transition-all" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Email</label>
                                <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-medium text-stone-700 dark:text-stone-300 focus:bg-white dark:focus:bg-stone-700 focus:border-emerald-300 transition-all" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Teléfono</label>
                                <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-700" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Monto / Total</label>
                                <input type="text" value={formData.total || ''} placeholder="$0.00 COP" onChange={e => setFormData({ ...formData, total: e.target.value })} className="w-full mt-1 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold focus:bg-white dark:focus:bg-stone-700" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Estado</label>
                                <select
                                    value={formData.status || ''}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-700 appearance-none cursor-pointer"
                                >
                                    <option value="pending">Pendiente 🟡</option>
                                    <option value="payment_reported">Pago Reportado 🏦</option>
                                    <option value="confirmed">Confirmada ✅</option>
                                    <option value="cancelled">Cancelada ❌</option>
                                    <option value="pending_event">Evento Pendiente 📅</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">Huéspedes</label>
                                <input type="number" value={formData.guests || ''} onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-700" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">F. Inicio (Desde)</label>
                                <input type="date" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-700" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 ml-1">F. Fin (Hasta)</label>
                                <input type="date" value={formData.end_date || ''} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl outline-none font-bold text-stone-800 dark:text-stone-100 text-sm focus:bg-white dark:focus:bg-stone-700" />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 mt-8">
                            <button onClick={handleSaveEdit} className="w-full md:flex-[2] bg-emerald-600 text-white py-4 rounded-2xl text-sm font-bold shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Guardar y Sincronizar</button>
                            <button onClick={() => setEditingBooking(null)} className="w-full md:flex-[1] py-4 text-sm font-bold text-stone-400 hover:text-stone-800 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}


            <ConfirmModal isOpen={!!deletingBooking} onClose={() => setDeletingBooking(null)} onConfirm={handleDelete} title="Confirmar Eliminación" message="Esta acción eliminará la reserva permanentemente." type="danger" />
            <ConfirmModal isOpen={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)} onConfirm={handleBulkDelete} title="Borrar Selección" message="¿Eliminar registros seleccionados?" type="danger" />
            <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })} title={successModal.title} message={successModal.message} />
            <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title} message={errorModal.message} details={errorModal.details} />
            <ConfirmModal isOpen={confirmWhatsApp.isOpen} onClose={() => setConfirmWhatsApp({ isOpen: false, booking: null })} onConfirm={executeWhatsAppConfirm} title="Confirmar y Notificar" message="Se enviará correo de confirmación y se abrirá WhatsApp con los datos oficiales." type="info" />
        </div>
    );
}
