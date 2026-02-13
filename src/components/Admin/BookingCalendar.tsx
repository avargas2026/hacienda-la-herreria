'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface Booking {
    id: string;
    start_date: string;
    end_date: string;
    name: string;
    email: string;
    status: string;
    total: string;
}

export default function BookingCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            const start = startOfMonth(currentDate).toISOString();
            const end = endOfMonth(currentDate).toISOString();

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .gte('end_date', start)
                .lte('start_date', end);

            if (error) {
                console.error('Error fetching bookings:', error);
            } else {
                setBookings(data || []);
            }
            setLoading(false);
        };

        fetchBookings();

        // Auto-refresh every 10 seconds to sync with ContactList changes
        const interval = setInterval(fetchBookings, 10000);

        return () => clearInterval(interval);
    }, [currentDate]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const getBookingForDay = (day: Date) => {
        return bookings.find(booking =>
            isWithinInterval(day, {
                start: parseISO(booking.start_date),
                end: parseISO(booking.end_date)
            })
        );
    };

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const handleConfirmBooking = async () => {
        if (!selectedBooking) return;

        try {
            const response = await fetch('/api/bookings/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: selectedBooking.id,
                    email: selectedBooking.email,
                    name: selectedBooking.name,
                    dates: `${selectedBooking.start_date} - ${selectedBooking.end_date}`,
                    total: selectedBooking.total
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Update local state
                setBookings(prev => prev.map(b =>
                    b.id === selectedBooking.id ? { ...b, status: 'confirmed' } : b
                ));

                // Show appropriate message based on email status
                if (data.emailSent) {
                    alert('✅ Reserva confirmada y correo enviado exitosamente!');
                } else {
                    alert('✅ Reserva confirmada!\n\n⚠️ El correo no pudo ser enviado (RESEND_API_KEY no configurado).\n\nPor favor, notifica al cliente por WhatsApp.');
                }

                setSelectedBooking(null);
            } else {
                alert('Hubo un error al confirmar la reserva.');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('Error de conexión.');
        }
    };

    const handleSendWhatsApp = () => {
        if (!selectedBooking) return;

        const message = `Hola ${selectedBooking.name}! 👋

Es un gusto poder contar con su presencia en Hacienda La Herrería, un espacio de naturaleza y desconexión.

✅ *Su reserva ha sido confirmada*

📅 *Fechas reservadas:*
Desde el ${selectedBooking.start_date} hasta el ${selectedBooking.end_date}

💰 *Valor total:* ${selectedBooking.total}

Estamos emocionados de recibirle. Si tiene alguna pregunta, no dude en escribirnos.

Atentamente,
El equipo de Hacienda La Herrería 🌿`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden relative">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-lg font-medium text-stone-800">Calendario de Ocupación</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                        className="p-1 hover:bg-stone-100 rounded text-stone-600"
                    >
                        &larr;
                    </button>
                    <span className="font-medium text-stone-800 w-32 text-center">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button
                        onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                        className="p-1 hover:bg-stone-100 rounded text-stone-600"
                    >
                        &rarr;
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-stone-400 uppercase">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for start of month */}
                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-stone-50 rounded-lg" />
                    ))}

                    {daysInMonth.map((day, i) => {
                        const booking = getBookingForDay(day);
                        const isStart = booking && isSameDay(day, parseISO(booking.start_date));
                        const isEnd = booking && isSameDay(day, parseISO(booking.end_date));
                        const isConfirmed = booking?.status === 'confirmed';

                        return (
                            <div
                                key={i}
                                onClick={() => booking && setSelectedBooking(booking)}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative group cursor-pointer transition-colors
                                    ${booking
                                        ? (isConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200')
                                        : 'hover:bg-stone-50 text-stone-600'}
                                    ${isStart ? 'rounded-l-lg' : ''}
                                    ${isEnd ? 'rounded-r-lg' : ''}
                                `}
                            >
                                <span className={isSameDay(day, new Date()) ? 'font-bold bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex gap-4 text-xs text-stone-500 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                        <span>Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-100 rounded"></div>
                        <span>Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-stone-200 rounded"></div>
                        <span>Disponible</span>
                    </div>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-serif font-medium text-stone-800 mb-4">Detalles de la Reserva</h3>

                        <div className="space-y-3 text-sm text-stone-600 mb-6">
                            <p><span className="font-medium text-stone-800">Huésped:</span> {selectedBooking.name}</p>
                            <p><span className="font-medium text-stone-800">Email:</span> {selectedBooking.email}</p>
                            <p><span className="font-medium text-stone-800">Fechas:</span> {selectedBooking.start_date} al {selectedBooking.end_date}</p>
                            <p><span className="font-medium text-stone-800">Valor Total:</span> <span className="text-emerald-600 font-semibold">{selectedBooking.total}</span></p>
                            <p>
                                <span className="font-medium text-stone-800">Estado: </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {selectedBooking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            {selectedBooking.status !== 'confirmed' && (
                                <button
                                    onClick={handleConfirmBooking}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    Confirmar Reserva y Enviar Correo
                                </button>
                            )}

                            <button
                                onClick={handleSendWhatsApp}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span>📱</span>
                                <span>Notificar por WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
