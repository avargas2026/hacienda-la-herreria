'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, RefreshCcw, DollarSign, Users, Home, Calendar, Trash2, Plus, Info } from 'lucide-react';
import { BOOKING_CONSTANTS } from '@/lib/constants';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface PriceOverride {
    id: string;
    date: string;
    price: number;
    type: 'room' | 'camping';
    max_guests?: number;
}

export default function SiteSettings() {
    const [settings, setSettings] = useState({
        ROOM_PRICE_COP: BOOKING_CONSTANTS.ROOM_PRICE_COP,
        CAMPING_PRICE_PER_PERSON_COP: BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP,
        MAX_GUESTS_PER_ROOM: BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM,
        TOTAL_ROOMS: BOOKING_CONSTANTS.TOTAL_ROOMS,
    });
    const [overrides, setOverrides] = useState<PriceOverride[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // New Range-based Override state
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [rangePrice, setRangePrice] = useState(400000);
    const [rangeMaxGuests, setRangeMaxGuests] = useState(4);
    const [rangeType, setRangeType] = useState<'room' | 'camping'>('room');

    const fetchData = async () => {
        // Fetch base settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('*');

        if (settingsData && settingsData.length > 0) {
            const dbSettings: any = {};
            settingsData.forEach(s => dbSettings[s.key] = s.value);
            setSettings(prev => ({ ...prev, ...dbSettings }));
        }

        // Fetch overrides
        try {
            const { data: overrideData, error } = await supabase
                .from('pricing_overrides')
                .select('*')
                .order('date', { ascending: true });

            if (overrideData) setOverrides(overrideData);
        } catch (e) {
            console.warn('pricing_overrides table fetch failed');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveBase = async () => {
        setLoading(true);
        try {
            for (const [key, value] of Object.entries(settings)) {
                await supabase
                    .from('site_settings')
                    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
            }
            setMessage({ text: 'Configuración base guardada correctamente.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            setMessage({ text: 'Error al guardar.', type: 'error' });
        }
        setLoading(false);
    };

    const handleAddRangeOverride = async () => {
        if (!selectedRange?.from || !selectedRange?.to) {
            setMessage({ text: 'Por favor selecciona un rango de fechas en el calendario.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const days = eachDayOfInterval({
                start: selectedRange.from,
                end: selectedRange.to
            });

            // Prepare all upserts
            const upserts = days.map(day => ({
                date: format(day, 'yyyy-MM-dd'),
                price: rangePrice,
                type: rangeType,
                max_guests: rangeMaxGuests
            }));

            // Supabase upsert handles individual records
            const { data, error } = await supabase
                .from('pricing_overrides')
                .upsert(upserts, { onConflict: 'date,type' });

            if (error) throw error;

            setMessage({ text: 'Tarifas de rango aplicadas correctamente.', type: 'success' });
            setSelectedRange(undefined);
            fetchData();
        } catch (error: any) {
            console.error('Error applying overrides:', error);
            setMessage({
                text: `Error de Sistema: ${error.message || error.details || 'No se pudo aplicar el rango.'}`,
                type: 'error'
            });
        }
        setLoading(false);
    };

    const handleDeleteOverride = async (id: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('pricing_overrides')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            setMessage({ text: 'No se pudo eliminar el registro.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Range-based Dynamic Pricing */}
            <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden font-sans">
                <div className="p-8 border-b border-stone-50 bg-stone-50/20">
                    <h2 className="text-2xl font-serif text-stone-800 italic">Gestión de Calendario Dinámico</h2>
                    <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-bold">Aplica rangos de precios y capacidades especiales</p>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Calendar Selection Area */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex flex-col items-center">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-4">1. Selecciona el Rango</label>
                            <DayPicker
                                mode="range"
                                selected={selectedRange}
                                onSelect={setSelectedRange}
                                locale={es}
                                fromDate={new Date()}
                                className="admin-pricing-picker"
                            />
                            <style>{`
                                .admin-pricing-picker { margin: 0; }
                                .rdp-day_selected { background-color: #059669 !important; }
                                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #ecfdf5; color: #059669; }
                            `}</style>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-6 italic">
                            <div className="flex items-center gap-2 text-stone-400">
                                <Info className="w-4 h-4" />
                                <p className="text-xs">Estás configurando el periodo: <span className="text-emerald-600 font-bold">
                                    {selectedRange?.from ? format(selectedRange.from, 'dd MMM') : '...'} - {selectedRange?.to ? format(selectedRange.to, 'dd MMM') : '...'}
                                </span></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-2 ml-1">2. Categoría</label>
                                    <select
                                        value={rangeType}
                                        onChange={e => setRangeType(e.target.value as any)}
                                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-4 focus:ring-emerald-50 transition-all appearance-none bg-white bg-no-repeat bg-[right_1.5rem_center]"
                                    >
                                        <option value="room">Habitación</option>
                                        <option value="camping">Camping</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-2 ml-1">3. Precio Especial (COP)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={rangePrice}
                                            onChange={e => setRangePrice(Number(e.target.value))}
                                            className="w-full pl-10 pr-6 py-4 rounded-2xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-4 focus:ring-emerald-50 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {rangeType === 'room' && (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-2 ml-1">4. Huéspedes Máx. en este periodo</label>
                                    <input
                                        type="number"
                                        value={rangeMaxGuests}
                                        onChange={e => setRangeMaxGuests(Number(e.target.value))}
                                        className="w-full px-6 py-4 rounded-2xl border border-stone-200 font-bold text-stone-700 outline-none focus:ring-4 focus:ring-emerald-50 transition-all text-lg"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleAddRangeOverride}
                                disabled={loading || !selectedRange?.from}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-30 shadow-xl shadow-emerald-100"
                            >
                                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Aplicar Tarifas al Calendario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overrides List */}
                <div className="px-8 pb-8">
                    <div className="border-t border-stone-50 pt-8">
                        <div className="flex items-center gap-2 mb-6 text-stone-400">
                            <Calendar className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Registros de Excepción</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <tbody className="divide-y divide-stone-50">
                                    {overrides.length === 0 ? (
                                        <tr>
                                            <td className="py-12 text-center text-stone-300 italic text-sm">No hay reglas de excepción activas</td>
                                        </tr>
                                    ) : (
                                        overrides.map((ov) => (
                                            <tr key={ov.id} className="hover:bg-stone-50/50 transition-colors group">
                                                <td className="py-4 text-sm font-bold text-stone-700">
                                                    {format(new Date(ov.date + 'T12:00:00'), 'dd MMM yyyy')}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${ov.type === 'room' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {ov.type === 'room' ? 'Habitación' : 'Camping'}
                                                    </span>
                                                </td>
                                                <td className="py-4 font-mono font-bold text-emerald-600">
                                                    ${ov.price.toLocaleString()}
                                                </td>
                                                <td className="py-4 text-xs text-stone-400 font-medium">
                                                    {ov.type === 'room' && `Cap: ${ov.max_guests} pax`}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteOverride(ov.id)}
                                                        className="p-2 text-stone-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`fixed bottom-8 right-8 p-4 px-6 rounded-2xl text-sm font-bold shadow-2xl animate-in slide-in-from-right-4 duration-300 ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
