'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';
import { differenceInDays, addDays, format, parseISO, isSameDay } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import ReservationCalendar from './ReservationCalendar';
import { DateRange } from 'react-day-picker';

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    name: string;
    status: 'confirmed' | 'pending';
}

export default function BookingForm() {
    const { t } = useLanguage();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(2);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ nights: 0, total: 0, pricePerNight: 350000 });
    const [bookedDates, setBookedDates] = useState<Date[]>([]);

    useEffect(() => {
        // Load confirmed bookings from Supabase
        const fetchBookedDates = async () => {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('start_date, end_date, status')
                .in('status', ['confirmed', 'pending']); // Include both confirmed and pending

            if (error) {
                console.error('Error fetching bookings:', error);
                return;
            }

            if (bookings) {
                const dates: Date[] = [];
                bookings.forEach(booking => {
                    const start = parseISO(booking.start_date);
                    const end = parseISO(booking.end_date);

                    // Add all days in the range to bookedDates
                    let current = start;
                    while (current <= end) {
                        dates.push(new Date(current));
                        current = addDays(current, 1);
                    }
                });
                setBookedDates(dates);
            }
        };

        fetchBookedDates();
    }, []);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const diff = differenceInDays(dateRange.to, dateRange.from);

            if (diff > 0) {
                // Example pricing logic: Base price per night per guest (modify as needed)
                const pricePerNight = 350000 * guests;
                setSummary({
                    nights: diff,
                    total: pricePerNight * diff,
                    pricePerNight: pricePerNight
                });
            } else {
                setSummary({ nights: 0, total: 0, pricePerNight: 0 });
            }
        } else {
            setSummary({ nights: 0, total: 0, pricePerNight: 0 });
        }
    }, [dateRange, guests]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateRange?.from || !dateRange?.to) return;

        setLoading(true);

        const bookingId = `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const details = {
            dates: `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`,
            guests,
            total: formatCurrency(summary.total),
            pricePerNight: formatCurrency(summary.pricePerNight),
            nights: summary.nights,
            bookingId: bookingId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone
        };

        // Save to Supabase
        const { error } = await supabase.from('bookings').insert({
            id: bookingId,
            start_date: format(dateRange.from, 'yyyy-MM-dd'),
            end_date: format(dateRange.to, 'yyyy-MM-dd'),
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            guests: guests,
            total: formatCurrency(summary.total),
            status: 'pending'
        });

        if (error) {
            console.error('Error saving booking:', error);
            // Optionally handle error UI
        }

        const link = generateWhatsAppLink(details);

        // Redirect to WhatsApp
        setTimeout(() => {
            window.location.href = link;
            setLoading(false);
        }, 500);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-emerald-800 mb-6 text-center md:text-left">{t('booking.title')}</h3>
                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.name')}</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder={t('booking.name.placeholder')}
                            value={contact.name}
                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.email')}</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder={t('booking.email.placeholder')}
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.phone')}</label>
                        <input
                            type="tel"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder={t('booking.phone.placeholder')}
                            value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.guests')}</label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        >
                            {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} {t('booking.people')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex-grow flex justify-center">
                        <ReservationCalendar
                            selectedRange={dateRange}
                            onSelectRange={setDateRange}
                            bookedDates={bookedDates}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            {summary.nights > 0 && (
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mt-8 space-y-2 text-sm text-stone-700">
                    <div className="flex justify-between">
                        <span>{t('booking.summary.night')} ({guests} {t('booking.people')}):</span>
                        <span className="font-medium">{formatCurrency(summary.pricePerNight)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t('booking.summary.stay')}:</span>
                        <span className="font-medium">{summary.nights} {t('booking.summary.nights')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stone-200 text-base font-bold text-emerald-800">
                        <span>{t('booking.summary.total')}:</span>
                        <span>{formatCurrency(summary.total)}</span>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || summary.nights <= 0}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-6 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
            >
                {loading ? t('booking.processing') : t('booking.submit')}
            </button>

            <p className="text-xs text-center text-stone-500 mt-4 italic">
                {t('booking.note')}
            </p>
        </form>
    );
}
