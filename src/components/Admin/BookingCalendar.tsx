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
    status: string;
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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
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

                        return (
                            <div
                                key={i}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative group
                                    ${booking ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-stone-50 text-stone-600'}
                                    ${isStart ? 'rounded-l-lg' : ''}
                                    ${isEnd ? 'rounded-r-lg' : ''}
                                `}
                            >
                                <span className={isSameDay(day, new Date()) ? 'font-bold bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}>
                                    {format(day, 'd')}
                                </span>

                                {booking && (
                                    <div className="hidden group-hover:block absolute bottom-full mb-2 z-10 bg-stone-800 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
                                        {booking.name} ({booking.status})
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex gap-4 text-xs text-stone-500 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                        <span>Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-stone-200 rounded"></div>
                        <span>Disponible</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
