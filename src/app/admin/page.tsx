'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    name: string;
    status: 'confirmed' | 'pending';
}

export default function AdminPage() {
    const { t } = useLanguage();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const savedBookings = localStorage.getItem('laherreria_bookings');
        if (savedBookings) {
            setBookings(JSON.parse(savedBookings));
        }
    }, []);

    const generateICS = () => {
        let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Herreria//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

        bookings.forEach(booking => {
            const start = booking.startDate.replace(/-/g, '');
            const end = booking.endDate.replace(/-/g, '');
            // Create a UID based on booking ID
            const uid = `${booking.id}@laherreria.com`;
            const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;VALUE=DATE:${start}
DTEND;VALUE=DATE:${end}
SUMMARY:Reserva - ${booking.name}
DESCRIPTION:Reserva confirmada en Hacienda La Herrería.
STATUS:CONFIRMED
END:VEVENT
`;
        });

        icsContent += 'END:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reservas_laherreria.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearBookings = () => {
        if (confirm('¿Estás seguro de borrar todas las reservas locales?')) {
            localStorage.removeItem('laherreria_bookings');
            setBookings([]);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-serif text-3xl text-stone-800">Panel de Administración</h1>
                    <div className="space-x-4">
                        <button
                            onClick={clearBookings}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Borrar Todo
                        </button>
                        <button
                            onClick={generateICS}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            Exportar Calendario (.ics)
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <h2 className="text-lg font-medium text-stone-800">Reservas Confirmadas</h2>
                        <p className="text-sm text-stone-500">Estas reservas están guardadas localmente en este navegador.</p>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="p-12 text-center text-stone-500">
                            No hay reservas registradas aún.
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-stone-800">{booking.name}</h3>
                                        <p className="text-sm text-stone-500">ID: {booking.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-emerald-600">
                                            {format(parseISO(booking.startDate), 'dd MMM yyyy')} - {format(parseISO(booking.endDate), 'dd MMM yyyy')}
                                        </p>
                                        <p className="text-xs text-stone-400 uppercase tracking-wide mt-1">{booking.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
