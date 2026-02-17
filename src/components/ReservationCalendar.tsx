'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, isSameDay, isBefore, startOfDay, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { useLanguage } from '@/context/LanguageContext';
import Skeleton from '@/components/Skeleton';

interface ReservationCalendarProps {
    selectedRange: DateRange | undefined;
    onSelectRange: (range: DateRange | undefined) => void;
    bookedDates: Date[];
    pricingOverrides?: any[];
}

export default function ReservationCalendar({ selectedRange, onSelectRange, bookedDates, pricingOverrides = [] }: ReservationCalendarProps) {
    const { t, language } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDayClick = (day: Date, modifiers: any) => {
        setErrorMsg(null);
        const today = startOfDay(new Date());

        if (modifiers.booked) {
            setErrorMsg(t('booking.error.booked_date') || (language === 'es' ? 'Fecha ocupada' : 'Date booked'));
            return;
        }

        if (isBefore(day, today)) {
            setErrorMsg(t('booking.error.past_dates'));
            return;
        }
    };

    if (!mounted) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                    <Skeleton className="w-full h-[300px] rounded-xl" />
                    <div className="mt-4 flex justify-center gap-2">
                        <Skeleton className="w-24 h-4" />
                    </div>
                </div>
                <div className="flex justify-center gap-6">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-20 h-4" />
                </div>
            </div>
        );
    }

    const specialPriceDates = pricingOverrides.map(o => parseISO(o.date));

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col items-center">
                <style>{`
                    .rdp {
                        --rdp-cell-size: 40px;
                        --rdp-accent-color: #059669; 
                        --rdp-background-color: #ecfdf5; 
                        margin: 0;
                    }
                    .rdp-day_selected:not([aria-disabled="true"]) { 
                        background-color: var(--rdp-accent-color); 
                        color: white;
                    }
                    .rdp-day_booked {
                        background-color: #fce7f3 !important; /* Rose 100 - Soft Pink */
                        color: transparent !important;
                        cursor: not-allowed;
                        border: 1px solid #fbcfe8;
                        position: relative;
                    }
                    .rdp-day_booked::after {
                        content: '✕';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 16px;
                        color: #9d174d; /* Pink 800 - Contrast */
                        font-weight: bold;
                        opacity: 0.7;
                    }
                    .rdp-day_specialPrice {
                        position: relative;
                    }
                    .rdp-day_specialPrice::before {
                        content: '';
                        position: absolute;
                        bottom: 4px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 4px;
                        height: 4px;
                        background-color: #059669;
                        border-radius: 50%;
                    }
                    .rdp-day_selected.rdp-day_specialPrice::before {
                        background-color: white;
                    }
                    /* Styling for Past Dates (Disabled but not Booked) */
                    .rdp-day_disabled:not(.rdp-day_booked) {
                        color: #d6d3d1;
                        background-color: transparent;
                    }
                `}</style>
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={(range) => {
                        setErrorMsg(null);
                        onSelectRange(range);
                    }}
                    onDayClick={handleDayClick}
                    min={1}
                    locale={language === 'es' ? es : enUS}
                    disabled={[{ before: new Date() }, ...bookedDates]}
                    modifiers={{
                        booked: bookedDates,
                        specialPrice: specialPriceDates
                    }}
                    modifiersClassNames={{
                        booked: 'rdp-day_booked',
                        specialPrice: 'rdp-day_specialPrice'
                    }}
                    fromDate={new Date()}
                    footer={
                        <div className="mt-4 text-center">
                            {errorMsg && (
                                <p className="text-red-600 font-medium text-sm animate-pulse mb-2">
                                    {errorMsg}
                                </p>
                            )}
                            {selectedRange?.from && !selectedRange.to && (
                                <p className="text-sm text-stone-600">
                                    {language === 'es' ? 'Selecciona fecha de salida' : 'Select check-out date'}
                                </p>
                            )}
                            {selectedRange?.from && selectedRange.to && (
                                <p className="text-sm text-stone-600">
                                    {format(selectedRange.from, 'dd MMM', { locale: language === 'es' ? es : enUS })} - {format(selectedRange.to, 'dd MMM', { locale: language === 'es' ? es : enUS })}
                                </p>
                            )}
                            {!selectedRange?.from && !errorMsg && (
                                <p className="text-sm text-stone-500">
                                    {language === 'es' ? 'Selecciona tus fechas' : 'Select your dates'}
                                </p>
                            )}
                        </div>
                    }
                />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-[10px] md:text-xs text-stone-600">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
                    </div>
                    <span>{language === 'es' ? 'Seleccionado' : 'Selected'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-stone-200 rounded flex items-center justify-center text-stone-400">
                    </div>
                    <span>{language === 'es' ? 'Disponible' : 'Available'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-stone-200 rounded flex items-center justify-center text-stone-400 relative">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                    </div>
                    <span>{language === 'es' ? 'Precio Especial' : 'Special Price'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#fce7f3] rounded flex items-center justify-center border border-[#fbcfe8] relative">
                        <span className="text-[#9d174d] text-sm font-bold">✕</span>
                    </div>
                    <span>{language === 'es' ? 'No disponible' : 'Not available'}</span>
                </div>
            </div>
        </div>
    );
}
