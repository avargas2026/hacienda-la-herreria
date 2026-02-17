import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        const { reference, dates, guests, total, bookingId } = body;

        console.log('📧 Sending Bre-B Alert to Admin:', reference);

        // 1. Enviar Email a la administración
        const { data, error: emailError } = await resend.emails.send({
            from: 'reservas@laherreria.co',
            to: 'reservas@laherreria.co',
            subject: `🚨 REPORTE DE PAGO BRE-B: ${reference}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
                    <h2 style="color: #4f46e5; font-style: italic;">Nuevo Pago Reportado (Bre-B)</h2>
                    <p>Se ha recibido una notificación de pago. Por favor validar en el dashboard de administración.</p>
                    <div style="background: #f5f3ff; padding: 20px; border-radius: 16px; border: 1px solid #ddd6fe;">
                        <p><strong>Cliente:</strong> ${body.customerName || 'N/A'}</p>
                        <p><strong>Email Cliente:</strong> ${body.customerEmail || 'N/A'}</p>
                        <p><strong>Celular Cliente:</strong> ${body.customerPhone || 'N/A'}</p>
                        <hr style="border: 0; border-top: 1px solid #ddd6fe; margin: 15px 0;" />
                        <p><strong>Referencia:</strong> ${reference}</p>
                        <p><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
                        <p><strong>Fechas:</strong> ${dates}</p>
                        <p><strong>Huéspedes:</strong> ${guests}</p>
                        <p style="font-size: 18px; color: #4338ca;"><strong>Monto:</strong> ${total}</p>
                    </div>
                    <p style="font-size: 12px; color: #57534e; margin-top: 20px;">
                        Acción requerida: Ingresa a "Gestión de Reservas" y verifica este pago para confirmar la reserva.
                    </p>
                </div>
            `
        });

        // 2. Si existe un bookingId real, actualizar el estado en DB a 'payment_reported'
        if (bookingId && (bookingId.startsWith('BK-') || bookingId.length > 20)) {
            const { error: dbError } = await supabase
                .from('bookings')
                .update({ status: 'payment_reported' })
                .eq('id', bookingId);

            if (dbError) console.error('❌ DB Update Error (Bre-B Notify):', dbError);
        }

        if (emailError) {
            console.error('❌ Resend Error (Lab):', emailError);
            return NextResponse.json({ error: emailError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });

    } catch (error: any) {
        console.error('❌ Global Server Error (Lab Notification):', error.message);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
