'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    QrCode, MessageSquare, Calendar, Users,
    ArrowRight, Copy, CheckCircle2, ChevronLeft,
    Smartphone, ShieldCheck, Zap, Info,
    RefreshCcw, Sparkles, AlertCircle, Laptop,
    Search, User, Key
} from 'lucide-react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { BOOKING_CONSTANTS } from '@/lib/constants';
import { QRCodeSVG } from 'qrcode.react';
import { Tent, Home, CreditCard, Send, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

type SandboxStep = 1 | 2 | 3;

interface Booking {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    guests: number;
    total: string;
    status: string;
}

export default function BreBSimulator() {
    const [step, setStep] = useState<SandboxStep>(1);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState<'llave' | 'monto' | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Integración con Gestión de Reservas
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showBookingSelector, setShowBookingSelector] = useState(true);

    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [pricingOverrides, setPricingOverrides] = useState<any[]>([]);

    // Configuración oficial (Ubicación: Hacienda La Herrería)
    const LLAVE_REAL = "94242642";
    const WHATSAPP_NUMBER = "573150322241";
    const [reference, setReference] = useState(`HER-${Math.floor(1000 + Math.random() * 9000)}`);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

    const sanitizeInput = (val: string) => val.replace(/[<>]/g, '').trim();

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent));
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Efecto de Auto-Scroll al cambiar de paso (Vital para Móviles)
    useEffect(() => {
        if (!loading && containerRef.current) {
            const yOffset = -20;
            const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [step, loading]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('start_date, end_date, status')
                    .in('status', ['confirmed', 'blocked', 'payment_reported']);

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

                const { data: pending } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (pending) setPendingBookings(pending);

                const { data: overrides } = await supabase.from('pricing_overrides').select('*');
                if (overrides) setPricingOverrides(overrides);

            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setSelectedRange({
            from: parseISO(booking.start_date),
            to: parseISO(booking.end_date)
        });
        setGuests(booking.guests);
        setReference(booking.id);
        setContact({
            name: booking.name,
            email: (booking as any).email || '',
            phone: (booking as any).phone || ''
        });
        setShowBookingSelector(false);
    };

    const calculateTotal = () => {
        if (selectedBooking) {
            return parseInt(selectedBooking.total.replace(/[^0-9]/g, ''));
        }
        if (!selectedRange?.from || !selectedRange?.to) return 0;
        const diff = differenceInDays(selectedRange.to, selectedRange.from);
        if (diff <= 0) return 0;

        let totalCost = 0;
        let current = selectedRange.from;
        for (let i = 0; i < diff; i++) {
            const dateStr = format(current, 'yyyy-MM-dd');
            const roomOverride = pricingOverrides.find(o => o.date === dateStr && o.type === 'room');
            const currentRoomPrice = roomOverride ? roomOverride.price : BOOKING_CONSTANTS.ROOM_PRICE_COP;
            const currentMaxGuests = (roomOverride && roomOverride.max_guests) ? roomOverride.max_guests : BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM;
            let roomsNeeded = Math.ceil(guests / currentMaxGuests);
            if (roomsNeeded > BOOKING_CONSTANTS.TOTAL_ROOMS) roomsNeeded = BOOKING_CONSTANTS.TOTAL_ROOMS;
            const roomCapacity = roomsNeeded * currentMaxGuests;
            let campingGuestsToday = guests > roomCapacity ? guests - roomCapacity : 0;
            const campingOverride = pricingOverrides.find(o => o.date === dateStr && o.type === 'camping');
            const currentCampingPrice = campingOverride ? campingOverride.price : BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP;
            totalCost += (roomsNeeded * currentRoomPrice) + (campingGuestsToday * currentCampingPrice);
            current = addDays(current, 1);
        }
        return totalCost;
    };

    const nights = selectedRange?.from && selectedRange?.to ? differenceInDays(selectedRange.to, selectedRange.from) : 0;
    const total = calculateTotal();
    const qrValue = `breb://pay?key=${LLAVE_REAL}&amount=${total}&ref=${reference}&name=HaciendaLaHerreria`;

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^3\d{9}$/.test(phone);
    const isFormValid = contact.name.trim().length > 3 && validateEmail(contact.email) && validatePhone(contact.phone) && privacyAccepted;

    const handleCopy = async (text: string, type: 'llave' | 'monto') => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            setCopyFeedback(type);
            setTimeout(() => setCopyFeedback(null), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const generateWALink = () => {
        const text = `Hola Hacienda La Herrería! 👋\n\nConfirmo mi pago de reserva (Bre-B):\n👤 Cliente: ${contact.name}\n📧 Correo: ${contact.email}\n📱 Celular: ${contact.phone}\n🆔 Referencia: ${reference}\n📌 Fechas: ${format(selectedRange!.from!, 'dd MMM')} - ${format(selectedRange!.to!, 'dd MMM')}\n👥 Huéspedes: ${guests}\n💰 Total pagado: $${total.toLocaleString()}\n\nAdjunto comprobante de transferencia.`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    };

    const handleUnifiedConfirmation = async () => {
        if (!selectedRange?.from || !selectedRange?.to) {
            alert('Por favor selecciona un rango de fechas válido.');
            return;
        }

        setIsProcessing(true);
        setEmailStatus('sending');
        try {
            let finalBookingId = selectedBooking?.id;

            // 1. Si es simulación libre (no hay reserva previa seleccionada), crear el registro en la DB
            if (!selectedBooking) {
                const testId = `BK-TEST-${Math.floor(100000 + Math.random() * 900000)}`;
                const { data: newBooking, error: createError } = await supabase
                    .from('bookings')
                    .insert({
                        id: testId,
                        name: contact.name || 'PRUEBA BRE-B 🧪',
                        email: contact.email || 'pruebas@laherreria.co',
                        phone: contact.phone || '+573114826302',
                        start_date: format(selectedRange.from, 'yyyy-MM-dd'),
                        end_date: format(selectedRange.to, 'yyyy-MM-dd'),
                        guests: guests,
                        total: `$${total.toLocaleString()}`,
                        status: 'payment_reported'
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('❌ Error creating test booking:', createError);
                    throw createError;
                }
                finalBookingId = testId;
                console.log('✅ Test booking created:', testId);
            } else {
                // 2. Si existe una reserva seleccionada, actualizar su estado a 'payment_reported'
                const { error: updateError } = await supabase
                    .from('bookings')
                    .update({ status: 'payment_reported' })
                    .eq('id', selectedBooking.id);

                if (updateError) throw updateError;
            }

            // 3. Notificar vía API (Email admin)
            const response = await fetch('/api/admin/bre-b-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: reference,
                    bookingId: finalBookingId,
                    customerName: contact.name,
                    customerEmail: contact.email,
                    customerPhone: contact.phone,
                    dates: `${format(selectedRange.from, 'dd MMM')} - ${format(selectedRange.to, 'dd MMM')}`,
                    guests: guests,
                    total: `$${total.toLocaleString()} COP`,
                    source: 'Portal de Pagos (Admin Simulation)'
                })
            });

            if (response.ok) {
                setEmailStatus('success');

                // 4. IMPORTANTE: Disparar refresco dinámico del calendario
                window.dispatchEvent(new CustomEvent('booking-updated'));

                // Redirigir a WhatsApp - Abrir en una nueva pestaña
                const waLink = generateWALink();
                setTimeout(() => {
                    const win = window.open(waLink, '_blank');
                    if (!win) {
                        // Fallback si el navegador bloquea el popup
                        window.location.href = waLink;
                    }
                }, 1000);
            } else {
                setEmailStatus('error');
            }
            setIsProcessing(false);
        } catch (err) {
            console.error('Error en simulación:', err);
            setEmailStatus('error');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[40px] border border-stone-100 shadow-xl overflow-hidden animate-pulse font-sans">
                <div className="bg-stone-900 p-8 h-32 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-stone-800 rounded-2xl" />
                        <div className="space-y-2">
                            <div className="w-32 h-6 bg-stone-800 rounded-lg" />
                            <div className="w-24 h-3 bg-stone-800 rounded-lg" />
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="w-full h-96 bg-stone-50 rounded-[40px]" />
                            <div className="w-full h-48 bg-stone-50 rounded-[32px]" />
                        </div>
                        <div className="lg:col-span-5 space-y-6">
                            <div className="w-full h-48 bg-stone-100 rounded-[32px]" />
                            <div className="w-full h-64 bg-stone-50 rounded-[32px]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const roomsNeeded = Math.ceil(guests / BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM);
    const hasCamping = guests > (BOOKING_CONSTANTS.TOTAL_ROOMS * BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM);

    return (
        <div ref={containerRef} className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden animate-in fade-in duration-500 font-sans">
            {/* Header / Step Indicator */}
            <header className="bg-stone-900 text-white p-8 border-b border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-2xl leading-tight italic">Portal de Pagos</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Experiencia Hacienda La Herrería</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-3">
                        {[
                            { id: 1, label: 'Estancia', icon: Home },
                            { id: 2, label: 'Pago', icon: CreditCard },
                            { id: 3, label: 'Reporte', icon: Send }
                        ].map((s) => (
                            <div key={s.id} className="flex items-center gap-2 group">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === s.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : step > s.id ? 'bg-emerald-800 text-emerald-400' : 'bg-stone-800 text-stone-500'
                                    }`}>
                                    <s.icon className={`w-3.5 h-3.5 ${step === s.id ? 'animate-pulse' : ''}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                                </div>
                                {s.id < 3 && <div className="hidden md:block w-4 h-[1px] bg-stone-700" />}
                            </div>
                        ))}
                    </nav>
                </div>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    {/* Left Column: Step Content */}
                    <div className="lg:col-span-7">
                        {step === 1 && (
                            <div className="space-y-8">
                                {showBookingSelector && pendingBookings.length > 0 ? (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Seleccionar Reserva Pendiente:</p>
                                        </div>
                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {pendingBookings.map(b => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => handleSelectBooking(b)}
                                                    className="w-full text-left p-5 border border-stone-100 rounded-3xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex justify-between items-center group bg-white shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-stone-50 p-2.5 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                                                            <User className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-stone-800 font-serif italic">{b.name}</p>
                                                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-0.5">
                                                                {format(parseISO(b.start_date), 'dd MMM')} - {format(parseISO(b.end_date), 'dd MMM')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-emerald-700">{b.total}</p>
                                                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{b.id}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowBookingSelector(false)}
                                            className="w-full mt-6 py-4 border-2 border-dashed border-stone-100 rounded-2xl text-[10px] font-bold text-stone-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all uppercase tracking-[0.2em]"
                                        >
                                            O realizar simulación libre ❯
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        {/* Calendar Section */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                                                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Selección de Fechas</label>
                                            </div>
                                            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 flex justify-center shadow-inner">
                                                <DayPicker
                                                    mode="range"
                                                    selected={selectedRange}
                                                    onSelect={setSelectedRange}
                                                    locale={es}
                                                    disabled={[{ before: new Date() }, ...bookedDates]}
                                                    className="rdp-main"
                                                />
                                                <style>{`
                                                    .rdp-main { --rdp-accent-color: #059669; --rdp-background-color: #ecfdf5; margin: 0; scale: 1.1; }
                                                    .rdp-day_selected { background-color: #059669 !important; border-radius: 12px; color: white !important; font-weight: 800; }
                                                    .rdp-day_today { color: #059669; font-weight: 900; text-decoration: underline; }
                                                `}</style>
                                            </div>
                                        </div>

                                        {/* Contact Info Form */}
                                        <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Datos de contacto para la reserva</label>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nombre Completo"
                                                value={contact.name}
                                                onChange={(e) => setContact({ ...contact, name: sanitizeInput(e.target.value) })}
                                                className="w-full bg-white px-6 py-4 rounded-2xl border border-stone-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input
                                                    type="email"
                                                    placeholder="Correo Electrónico"
                                                    value={contact.email}
                                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                                    className={`w-full bg-white px-6 py-4 rounded-2xl border text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm ${contact.email && !validateEmail(contact.email) ? 'border-red-300' : 'border-stone-100'}`}
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Celular (10 dígitos)"
                                                    value={contact.phone}
                                                    onChange={(e) => setContact({ ...contact, phone: sanitizeInput(e.target.value.replace(/\D/g, '').slice(0, 10)) })}
                                                    className={`w-full bg-white px-6 py-4 rounded-2xl border text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm ${contact.phone && !validatePhone(contact.phone) ? 'border-red-300' : 'border-stone-100'}`}
                                                />
                                            </div>
                                            {contact.phone && !validatePhone(contact.phone) && (
                                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider pl-2">El número debe iniciar con 3 y tener 10 dígitos</p>
                                            )}

                                            {/* Privacy Policy Checkbox - HI-VISIBILITY CARD */}
                                            <div
                                                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer select-none relative overflow-hidden group ${privacyAccepted
                                                    ? 'bg-emerald-50/40 border-emerald-500 shadow-md translate-y-[-2px]'
                                                    : 'bg-stone-50 border-stone-100 hover:border-emerald-300'
                                                    }`}
                                                onClick={() => setPrivacyAccepted(!privacyAccepted)}
                                            >
                                                {!privacyAccepted && (
                                                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase rounded-full tracking-tighter animate-pulse">
                                                        REQUERIDO
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${privacyAccepted
                                                        ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200'
                                                        : 'bg-white border-stone-200 group-hover:border-emerald-400'
                                                        }`}>
                                                        {privacyAccepted ? (
                                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <ShieldCheck className="w-6 h-6 text-stone-300 group-hover:text-emerald-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <p className={`text-[11px] font-bold uppercase tracking-wider leading-none ${privacyAccepted ? 'text-emerald-900' : 'text-stone-500'}`}>Marco Legal y Privacidad</p>
                                                        <p className="text-[10px] font-medium text-stone-600 leading-relaxed">
                                                            He leído y acepto los <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setLegalTab('terms'); setShowLegalModal(true); }}
                                                                className="text-emerald-600 underline decoration-2 decoration-emerald-600/20 hover:text-emerald-700"
                                                            >términos de estancia</button> y la <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setLegalTab('privacy'); setShowLegalModal(true); }}
                                                                className="text-emerald-600 underline decoration-2 decoration-emerald-600/20 hover:text-emerald-700"
                                                            >política de datos</button>.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500 py-6">
                                <div className="text-center mb-10 w-full">
                                    <h4 className="text-3xl font-serif italic text-stone-800 leading-tight">Caja de Recaudación</h4>
                                    <p className="text-[11px] text-emerald-600 uppercase font-black tracking-[0.2em] mt-2">Realiza el pago usando la llave de tu banco y luego repórtalo</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
                                    <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden group/key">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100/50 flex items-center justify-center border border-amber-200/50 shadow-lg shadow-amber-900/5 transition-all duration-500 group-hover/key:rotate-[15deg] group-hover/key:scale-110">
                                                <Key className="w-6 h-6 text-amber-700" strokeWidth={1.2} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] leading-none">Llave de Pago</p>
                                                <p className="text-[8px] font-bold text-amber-800/60 uppercase tracking-tighter italic">Seguridad de la Hacienda</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-2xl font-black text-stone-900 tracking-tighter font-serif">{LLAVE_REAL}</span>
                                            <button
                                                onClick={() => handleCopy(LLAVE_REAL, 'llave')}
                                                className={`p-3 rounded-2xl transition-all shadow-sm ${copyFeedback === 'llave' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                {copyFeedback === 'llave' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200/50 shadow-sm border-dashed">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Monto Total</p>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-2xl font-black text-emerald-900 tracking-tighter">$ {total.toLocaleString()}</span>
                                            <button
                                                onClick={() => handleCopy(total.toString(), 'monto')}
                                                className={`p-3 rounded-2xl transition-all shadow-sm ${copyFeedback === 'monto' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                {copyFeedback === 'monto' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full pt-10 border-t border-stone-100">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] hover:text-stone-800 transition-colors">
                                        ❮ Corregir Reserva
                                    </button>
                                    <div className="flex-[2]">
                                        <button
                                            onClick={() => setStep(3)}
                                            className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                        >
                                            Reportar mi pago ❯
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center py-10 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mb-10 shadow-inner border border-emerald-100">
                                    <Send className="w-10 h-10 text-emerald-600 opacity-90 animate-bounce" />
                                </div>
                                <h4 className="text-3xl font-serif italic text-stone-800 mb-3">Notificación de Pago</h4>
                                <div className="w-full bg-stone-50 rounded-3xl p-8 border border-stone-100 mb-8 space-y-5 shadow-inner">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                        <span>Detalle de Facturación</span>
                                        <span className="text-emerald-600">Ref: {reference}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Fechas:</span>
                                            <span className="text-sm font-black text-stone-900 italic font-serif">
                                                {selectedRange?.from && format(selectedRange.from, 'dd MMM', { locale: es })} - {selectedRange?.to && format(selectedRange.to, 'dd MMM', { locale: es })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Estancia:</span>
                                            <span className="text-xs font-black text-stone-900">
                                                {roomsNeeded} Hab. {hasCamping ? '+ Zona Camping' : ''} ({guests} pers.)
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Monto a Reportar:</span>
                                            <span className="text-2xl font-black text-emerald-700 font-serif italic">$ {total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={handleUnifiedConfirmation}
                                        disabled={emailStatus === 'sending' || emailStatus === 'success'}
                                        className={`w-full py-6 rounded-3xl font-bold uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl active:scale-[0.98] ${emailStatus === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
                                            }`}
                                    >
                                        {emailStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-white" />}
                                        {emailStatus === 'success' ? 'PAGO REPORTADO ✓' : 'REPORTAR Y CERRAR ⚡'}
                                    </button>
                                </div>

                                <button
                                    onClick={() => { setStep(1); setEmailStatus('idle'); }}
                                    className="mt-10 text-[10px] font-black text-stone-300 uppercase hover:text-emerald-600 tracking-[0.2em] transition-colors"
                                >
                                    ↺ Gestionar Nueva Reserva
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Persistent Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Real Property Preview Card */}
                        <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg group cursor-pointer">
                            <img
                                src="/Habitacion1.jpg"
                                alt="Hacienda La Herrería"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent group-hover:via-emerald-950/40 transition-colors duration-500" />
                            <div className="absolute bottom-6 left-6 right-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Estancia Exclusiva</span>
                                </div>
                                <h4 className="text-white font-serif italic text-2xl drop-shadow-lg">Suite de Campo</h4>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-full shadow-lg transition-all duration-300 group-hover:bg-white/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Propiedad Verificada</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 space-y-8 shadow-sm transition-all duration-500 hover:shadow-md hover:border-emerald-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-100/30 flex items-center justify-center transition-colors">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Configuración de Huéspedes</label>
                                </div>
                                <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-stone-100 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-14 h-14 rounded-2xl bg-stone-50 hover:bg-emerald-50 transition-all flex items-center justify-center text-stone-400 font-bold hover:text-emerald-600 text-2xl shadow-sm hover:shadow active:scale-90">-</button>
                                    <div className="text-center px-6">
                                        <span className="text-4xl font-black text-stone-900 font-serif italic">{guests}</span>
                                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Visitantes</p>
                                    </div>
                                    <button onClick={() => setGuests(Math.min(30, guests + 1))} className="w-14 h-14 rounded-2xl bg-stone-50 hover:bg-emerald-50 transition-all flex items-center justify-center text-stone-400 font-bold hover:text-emerald-600 text-2xl shadow-sm hover:shadow active:scale-90">+</button>
                                </div>
                            </div>

                            {/* Summary Detail */}
                            <div className="space-y-5 pt-8 border-t border-stone-200/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shadow-inner">
                                        <Info className="w-4 h-4 text-stone-400" />
                                    </div>
                                    <p className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.15em] italic font-serif">Itinerario de Estancia</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group/item transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-sm">
                                        <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Duración:</span>
                                        <span className="text-emerald-700 font-serif italic font-bold text-base transition-all duration-500 animate-in fade-in">
                                            {nights > 0 ? `${nights} Noches Garantizadas` : 'Sin fechas definidas'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center group/item transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-sm">
                                        <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Capacidad:</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-black text-[10px] uppercase tracking-tighter shadow-sm animate-in fade-in duration-500">
                                                <Home className="w-3.5 h-3.5" />
                                                <span>{roomsNeeded} {roomsNeeded === 1 ? 'Habitación' : 'Habitaciones'}</span>
                                            </div>
                                            {hasCamping && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 font-black text-[10px] uppercase tracking-tighter shadow-sm animate-in slide-in-from-right-2 duration-500">
                                                    <Tent className="w-3.5 h-3.5" />
                                                    <span>Camping</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-900 p-8 rounded-[40px] text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Cotización Final</p>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black font-serif italic leading-none">$ {total.toLocaleString()}</span>
                                    <span className="text-[12px] font-bold text-emerald-400/50 uppercase tracking-[0.2em]">COP</span>
                                </div>
                            </div>
                            <div className="absolute top-[-20px] right-[-20px] p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-12 group-hover:scale-125 transition-all duration-[2s] ease-out">
                                <Sparkles className="w-48 h-48" />
                            </div>
                            <div className="mt-8 pt-6 border-t border-emerald-800/60 flex items-center justify-between relative z-10">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-900 bg-emerald-800 flex items-center justify-center transition-transform hover:scale-110">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 tracking-[0.2em]">Reserva Garantizada</span>
                                    <p className="text-[8px] text-emerald-400/40 font-bold uppercase mt-1">Hacienda La Herrería 2024</p>
                                </div>
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <button
                                    disabled={!selectedRange?.to || total === 0 || !isFormValid}
                                    onClick={() => setStep(2)}
                                    className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-20 shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
                                >
                                    Continuar con el Pago ❯
                                </button>
                            </div>
                        )}

                        {step === 1 && selectedBooking && (
                            <button
                                onClick={() => { setSelectedBooking(null); setShowBookingSelector(true); }}
                                className="w-full py-2 text-[10px] font-black text-stone-300 hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors"
                            >
                                ✕ Cancelar selección actual
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Legal / Privacy SIDE PANEL - ENHANCED FOCUS VIEWER */}
            {showLegalModal && (
                <div className="fixed inset-0 z-[300] flex justify-end overflow-hidden">
                    {/* Soft Backdrop - Keeps context visible */}
                    <div
                        className="absolute inset-0 bg-stone-900/20 backdrop-blur-[2px] animate-in fade-in duration-500"
                        onClick={() => setShowLegalModal(false)}
                    />

                    <div className="bg-white w-full max-w-xl h-full relative z-10 shadow-[-20px_0_80px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-right duration-500 border-l border-stone-100 flex flex-col">

                        {/* Transaction Context Bar - PREVENTS LOSS OF FOCUS */}
                        <div className="bg-emerald-900 px-8 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider">Continuando transacción de estancia</span>
                            </div>
                            <span className="text-[10px] font-bold text-white italic font-serif">$ {total.toLocaleString()} COP</span>
                        </div>

                        {/* Interactive Header with Tabs */}
                        <div className="bg-stone-50 border-b border-stone-100 shrink-0">
                            <div className="p-8 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                                        <ShieldCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-serif italic text-stone-800">Centro de Transparencia</h4>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Hacienda La Herrería</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLegalModal(false)} className="w-10 h-10 rounded-full hover:bg-stone-200/50 transition-colors text-stone-400 hover:text-stone-800 font-bold text-xl flex items-center justify-center">✕</button>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="px-8 flex gap-8">
                                <button
                                    onClick={() => setLegalTab('terms')}
                                    className={`pb-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${legalTab === 'terms' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
                                >
                                    Términos de Estancia
                                </button>
                                <button
                                    onClick={() => setLegalTab('privacy')}
                                    className={`pb-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${legalTab === 'privacy' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
                                >
                                    Privacidad (Habeas Data)
                                </button>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            {legalTab === 'terms' ? (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            1. Información General
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            La Herrería ofrece servicio de alojamiento turístico rural con 5 habitaciones disponibles y capacidad máxima de 4 personas por habitación. Al realizar una reserva, el huésped declara haber leído, entendido y aceptado los presentes Términos y Condiciones.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            2. Proceso de Reserva
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Las reservas quedan inicialmente en estado “Pendiente”. Se consideran oficialmente confirmadas únicamente cuando el huésped reciba notificación formal tras la verificación de disponibilidad y pago.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            3. Política de Cancelación (Flexible)
                                        </h5>
                                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-3">
                                            <p className="text-[12px] flex items-center gap-3 text-emerald-700 font-bold">✓ Más de 5 días: Reembolso 100%</p>
                                            <p className="text-[12px] flex items-center gap-3 text-amber-700 font-bold">⚠ Últimas 48 horas: Reembolso 70%</p>
                                            <p className="text-[12px] flex items-center gap-3 text-orange-700 font-bold">⚠ Últimas 24 horas: Reembolso 50%</p>
                                            <p className="text-[12px] flex items-center gap-3 text-red-700 font-bold">✕ No-show: Sin reembolso</p>
                                        </div>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            4. Horarios Oficiales
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Check-in: desde las 3:00 p.m. / Check-out: hasta las 11:00 a.m. Solicitudes de ingreso anticipado o salida tardía están sujetas a disponibilidad y aprobación.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            5. Uso de Instalaciones
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            El uso de la piscina es exclusivo para huéspedes registrados. Menores deben estar supervisados permanentemente. Se prohíbe el ingreso de vidrio al área de piscina.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            6. Convivencia y Áreas Comunes
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Respetar horarios de descanso (10:00 p.m. a 7:00 a.m.). No se permite realizar eventos sin autorización. El huésped es responsable por daños en las instalaciones.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            7. Protección de Datos (Ley 1581)
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            El tratamiento de datos personales se realiza conforme a la Ley 1581 de 2012 y el GDPR. La información detallada se encuentra en la pestaña de Privacidad.
                                        </p>
                                    </section>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            1. Responsable del Tratamiento
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Hacienda La Herrería, domiciliada en Fusagasuga, Cundinamarca, es responsable del tratamiento de sus datos personales. Contacto: info@laherreria.co
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            2. Finalidad de los Datos
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Los datos se capturan exclusivamente para gestionar reservas, comunicación vía WhatsApp sobre su estadía, coordinación de servicios y cumplimiento de obligaciones legales.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            3. Sus Derechos como Titular
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales en cualquier momento escribiendo al correo oficial de la Hacienda.
                                        </p>
                                    </section>
                                    <section>
                                        <h5 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                            4. Seguridad y Transferencia
                                        </h5>
                                        <p className="text-stone-600 text-[13px] leading-relaxed">
                                            Implementamos medidas técnicas para proteger su información. No compartimos sus datos con terceros con fines comerciales. Las cookies se usan solo para fines analíticos y técnicos.
                                        </p>
                                    </section>
                                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 italic text-[11px] text-emerald-800 leading-relaxed text-center">
                                        "Priorizamos la seguridad de su identidad digital bajo los más estrictos estándares del GDPR y Ley 1581."
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer Action */}
                        <div className="p-8 border-t border-stone-100 bg-stone-50 shrink-0">
                            <button
                                onClick={() => { setShowLegalModal(false); setPrivacyAccepted(true); }}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                            >
                                ACEPTAR Y CONTINUAR CON EL PAGO ❯
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Guard Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center cursor-wait overflow-hidden">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
                    <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
                            <RefreshCcw className="w-10 h-10 text-white animate-spin duration-[3s]" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-2xl font-serif italic text-stone-800 font-bold">Procesando Identidad</h4>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2 animate-pulse">Sincronizando con Hacienda...</p>
                        </div>
                    </div>
                </div>
            )}

            <footer className="px-8 py-6 bg-stone-50 border-t border-stone-100 flex justify-between items-center text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Plataforma Hacienda La Herrería</span>
                </div>
                <span>Versión de Calidad 1.4.5</span>
            </footer>
        </div>
    );
}
