'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ErrorModal from '@/components/ErrorModal';
import ConfirmModal from '@/components/ConfirmModal';

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
    language?: string; // Optional as older records might not have it
}

const ITEMS_PER_PAGE = 10;

export default function ContactList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    // ... (existing state)

    const handleConfirm = (booking: Booking) => {
        setConfirmWhatsApp({ isOpen: true, booking });
    };

    const executeWhatsAppConfirm = async () => {
        const booking = confirmWhatsApp.booking;
        if (!booking) return;

        try {
            // 1. Update status in DB
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', booking.id);

            if (error) throw error;

            // 2. Generate WhatsApp Message
            const isEnglish = booking.name.toUpperCase().includes('[EN]');
            const cleanName = booking.name.replace(/ \[EN\]/i, '').trim();
            const lang = isEnglish ? 'en' : 'es';
            let message = '';

            if (lang !== 'en') {
                message = `Hola ${cleanName}, nos complace informarte que tu reserva en *Hacienda La Herrería* ha sido *CONFIRMADA* ✅\n\n`;
                message += `📅 Fechas: ${format(parseISO(booking.start_date), 'dd MMM')} - ${format(parseISO(booking.end_date), 'dd MMM yyyy')}\n`;
                message += `👥 Huéspedes: ${booking.guests}\n`;
                message += `💰 Total: ${booking.total}\n\n`;
                message += `¡Te esperamos para disfrutar de una experiencia inolvidable! 🌿`;
            } else {
                message = `Hello ${cleanName}, we are pleased to inform you that your reservation at *Hacienda La Herrería* has been *CONFIRMED* ✅\n\n`;
                message += `📅 Dates: ${format(parseISO(booking.start_date), 'MMM dd')} - ${format(parseISO(booking.end_date), 'MMM dd, yyyy')}\n`;
                message += `👥 Guests: ${booking.guests}\n`;
                message += `💰 Total: ${booking.total}\n\n`; // Assuming total string has currency symbol, usually does from formatCurrency
                message += `We look forward to hosting you! 🌿`;
            }

            const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

            // 3. Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // 4. Refresh List
            alert('✅ Reserva confirmada localmente. Se abrirá WhatsApp para enviar el mensaje.');
            fetchBookings();

        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('❌ Error al confirmar la reserva');
        }
    };
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [formData, setFormData] = useState<Partial<Booking>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Error modal state
    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title?: string;
        message?: string;
        details?: Array<{ field: string; message: string }>;
    }>({ isOpen: false });

    // Confirmation modals state
    const [confirmWhatsApp, setConfirmWhatsApp] = useState<{
        isOpen: boolean;
        booking: Booking | null;
    }>({ isOpen: false, booking: null });

    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const toggleSelectAll = () => {
        if (selectedIds.size === bookings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(bookings.map(b => b.id)));
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

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setConfirmBulkDelete(true);
    };

    const executeBulkDelete = async () => {
        try {
            const response = await fetch('/api/bookings/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });

            if (response.ok) {
                alert('✅ Reservas eliminadas exitosamente!');
                setSelectedIds(new Set());
                fetchBookings();
            } else {
                const data = await response.json();
                alert(`❌ Error: ${data.error || 'No se pudo eliminar las reservas'}`);
            }
        } catch (error) {
            console.error('Error deleting bookings:', error);
            alert('❌ Error de conexión');
        }
    };

    const exportToICAL = () => {
        const calendarEvents = bookings.map(booking => {
            const uid = booking.id;
            const now = new Date();
            // DTSTAMP: UTC
            const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const dtStart = format(parseISO(booking.start_date), 'yyyyMMdd');
            const dtEnd = format(parseISO(booking.end_date), 'yyyyMMdd');

            return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Reservado
END:VEVENT`;
        }).join('\n');

        const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hacienda La Herrería//Sistema Reservas//ES
CALSCALE:GREGORIAN
${calendarEvents}
END:VCALENDAR`;

        const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "reservas_laherreria.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Fecha Creación', 'Nombre', 'Email', 'Teléfono', 'Check-in', 'Check-out', 'Huéspedes', 'Total', 'Estado'];
        const rows = bookings.map(b => [
            b.id,
            format(parseISO(b.created_at), 'yyyy-MM-dd HH:mm'),
            b.name,
            b.email,
            b.phone,
            b.start_date,
            b.end_date,
            b.guests,
            b.total,
            b.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "contactos_laherreria.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (booking: Booking) => {
        setEditingBooking(booking);
        setFormData(booking);
    };

    const handleSaveEdit = async () => {
        if (!editingBooking) return;

        try {
            // Extract only editable fields from formData
            const updateData: any = {
                bookingId: editingBooking.id
            };

            // Only include fields that have been modified
            if (formData.name !== undefined) updateData.name = formData.name;
            if (formData.email !== undefined) updateData.email = formData.email;
            if (formData.phone !== undefined) updateData.phone = formData.phone;
            if (formData.start_date !== undefined) updateData.start_date = formData.start_date;
            if (formData.end_date !== undefined) updateData.end_date = formData.end_date;
            if (formData.guests !== undefined) updateData.guests = formData.guests;
            if (formData.total !== undefined) updateData.total = formData.total;
            if (formData.status !== undefined) updateData.status = formData.status;

            const response = await fetch('/api/bookings/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Reserva actualizada exitosamente!');
                setEditingBooking(null);
                fetchBookings(); // Refresh list
            } else {
                // Show detailed validation errors in modal
                if (data.details && Array.isArray(data.details)) {
                    setErrorModal({
                        isOpen: true,
                        title: 'Datos Inválidos',
                        message: 'Por favor corrige los siguientes errores:',
                        details: data.details
                    });
                } else {
                    setErrorModal({
                        isOpen: true,
                        title: 'Error',
                        message: data.error || 'No se pudo actualizar la reserva'
                    });
                }
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            setErrorModal({
                isOpen: true,
                title: 'Error de Conexión',
                message: 'No se pudo conectar con el servidor. Por favor intenta nuevamente.'
            });
        }
    };

    const handleDelete = async () => {
        if (!deletingBooking) return;

        try {
            const response = await fetch('/api/bookings/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deletingBooking.id })
            });

            if (response.ok) {
                alert('✅ Reserva eliminada exitosamente!');
                setDeletingBooking(null);
                fetchBookings(); // Refresh list
            } else {
                const data = await response.json();
                alert(`❌ Error: ${data.error || 'No se pudo eliminar la reserva'}`);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('❌ Error de conexión');
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = bookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };


    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mt-8">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-stone-800">Reporte de Contactos y Reservas</h2>
                    <p className="text-sm text-stone-500">Listado de solicitudes recibidas.</p>
                </div>
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
                        onClick={fetchBookings}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Actualizar
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        CSV
                    </button>
                    <button
                        onClick={exportToICAL}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        iCal
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
                                    checked={selectedIds.size > 0 && selectedIds.size === bookings.length}
                                    onChange={toggleSelectAll}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                            </th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Contacto</th>
                            <th className="px-6 py-3">Fechas</th>
                            <th className="px-6 py-3">Detalles</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-stone-400">
                                    Cargando reservas...
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-stone-400">
                                    No hay contactos registrados aún.
                                </td>
                            </tr>
                        ) : (
                            paginatedBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(booking.id)}
                                            onChange={() => toggleSelect(booking.id)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-stone-800">{booking.name}</div>
                                        <div className="text-xs text-stone-400">Reg: {format(parseISO(booking.created_at), 'dd MMM yyyy')}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div>{booking.email}</div>
                                        <div className="text-xs text-stone-500">{booking.phone}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-stone-800">
                                            {format(parseISO(booking.start_date), 'dd MMM')} - {format(parseISO(booking.end_date), 'dd MMM yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {booking.guests} huéspedes
                                    </td>
                                    <td className="px-6 py-3 font-medium text-emerald-600">
                                        {booking.total}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                            booking.status === 'event_pending' ? 'bg-purple-100 text-purple-800' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                            {booking.status === 'confirmed' ? 'Confirmada' :
                                                booking.status === 'event_pending' ? 'Pendiente Evento' :
                                                    'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-2">
                                            {booking.status !== 'confirmed' && (
                                                <button
                                                    onClick={() => handleConfirm(booking)}
                                                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                                                    title="Confirmar y Enviar Mensaje"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(booking)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setDeletingBooking(booking)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t border-stone-100">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-white border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-stone-500">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm bg-white border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editingBooking && (
                    <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setEditingBooking(null)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                            >
                                ✕
                            </button>

                            <h3 className="text-lg font-serif font-medium text-stone-800 mb-4">Editar Reserva</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={formData.start_date || ''}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Fecha Fin</label>
                                        <input
                                            type="date"
                                            value={formData.end_date || ''}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Huéspedes</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.guests || 2}
                                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Total</label>
                                    <input
                                        type="text"
                                        value={formData.total || ''}
                                        onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Estado</label>
                                    <select
                                        value={formData.status || 'pending'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="event_pending">Pendiente Evento</option>
                                        <option value="confirmed">Confirmada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingBooking(null)}
                                    className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deletingBooking && (
                    <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                            <button
                                onClick={() => setDeletingBooking(null)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                            >
                                ✕
                            </button>

                            <div className="text-center">
                                <div className="text-4xl mb-4">⚠️</div>
                                <h3 className="text-lg font-serif font-medium text-stone-800 mb-2">Confirmar Eliminación</h3>
                                <p className="text-sm text-stone-600 mb-4">
                                    ¿Estás seguro de eliminar esta reserva?
                                </p>

                                <div className="bg-stone-50 rounded-lg p-4 mb-4 text-left">
                                    <p className="text-sm"><strong>Nombre:</strong> {deletingBooking.name}</p>
                                    <p className="text-sm"><strong>Fechas:</strong> {deletingBooking.start_date} - {deletingBooking.end_date}</p>
                                </div>

                                <p className="text-xs text-stone-500 mb-6">
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeletingBooking(null)}
                                        className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false })}
                title={errorModal.title}
                message={errorModal.message}
                details={errorModal.details}
            />

            {/* WhatsApp Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmWhatsApp.isOpen}
                onClose={() => setConfirmWhatsApp({ isOpen: false, booking: null })}
                onConfirm={executeWhatsAppConfirm}
                title="Confirmar Reserva"
                message="¿Confirmar esta reserva y enviar mensaje al cliente por WhatsApp?"
                confirmText="Sí, Confirmar"
                cancelText="Cancelar"
                type="info"
                details={confirmWhatsApp.booking && (
                    <div className="text-sm space-y-1">
                        <p><strong>Cliente:</strong> {confirmWhatsApp.booking.name}</p>
                        <p><strong>Fechas:</strong> {confirmWhatsApp.booking.start_date} - {confirmWhatsApp.booking.end_date}</p>
                        <p><strong>Total:</strong> {confirmWhatsApp.booking.total}</p>
                    </div>
                )}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmBulkDelete}
                onClose={() => setConfirmBulkDelete(false)}
                onConfirm={executeBulkDelete}
                title="Eliminar Reservas"
                message={`¿Estás seguro de eliminar ${selectedIds.size} reserva${selectedIds.size > 1 ? 's' : ''} seleccionada${selectedIds.size > 1 ? 's' : ''}?`}
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                type="danger"
                details={
                    <p className="text-xs text-stone-500">
                        Esta acción no se puede deshacer.
                    </p>
                }
            />
        </div >
    );
}
