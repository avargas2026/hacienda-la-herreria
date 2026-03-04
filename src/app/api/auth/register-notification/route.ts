import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { headers } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const headersList = headers();

    try {
        const body = await request.json();
        const { name, email, password, phone } = body;

        // Prepare Image Attachment (Embed)
        const imagePath = path.join(process.cwd(), 'public', 'Herreria1.jpg');
        let imageContent = '';
        try {
            const buffer = fs.readFileSync(imagePath);
            imageContent = buffer.toString('base64');
        } catch (e) {
            console.error("Could not read image for email attachment", e);
        }

        // Extract metadata from request headers
        const rawIp = headersList.get('x-forwarded-for') || '127.0.0.1';

        // Prioritize IPv4 over IPv6
        const getIPv4 = (ipString: string) => {
            const ips = ipString.split(',').map(i => i.trim());
            // Look for standard IPv4 pattern
            const ipv4 = ips.find(ip => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip));
            if (ipv4) return ipv4;

            // Handle IPv4-mapped IPv6 (::ffff:1.2.3.4)
            const mapped = ips.find(ip => ip.includes('::ffff:'));
            if (mapped) return mapped.split('::ffff:')[1];

            return ips[0]; // Fallback to first IP (might be IPv6)
        };

        const ip = getIPv4(rawIp);
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Geo-location headers (provided by platforms like Vercel or Cloudflare if available)
        const city = headersList.get('x-vercel-ip-city') || 'Desconocida';
        const country = headersList.get('x-vercel-ip-country') || 'Desconocido';
        const geo = `${city}, ${country}`;

        // Generate Readable ID: YYYYMMDD-XXXX
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const readableId = `${dateStr}-${randomSuffix}`;

        if (process.env.RESEND_API_KEY) {
            // 1. Generate Confirmation Link from Supabase (this also creates the user if they don't exist)
            console.log(`🔗 Generating confirmation link for: ${email}`);
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'signup',
                email: email,
                password: password,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
                    data: {
                        full_name: name,
                        readable_id: readableId,
                        registration_ip: ip,
                        registration_geo: geo,
                        registration_user_agent: userAgent,
                        ...(phone && { phone })
                    }
                }
            });

            if (linkError) {
                console.error("❌ Supabase Link Generation Error:", linkError);
                if (linkError.message.toLowerCase().includes('already registered')) {
                    return NextResponse.json({ success: false, error: 'already_exists' }, { status: 400 });
                }
                return NextResponse.json({ success: false, error: linkError.message }, { status: 500 });
            }

            const confirmationLink = linkData?.properties?.action_link;

            // 2. Send Welcome Email to USER
            console.log(`📧 Sending welcome/confirmation email to user: ${email}`);
            await resend.emails.send({
                from: 'reservas@laherreria.co',
                to: email,
                subject: `🌿 ¡Bienvenido a Hacienda La Herrería, ${name}!`,
                html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #059669; font-size: 28px; margin-bottom: 10px;">¡Bienvenido a La Herrería!</h1>
                        <p style="font-size: 18px; color: #666;">Estamos felices de tenerte con nosotros.</p>
                    </div>

                    <div style="margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: #f3f4f6;">
                        <img src="cid:herreria-hero" 
                             alt="Hacienda La Herrería" 
                             style="width: 100%; height: auto; min-height: 200px; display: block; object-fit: cover;" />
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <p style="font-size: 16px; margin-bottom: 25px;">Hola <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; margin-bottom: 25px;">Para completar tu registro y poder realizar tus reservas, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${confirmationLink || '#'}" 
                               style="background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                               Confirmar mi cuenta
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">Si el botón no funciona, puedes copiar y paster este enlace en tu navegador:</p>
                        <p style="font-size: 12px; color: #059669; word-break: break-all;">${confirmationLink}</p>
                    </div>
                </div>`,
                attachments: imageContent ? [
                    {
                        filename: 'Herreria1.jpg',
                        content: imageContent,
                        contentId: 'herreria-hero'
                    }
                ] : []
            });

            // 3. Send Notification Email to ADMIN
            console.log(`📧 Sending admin notification for: ${email}`);
            await resend.emails.send({
                from: 'reservas@laherreria.co',
                to: 'reservas@laherreria.co',
                subject: `👤 Nuevo Registro de Usuario: ${name}`,
                html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                        <h2 style="color: #059669;">👤 Nuevo Usuario Registrado</h2>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <strong>ID Usuario:</strong> ${readableId}<br>
                            <strong>Nombre:</strong> ${name}<br>
                            <strong>Correo:</strong> ${email}<br>
                            <strong>IP:</strong> ${ip}<br>
                            <strong>Ubicación:</strong> ${geo}<br>
                            ${phone ? `<strong>Celular:</strong> ${phone}<br>` : ''}
                            <strong>Navegador:</strong> ${userAgent}<br>
                            <strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
                               style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                               Ver en el panel de Administración
                            </a>
                        </div>
                    </div>`
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Global Notification Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
