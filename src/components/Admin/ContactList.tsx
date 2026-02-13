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
        const headers = ['ID', 'Fecha Creación', 'Nombre', 'Email', 'Teléfono', 'Check-in', 'Check-out', 'Huéspedes', 'Total'];
        const rows = bookings.map(b => [
            b.id,
            format(parseISO(b.created_at), 'yyyy-MM-dd HH:mm'),
            b.name,
            b.email,
            b.phone,
            b.start_date,
            b.end_date,
            b.guests,
            b.total
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
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                    Cargando reservas...
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
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
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
