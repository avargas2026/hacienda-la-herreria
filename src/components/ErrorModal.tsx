'use client';

interface ErrorDetail {
    field: string;
    message: string;
}

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    details?: ErrorDetail[];
}

export default function ErrorModal({ isOpen, onClose, title = 'Error', message, details }: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <p className="text-stone-600 mb-4">{message}</p>
                )}

                {/* Error Details */}
                {details && details.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Errores de validación:</p>
                        <ul className="space-y-2">
                            {details.map((detail, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <div>
                                        <span className="font-medium text-red-900">{detail.field}:</span>{' '}
                                        <span className="text-red-700">{detail.message}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Entendido
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
