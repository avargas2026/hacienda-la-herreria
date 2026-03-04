'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';
import { differenceInDays, addDays, format, parseISO, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import ReservationCalendar from './ReservationCalendar';
import { DateRange } from 'react-day-picker';
import { Users, Tent, Sparkles, BedDouble, AlertCircle, Phone } from 'lucide-react';
import { BOOKING_CONSTANTS } from '@/lib/constants';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
    const [user, setUser] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

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

        // 3. Handle Auth State
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                setContact(prev => ({
                    ...prev,
                    name: session.user.user_metadata?.full_name || '',
                    email: session.user.email || ''
                }));
                setIsReadOnly(true);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setContact(prev => ({
                    ...prev,
                    name: session.user.user_metadata?.full_name || '',
                    email: session.user.email || ''
                }));
                setIsReadOnly(true);
            } else {
                setUser(null);
                setIsReadOnly(false);
                setContact({ name: '', email: '', phone: '' });
            }
        });

        return () => subscription.unsubscribe();
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

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if ((!dateRange?.from || !dateRange?.to) && !specialEvent) return;

        // Build details for preview NOT for final ID generation yet to keep it fresh
        let details: any = {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            guests,
        };

        if (dateRange?.from && dateRange?.to) {
            details.dates = `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`;
            details.nights = summary.nights;
            details.total = formatCurrency(summary.total);
            details.rooms = summary.rooms;
        }

        if (specialEvent) details.specialEvent = true;
        if (camping) details.camping = true;

        setBookingDetails(details);
        setShowPreview(true);
    };

    const handleFinalConfirm = async () => {
        setLoading(true);
        setError(null);

        // 1. Get Consecutive Counter from DB
        let consecutive = '001';
        try {
            const { count } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true });

            if (count !== null) {
                consecutive = String(count + 1).padStart(3, '0');
            }
        } catch (e) {
            console.error('Error fetching booking count:', e);
            consecutive = Math.random().toString(36).substring(2, 5).toUpperCase();
        }

        const datePart = format(new Date(), 'yyyyMMdd');
        const initials = contact.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);

        const userSeg = user ? `-${user.id.substring(0, 4).toUpperCase()}` : '';
        const bookingId = `BK-${datePart}-${initials}${userSeg}-${consecutive}`;

        let details = {
            ...bookingDetails,
            bookingId,
            language
        };

        if (language === 'en' && summary.total > 0) {
            details.totalUSD = `$${(summary.total / usdRate).toFixed(2)} USD`;
        }

        // Save to Supabase
        if (dateRange?.from && dateRange?.to) {
            const { error: sbError } = await supabase.from('bookings').insert({
                id: bookingId,
                start_date: format(dateRange.from, 'yyyy-MM-dd'),
                end_date: format(dateRange.to, 'yyyy-MM-dd'),
                name: language === 'en' ? `${contact.name} [EN]` : contact.name,
                email: contact.email,
                phone: contact.phone,
                guests: guests,
                total: formatCurrency(summary.total),
                status: specialEvent ? 'event_pending' : 'pending'
            });

            if (sbError) {
                setError(`Error: ${sbError.message}`);
                setLoading(false);
                return;
            }
        }

        const link = generateWhatsAppLink(details);

        // CRM Sync
        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    bookingRef: bookingId,
                    guests,
                    checkIn: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                    checkOut: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
                    total: formatCurrency(summary.total),
                    specialEvent
                })
            });
        } catch (e) { console.error('CRM Sync Failed:', e); }

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


            <form onSubmit={handlePreview} className="bg-white dark:bg-stone-900/50 p-6 md:p-8 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 transition-colors">
                {/* Step 1: Dates & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <h3 className="font-serif text-2xl text-emerald-800 dark:text-emerald-400">{t('booking.title')}</h3>

                        {/* Guests Selector */}
                        <div>
                            <label htmlFor="guests-select" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">{t('booking.guests')}</label>
                            <div className="relative">
                                <select
                                    id="guests-select"
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold"
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
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 transition-colors">
                            <label htmlFor="special-event-toggle" className="flex items-center space-x-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        id="special-event-toggle"
                                        type="checkbox"
                                        checked={specialEvent}
                                        onChange={(e) => setSpecialEvent(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-stone-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="flex items-center text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                    <Sparkles className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                    {t('booking.event.label')}
                                </span>
                            </label>
                            {specialEvent && (
                                <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-400 ml-1">
                                    {t('booking.event.contact_msg')}
                                </p>
                            )}
                        </div>

                        {/* Contact Form */}
                        <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800 transition-colors">
                            <div>
                                <label htmlFor="contact-name" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('booking.name')}</label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-600 font-bold transition-all ${isReadOnly ? 'opacity-60 cursor-not-allowed bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800' : 'focus:ring-2 focus:ring-emerald-500'}`}
                                    placeholder={t('booking.name.placeholder')}
                                    value={contact.name}
                                    readOnly={isReadOnly}
                                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('booking.email')}</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        readOnly={isReadOnly}
                                        className={`w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-600 font-bold transition-all ${isReadOnly ? 'opacity-60 cursor-not-allowed bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800' : 'focus:ring-2 focus:ring-emerald-500'}`}
                                        placeholder={t('booking.email.placeholder')}
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    />
                                </div>
                                <div className="booking-phone-container">
                                    <label htmlFor="contact-phone" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('booking.phone')}</label>
                                    <PhoneInput
                                        country={'co'}
                                        value={contact.phone}
                                        onChange={(phone) => setContact({ ...contact, phone: `+${phone}` })}
                                        containerClass="!w-full"
                                        inputClass="!w-full !h-[42px] !pl-[48px] !rounded-lg !border !border-stone-300 dark:!border-stone-700 !bg-white dark:!bg-stone-800 !text-stone-900 dark:!text-stone-100 !font-bold focus:!ring-2 focus:!ring-emerald-500 !outline-none"
                                        buttonClass="!border-stone-300 dark:!border-stone-700 !bg-stone-50 dark:!bg-stone-800 !rounded-l-lg"
                                        dropdownClass="dark:!bg-stone-800 dark:!text-stone-100"
                                        placeholder={t('booking.phone.placeholder')}
                                        inputProps={{
                                            name: 'phone',
                                            required: true,
                                            id: 'contact-phone'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar & Summary */}
                    <div className="space-y-6">
                        <div className="flex justify-center bg-stone-50 dark:bg-stone-800 p-4 rounded-xl transition-colors">
                            <ReservationCalendar
                                selectedRange={dateRange}
                                onSelectRange={setDateRange}
                                bookedDates={bookedDates}
                                pricingOverrides={pricingOverrides}
                            />
                        </div>

                        {/* Dynamic Summary */}
                        {(summary.nights > 0 || specialEvent) && (
                            <div className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3 transition-colors">
                                {!specialEvent ? (
                                    <>
                                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                                            <span>{t('booking.summary.rooms')}:</span>
                                            <span className="font-medium text-stone-900 dark:text-stone-100">{summary.rooms}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                                            <span>{t('booking.summary.price_per_night_total')}:</span>
                                            <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(summary.pricePerNight)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                                            <span>{t('booking.summary.stay')}:</span>
                                            <span className="font-medium text-stone-900 dark:text-stone-100">{summary.nights} {t('booking.summary.nights')}</span>
                                        </div>
                                        <div className="pt-3 border-t border-stone-200 dark:border-stone-700 mt-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{t('booking.summary.total')}:</span>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400">{formatCurrency(summary.total)}</div>
                                                    {language === 'en' && (
                                                        <div className="mt-1">
                                                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                                                                ~ ${(summary.total / usdRate).toFixed(2)} USD
                                                            </div>
                                                            <div className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">1 USD = {formatCurrency(usdRate)} COP</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-indigo-800 dark:text-indigo-300 font-medium py-2">
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
                            <label htmlFor="privacy-policy-checkbox" className="flex items-start gap-3 cursor-pointer p-1 rounded hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        id="privacy-policy-checkbox"
                                        type="checkbox"
                                        required
                                        checked={acceptedPolicy}
                                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 border-2 border-stone-300 dark:border-stone-700 rounded peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-colors"></div>
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-stone-600 dark:text-stone-400 select-none">
                                    {language === 'es' ? (
                                        <>
                                            Acepto la <a href="/politica-de-privacidad" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline relative z-10" onClick={(e) => e.stopPropagation()}>Política de Privacidad</a> y el tratamiento de mis datos personales.
                                        </>
                                    ) : (
                                        <>
                                            I accept the <a href="/politica-de-privacidad" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline relative z-10" onClick={(e) => e.stopPropagation()}>Privacy Policy</a> and the processing of my personal data.
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

            {/* Preview Modal Overlay */}
            {showPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-stone-100 dark:border-stone-800 p-8 md:p-12 animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-serif italic text-emerald-800 dark:text-emerald-400 mb-4">{t('booking.preview.title')}</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                                {t('booking.preview.subtitle')}
                            </p>
                        </div>

                        <div className="space-y-6 bg-stone-50/50 dark:bg-stone-800/30 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 mb-8">
                            <div className="flex justify-between items-center pb-4 border-b border-dashed border-stone-200 dark:border-stone-700">
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('booking.preview.info')}</span>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">Local System</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.name')}</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-bold">{bookingDetails.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.phone')}</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-mono font-bold">{bookingDetails.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.email')}</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-bold truncate">{bookingDetails.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.guests')}</p>
                                    <p className="text-stone-800 dark:text-stone-200 font-bold">{bookingDetails.guests} {t('booking.people')}</p>
                                </div>
                                {!specialEvent && (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.summary.stay')}</p>
                                            <p className="text-stone-800 dark:text-stone-200 font-bold">{bookingDetails.dates}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-stone-400 font-bold uppercase">{t('booking.summary.total')}</p>
                                            <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{bookingDetails.total}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Privacy Policy Mini Box */}
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 p-5 rounded-2xl mb-8">
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">{t('booking.preview.policy_title')}</p>
                            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed italic">
                                "{t('booking.preview.policy_text')}"
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="flex-1 px-8 py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
                            >
                                {t('booking.preview.back')}
                            </button>
                            <button
                                onClick={handleFinalConfirm}
                                disabled={loading}
                                className="flex-[2] px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? t('booking.processing') : t('booking.preview.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
