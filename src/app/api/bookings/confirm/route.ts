import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { confirmBookingSchema, formatZodError } from '@/lib/schemas';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Placeholder if env not set

export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input with Zod
        const validation = confirmBookingSchema.safeParse(body);

        if (!validation.success) {
            console.error('Validation error:', formatZodError(validation.error));
            return NextResponse.json(
                {
                    error: 'Datos inválidos',
                    details: formatZodError(validation.error),
                },
                { status: 400 }
            );
        }

        // Use validated data
        const { bookingId, email, name, dates, total } = validation.data;

        // Detect language
        const isEnglish = name.toUpperCase().includes('[EN]');
        const cleanName = name.replace(/ \[EN\]/i, '').trim();

        // 1. Update status in Supabase
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
        }

        // Parse dates (assumes "StartDate - EndDate" format)
        const [startDate, endDate] = dates.split(' - ');

        // 2. Send confirmation email
        try {
            if (process.env.RESEND_API_KEY) {
                const subject = isEnglish
                    ? 'Your Booking is Confirmed! - Hacienda La Herrería'
                    : '¡Tu Reserva está Confirmada! - Hacienda La Herrería';

                const contentSpanish = `
                    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                        <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #059669; font-size: 28px; margin: 0;">Hacienda La Herrería</h1>
                                <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Un espacio de naturaleza y desconexión</p>
                            </div>

                            <div style="border-top: 2px solid #059669; padding-top: 30px;">
                                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                    Apreciado(a) <strong>${cleanName}</strong>,
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
                            <p>Fusagasuga, Cundinamarca - Colombia</p>
                        </div>
                    </div>
                `;

                const contentEnglish = `
                    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                        <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #059669; font-size: 28px; margin: 0;">Hacienda La Herrería</h1>
                                <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">A space of nature and disconnection</p>
                            </div>

                            <div style="border-top: 2px solid #059669; padding-top: 30px;">
                                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                    Dear <strong>${cleanName}</strong>,
                                </p>
                                
                                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                    It is a pleasure to welcome you to this space of nature and disconnection.
                                </p>

                                <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                    <p style="margin: 0 0 15px 0; color: #374151; font-size: 15px;">
                                        <strong style="color: #059669;">📅 Reserved Dates:</strong><br/>
                                        From <strong>${startDate}</strong> to <strong>${endDate}</strong>
                                    </p>
                                    <p style="margin: 0; color: #374151; font-size: 15px;">
                                        <strong style="color: #059669;">💰 Total Value:</strong> <strong style="font-size: 18px;">${total}</strong>
                                    </p>
                                </div>

                                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                                    We are excited to welcome you. If you have any additional questions, please feel free to reply to this email or write to us on WhatsApp at <strong>+57 315 032 2241</strong>.
                                </p>

                                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                        Sincerely,<br/>
                                        <strong style="color: #059669;">The Hacienda La Herrería Team</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                            <p>Fusagasuga, Cundinamarca - Colombia</p>
                        </div>
                    </div>
                `;

                await resend.emails.send({
                    from: 'Hacienda La Herrería <reservas@laherreria.co>',
                    to: email,
                    subject: subject,
                    html: isEnglish ? contentEnglish : contentSpanish
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
