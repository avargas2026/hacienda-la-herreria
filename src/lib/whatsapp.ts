export function generateWhatsAppLink(details: {
    bookingId?: string;
    dates?: string;
    guests?: number;
    total?: string;
    name?: string;
}) {
    const phone = '573150322241';
    let message = '';

    if (details.bookingId) {
        message = `Hola, quiero confirmar mi reserva con ID: *${details.bookingId}*.\n\n`;
        message += `📅 Fechas: ${details.dates}\n`;
        message += `👥 Huéspedes: ${details.guests}\n`;
        message += `💰 Total: ${details.total}\n\n`;
        message += `A nombre de: ${details.name}`;
    } else {
        message = "Hola, me gustaría más información sobre reservas en Hacienda La Herrería.";
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
