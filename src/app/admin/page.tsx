'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import VisitorStats from '@/components/Admin/VisitorStats';
import VisitorMap from '@/components/Admin/VisitorMap';
import ContactList from '@/components/Admin/ContactList';
import BookingCalendar from '@/components/Admin/BookingCalendar';

const ADMIN_EMAIL = 'a.vargas@mrvargas.co';

export default function AdminPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.email !== ADMIN_EMAIL) {
                router.push('/login');
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-600">Verificando acceso...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-stone-50 py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="font-serif text-3xl text-stone-800">Panel de Administración</h1>
                </div>

                {/* Visitor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <VisitorStats />
                    <VisitorMap />
                </div>

                {/* Booking Calendar */}
                <BookingCalendar />

                {/* Contact List */}
                <ContactList />
            </div>
        </div>
    );
}
