'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { Star, CheckCircle, XCircle, Trash2, Filter, MessageSquare, MapPin, User, Calendar, ExternalLink } from 'lucide-react';
import ErrorModal from '@/components/ErrorModal';
import ConfirmModal from '@/components/ConfirmModal';
import SuccessModal from '@/components/SuccessModal';
import { ListSkeleton } from '@/components/Skeletons';

interface Review {
    id: string;
    booking_id: string;
    user_id: string | null;
    customer_name: string | null;
    customer_location: string | null;
    rating: number;
    comment: string;
    recommend: boolean;
    publish_authorized: boolean;
    status: 'pending' | 'approved' | 'rejected';
    is_featured: boolean;
    created_at: string;
}

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
    const [adminEmail, setAdminEmail] = useState<string>('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) setAdminEmail(session.user.email);
        };
        getSession();
    }, []);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching reviews:', error);
            setErrorModal({ isOpen: true, title: 'Error', message: 'No se pudieron cargar las reseñas.' });
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    }, [filterStatus]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const oldReview = reviews.find(r => r.id === id);
            const { error } = await supabase
                .from('reviews')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Audit
            await fetch('/api/admin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: status === 'approved' ? 'APPROVE_REVIEW' : 'REJECT_REVIEW',
                    entity_type: 'reviews',
                    entity_id: id,
                    old_data: oldReview,
                    new_data: { ...oldReview, status },
                    adminEmail
                })
            });

            setSuccessModal({
                isOpen: true,
                title: 'Estado Actualizado',
                message: `La reseña ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente.`
            });
            fetchReviews();
        } catch (err: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: err.message });
        }
    };

    const handleToggleFeatured = async (id: string, is_featured: boolean) => {
        try {
            const oldReview = reviews.find(r => r.id === id);
            const { error } = await supabase
                .from('reviews')
                .update({ is_featured, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Audit
            await fetch('/api/admin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: is_featured ? 'FEATURE_REVIEW' : 'UNFEATURE_REVIEW',
                    entity_type: 'reviews',
                    entity_id: id,
                    old_data: oldReview,
                    new_data: { ...oldReview, is_featured },
                    adminEmail
                })
            });

            fetchReviews();
        } catch (err: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: err.message });
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const oldReview = reviews.find(r => r.id === deletingId);
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', deletingId);

            if (error) throw error;

            // Audit
            await fetch('/api/admin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'DELETE_REVIEW',
                    entity_type: 'reviews',
                    entity_id: deletingId,
                    old_data: oldReview,
                    adminEmail
                })
            });

            setDeletingId(null);
            setSuccessModal({ isOpen: true, title: 'Eliminado', message: 'Reseña eliminada permanentemente.' });
            fetchReviews();
        } catch (err: any) {
            setErrorModal({ isOpen: true, title: 'Error', message: err.message });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Filters */}
            <div className="bg-white dark:bg-stone-900 rounded-[32px] p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-stone-800 dark:text-stone-100 italic">Gestión de Residuo y Feedback</h3>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Reseñas de Clientes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-stone-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="pending">Pendientes 🟡</option>
                        <option value="approved">Aprobados ✅</option>
                        <option value="rejected">Rechazados ❌</option>
                    </select>
                    <button
                        onClick={fetchReviews}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800">
                    <ListSkeleton />
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 p-20 rounded-[40px] border border-stone-100 dark:border-stone-800 text-center">
                    <MessageSquare className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                    <p className="text-stone-400 italic">No se encontraron reseñas con los filtros seleccionados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden group hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300">
                            <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6">
                                {/* Side Info */}
                                <div className="lg:w-1/4 flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{review.customer_name || 'Anónimo'}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                                <MapPin className="w-3 h-3" />
                                                {review.customer_location || 'Ubicación no provista'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex text-amber-400 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : 'text-stone-200 dark:text-stone-800'}`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {review.status === 'approved' ? 'Aprobada' : review.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                                            </span>
                                            {review.publish_authorized && (
                                                <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">Publicable</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-stone-50 dark:border-stone-800/50">
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Referencia</p>
                                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                                            {review.booking_id}
                                            <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                                            <span className="text-stone-400 font-sans italic">{format(parseISO(review.created_at), 'dd/MM/yy')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="lg:w-2/4 flex flex-col">
                                    <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-2xl italic text-stone-700 dark:text-stone-300 relative">
                                        <div className="absolute -top-3 -left-2 text-4xl text-emerald-200 dark:text-emerald-800 font-serif overflow-hidden h-8 w-8 leading-none">“</div>
                                        <p className="text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <p className="text-xs text-stone-500 font-medium">
                                            ¿Recomienda? {review.recommend ? <span className="text-emerald-600 font-bold">Sí ✅</span> : <span className="text-amber-600 font-bold">No ⚠️</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="lg:w-1/4 flex flex-row lg:flex-col justify-end gap-3 border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-stone-800 pt-6 lg:pt-0 lg:pl-6">
                                    {review.status !== 'approved' && (
                                        <button
                                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl text-xs font-bold transition-all active:scale-95"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Aprobar
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white dark:bg-stone-800 border border-red-100 dark:border-red-900/30 text-red-500 p-3 rounded-2xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95"
                                        >
                                            <XCircle className="w-4 h-4" /> Rechazar
                                        </button>
                                    )}
                                    <div className="hidden lg:block h-px bg-stone-50 dark:bg-stone-800 my-2"></div>

                                    <div className="flex flex-1 lg:flex-none gap-2">
                                        <button
                                            onClick={() => handleToggleFeatured(review.id, !review.is_featured)}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all ${review.is_featured
                                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-500'
                                                }`}
                                        >
                                            <Star className={`w-4 h-4 ${review.is_featured ? 'fill-amber-500' : ''}`} /> {review.is_featured ? 'Destacada' : 'Destacar'}
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(review.id)}
                                            className="p-3 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Eliminar Reseña"
                message="Esta acción es permanente y eliminará la reseña de la base de datos."
                type="danger"
            />
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
            />
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                title={errorModal.title}
                message={errorModal.message}
            />
        </div>
    );
}
