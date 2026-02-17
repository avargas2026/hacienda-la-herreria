'use client';

import { useLanguage } from '@/context/LanguageContext';
import { generateBookingConfirmationEmail } from '@/lib/emailTemplates';

export default function EmailPreviewPage() {
    const { language } = useLanguage();
    const isEnglish = language === 'en';

    const mockHtml = generateBookingConfirmationEmail({
        name: isEnglish ? 'John Doe' : 'Juan Pérez',
        dates: '2024-03-20 → 2024-03-22',
        total: '$850.000 COP',
        isEnglish
    });

    return (
        <div className="min-h-screen bg-stone-100 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto mb-8 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-800 text-sm flex items-center gap-3">
                <span className="text-xl">✨</span>
                <p>
                    Esta es una <strong>vista previa exacta</strong> del correo que recibirán los huéspedes.
                    El diseño está optimizado para dispositivos móviles y guarda la estética de la Hacienda.
                </p>
            </div>

            {/* Render the actual HTML in a container */}
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-stone-200">
                <div dangerouslySetInnerHTML={{ __html: mockHtml }} />
            </div>

            <div className="mt-8 text-center text-stone-400 text-sm">
                Nota: Los botones y enlaces son funcionales en la vista previa.
            </div>
        </div>
    );
}
