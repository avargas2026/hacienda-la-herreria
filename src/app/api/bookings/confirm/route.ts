import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { confirmBookingSchema, formatZodError } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateBookingConfirmationEmail } from '@/lib/emailTemplates';

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await checkRateLimit(`confirm_${ip}`);

    if (!success) {
        return NextResponse.json(
            { error: 'Demasiadas peticiones. Por favor, intenta de nuevo en un minuto.' },
            { status: 429 }
        );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        console.log('📦 Confirm Request Body:', JSON.stringify(body, null, 2));

        const validation = confirmBookingSchema.safeParse(body);
        if (!validation.success) {
            console.error('❌ Validation error:', formatZodError(validation.error));
            return NextResponse.json({ error: 'Datos inválidos', details: formatZodError(validation.error) }, { status: 400 });
        }

        const { bookingId, email, name, dates, total } = validation.data;

        // 1. Update status in Supabase
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            console.error('❌ Supabase update error:', updateError);
            return NextResponse.json({ error: 'Fallo al actualizar estado en base de datos' }, { status: 500 });
        }

        // 2. Email Logic
        if (process.env.RESEND_API_KEY && email) {
            try {
                const targetEmail = email.trim();
                const isEnglish = (name || '').toUpperCase().includes('[EN]');
                const cleanName = (name || '').replace(/ \[EN\]/i, '').trim();
                const [startDate, endDate] = dates.split(' - ');

                const subject = isEnglish
                    ? 'Your Booking is Confirmed! - Hacienda La Herrería'
                    : '¡Tu Reserva está Confirmada! - Hacienda La Herrería';

                const htmlContent = generateBookingConfirmationEmail({
                    name: cleanName,
                    dates: `${startDate} - ${endDate}`,
                    total: total || '',
                    isEnglish
                });

                console.log(`📧 Sending confirmation email to: ${targetEmail}`);
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'reservas@laherreria.co',
                    to: targetEmail,
                    subject: subject,
                    html: htmlContent
                });

                if (emailError) {
                    console.error('❌ Resend API Error (Confirm):', JSON.stringify(emailError, null, 2));
                    return NextResponse.json({
                        success: true,
                        warning: 'Reserva confirmada en base de datos, pero el correo falló.',
                        emailError: emailError.message || 'Resend error'
                    });
                }
                console.log('✅ Confirmation email sent successfully:', emailData?.id);
            } catch (innerError: any) {
                console.error('❌ Internal error in email logic:', innerError.message);
            }
        }

        return NextResponse.json({ success: true, message: 'Booking confirmed' });

    } catch (error: any) {
        console.error('❌ Global Server Error (Confirm):', error.message);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
