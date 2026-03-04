import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'ID de reserva requerido' }, { status: 400 });
        }

        // 1. Fetch booking details
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            console.error('❌ Booking not found:', bookingId);
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        if (!booking.email) {
            console.error('❌ Booking has no email:', bookingId);
            return NextResponse.json({ error: 'La reserva no tiene un correo electrónico asociado' }, { status: 400 });
        }

        // 2. Generate secure token
        const feedbackToken = uuidv4();

        // 3. Save token to booking
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                feedback_token: feedbackToken,
                feedback_sent: true
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('❌ Error saving feedback token:', updateError);
            return NextResponse.json({ error: 'Error al actualizar la reserva en la base de datos' }, { status: 500 });
        }

        // 4. Send Email via Resend
        // Priority: NEXT_PUBLIC_SITE_URL (found in .env.local) > NEXT_PUBLIC_BASE_URL > production default
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://laherreria.co';
        const feedbackUrl = `${baseUrl}/feedback/${feedbackToken}`;

        const emailHtml = `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e7e5e4; border-radius: 24px; color: #44403c; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #059669; font-style: italic; font-weight: normal; font-size: 28px; margin-bottom: 5px;">¡Gracias por visitarnos!</h2>
                    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: bold; color: #a8a29e;">Hacienda La Herrería</p>
                </div>

                <p style="font-size: 16px;">Hola <strong>${booking.name}</strong>,</p>
                
                <p>Esperamos que hayas disfrutado de tu estancia en nuestra Hacienda. Para nosotros es fundamental conocer tu opinión para seguir mejorando y ofrecer la mejor experiencia posible.</p>
                
                <p>¿Podrías dedicarnos un minuto para dejarnos tu reseña?</p>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${feedbackUrl}" style="background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-family: sans-serif; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);">Dejar mi Reseña</a>
                </div>

                <p style="font-size: 14px; text-align: center; color: #78716c;">
                    Ref: <span style="font-family: monospace; color: #059669;">${booking.id}</span>
                </p>

                <hr style="border: none; border-top: 1px solid #f5f5f4; margin: 30px 0;" />

                <div style="font-size: 12px; color: #a8a29e; text-align: center;">
                    <p>&copy; 2026 Hacienda La Herrería - Fusagasugá, Colombia</p>
                    <p>Si no autorizaste este correo, por favor contáctanos.</p>
                </div>
            </div>
        `;

        console.log(`📧 Attempting to send feedback email to: ${booking.email}`);

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'reservas@laherreria.co',
            to: [booking.email.trim()],
            subject: '¿Cómo fue tu experiencia en Hacienda La Herrería?',
            html: emailHtml,
        });

        if (emailError) {
            console.error('❌ Resend API error:', JSON.stringify(emailError, null, 2));
            return NextResponse.json({
                success: true,
                warning: 'Token generado pero falló el envío del correo.',
                emailError: emailError.message
            });
        }

        console.log('✅ Feedback email sent successfully:', emailData?.id);

        return NextResponse.json({
            success: true,
            message: 'Solicitud de feedback enviada correctamente.'
        });

    } catch (error: any) {
        console.error('❌ Critical error in feedback request API:', error);
        return NextResponse.json({ error: `Error interno: ${error.message}` }, { status: 500 });
    }
}
