import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { updateBookingSchema, formatZodError } from '@/lib/schemas';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/ratelimit';

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
                        emailHtml = isEnglish ? `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                                    <h1 style="color: #059669; text-align: center;">Hacienda La Herrería</h1>
                                    <p>Dear <strong>${cleanName}</strong>,</p>
                                    <p>It is a pleasure to have your presence in this space of nature and disconnection. Your reservation has been successfully confirmed.</p>
                                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #dcfce7;">
                                        <p style="margin-top: 0;"><strong>📅 Reserved Dates:</strong><br/>
                                        From ${displayStart} to ${displayEnd}</p>
                                        <p style="margin-bottom: 0;"><strong>💰 Total Amount:</strong> ${total}</p>
                                    </div>
                                    <p>We are excited to welcome you. If you have any additional questions, do not hesitate to reply to this email (reservas@laherreria.co) or write to us on WhatsApp at +57 315 032 2241.</p>
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 15px; color: #4b5563;">
                                        <p>Sincerely,<br/><strong>The Hacienda La Herrería Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                                    <h1 style="color: #059669; text-align: center;">Hacienda La Herrería</h1>
                                    <p>Apreciado(a) <strong>${cleanName}</strong>,</p>
                                    <p>Es un gusto poder contar con su presencia en este espacio de naturaleza y desconexión. Su reserva ha sido confirmada exitosamente.</p>
                                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #dcfce7;">
                                        <p style="margin-top: 0;"><strong>📅 Fechas reservadas:</strong><br/>
                                        Desde el ${displayStart} hasta el ${displayEnd}</p>
                                        <p style="margin-bottom: 0;"><strong>💰 Valor total:</strong> ${total}</p>
                                    </div>
                                    <p>Estamos emocionados de recibirle. Si tiene alguna pregunta adicional, no dude en responder a este correo (reservas@laherreria.co) o escribirnos por WhatsApp al +57 315 032 2241.</p>
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 15px; color: #4b5563;">
                                        <p>Atentamente,<br/><strong>El equipo de Hacienda La Herrería</strong></p>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else if (statusChangedToCancelled) {
                        emailHtml = isEnglish ? `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                                    <h1 style="color: #ef4444; text-align: center;">Hacienda La Herrería</h1>
                                    <p>Dear <strong>${cleanName}</strong>, your reservation has been cancelled.</p>
                                </div>
                            </div>
                        ` : `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                                    <h1 style="color: #ef4444; text-align: center;">Hacienda La Herrería</h1>
                                    <p>Apreciado(a) <strong>${cleanName}</strong>, su reserva ha sido cancelada.</p>
                                </div>
                            </div>
                        `;
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
