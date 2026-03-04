import { NextResponse } from 'next/server';
import { createChatwootConversation } from '@/lib/chatwoot';
import { Resend } from 'resend';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        const { name, email, phone, bookingRef, guests, checkIn, checkOut, total, specialEvent } = body;

        // Send Notification Email to Admin
        if (process.env.RESEND_API_KEY) {
            try {
                const subject = `🔔 Nueva Entrada de Reserva: ${name}`;
                const messageContent = `Hola, estoy interesado en validar disponibilidad:
🖊️ Nombre: ${name}
📧 Correo: ${email}
📱 Celular: ${phone}
📅 Fechas: ${checkIn} - ${checkOut}
👥 Huéspedes: ${guests}
💰 Total estimado: ${total}
🆔 Referencia: ${bookingRef}
${specialEvent ? '✨ Evento Especial: Sí' : ''}`;

                await resend.emails.send({
                    from: 'reservas@laherreria.co',
                    to: 'reservas@laherreria.co',
                    subject: subject,
                    text: messageContent,
                    html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                        <h2 style="color: #059669;">🔔 Nueva Entrada de Reserva</h2>
                        <p>Se ha recibido una nueva solicitud desde el sitio web:</p>
                        <blockquote style="background: #f3f4f6; padding: 15px; border-left: 5px solid #059669;">
                            ${messageContent.replace(/\n/g, '<br>')}
                        </blockquote>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">Este es un mensaje automático generado por el sistema de Hacienda La Herrería.</p>
                    </div>`
                });
            } catch (emailError) {
                console.error("Admin Email Notification failed", emailError);
            }
        }

        // Send to n8n Webhook
        const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;

        if (n8nWebhookUrl) {
            try {
                const n8nRes = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...body,
                        source: 'laherreria_web'
                    })
                });

                if (n8nRes.ok) {
                    const n8nData = await n8nRes.json();
                    return NextResponse.json({ success: true, n8n_data: n8nData });
                }
            } catch (err) {
                console.error("n8n Webhook failed, falling back to direct Chatwoot", err);
            }
        }

        // Custom Attributes for Chatwoot
        const custom_attributes = {
            booking_ref: bookingRef,
            check_in: checkIn,
            check_out: checkOut,
            guests: Number(guests),
            budget: total,
            special_event: specialEvent
        };

        const result = await createChatwootConversation({
            name,
            email,
            phone,
            custom_attributes
        });

        if (result) {
            return NextResponse.json({ success: true, id: result.id });
        } else {
            return NextResponse.json({ success: false, error: "Failed to create conversation" }, { status: 500 });
        }
    } catch (error) {
        console.error("API Error", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
