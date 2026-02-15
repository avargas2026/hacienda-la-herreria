export interface WhatsAppDetails {
    bookingId?: string;
    dates?: string;
    guests?: number;
    total?: string;
    name?: string;
    email?: string;
    phone?: string;
    nights?: number;
    pricePerNight?: string;
    rooms?: number;
    camping?: boolean;
    specialEvent?: boolean;
    notes?: string;
    totalUSD?: string;
    language?: 'es' | 'en';
}

export function generateWhatsAppLink(details: WhatsAppDetails) {
    const phoneNumber = '573150322241';
    const lang = details.language || 'es';
    let message = '';

    if (lang !== 'en') {
        if (details.specialEvent) {
            message = `Hola, estoy interesado en un Evento Especial en La Herrería:\n\n`;
            message += `👤 Nombre: ${details.name}\n`;
            message += `📧 Correo: ${details.email}\n`;
            message += `📱 Celular: ${details.phone}\n`;
            message += `✨ Tipo: Evento Especial\n`;
        } else if (details.bookingId) {
            message = `Hola, estoy interesado en validar disponibilidad:\n\n`;
            message += `👤 Nombre: ${details.name}\n`;
            message += `📧 Correo: ${details.email}\n`;
            message += `📱 Celular: ${details.phone}\n\n`;
            message += `📅 Fechas: ${details.dates} (${details.nights} noches)\n`;
            message += `👥 Huéspedes: ${details.guests}\n`;
            message += `🛏️ Habitaciones: ${details.rooms}\n`;
            if (details.camping) message += `⛺ Camping solicitado: Sí\n`;
            message += `💰 Total estimado: ${details.total}\n`;
            message += `🆔 Ref: ${details.bookingId}`;
        } else {
            message = "Hola, me gustaría más información sobre reservas en Hacienda La Herrería.";
        }
    } else {
        // English
        if (details.specialEvent) {
            message = `Hello, I am interested in a Special Event at La Herrería:\n\n`;
            message += `👤 Name: ${details.name}\n`;
            message += `📧 Email: ${details.email}\n`;
            message += `📱 Phone: ${details.phone}\n`;
            message += `✨ Type: Special Event\n`;
        } else if (details.bookingId) {
            message = `Hello, I would like to check availability:\n\n`;
            message += `👤 Name: ${details.name}\n`;
            message += `📧 Email: ${details.email}\n`;
            message += `📱 Phone: ${details.phone}\n\n`;
            message += `📅 Dates: ${details.dates} (${details.nights} nights)\n`;
            message += `👥 Guests: ${details.guests}\n`;
            message += `🛏️ Rooms: ${details.rooms}\n`;
            if (details.camping) message += `⛺ Camping requested: Yes\n`;
            message += `💰 Estimated Total: ${details.total} COP`;
            if (details.totalUSD) message += ` (${details.totalUSD})`;
            message += `\n🆔 Ref: ${details.bookingId}`;
        } else {
            message = "Hello, I would like more information about reservations at Hacienda La Herrería.";
        }
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
