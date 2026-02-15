import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(request: Request) {
    try {
        const { id, ids } = await request.json();

        // Validation
        if (!id && (!ids || !Array.isArray(ids) || ids.length === 0)) {
            return NextResponse.json({ error: 'Booking ID or IDs are required' }, { status: 400 });
        }

        // Delete booking(s) from Supabase
        let query = supabaseAdmin.from('bookings').delete();

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query = query.in('id', ids);
        } else {
            query = query.eq('id', id);
        }

        const { error } = await query;

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
        }

        console.log(`✅ Booking ${id} deleted successfully`);
        return NextResponse.json({ success: true, message: 'Booking deleted successfully' });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
