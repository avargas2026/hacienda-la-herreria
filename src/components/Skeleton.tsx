'use client';

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-stone-200 rounded-md ${className}`}
            aria-hidden="true"
        />
    );
}
