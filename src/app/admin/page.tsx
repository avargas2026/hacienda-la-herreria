'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import VisitorStats from '@/components/Admin/VisitorStats'; // [NEW]
import ContactList from '@/components/Admin/ContactList'; // [NEW]
import BookingCalendar from '@/components/Admin/BookingCalendar'; // [NEW]

export default function AdminPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-stone-50 py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="font-serif text-3xl text-stone-800">Panel de Administración</h1>
                </div>

                {/* Visitor Stats */}
                <VisitorStats />

                {/* Booking Calendar */}
                <BookingCalendar />

                {/* Contact List */}
                <ContactList />
            </div>
        </div>
    );
}
