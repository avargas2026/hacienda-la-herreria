import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { confirmBookingSchema, formatZodError } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/ratelimit';

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

                const htmlContent = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                            <h1 style="color: #059669; text-align: center;">Hacienda La Herrería</h1>
                            <p>${isEnglish ? 'Dear' : 'Apreciado(a)'} <strong>${cleanName}</strong>,</p>
                            
                            <p>${isEnglish
                        ? 'It is a pleasure to have your presence in this space of nature and disconnection. Your reservation has been successfully confirmed.'
                        : 'Es un gusto poder contar con su presencia en este espacio de naturaleza y desconexión. Su reserva ha sido confirmada exitosamente.'
                    }</p>
                            
                            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #dcfce7;">
                                <p style="margin-top: 0;"><strong>${isEnglish ? '📅 Reserved Dates:' : '📅 Fechas reservadas:'}</strong><br/>
                                ${isEnglish ? 'From' : 'Desde el'} ${startDate} ${isEnglish ? 'to' : 'hasta el'} ${endDate}</p>
                                
                                <p style="margin-bottom: 0;"><strong>${isEnglish ? '💰 Total Amount:' : '💰 Valor total:'}</strong> ${total}</p>
                            </div>
                            
                            <p>${isEnglish
                        ? 'We are excited to welcome you. If you have any additional questions, do not hesitate to reply to this email (reservas@laherreria.co) or write to us on WhatsApp at +57 315 032 2241.'
                        : 'Estamos emocionados de recibirle. Si tiene alguna pregunta adicional, no dude en responder a este correo (reservas@laherreria.co) o escribirnos por WhatsApp al +57 315 032 2241.'
                    }</p>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 15px; color: #4b5563;">
                                <p>${isEnglish ? 'Sincerely,' : 'Atentamente,'}<br/>
                                <strong>${isEnglish ? 'The Hacienda La Herrería Team' : 'El equipo de Hacienda La Herrería'}</strong></p>
                            </div>
                        </div>
                    </div>
                `;

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
