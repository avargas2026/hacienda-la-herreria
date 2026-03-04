import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        const { email } = body;

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'Falta configuración de correo' }, { status: 500 });
        }

        // 1. Generate Recovery Link from Supabase
        console.log(`🔗 Generating recovery link for: ${email}`);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/actualizar-password` }
        });

        if (linkError) {
            console.error("❌ Supabase Recovery Link Error:", linkError);
            return NextResponse.json({ error: 'No se pudo generar el enlace de recuperación. ¿El correo es correcto?' }, { status: 400 });
        }

        // Build our OWN link using token_hash — bypass Supabase's redirect (which uses hash fragments)
        const tokenHash = linkData?.properties?.hashed_token;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        if (!tokenHash) {
            console.error("❌ No token_hash found in generateLink response. Keys:", Object.keys(linkData?.properties || {}));
            return NextResponse.json({ error: 'Error generando token de recuperación.' }, { status: 500 });
        }

        // Build a direct link to OUR callback with token_hash as query param
        const recoveryLink = `${siteUrl}/api/auth/callback?token_hash=${tokenHash}&type=recovery&next=/actualizar-password`;
        console.log(`🔑 Token hash found. Recovery link built.`);

        // 2. Send Recovery Email via Resend
        console.log(`📧 Sending recovery email to: ${email}`);
        await resend.emails.send({
            from: 'reservas@laherreria.co',
            to: email,
            subject: `🔐 Recuperación de Contraseña - Hacienda La Herrería`,
            html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #059669; font-size: 28px; margin-bottom: 10px;">Recuperar Contraseña</h1>
                    <p style="font-size: 18px; color: #666;">Has solicitado restablecer tu contraseña.</p>
                </div>
                
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px; margin-bottom: 25px;">Hola,</p>
                    <p style="font-size: 16px; margin-bottom: 25px;">Para cambiar tu contraseña, por favor haz clic en el siguiente botón. Este enlace es válido por 24 horas:</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${recoveryLink || '#'}" 
                           style="background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                           Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="font-size: 12px; color: #059669; word-break: break-all;">${recoveryLink}</p>
                </div>
                
                <div style="margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} Hacienda La Herrería. Todos los derechos reservados.</p>
                </div>
            </div>`
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Global Recovery Error:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
