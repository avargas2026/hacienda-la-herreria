'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, RefreshCcw, DollarSign, Users, Home } from 'lucide-react';
import { BOOKING_CONSTANTS } from '@/lib/constants';

export default function SiteSettings() {
    const [settings, setSettings] = useState({
        ROOM_PRICE_COP: BOOKING_CONSTANTS.ROOM_PRICE_COP,
        CAMPING_PRICE_PER_PERSON_COP: BOOKING_CONSTANTS.CAMPING_PRICE_PER_PERSON_COP,
        MAX_GUESTS_PER_ROOM: BOOKING_CONSTANTS.MAX_GUESTS_PER_ROOM,
        TOTAL_ROOMS: BOOKING_CONSTANTS.TOTAL_ROOMS,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (data && data.length > 0) {
                const dbSettings: any = {};
                data.forEach(s => dbSettings[s.key] = s.value);
                setSettings(prev => ({ ...prev, ...dbSettings }));
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            for (const [key, value] of Object.entries(settings)) {
                await supabase
                    .from('site_settings')
                    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
            }
            setMessage({ text: 'Configuración guardada correctamente. (Nota: Es posible que necesites recargar para ver cambios en la web pública)', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            setMessage({ text: 'Error al guardar. Asegúrate de que la tabla site_settings exista.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden font-sans">
            <div className="p-6 border-b border-stone-100 bg-stone-50/30 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif text-stone-800 italic">Configuración del Sitio</h2>
                    <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-bold">Precios y Capacidades</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-stone-700 text-sm uppercase tracking-wider">Tarifas Actuales</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Precio Habitación (COP)</label>
                        <input
                            type="number"
                            value={settings.ROOM_PRICE_COP}
                            onChange={e => setSettings({ ...settings, ROOM_PRICE_COP: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-stone-800 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Precio Camping p/p (COP)</label>
                        <input
                            type="number"
                            value={settings.CAMPING_PRICE_PER_PERSON_COP}
                            onChange={e => setSettings({ ...settings, CAMPING_PRICE_PER_PERSON_COP: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-stone-800 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Home className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-stone-700 text-sm uppercase tracking-wider">Inventario y Límites</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Total de Habitaciones</label>
                        <input
                            type="number"
                            value={settings.TOTAL_ROOMS}
                            onChange={e => setSettings({ ...settings, TOTAL_ROOMS: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-stone-800 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Máx. Huéspedes p/ Habitación</label>
                        <input
                            type="number"
                            value={settings.MAX_GUESTS_PER_ROOM}
                            onChange={e => setSettings({ ...settings, MAX_GUESTS_PER_ROOM: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-stone-800 transition-all"
                        />
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 mx-8 mb-8 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
