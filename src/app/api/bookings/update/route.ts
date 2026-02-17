import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { updateBookingSchema, formatZodError } from '@/lib/schemas';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateBookingConfirmationEmail, generateBookingCancellationEmail } from '@/lib/emailTemplates';

export async function PUT(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await checkRateLimit(`update_${ip}`);

    if (!success) {
        return NextResponse.json(
            { error: 'Demasiadas peticiones. Por favor, intenta de nuevo en un minuto.' },
            { status: 429 }
        );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        console.log('📦 Update Request Body:', JSON.stringify(body, null, 2));

        const validation = updateBookingSchema.safeParse(body);
        if (!validation.success) {
            console.error('❌ Validation error:', formatZodError(validation.error));
            return NextResponse.json({ error: 'Datos inválidos', details: formatZodError(validation.error) }, { status: 400 });
        }

        const { bookingId, ...updateData } = validation.data;

        // 1. Get current booking
        const { data: oldBooking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !oldBooking) {
            console.error('❌ Booking not found:', bookingId);
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        // 2. Update booking
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(cleanData)
            .eq('id', bookingId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Supabase update error:', updateError);
            return NextResponse.json({ error: 'Fallo al actualizar en la base de datos' }, { status: 500 });
        }

        // 3. Email Logic
        const oldStatus = oldBooking.status;
        const newStatus = cleanData.status;
        const statusChangedToConfirmed = oldStatus !== 'confirmed' && newStatus === 'confirmed';
        const statusChangedToCancelled = oldStatus !== 'cancelled' && newStatus === 'cancelled';

        if ((statusChangedToConfirmed || statusChangedToCancelled) && process.env.RESEND_API_KEY) {
            try {
                const { email, name, start_date, end_date, total } = updatedBooking;
                const targetEmail = (email || '').trim();

                if (!targetEmail) {
                    console.warn('⚠️ No email found for booking');
                } else {
                    const isEnglish = (name || '').toUpperCase().includes('[EN]');
                    const cleanName = (name || '').replace(/ \[EN\]/i, '').trim();

                    const formatDisplayDate = (dateStr: string) => {
                        try {
                            const d = new Date(dateStr + 'T12:00:00');
                            return d.toLocaleDateString(isEnglish ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                        } catch (e) { return dateStr; }
                    };

                    const displayStart = formatDisplayDate(start_date);
                    const displayEnd = formatDisplayDate(end_date);
                    let emailHtml = '';

                    if (statusChangedToConfirmed) {
                        emailHtml = generateBookingConfirmationEmail({
                            name: cleanName,
                            dates: `${displayStart} - ${displayEnd}`,
                            total: total || '',
                            isEnglish
                        });
                    } else if (statusChangedToCancelled) {
                        emailHtml = generateBookingCancellationEmail({
                            name: cleanName,
                            isEnglish
                        });
                    }

                    const subject = statusChangedToConfirmed ?
                        (isEnglish ? 'Booking Confirmed - Hacienda La Herrería' : 'Reserva Confirmada - Hacienda La Herrería') :
                        (isEnglish ? 'Booking Update - Hacienda La Herrería' : 'Actualización de Reserva - Hacienda La Herrería');

                    console.log(`📧 Sending email to: ${targetEmail}`);
                    const { data: emailResult, error: emailError } = await resend.emails.send({
                        from: 'reservas@laherreria.co',
                        to: targetEmail,
                        subject: subject,
                        html: emailHtml
                    });

                    if (emailError) {
                        console.error('❌ Resend API Error:', JSON.stringify(emailError, null, 2));
                        return NextResponse.json({
                            success: true,
                            data: updatedBooking,
                            warning: 'Guardado, pero el correo falló.',
                            emailError: emailError.message || 'Error técnico en el servidor de correos (Resend).'
                        });
                    }
                    console.log('✅ Email sent successfully:', emailResult.id);
                }
            } catch (blockError: any) {
                console.error('❌ Critical error in email block:', blockError);
            }
        }

        return NextResponse.json({ success: true, data: updatedBooking });

    } catch (globalError: any) {
        console.error('❌ Global Server Error:', globalError);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
