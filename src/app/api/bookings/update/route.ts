import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { updateBookingSchema, formatZodError } from '@/lib/schemas';

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate with Zod
        const validation = updateBookingSchema.safeParse({ bookingId: body.id, ...body });

        if (!validation.success) {
            console.error('Validation error:', formatZodError(validation.error));
            return NextResponse.json(
                {
                    error: 'Datos inválidos',
                    details: formatZodError(validation.error),
                },
                { status: 400 }
            );
        }

        const { bookingId, ...updateData } = validation.data;

        // Remove undefined values
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );

        // Update booking in Supabase
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update(cleanData)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
        }

        console.log(`✅ Booking ${bookingId} updated successfully`);
        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
