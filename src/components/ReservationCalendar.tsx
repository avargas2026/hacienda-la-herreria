'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface ReservationCalendarProps {
    selectedRange: DateRange | undefined;
    onSelectRange: (range: DateRange | undefined) => void;
    bookedDates: Date[]; // Dates that are already booked
}

export default function ReservationCalendar({ selectedRange, onSelectRange, bookedDates }: ReservationCalendarProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Disable booked dates
    const isDateDisabled = (date: Date) => {
        return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
    };

    if (!mounted) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-200 flex justify-center">
                    <div className="h-80 flex items-center justify-center text-stone-400">
                        Cargando calendario...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-200 flex justify-center">
                <style>{`
                    .rdp {
                        --rdp-cell-size: 40px;
                        --rdp-accent-color: #059669; /* emerald-600 */
                        --rdp-background-color: #ecfdf5; /* emerald-50 */
                        margin: 0;
                    }
                    .rdp-day_selected:not([aria-disabled="true"]) { 
                        background-color: var(--rdp-accent-color); 
                        color: white;
                    }
                    .rdp-day_selected:hover:not([aria-disabled="true"]) { 
                        background-color: #047857; /* emerald-700 */
                    }
                    .rdp-day_disabled {
                        background-color: #fca5a5 !important; /* red-300 - más visible */
                        color: #7f1d1d !important; /* red-900 */
                        text-decoration: line-through;
                        font-weight: 600;
                        opacity: 0.9 !important;
                        cursor: not-allowed !important;
                        position: relative;
                    }
                    .rdp-day_disabled:hover {
                        background-color: #f87171 !important; /* red-400 */
                    }
                    .rdp-day_disabled::after {
                        content: '✕';
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        font-size: 8px;
                        color: #7f1d1d;
                        font-weight: bold;
                    }
                `}</style>
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={onSelectRange}
                    min={1}
                    locale={es}
                    disabled={isDateDisabled}
                    fromDate={new Date()}
                    footer={
                        selectedRange?.from ? (
                            <p className="mt-4 text-center text-sm text-stone-600">
                                {selectedRange.to ? (
                                    <>
                                        Del <strong>{format(selectedRange.from, 'dd MMM', { locale: es })}</strong> al <strong>{format(selectedRange.to, 'dd MMM', { locale: es })}</strong>
                                    </>
                                ) : (
                                    <>
                                        Desde <strong>{format(selectedRange.from, 'dd MMM', { locale: es })}</strong>
                                    </>
                                )}
                            </p>
                        ) : (
                            <p className="mt-4 text-center text-sm text-stone-500">
                                Selecciona tus fechas de llegada y salida.
                            </p>
                        )
                    }
                />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                    <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-stone-300 rounded"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-300 border border-red-400 rounded flex items-center justify-center">
                        <span className="text-red-900 text-[10px] font-bold">✕</span>
                    </div>
                    <span>No disponible</span>
                </div>
            </div>
        </div>
    );
}
