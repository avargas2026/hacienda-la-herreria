'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Star, MessageSquare, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
    id: string;
    customer_name: string | null;
    customer_location: string | null;
    rating: number;
    comment: string;
    created_at: string;
}

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('id, customer_name, customer_location, rating, comment, created_at')
                .eq('status', 'approved')
                .eq('publish_authorized', true)
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setReviews(data);
            }
            setLoading(false);
        };

        fetchReviews();
    }, []);

    const next = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

    if (loading || reviews.length === 0) return null;

    return (
        <section className="py-24 px-6 bg-[#FDFCFB] dark:bg-stone-950 overflow-hidden relative transition-colors duration-300">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-100/50 dark:bg-stone-900/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block"
                    >
                        Testimonios Reales
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif italic text-stone-800 dark:text-stone-100"
                    >
                        La Experiencia de Nuestros Huéspedes
                    </motion.h2>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[64px] p-8 md:p-20 shadow-2xl shadow-stone-200/50 dark:shadow-none relative"
                        >
                            <Quote className="absolute top-12 left-12 w-16 h-16 text-emerald-50 dark:text-emerald-900/30 -z-1" />

                            <div className="flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                                <div className="flex-1 space-y-8">
                                    <div className="flex text-amber-400 gap-1 justify-center md:justify-start">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < reviews[currentIndex].rating ? 'fill-amber-400' : 'text-stone-100 dark:text-stone-800'}`} />
                                        ))}
                                    </div>

                                    <p className="text-xl md:text-2xl text-stone-700 dark:text-stone-300 leading-relaxed font-serif italic">
                                        &quot;{reviews[currentIndex].comment}&quot;
                                    </p>

                                    <div className="flex items-center gap-4 justify-center md:justify-start">
                                        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-800 dark:text-stone-100 text-lg">
                                                {reviews[currentIndex].customer_name || 'Huésped Satisfecho'}
                                            </p>
                                            <p className="text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">
                                                {reviews[currentIndex].customer_location || 'Visitante'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {reviews.length > 1 && (
                        <div className="flex justify-center md:justify-end gap-4 mt-12 px-8">
                            <button
                                onClick={prev}
                                className="w-14 h-14 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-90"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={next}
                                className="w-14 h-14 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-90"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 grayscale contrast-125 transition-all">
                    {/* Logo placeholders or brand icons could go here */}
                </div>
            </div>
        </section>
    );
}
