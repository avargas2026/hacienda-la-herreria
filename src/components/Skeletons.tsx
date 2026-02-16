'use client';

import Skeleton from './Skeleton';

export function CardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 h-full">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
            <Skeleton className="w-3/4 h-6 mx-auto mb-4" />
            <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4 mx-auto" />
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="w-1/3 h-4" />
                        <Skeleton className="w-1/2 h-3" />
                    </div>
                    <Skeleton className="w-20 h-8 rounded-full" />
                </div>
            ))}
        </div>
    );
}
