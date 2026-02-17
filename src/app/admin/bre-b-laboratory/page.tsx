'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    QrCode, MessageSquare, Calendar, Users,
    ArrowRight, Copy, CheckCircle2, ChevronLeft,
    Smartphone, ShieldCheck, Zap, Info,
    RefreshCcw, Sparkles, AlertCircle, Laptop,
    Search, User, DollarSign
} from 'lucide-react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { BOOKING_CONSTANTS } from '@/lib/constants';
import { QRCodeSVG } from 'qrcode.react';

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

export default function BreBLaboratory() {
    const [step, setStep] = useState<SandboxStep>(1);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState<'llave' | 'monto' | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Integración con Gestión de Reservas
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showBookingSelector, setShowBookingSelector] = useState(true);

    // Datos Reales de DB para disponibilidad
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [pricingOverrides, setPricingOverrides] = useState<any[]>([]);

    // Configuración Llave / WhatsApp (Nuevos datos oficiales)
    const LLAVE_REAL = "3114826302";
    const WHATSAPP_NUMBER = "573150322241";
    const [reference, setReference] = useState(`HER-${Math.floor(1000 + Math.random() * 9000)}`);

    // Detección de dispositivo
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent));
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Carga de Datos Reales y Reservas Pendientes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Cargar todas las fechas ocupadas para el calendario
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('start_date, end_date, status')
                    .in('status', ['confirmed', 'blocked']);

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

                // 2. Cargar reservas pendientes para simulación
                const { data: pending } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (pending) setPendingBookings(pending);

                // 3. Overrides de precios
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

    // Sincronizar reserva seleccionada con los estados del laboratorio
    const handleSelectBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setSelectedRange({
            from: parseISO(booking.start_date),
            to: parseISO(booking.end_date)
        });
        setGuests(booking.guests);
        setReference(booking.id);
        setShowBookingSelector(false);
    };

    const calculateTotal = () => {
        // Si hay una reserva seleccionada, usar su total persistido
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
            alert(`No se pudo copiar automáticamente. Por favor copia manualmente: ${text}`);
        }
    };

    const generateWALink = () => {
        const text = `Hola Hacienda La Herrería! 👋\n\nConfirmo mi pago de reserva (Bre-B):\n🆔 Referencia: ${reference}\n📌 Fechas: ${format(selectedRange!.from!, 'dd MMM')} - ${format(selectedRange!.to!, 'dd MMM')}\n👥 Huéspedes: ${guests}\n💰 Total pagado: $${total.toLocaleString()}\n\nAdjunto comprobante.`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    };

    const handleUnifiedConfirmation = async () => {
        setEmailStatus('sending');
        try {
            const response = await fetch('/api/admin/bre-b-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: reference,
                    bookingId: selectedBooking?.id || reference,
                    dates: `${format(selectedRange!.from!, 'dd MMM')} - ${format(selectedRange!.to!, 'dd MMM')}`,
                    guests: guests,
                    total: `$ ${total.toLocaleString()} COP`
                })
            });

            if (response.ok) {
                setEmailStatus('success');
                setTimeout(() => {
                    window.open(generateWALink(), '_blank');
                }, 1000);
            } else {
                setEmailStatus('error');
            }
        } catch (err) {
            setEmailStatus('error');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
            <RefreshCcw className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest text-center">Sincronizando Sistema de Pagos...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto uppercase-labels">

                <header className="mb-12 flex flex-col items-center">
                    <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl shadow-indigo-100 flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-white" />
                        Bre-B Pay Integration Center
                    </div>
                    <h1 className="text-4xl font-serif text-stone-800 italic text-center tracking-tight">Validación y Simulación de Pagos</h1>
                    <p className="text-stone-400 text-sm mt-3 text-center max-w-lg leading-relaxed">
                        Conecta tus reservas pendientes con el flujo de pago interoperable Bre-B.
                    </p>
                </header>

                {/* Paso 0: Selección de Reserva (Opcional pero recomendado para Admin) */}
                {step === 1 && showBookingSelector && pendingBookings.length > 0 && (
                    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-white border border-indigo-100 rounded-[32px] p-8 shadow-xl shadow-indigo-50/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest leading-none mb-1">Cargar Reserva Pendiente</h3>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Selecciona una reserva para validar su flujo de pago</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingBookings.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => handleSelectBooking(b)}
                                        className="text-left p-5 border border-stone-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3 h-3 text-stone-400" />
                                                <span className="text-xs font-bold text-stone-700 uppercase group-hover:text-indigo-700 transition-colors">{b.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                                                <Calendar className="w-3 h-3" />
                                                {format(parseISO(b.start_date), 'dd MMM')} - {format(parseISO(b.end_date), 'dd MMM')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-indigo-600 mb-1">{b.total}</div>
                                            <div className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{b.id}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowBookingSelector(false)}
                                className="w-full mt-6 py-3 text-[10px] font-bold text-stone-400 hover:text-stone-600 uppercase tracking-[0.2em] transition-colors"
                            >
                                Continuar con simulación libre →
                            </button>
                        </div>
                    </div>
                )}

                <nav className="flex items-center justify-center gap-4 mb-16 max-w-2xl mx-auto">
                    {[
                        { s: 1, label: 'Reserva', desc: 'Días y Personas' },
                        { s: 2, label: 'Pago', desc: 'Transferencia QR' },
                        { s: 3, label: 'Reporte', desc: 'Confirmación Final' }
                    ].map((item) => (
                        <div key={item.s} className="flex-1 flex flex-col items-center gap-2 relative">
                            {item.s < 3 && <div className={`absolute top-5 left-[60%] right-[-40%] h-[1px] ${step > item.s ? 'bg-indigo-600' : 'bg-stone-100'}`} />}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${step === item.s ? 'bg-stone-900 text-white shadow-2xl scale-110' :
                                step > item.s ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-stone-100 text-stone-300'
                                }`}>
                                <span className="text-xs font-black">{item.s}</span>
                            </div>
                            <div className="text-center">
                                <p className={`text-[10px] font-black uppercase tracking-tighter ${step === item.s ? 'text-stone-800' : 'text-stone-300'}`}>{item.label}</p>
                                <p className="text-[8px] text-stone-400 font-medium uppercase tracking-tight hidden md:block">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </nav>

                <main>
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white rounded-[48px] shadow-2xl border border-stone-100 overflow-hidden">
                                {selectedBooking && (
                                    <div className="bg-indigo-600 px-8 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Validando Reserva: {selectedBooking.name}</span>
                                        </div>
                                        <button onClick={() => { setSelectedBooking(null); setShowBookingSelector(true); }} className="text-white/60 hover:text-white transition-colors">
                                            <RefreshCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xl font-serif text-stone-800 italic">Planifica tu estancia</h3>
                                            <p className="text-xs text-stone-400 leading-relaxed md:pr-10">
                                                Selecciona el rango de fechas en el calendario. El sistema validará automáticamente la disponibilidad real.
                                            </p>
                                        </div>
                                        <div className="p-2 bg-stone-50 rounded-[40px] border border-stone-100 flex justify-center shadow-inner">
                                            <DayPicker
                                                mode="range"
                                                selected={selectedRange}
                                                onSelect={setSelectedRange}
                                                locale={es}
                                                disabled={[{ before: new Date() }, ...bookedDates]}
                                                className="rdp-lab-v2"
                                            />
                                            <style>{`
                                                .rdp-lab-v2 { --rdp-accent-color: #4f46e5; margin: 0; }
                                                .rdp-day_selected { background-color: #4f46e5 !important; border-radius: 12px; opacity: 1 !important; color: white !important; font-weight: bold; }
                                            `}</style>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between py-6">
                                        <div className="space-y-10">
                                            <div>
                                                <div className="flex justify-between items-end mb-4">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Acompañantes</label>
                                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Capacidad Real</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-stone-50 p-4 rounded-[28px] border border-stone-100 shadow-sm">
                                                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-stone-400 hover:text-indigo-600 active:scale-95 transition-all text-2xl">-</button>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-3xl font-black text-stone-800">{guests}</span>
                                                        <span className="text-[10px] font-bold text-stone-400 uppercase">Huéspedes</span>
                                                    </div>
                                                    <button onClick={() => setGuests(Math.min(30, guests + 1))} className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-stone-400 hover:text-indigo-600 active:scale-95 transition-all text-2xl">+</button>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-stone-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl group">
                                                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5 opacity-50 group-hover:rotate-12 transition-transform duration-700" />
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2 leading-none">Monto Validado</p>
                                                <div className="flex items-baseline gap-2">
                                                    <h3 className="text-5xl font-black tracking-tighter text-white font-sans">$ {total.toLocaleString()}</h3>
                                                    <span className="text-xs font-bold opacity-40">COP</span>
                                                </div>
                                                <div className="mt-6 flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-40 border-t border-white/10 pt-6">
                                                    <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {nights} Noches</span>
                                                    <span className="flex items-center gap-2 tracking-tighter truncate max-w-[150px]">REF: {reference}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            disabled={!selectedRange?.to || total === 0}
                                            onClick={() => setStep(2)}
                                            className="w-full bg-indigo-600 text-white py-6 mt-10 rounded-[28px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-20 disabled:translate-y-0"
                                        >
                                            Simular Flujo de Pago <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-12 duration-700 max-w-2xl mx-auto space-y-8">
                            <div className="bg-white rounded-[56px] shadow-2xl border border-stone-100 overflow-hidden">
                                <div className="p-10 md:p-16 flex flex-col items-center">
                                    <div className="text-center mb-12">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                                            {isMobile ? <Smartphone className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                                            {isMobile ? 'Modo Dispositivo Móvil' : 'Modo Ordenador Detectado'}
                                        </div>
                                        <h2 className="text-3xl font-serif text-stone-800 italic">Instrucciones de Pago</h2>
                                        <p className="text-xs text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                            {isMobile
                                                ? "Ideal para pagar desde tu propia app bancaria. Copia los datos abajo y ábrela."
                                                : "Escanea el código QR con tu celular usando la cámara o tu app bancaria favorita."}
                                        </p>
                                    </div>

                                    {!isMobile && (
                                        <div className="p-10 bg-white rounded-[48px] shadow-2xl border border-stone-100 mb-12 relative group animate-in zoom-in-95 duration-700">
                                            <div className="absolute -inset-4 bg-indigo-100 rounded-[64px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                            <QRCodeSVG value={qrValue} size={220} level={"H"} className="relative" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-2xl shadow-2xl border border-stone-50">
                                                <Zap className="w-8 h-8 text-indigo-600 fill-indigo-600" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-full space-y-4 mb-12">
                                        <div className="bg-stone-50 p-8 rounded-[36px] border border-stone-100 flex flex-col items-center md:flex-row md:justify-between group">
                                            <div className="text-center md:text-left mb-6 md:mb-0">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Número de LLave Bre-B</p>
                                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                </div>
                                                <span className="text-4xl font-black text-stone-900 tracking-tighter">{LLAVE_REAL}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(LLAVE_REAL, 'llave')}
                                                className={`px-8 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${copyFeedback === 'llave' ? 'bg-indigo-600 text-white' : 'bg-white text-stone-900 shadow-xl hover:shadow-indigo-100 hover:text-indigo-600'
                                                    }`}
                                            >
                                                {copyFeedback === 'llave' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copyFeedback === 'llave' ? 'Copiado' : 'Copiar Llave'}
                                            </button>
                                        </div>

                                        <div className="bg-indigo-50 p-8 rounded-[36px] border border-indigo-100 flex flex-col items-center md:flex-row md:justify-between">
                                            <div className="text-center md:text-left mb-6 md:mb-0">
                                                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Monto Exacto a Transferir</p>
                                                <span className="text-4xl font-black text-indigo-900 tracking-tighter">$ {total.toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(total.toString(), 'monto')}
                                                className={`px-8 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${copyFeedback === 'monto' ? 'bg-indigo-900 text-white' : 'bg-white text-indigo-900 shadow-xl hover:text-indigo-700'
                                                    }`}
                                            >
                                                {copyFeedback === 'monto' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copyFeedback === 'monto' ? 'Monto Copiado' : 'Copiar Monto'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full bg-stone-900 text-white py-7 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:bg-black transition-all hover:translate-y-[-2px] active:scale-[0.98] shadow-2xl"
                                    >
                                        Confirmar Reporte de Pago <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-stone-300 text-[10px] font-black uppercase tracking-widest hover:text-stone-500 mx-auto transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Volver a edición
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-12 duration-700 max-w-xl mx-auto">
                            <div className="bg-white rounded-[64px] shadow-2xl border border-stone-100 p-12 md:p-20 flex flex-col items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full translate-x-24 -translate-y-24 opacity-50" />

                                <div className="w-32 h-32 bg-indigo-50 rounded-[48px] flex items-center justify-center mb-12 shadow-inner border border-indigo-100/50">
                                    <MessageSquare className="w-12 h-12 text-indigo-600 fill-indigo-600 opacity-80" />
                                </div>

                                <div className="text-center mb-12 space-y-4">
                                    <h2 className="text-4xl font-serif text-stone-800 italic">Reportar Operación</h2>
                                    <p className="text-stone-400 text-sm leading-relaxed">
                                        Al pulsar, se notificará a la Hacienda y se actualizará el estado de la reserva a <span className="text-indigo-600 font-bold">&quot;Pago Reportado&quot;</span>.
                                    </p>
                                </div>

                                <div className="w-full relative group">
                                    <div className={`absolute -inset-1 rounded-[36px] blur-xl opacity-3 transition-all ${emailStatus === 'success' ? 'bg-indigo-400 opacity-60' : 'bg-indigo-600'
                                        }`} />
                                    <button
                                        onClick={handleUnifiedConfirmation}
                                        disabled={emailStatus === 'sending' || emailStatus === 'success'}
                                        className={`relative w-full py-8 rounded-[32px] font-black uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-2 transition-all shadow-2xl border-2 ${emailStatus === 'success'
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                            : 'bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-700'
                                            } disabled:opacity-90`}
                                    >
                                        {emailStatus === 'sending' ? (
                                            <>
                                                <RefreshCcw className="w-6 h-6 animate-spin text-white mb-1" />
                                                <span className="text-[10px]">Actualizando Reserva...</span>
                                            </>
                                        ) : emailStatus === 'success' ? (
                                            <>
                                                <CheckCircle2 className="w-7 h-7 mb-1" />
                                                <span className="text-[12px]">Éxito: Pago Notificado</span>
                                                <span className="text-[8px] opacity-70">Redirigiendo a WhatsApp...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <Zap className="w-5 h-5 fill-white" />
                                                    <span className="text-sm">Finalizar Reporte</span>
                                                </div>
                                                <span className="text-[8px] opacity-60 tracking-[0.4em] mt-1 font-bold">Sistema Real-Time Hacienda</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-16 bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-start gap-4 w-full">
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Verificación Manual</p>
                                        <p className="text-[10px] text-indigo-400 leading-relaxed font-medium uppercase tracking-tight">
                                            Una vez reportado, el administrador validará el ingreso en su banca móvil para confirmar definitivamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="mt-24 py-10 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all font-bold">
                    <div className="flex flex-col items-center md:items-start">
                        <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest leading-none mb-2">Command Center · Hacienda La Herrería</p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">BRE-B CONNECTED · v3.3.0 · LAB_INTEGRATION</p>
                    </div>
                    <div className="flex gap-10">
                        {['Sincronizado', 'Prioridad Admin', 'Fuerza Operativa'].map(item => (
                            <span key={item} className="text-[9px] font-black uppercase tracking-widest text-stone-800">{item}</span>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}
