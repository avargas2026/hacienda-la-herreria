'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
}

export default function ContactList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [formData, setFormData] = useState<Partial<Booking>>({});

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
            const response = await fetch('/api/bookings/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingBooking.id,
                    ...formData
                })
            });

            if (response.ok) {
                alert('✅ Reserva actualizada exitosamente!');
                setEditingBooking(null);
                fetchBookings(); // Refresh list
            } else {
                const data = await response.json();
                alert(`❌ Error: ${data.error || 'No se pudo actualizar la reserva'}`);
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('❌ Error de conexión');
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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mt-8">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-stone-800">Reporte de Contactos y Reservas</h2>
                    <p className="text-sm text-stone-500">Listado de solicitudes recibidas.</p>
                </div>
                <div className="space-x-4">
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
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                    <thead className="bg-stone-50 text-stone-800 font-medium border-b border-stone-100">
                        <tr>
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
                                <td colSpan={7} className="px-6 py-8 text-center text-stone-400">
                                    Cargando reservas...
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-stone-400">
                                    No hay contactos registrados aún.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
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
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-2">
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

            {/* Edit Modal */}
            {editingBooking && (
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
            )}

            {/* Delete Confirmation Modal */}
            {deletingBooking && (
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
            )}
        </div>
    );
}
