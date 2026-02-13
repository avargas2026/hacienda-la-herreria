import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        // Validation
        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        // Delete booking from Supabase
        const { error } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', id);

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
