import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteBookingSchema, formatZodError } from '@/lib/schemas';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';

// Schema for bulk delete
const bulkDeleteSchema = z.object({
    ids: z.array(
        z.string().refine(
            (val) => val.startsWith('BK-') || val.startsWith('BLOCKED-') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
            'ID de reserva inválido'
        )
    ).min(1, 'Al menos un ID es requerido'),
});

export async function DELETE(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await checkRateLimit(`delete_${ip}`);

    if (!success) {
        return NextResponse.json(
            { error: 'Demasiadas peticiones. Por favor, intenta de nuevo en un minuto.' },
            { status: 429 }
        );
    }
    try {
        const body = await request.json();

        // Check if it's a single delete or bulk delete
        const isBulk = 'ids' in body;

        if (isBulk) {
            // Validate bulk delete
            const validation = bulkDeleteSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    {
                        error: 'Datos inválidos',
                        details: formatZodError(validation.error),
                    },
                    { status: 400 }
                );
            }

            // Delete multiple bookings
            const { error } = await supabaseAdmin
                .from('bookings')
                .delete()
                .in('id', validation.data.ids);

            if (error) {
                console.error('Supabase delete error:', error);
                return NextResponse.json({ error: 'Failed to delete bookings' }, { status: 500 });
            }

            console.log(`✅ ${validation.data.ids.length} bookings deleted successfully`);
            return NextResponse.json({ success: true, message: `${validation.data.ids.length} bookings deleted` });

        } else {
            // Validate single delete
            const validation = deleteBookingSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    {
                        error: 'Datos inválidos',
                        details: formatZodError(validation.error),
                    },
                    { status: 400 }
                );
            }

            // Delete single booking
            const { error } = await supabaseAdmin
                .from('bookings')
                .delete()
                .eq('id', validation.data.bookingId);

            if (error) {
                console.error('Supabase delete error:', error);
                return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
            }

            console.log(`✅ Booking ${validation.data.bookingId} deleted successfully`);
            return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
        }

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
