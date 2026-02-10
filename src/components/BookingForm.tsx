'use client';

import { useState } from 'react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';

export default function BookingForm() {
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Integrate actual availability check here

        const details = {
            dates: `${dates.checkIn} - ${dates.checkOut}`,
            guests,
            total: formatCurrency(350000 * guests), // Dummy calculation
            bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };

        const link = generateWhatsAppLink(details);
        window.location.href = link;
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-stone-100">
            <h3 className="font-serif text-2xl text-emerald-800 mb-6 text-center">Reserva tu estadía</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Check-in</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Check-out</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Huéspedes</label>
                    <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    >
                        {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} Personas</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                >
                    {loading ? 'Procesando...' : 'Consultar Disponibilidad'}
                </button>

                <p className="text-xs text-center text-stone-500 mt-4 italic">
                    No se realizará ningún cobro todavía.
                </p>
            </div>
        </form>
    );
}
