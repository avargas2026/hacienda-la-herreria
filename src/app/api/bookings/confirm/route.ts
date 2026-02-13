import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Placeholder if env not set

export async function POST(request: Request) {
    try {
        const { bookingId, email, name, dates, total } = await request.json();

        // 1. Update status in Supabase
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
        }

        // Parse dates
        const [startDate, endDate] = dates.split(' - ');

        // 2. Send confirmation email
        try {
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Hacienda La Herrería <reservas@laherreria.co>',
                    to: email,
                    subject: '¡Tu Reserva está Confirmada! - Hacienda La Herrería',
                    html: `
                        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #059669; font-size: 28px; margin: 0;">Hacienda La Herrería</h1>
                                    <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Un espacio de naturaleza y desconexión</p>
                                </div>

                                <div style="border-top: 2px solid #059669; padding-top: 30px;">
                                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                        Apreciado(a) <strong>${name}</strong>,
                                    </p>
                                    
                                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                        Es un gusto poder contar con su presencia en este espacio de naturaleza y desconexión.
                                    </p>

                                    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                        <p style="margin: 0 0 15px 0; color: #374151; font-size: 15px;">
                                            <strong style="color: #059669;">📅 Fechas reservadas:</strong><br/>
                                            Desde el <strong>${startDate}</strong> hasta el <strong>${endDate}</strong>
                                        </p>
                                        <p style="margin: 0; color: #374151; font-size: 15px;">
                                            <strong style="color: #059669;">💰 Valor total:</strong> <strong style="font-size: 18px;">${total}</strong>
                                        </p>
                                    </div>

                                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                        Estamos emocionados de recibirle. Si tiene alguna pregunta adicional, no dude en responder a este correo o escribirnos por WhatsApp al <strong>+57 315 032 2241</strong>.
                                    </p>

                                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                            Atentamente,<br/>
                                            <strong style="color: #059669;">El equipo de Hacienda La Herrería</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                                <p>Silvania, Cundinamarca - Colombia</p>
                            </div>
                        </div>
                    `
                });
                console.log(`✅ Confirmation email sent successfully to ${email}`);
            } else {
                console.warn('⚠️ RESEND_API_KEY not configured in environment variables');
                console.warn('⚠️ Email will NOT be sent. Please configure RESEND_API_KEY or use WhatsApp notification.');
                console.log('📧 Email details:', {
                    to: email,
                    name,
                    dates: `${startDate} - ${endDate}`,
                    total
                });
                console.log('💡 Tip: Add RESEND_API_KEY to .env.local to enable email delivery');
            }
        } catch (emailError) {
            console.error('❌ Error sending email:', emailError);
            // Don't fail the request if email fails, but log it.
        }

        return NextResponse.json({
            success: true,
            message: 'Booking confirmed',
            emailSent: !!process.env.RESEND_API_KEY
        });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
