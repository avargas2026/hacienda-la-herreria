/**
 * Utility to generate HTML email templates with premium branding
 */

interface EmailData {
    name: string;
    dates?: string;
    total?: string;
    isEnglish: boolean;
}

const COLORS = {
    emerald: '#059669',
    stone50: '#fafaf9',
    stone100: '#f5f5f4',
    stone200: '#e7e5e4',
    stone600: '#57534e',
    stone800: '#1c1917',
    white: '#ffffff',
};

const LOGO_URL = "https://www.laherreria.co/logo.jpeg";
const HERO_URL = "https://www.laherreria.co/Herreria1.jpg";

const sharedStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: ${COLORS.stone600};
`;

const wrapperStyle = `
    background-color: ${COLORS.stone100};
    padding: 40px 20px;
    margin: 0;
    width: 100%;
`;

const containerStyle = `
    max-width: 600px;
    margin: 0 auto;
    background-color: ${COLORS.white};
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

export function generateBookingConfirmationEmail({ name, dates, total, isEnglish }: EmailData) {
    const title = isEnglish ? 'Your Booking is Confirmed!' : '¡Tu Reserva está Confirmada!';
    const intro = isEnglish
        ? `It is a pleasure to have your presence in this space of nature and disconnection. We have received your booking and it is now fully confirmed in our system.`
        : `Es un gusto poder contar con su presencia en este espacio de naturaleza y desconexión. Hemos recibido su reserva y ahora está plenamente confirmada en nuestro sistema.`;

    const detailsTitle = isEnglish ? '📅 RESERVED DATES' : '📅 FECHAS RESERVADAS';
    const amountTitle = isEnglish ? '💰 TOTAL AMOUNT' : '💰 VALOR TOTAL';

    const footerText = isEnglish
        ? 'If you have any questions, feel free to contact us via WhatsApp or reply to this email.'
        : 'Si tiene alguna pregunta, no dude en contactarnos vía WhatsApp o respondiendo a este correo.';

    const signature = isEnglish ? 'The Hacienda La Herrería Team' : 'El equipo de Hacienda La Herrería';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; ${sharedStyles}">
            <div style="${wrapperStyle}">
                <div style="${containerStyle}">
                    <!-- Logo Header -->
                    <div style="padding: 30px; text-align: center; border-bottom: 1px solid ${COLORS.stone100};">
                        <img src="${LOGO_URL}" alt="Logo" width="80" height="80" style="border-radius: 40px; margin-bottom: 15px;">
                        <div style="font-family: 'Times New Roman', Times, serif; font-size: 24px; color: ${COLORS.stone800}; font-style: italic; font-weight: bold;">
                            Hacienda La Herrería
                        </div>
                    </div>

                    <!-- Hero Image -->
                    <div style="width: 100%; height: 200px; overflow: hidden;">
                        <img src="${HERO_URL}" alt="Hero" width="600" style="width: 100%; object-fit: cover;">
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px;">
                        <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 28px; color: ${COLORS.emerald}; margin-bottom: 25px; font-style: italic; font-weight: normal;">
                            ${title}
                        </h2>
                        
                        <p style="margin-bottom: 20px;">
                            ${isEnglish ? 'Dear' : 'Apreciado(a)'} <strong style="color: ${COLORS.stone800};">${name}</strong>,
                        </p>
                        
                        <p style="margin-bottom: 30px;">${intro}</p>

                        <!-- Details Box -->
                        <div style="background-color: ${COLORS.stone50}; border-radius: 16px; padding: 30px; border: 1px solid ${COLORS.stone100}; margin-bottom: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="55%" style="vertical-align: top;">
                                        <div style="font-size: 10px; font-weight: bold; color: ${COLORS.stone600}; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase;">
                                            ${detailsTitle}
                                        </div>
                                        <div style="font-size: 16px; font-weight: bold; color: ${COLORS.stone800};">
                                            ${dates}
                                        </div>
                                    </td>
                                    <td width="45%" style="vertical-align: top;">
                                        <div style="font-size: 10px; font-weight: bold; color: ${COLORS.stone600}; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase;">
                                            ${amountTitle}
                                        </div>
                                        <div style="font-size: 18px; font-weight: bold; color: ${COLORS.emerald};">
                                            ${total}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <p style="margin-bottom: 30px;">${footerText}</p>

                        <!-- WhatsApp Action -->
                        <div style="text-align: center;">
                            <a href="https://wa.me/573150322241" style="background-color: ${COLORS.emerald}; color: ${COLORS.white}; padding: 15px 35px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);">
                                ${isEnglish ? 'WhatsApp Support' : 'Soporte WhatsApp'}
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid ${COLORS.stone100};">
                            <p style="font-family: 'Times New Roman', Times, serif; font-style: italic; margin: 0; color: ${COLORS.stone800};">
                                ${isEnglish ? 'Sincerely,' : 'Atentamente,'}<br>
                                <strong style="font-style: normal;">${signature}</strong>
                            </p>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div style="background-color: ${COLORS.stone50}; padding: 20px; text-align: center; font-size: 10px; color: ${COLORS.stone600}; letter-spacing: 1px; text-transform: uppercase;">
                        Hacienda La Herrería • Fusagasugá • Colombia
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function generateBookingCancellationEmail({ name, isEnglish }: EmailData) {
    const title = isEnglish ? 'Booking Cancellation' : 'Cancelación de Reserva';
    const message = isEnglish
        ? `We inform you that your reservation at Hacienda La Herrería has been cancelled. If this was an error or you have any questions, please contact us.`
        : `Le informamos que su reserva en Hacienda La Herrería ha sido cancelada. Si esto ha sido un error o tiene alguna duda, por favor contáctenos.`;

    const signature = isEnglish ? 'The Hacienda La Herrería Team' : 'El equipo de Hacienda La Herrería';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; ${sharedStyles}">
            <div style="${wrapperStyle}">
                <div style="${containerStyle}">
                    <div style="padding: 30px; text-align: center; border-bottom: 1px solid ${COLORS.stone100};">
                        <img src="${LOGO_URL}" alt="Logo" width="80" height="80" style="border-radius: 40px; margin-bottom: 15px;">
                        <div style="font-family: 'Times New Roman', Times, serif; font-size: 24px; color: ${COLORS.stone800}; font-style: italic; font-weight: bold;">
                            Hacienda La Herrería
                        </div>
                    </div>

                    <div style="padding: 40px;">
                        <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 28px; color: #ef4444; margin-bottom: 25px; font-style: italic; font-weight: normal;">
                            ${title}
                        </h2>
                        
                        <p style="margin-bottom: 20px;">
                            ${isEnglish ? 'Dear' : 'Apreciado(a)'} <strong style="color: ${COLORS.stone800};">${name}</strong>,
                        </p>
                        
                        <p style="margin-bottom: 40px;">${message}</p>

                        <div style="text-align: center;">
                            <a href="https://wa.me/573150322241" style="background-color: ${COLORS.stone800}; color: ${COLORS.white}; padding: 15px 35px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
                                ${isEnglish ? 'Contact Support' : 'Contactar Soporte'}
                            </a>
                        </div>

                        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid ${COLORS.stone100};">
                            <p style="font-family: 'Times New Roman', Times, serif; font-style: italic; margin: 0; color: ${COLORS.stone800};">
                                ${isEnglish ? 'Sincerely,' : 'Atentamente,'}<br>
                                <strong style="font-style: normal;">${signature}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}
