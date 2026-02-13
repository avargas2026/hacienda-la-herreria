import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request) {
    try {
        const { id, name, email, phone, start_date, end_date, guests, total, status } = await request.json();

        // Validation
        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        if (!name || !email || !start_date || !end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Update booking in Supabase
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({
                name,
                email,
                phone,
                start_date,
                end_date,
                guests: guests || 2,
                total,
                status: status || 'pending'
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
        }

        console.log(`✅ Booking ${id} updated successfully`);
        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
