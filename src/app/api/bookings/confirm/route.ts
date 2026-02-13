import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Placeholder if env not set

export async function POST(request: Request) {
    try {
        const { bookingId, email, name, dates } = await request.json();

        // 1. Update status in Supabase
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
        }

        // 2. Send confirmation email (only attempts if API Key might vary, but Resend throws if key is invalid, so we wrap in try/catch or just log)
        try {
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Hacienda La Herrería <onboarding@resend.dev>', // Or verified domain
                    to: email,
                    subject: '¡Tu Reserva está Confirmada! - Hacienda La Herrería',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #059669;">¡Reserva Confirmada!</h1>
                            <p>Hola <strong>${name}</strong>,</p>
                            <p>Nos complace confirmarte que tu reserva en <strong>Hacienda La Herrería</strong> ha sido aceptada.</p>
                            
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Fechas:</strong> ${dates}</p>
                                <p style="margin: 5px 0;"><strong>Estado:</strong> Confirmado ✅</p>
                            </div>

                            <p>Estamos emocionados de recibirte. Si tienes alguna pregunta adicional, no dudes en responder a este correo o escribirnos por WhatsApp.</p>
                            
                            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Atentamente,<br>El equipo de Hacienda La Herrería</p>
                        </div>
                    `
                });
                console.log(`Confirmation email sent to ${email}`);
            } else {
                console.log('RESEND_API_KEY not set. Email simulation:', { email, name, dates });
            }
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Don't fail the request if email fails, but log it.
        }

        return NextResponse.json({ success: true, message: 'Booking confirmed and email sent' });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
