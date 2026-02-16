'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import ErrorModal from '@/components/ErrorModal';

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
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title?: string;
        message?: string;
        details?: Array<{ field: string; message: string }>;
    }>({ isOpen: false });

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        const start = startOfMonth(currentDate).toISOString();
        const end = endOfMonth(currentDate).toISOString();

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .gte('end_date', start)
            .lte('start_date', end);

        if (error) console.error('Error fetching bookings:', error);
        else setBookings(data || []);
        setLoading(false);
    }, [currentDate]);

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 10000);
        return () => clearInterval(interval);
    }, [fetchBookings]);

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

    const handleBlockDate = async () => {
        if (!selectedDate) return;
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const { error } = await supabase.from('bookings').insert({
                id: `BLOCKED-${Date.now()}`,
                start_date: dateStr,
                end_date: dateStr,
                name: 'Bloqueado (Admin)',
                status: 'blocked',
                total: '$0',
                email: 'admin@laherreria.co',
                phone: '+57000000000',
                guests: 1
            });

            if (error) throw error;

            fetchBookings();
            setSelectedDate(null);
        } catch (error: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'No se pudo bloquear la fecha: ' + error.message });
        }
    };

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

            const data = await response.json();

            if (response.ok) {
                setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'confirmed' } : b));
                setSelectedBooking(null);

                if (data.warning) {
                    setErrorModal({
                        isOpen: true,
                        title: 'Aprobado con Aviso',
                        message: `La reserva se confirmó en la base de datos, pero el correo falló: ${data.emailError}. Por favor use WhatsApp para notificar.`
                    });
                } else {
                    // We don't have a SuccessModal here but we could use a simple alert or just close
                    // Since it's a critical confirmation, a small browser alert is fine or just trust the color change.
                }
            } else {
                setErrorModal({ isOpen: true, title: 'Error', message: data.error, details: data.details });
            }
        } catch (error) {
            setErrorModal({ isOpen: true, title: 'Error', message: 'Fallo de conexión.' });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative font-sans">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/30">
                <h2 className="text-xl font-serif text-stone-800 italic">Calendario de Ocupación</h2>
                <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100">
                    <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="text-stone-400 hover:text-stone-800 transition-colors p-1 font-bold">❮</button>
                    <span className="font-bold text-stone-700 w-32 text-center text-sm capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="text-stone-400 hover:text-stone-800 transition-colors p-1 font-bold">❯</button>
                </div>
            </div>

            <div className="p-4 md:p-8">
                <div className="grid grid-cols-7 gap-1 md:gap-3 mb-4">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-3">
                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {daysInMonth.map((day, i) => {
                        const booking = getBookingForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isConfirmed = booking?.status === 'confirmed';

                        return (
                            <div
                                key={i}
                                onClick={() => {
                                    if (booking) setSelectedBooking(booking);
                                    else setSelectedDate(day);
                                }}
                                className={`
                                    aspect-square rounded-xl flex items-center justify-center text-xs md:text-sm font-bold transition-all relative cursor-pointer
                                    ${booking
                                        ? (booking.status === 'blocked'
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : (isConfirmed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/50' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'))
                                        : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-800 border border-transparent'}
                                    ${isToday && !booking ? 'border-stone-800 text-stone-800 ring-2 ring-stone-800 ring-offset-2' : ''}
                                `}
                            >
                                {booking?.status === 'blocked' && <span className="absolute inset-0 flex items-center justify-center opacity-20 text-3xl font-light">✕</span>}
                                {format(day, 'd')}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest justify-center">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 rounded-md shadow-sm"></div><span>Confirmado</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-md"></div><span>Pendiente</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-50 border border-red-200 rounded-md"></div><span>Bloqueado</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-50 border border-stone-100 rounded-md"></div><span>Libre</span></div>
                </div>
            </div>

            {selectedBooking && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`absolute top-0 left-0 w-full h-1 ${selectedBooking.status === 'confirmed' ? 'bg-emerald-500' : (selectedBooking.status === 'blocked' ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                        <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-stone-300 hover:text-stone-800">✕</button>

                        <h3 className="text-xl font-serif text-stone-800 mb-6 font-bold italic">
                            {selectedBooking.status === 'blocked' ? 'Fecha Bloqueada' : 'Reserva Detallada'}
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                                <p className="text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Huésped / Razón</p>
                                <p className="text-base font-bold text-stone-800">{selectedBooking.name}</p>
                            </div>
                            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                                <p className="text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Periodo</p>
                                <p className="text-sm font-bold text-stone-800">{selectedBooking.start_date} → {selectedBooking.end_date}</p>
                            </div>
                            {selectedBooking.status !== 'blocked' && (
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1 tracking-widest">Monto Total</p>
                                    <p className="text-xl font-bold text-emerald-700 font-mono tracking-tighter">{selectedBooking.total}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {selectedBooking.status === 'pending' && (
                                <button onClick={handleConfirmBooking} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-sm">Aprobar Reserva ✅</button>
                            )}
                            {selectedBooking.status === 'blocked' && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/api/bookings/delete', {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ bookingId: selectedBooking.id })
                                            });

                                            if (response.ok) {
                                                fetchBookings();
                                                setSelectedBooking(null);
                                            } else {
                                                const data = await response.json();
                                                setErrorModal({
                                                    isOpen: true,
                                                    title: 'Error al eliminar',
                                                    message: data.error || 'No se pudo eliminar el bloqueo.'
                                                });
                                            }
                                        } catch (error) {
                                            setErrorModal({ isOpen: true, title: 'Error', message: 'Fallo de conexión.' });
                                        }
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-sm"
                                >
                                    Eliminar Bloqueo 🔓
                                </button>
                            )}
                            {selectedBooking.status !== 'blocked' && (
                                <button onClick={() => {
                                    const msg = `Hola ${selectedBooking.name}, te escribo desde Hacienda La Herrería...`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                }} className="w-full py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-stone-50 transition-all active:scale-95">
                                    <span>📱</span> Notificar WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Bloqueo Manual */}
            {selectedDate && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                        <button onClick={() => setSelectedDate(null)} className="absolute top-6 right-6 text-stone-300 hover:text-stone-800">✕</button>

                        <h3 className="text-xl font-serif text-stone-800 mb-2 font-bold italic">Bloquear Fecha</h3>
                        <p className="text-sm text-stone-500 mb-6">Esta fecha no estará disponible para reservas en la web pública.</p>

                        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 mb-8">
                            <p className="text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Día Seleccionado</p>
                            <p className="text-lg font-bold text-stone-800">{format(selectedDate, 'dd MMMM yyyy', { locale: es })}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleBlockDate} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-sm">Bloquear Día 🔒</button>
                            <button onClick={() => setSelectedDate(null)} className="w-full py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-2xl text-sm hover:bg-stone-50 transition-all active:scale-95">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ isOpen: false })} title={errorModal.title} message={errorModal.message} details={errorModal.details} />
        </div>
    );
}
