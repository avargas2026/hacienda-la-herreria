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

    // Disable booked dates
    const isDateDisabled = (date: Date) => {
        return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
    };

    return (
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
            `}</style>
            <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={onSelectRange}
                min={1}
                locale={es}
                disabled={isDateDisabled}
                modifiers={{
                    booked: bookedDates
                }}
                modifiersStyles={{
                    booked: { textDecoration: 'line-through', color: '#dc2626', opacity: 0.5 }
                }}
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
    );
}
