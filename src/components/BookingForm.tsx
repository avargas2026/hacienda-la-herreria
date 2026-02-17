'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';
import { differenceInDays, addDays, format, parseISO, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import ReservationCalendar from './ReservationCalendar';
import { DateRange } from 'react-day-picker';
import { Users, Tent, Sparkles, BedDouble, AlertCircle } from 'lucide-react';
import { BOOKING_CONSTANTS } from '@/lib/constants';

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    name: string;
    status: 'confirmed' | 'pending';
}

export default function BookingForm() {
    const { t, language } = useLanguage();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(2);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [usdRate, setUsdRate] = useState(BOOKING_CONSTANTS.USD_CONVERSION_RATE);
    const [pricingOverrides, setPricingOverrides] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        nights: 0,
        total: 0,
        rooms: 1,
        pricePerNight: BOOKING_CONSTANTS.ROOM_PRICE_COP
    });
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [camping, setCamping] = useState(false);
    const [specialEvent, setSpecialEvent] = useState(false);
    const [acceptedPolicy, setAcceptedPolicy] = useState(false);

    useEffect(() => {
        // Fetch USD Rate
        const fetchRate = async () => {
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await res.json();
                if (data && data.rates && data.rates.COP) {
                    setUsdRate(data.rates.COP);
                }
            } catch (e) {
                console.error("Failed to fetch USD rate, using default", e);
            }
        };
        fetchRate();

        // Load confirmed bookings AND pricing overrides from Supabase
        const fetchData = async () => {
            // 1. Fetch Bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('start_date, end_date, status')
                .in('status', ['confirmed', 'pending', 'blocked', 'event_pending']);

            if (bookings) {
                const dates: Date[] = [];
                bookings.forEach(booking => {
                    const start = parseISO(booking.start_date);
                    const end = parseISO(booking.end_date);
                    let current = start;
                    while (current <= end) {
                        dates.push(new Date(current));
                        current = addDays(current, 1);
                    }
                });
                setBookedDates(dates);
            }

            // 2. Fetch Pricing Overrides
            const { data: overrides } = await supabase
                .from('pricing_overrides')
                .select('*');

            if (overrides) setPricingOverrides(overrides);
        };

        fetchData();
    }, []);

    // Effect to handle guest calculation logic
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const diff = differenceInDays(dateRange.to, dateRange.from);

            if (diff > 0) {
                let totalCost = 0;
                let current = dateRange.from;
                let maxGuestsInPeriod = BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM; // Standard fallback

                // Calculate day by day to apply overrides
                for (let i = 0; i < diff; i++) {
                    const dateStr = format(current, 'yyyy-MM-dd');

                    // Check for room price & capacity override
                    const roomOverride = pricingOverrides.find(o => o.date === dateStr && o.type === 'room');
                    const currentRoomPrice = roomOverride ? roomOverride.price : BOOKING_CONSTANTS.ROOM_PRICE_COP;
                    const currentMaxGuests = (roomOverride && roomOverride.max_guests) ? roomOverride.max_guests : BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM;

                    // Update maxGuestsInPeriod if this day has a specific limit (using MIN to be safe or just latest? usually usually we want to respect the user's defined capacity for the period)
                    // Let's assume the user wants to calculate rooms needed based on the selected dates.

                    // Check for camping price override
                    const campingOverride = pricingOverrides.find(o => o.date === dateStr && o.type === 'camping');
                    const currentCampingPrice = campingOverride ? campingOverride.price : BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP;

                    // Calculate rooms needed FOR THIS SPECIFIC DAY
                    let roomsNeededToday = Math.ceil(guests / currentMaxGuests);
                    if (roomsNeededToday > BOOKING_CONSTANTS.TOTAL_ROOMS) {
                        roomsNeededToday = BOOKING_CONSTANTS.TOTAL_ROOMS;
                    }

                    // Camping calculation
                    const dailyMaxRoomCapacity = roomsNeededToday * currentMaxGuests;
                    let campingGuestsToday = 0;
                    if (guests > dailyMaxRoomCapacity) {
                        campingGuestsToday = guests - dailyMaxRoomCapacity;
                    }

                    totalCost += (roomsNeededToday * currentRoomPrice) + (campingGuestsToday * currentCampingPrice);
                    current = addDays(current, 1);

                    // Update state for UI feedback (using last day as reference or average)
                    if (i === 0) setCamping(campingGuestsToday > 0);
                }

                setSummary({
                    nights: diff,
                    total: totalCost,
                    rooms: Math.ceil(guests / maxGuestsInPeriod), // Approximate for summary
                    pricePerNight: totalCost / diff
                });
            } else {
                setSummary({ nights: 0, total: 0, rooms: Math.ceil(guests / BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM), pricePerNight: BOOKING_CONSTANTS.ROOM_PRICE_COP });
                setCamping(false);
            }
        } else {
            setSummary({ nights: 0, total: 0, rooms: Math.ceil(guests / BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM), pricePerNight: BOOKING_CONSTANTS.ROOM_PRICE_COP });
            setCamping(false);
        }
    }, [dateRange, guests, pricingOverrides]);

    const [error, setError] = useState<string | null>(null);

    // ... (existing code)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if ((!dateRange?.from || !dateRange?.to) && !specialEvent) return;

        setLoading(true);

        const bookingId = `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Prepare details
        let details: any = {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            guests,
            bookingId,
            language
        };

        if (dateRange?.from && dateRange?.to) {
            details.dates = `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`;
            details.nights = summary.nights;
            details.total = formatCurrency(summary.total);
            details.rooms = summary.rooms;

            // Add USD estimate if EN
            if (language === 'en') {
                details.totalUSD = `$${(summary.total / usdRate).toFixed(2)} USD`;
            }
        }

        if (specialEvent) {
            details.specialEvent = true;
            details.notes = "Event Inquiry";
        }

        if (camping) {
            details.camping = true;
        }

        // Save to Supabase (only if dates selected)
        if (dateRange?.from && dateRange?.to) {
            const { error: sbError } = await supabase.from('bookings').insert({
                id: bookingId,
                start_date: format(dateRange.from, 'yyyy-MM-dd'),
                end_date: format(dateRange.to, 'yyyy-MM-dd'),
                name: language === 'en' ? `${contact.name} [EN]` : contact.name, // Append [EN] if English
                email: contact.email,
                phone: contact.phone,
                guests: guests,
                total: formatCurrency(summary.total),
                status: specialEvent ? 'event_pending' : 'pending'
            });

            if (sbError) {
                console.error('Error saving booking:', sbError);
                setError(`Error al guardar la reserva: ${sbError.message}`);
                setLoading(false);
                return; // Stop execution if DB save fails
            }
        }

        const link = generateWhatsAppLink(details);

        setTimeout(() => {
            window.location.href = link;
            setLoading(false);
        }, 500);
    };

    // Custom past date check for Calendar is handled inside ReservationCalendar typically, usually implicitly by disabled modifiers.
    // If we need explicit error message on click of past date, react-day-picker handles disabled dates.
    // We'll show a general message if they try something invalid in the UI if needed, but the calendar component typically disables past days.

    return (
        <div className="max-w-4xl mx-auto">
            {/* Room Info Banner */}


            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-stone-100">
                {/* Step 1: Dates & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <h3 className="font-serif text-2xl text-emerald-800">{t('booking.title')}</h3>

                        {/* Guests Selector */}
                        <div>
                            <label htmlFor="guests-select" className="block text-sm font-medium text-stone-600 mb-2">{t('booking.guests')}</label>
                            <div className="relative">
                                <select
                                    id="guests-select"
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                >
                                    {[...Array(30)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1} {t('booking.people')}</option>
                                    ))}
                                </select>
                                <Users className="absolute right-3 top-3 text-stone-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Camping Message */}
                        {guests > BOOKING_CONSTANTS.MAX_CAPACITY && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                                <Tent className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-amber-800 mb-2">{t('booking.camping.alert')}</p>
                                    <p className="text-xs text-amber-700">
                                        + {formatCurrency((guests - BOOKING_CONSTANTS.MAX_CAPACITY) * BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP)}
                                        ({guests - BOOKING_CONSTANTS.MAX_CAPACITY} x {formatCurrency(BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP)})
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Special Event Toggle */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                            <label htmlFor="special-event-toggle" className="flex items-center space-x-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        id="special-event-toggle"
                                        type="checkbox"
                                        checked={specialEvent}
                                        onChange={(e) => setSpecialEvent(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="flex items-center text-sm font-medium text-indigo-900">
                                    <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
                                    {t('booking.event.label')}
                                </span>
                            </label>
                            {specialEvent && (
                                <p className="mt-2 text-xs text-indigo-700 ml-1">
                                    {t('booking.event.contact_msg')}
                                </p>
                            )}
                        </div>

                        {/* Contact Form */}
                        <div className="space-y-4 pt-4 border-t border-stone-100">
                            <div>
                                <label htmlFor="contact-name" className="block text-sm font-medium text-stone-600 mb-1">{t('booking.name')}</label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder={t('booking.name.placeholder')}
                                    value={contact.name}
                                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-stone-600 mb-1">{t('booking.email')}</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder={t('booking.email.placeholder')}
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-phone" className="block text-sm font-medium text-stone-600 mb-1">{t('booking.phone')}</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder={t('booking.phone.placeholder')}
                                        value={contact.phone}
                                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar & Summary */}
                    <div className="space-y-6">
                        <div className="flex justify-center bg-stone-50 p-4 rounded-xl">
                            <ReservationCalendar
                                selectedRange={dateRange}
                                onSelectRange={setDateRange}
                                bookedDates={bookedDates}
                                pricingOverrides={pricingOverrides}
                            />
                        </div>

                        {/* Dynamic Summary */}
                        {(summary.nights > 0 || specialEvent) && (
                            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-3">
                                {!specialEvent ? (
                                    <>
                                        <div className="flex justify-between text-sm text-stone-600">
                                            <span>{t('booking.summary.rooms')}:</span>
                                            <span className="font-medium text-stone-900">{summary.rooms}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-stone-600">
                                            <span>{t('booking.summary.price_per_night_total')}:</span>
                                            <span className="font-medium text-stone-900">{formatCurrency(summary.pricePerNight)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-stone-600">
                                            <span>{t('booking.summary.stay')}:</span>
                                            <span className="font-medium text-stone-900">{summary.nights} {t('booking.summary.nights')}</span>
                                        </div>
                                        <div className="pt-3 border-t border-stone-200 mt-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-emerald-800">{t('booking.summary.total')}:</span>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-emerald-800">{formatCurrency(summary.total)}</div>
                                                    {language === 'en' && (
                                                        <div className="mt-1">
                                                            <div className="text-lg font-bold text-emerald-600">
                                                                ~ ${(summary.total / usdRate).toFixed(2)} USD
                                                            </div>
                                                            <div className="text-[10px] text-stone-400 font-normal">1 USD = {formatCurrency(usdRate)} COP</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-indigo-800 font-medium py-2">
                                        {t('booking.event.contact_msg')}
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="mb-2">
                            <label htmlFor="privacy-policy-checkbox" className="flex items-start gap-3 cursor-pointer p-1 rounded hover:bg-stone-50 transition-colors">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        id="privacy-policy-checkbox"
                                        type="checkbox"
                                        required
                                        checked={acceptedPolicy}
                                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 border-2 border-stone-300 rounded peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-colors"></div>
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-stone-600 select-none">
                                    {language === 'es' ? (
                                        <>
                                            Acepto la <a href="/politica-de-privacidad" target="_blank" className="text-emerald-600 font-medium hover:underline relative z-10" onClick={(e) => e.stopPropagation()}>Política de Privacidad</a> y el tratamiento de mis datos personales.
                                        </>
                                    ) : (
                                        <>
                                            I accept the <a href="/politica-de-privacidad" target="_blank" className="text-emerald-600 font-medium hover:underline relative z-10" onClick={(e) => e.stopPropagation()}>Privacy Policy</a> and the processing of my personal data.
                                        </>
                                    )}
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (!specialEvent && summary.nights <= 0)}
                            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl transform active:scale-[0.98] duration-200"
                        >
                            {loading ? t('booking.processing') : (specialEvent ? t('booking.event.contact_msg').split(' ')[0] + ' Contact' : t('booking.submit'))}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
