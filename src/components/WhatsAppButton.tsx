import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = "573150322241"; // Your WhatsApp number
    const message = "Hola, me gustaría más información sobre reservas en Hacienda La Herrería.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle size={32} />
        </Link>
    );
}
