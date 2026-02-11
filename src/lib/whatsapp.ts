export function generateWhatsAppLink(details: {
    bookingId?: string;
    dates?: string;
    guests?: number;
    total?: string;
    name?: string;
    email?: string;
    phone?: string;
    nights?: number;
    pricePerNight?: string;
}) {
    const phoneNumber = '573150322241';
    let message = '';

    if (details.bookingId) {
        message = `Hola, estoy interesado en validar disponibilidad:\n\n`;
        message += `👤 Nombre: ${details.name}\n`;
        message += `📧 Correo: ${details.email}\n`;
        message += `📱 Celular: ${details.phone}\n\n`;
        message += `📅 Fechas: ${details.dates} (${details.nights} noches)\n`;
        message += `👥 Huéspedes: ${details.guests}\n`;
        message += `💵 Valor por noche: ${details.pricePerNight}\n`;
        message += `💰 Total estimado: ${details.total}`;
    } else {
        message = "Hola, me gustaría más información sobre reservas en Hacienda La Herrería.";
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
