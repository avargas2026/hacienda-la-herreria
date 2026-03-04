'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Star, Send, MapPin, User, CheckCircle2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessModal from '@/components/SuccessModal';
import ErrorModal from '@/components/ErrorModal';

export default function FeedbackPage() {
    const { token } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [recommend, setRecommend] = useState<boolean | null>(null);
    const [publishAuthorized, setPublishAuthorized] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerLocation, setCustomerLocation] = useState('');

    const [error, setError] = useState<{ isOpen: boolean, title: string, message: string }>({ isOpen: false, title: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!token) return;

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('feedback_token', token)
                .single();

            if (error || !data) {
                setError({
                    isOpen: true,
                    title: 'Enlace Inválido',
                    message: 'Este enlace de retroalimentación no es válido o ha expirado.'
                });
                setLoading(false);
            } else {
                setBooking(data);
                setCustomerName(data.name);
                setLoading(false);
            }
        };

        fetchBooking();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        try {
            const { error: insertError } = await supabase
                .from('reviews')
                .insert({
                    booking_id: booking.id,
                    user_id: booking.user_id || null,
                    customer_name: customerName,
                    customer_location: customerLocation,
                    rating,
                    comment,
                    recommend: recommend === true,
                    publish_authorized: publishAuthorized,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            // Mark token as used or clear it
            await supabase
                .from('bookings')
                .update({ feedback_token: null })
                .eq('id', booking.id);

            setSubmitted(true);
        } catch (err: any) {
            setError({ isOpen: true, title: 'Error', message: 'No se pudo enviar tu reseña. Por favor intenta más tarde.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-emerald-100 max-w-lg w-full text-center border border-emerald-50"
                >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-serif italic text-stone-800 mb-4">¡Muchas Gracias!</h2>
                    <p className="text-stone-600 leading-relaxed mb-8">
                        Tu reseña ha sido enviada correctamente. Valoramos mucho el tiempo que nos has dedicado para ayudarnos a mejorar.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                        Volver al Inicio
                    </button>
                    <p className="mt-8 text-xs text-stone-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        Hecho con <Heart className="w-3 h-3 text-red-400 fill-red-400" /> por Hacienda La Herrería
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center py-12 px-6">
            <header className="mb-12 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">Tu Opinión nos importa</p>
                <h1 className="text-4xl md:text-5xl font-serif italic text-stone-800">Hacienda La Herrería</h1>
            </header>

            <main className="max-w-2xl w-full">
                <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-2xl shadow-stone-200 border border-stone-100">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Rating */}
                        <div className="text-center space-y-4">
                            <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">¿Cómo calificarías tu estadía?</label>
                            <div className="flex justify-center gap-2 md:gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-all transform active:scale-90"
                                    >
                                        <Star
                                            className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${(hoverRating || rating) >= star
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-stone-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Cuéntanos más detalladamente</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tus comentarios nos ayudan a mejorar..."
                                required
                                className="w-full h-40 bg-stone-50 border-none rounded-[32px] p-6 text-stone-700 placeholder-stone-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none italic"
                            />
                        </div>

                        {/* Recommendation */}
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest text-center">¿Recomendarías nuestro servicio?</p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRecommend(true)}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${recommend === true
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : 'bg-stone-50 border-transparent text-stone-400 hover:bg-stone-100'
                                        }`}
                                >
                                    ¡Sí, claro! ✅
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRecommend(false)}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${recommend === false
                                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                                            : 'bg-stone-50 border-transparent text-stone-400 hover:bg-stone-100'
                                        }`}
                                >
                                    Podría mejorar ⚠️
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nombre
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-stone-700 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Ciudad / País
                                </label>
                                <input
                                    type="text"
                                    value={customerLocation}
                                    onChange={(e) => setCustomerLocation(e.target.value)}
                                    placeholder="Ej: Bogotá, Colombia"
                                    className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-stone-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Authorization */}
                        <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="relative flex items-center pt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={publishAuthorized}
                                        onChange={(e) => setPublishAuthorized(e.target.checked)}
                                        className="w-6 h-6 rounded-lg text-emerald-600 border-stone-200 bg-white focus:ring-emerald-500 transition-all cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm text-stone-600 leading-relaxed font-medium">
                                    Autorizo a que mi reseña pueda ser publicada como referencia en la página web de Hacienda La Herrería. El sistema protegerá mi privacidad mostrando solo mi nombre e iniciales si así lo prefiero.
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${submitting || rating === 0
                                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                        >
                            {submitting ? (
                                <>Enviando...</>
                            ) : (
                                <>Enviar mi Comentario <Send className="w-5 h-5" /></>
                            )}
                        </button>

                    </form>
                </div>

                <footer className="mt-12 text-center text-stone-400 text-xs">
                    <p>Esta es una comunicación oficial de Hacienda La Herrería.</p>
                    <p className="mt-1">Copyright &copy; 2026 • Todos los derechos reservados.</p>
                </footer>
            </main>

            <ErrorModal
                isOpen={error.isOpen}
                onClose={() => {
                    setError({ ...error, isOpen: false });
                    if (error.title === 'Enlace Inválido') router.push('/');
                }}
                title={error.title}
                message={error.message}
            />
        </div>
    );
}
