'use client';

import { useState, useEffect } from 'react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

export default function BookingForm() {
    const { t } = useLanguage();
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState(2);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ nights: 0, total: 0, pricePerNight: 350000 });

    useEffect(() => {
        if (dates.checkIn && dates.checkOut) {
            const start = parseISO(dates.checkIn);
            const end = parseISO(dates.checkOut);
            const diff = differenceInDays(end, start);

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
        }
    }, [dates, guests]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const details = {
            dates: `${dates.checkIn} - ${dates.checkOut}`,
            guests,
            total: formatCurrency(summary.total),
            pricePerNight: formatCurrency(summary.pricePerNight),
            nights: summary.nights,
            bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            name: contact.name,
            email: contact.email,
            phone: contact.phone
        };

        const link = generateWhatsAppLink(details);
        window.location.href = link;
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-stone-100">
            <h3 className="font-serif text-2xl text-emerald-800 mb-6 text-center">{t('booking.title')}</h3>

            <div className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Dates & Guests */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.checkin')}</label>
                        <input
                            type="date"
                            required
                            value={dates.checkIn}
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">{t('booking.checkout')}</label>
                        <input
                            type="date"
                            required
                            value={dates.checkOut}
                            min={dates.checkIn}
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                        />
                    </div>
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

                {/* Summary Section */}
                {summary.nights > 0 && (
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mt-4 space-y-2 text-sm text-stone-700">
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
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                >
                    {loading ? t('booking.processing') : t('booking.submit')}
                </button>

                <p className="text-xs text-center text-stone-500 mt-4 italic">
                    {t('booking.note')}
                </p>
            </div>
        </form>
    );
}
