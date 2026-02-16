'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitorTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const visitIdRef = useRef<string | null>(null);
    const durationRef = useRef(0);
    const sectionTimesRef = useRef<Record<string, number>>({});
    const pathsRef = useRef<string[]>([]);
    const lastSyncRef = useRef<number>(0);

    // Initialize visit ID
    useEffect(() => {
        const initVisit = async () => {
            if (typeof window === 'undefined') return;

            let visitId = sessionStorage.getItem('current_visit_id');
            const storedDate = sessionStorage.getItem('visit_date');

            // New session if no ID or it's from a different day
            const isNewSession = !visitId || (storedDate && new Date(storedDate).toDateString() !== new Date().toDateString());

            if (isNewSession) {
                try {
                    const response = await fetch('https://ipapi.co/json/');
                    const data = await response.json();

                    const referrer = document.referrer;
                    const utmSource = searchParams.get('utm_source');
                    const utmMedium = searchParams.get('utm_medium');
                    const finalReferrer = utmSource ? `${utmSource} / ${utmMedium || 'link'}` : (referrer || 'Directo');

                    const { data: insertData, error } = await supabase.from('visits').insert({
                        ip: data.ip,
                        city: data.city,
                        country: data.country_name,
                        browser: navigator.userAgent,
                        os: navigator.platform,
                        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                        metadata: {
                            paths: [pathname],
                            last_path: pathname,
                            sections: {}
                        },
                        duration: 0,
                        referrer: finalReferrer
                    }).select().single();

                    if (!error && insertData?.id) {
                        visitIdRef.current = insertData.id;
                        sessionStorage.setItem('current_visit_id', insertData.id);
                        sessionStorage.setItem('visit_date', new Date().toISOString());
                        pathsRef.current = [pathname];
                    }
                } catch (error) {
                    console.error('Error init tracking:', error);
                }
            } else {
                visitIdRef.current = visitId;
                // Fetch current state if needed, but session usually suffices for short duration
            }
        };

        initVisit();
    }, [pathname, searchParams]); // Satisfy eslint dependencies

    // Track paths
    useEffect(() => {
        if (pathname && !pathsRef.current.includes(pathname)) {
            pathsRef.current.push(pathname);
        }
    }, [pathname]);

    // Main interval for duration and sections
    useEffect(() => {
        const updateVisit = async (visitId: string) => {
            try {
                await supabase.from('visits').update({
                    duration: durationRef.current,
                    metadata: {
                        last_path: pathname,
                        paths: pathsRef.current,
                        sections: sectionTimesRef.current
                    }
                }).eq('id', visitId);
                lastSyncRef.current = durationRef.current;
            } catch (err) {
                console.error("Error syncing visit time:", err);
            }
        };

        const interval = setInterval(() => {
            durationRef.current += 1;

            // Section detection
            const sections = document.querySelectorAll('section[id], div[id]');
            let activeSection = null;
            let maxVisibility = 0;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                if (visibleHeight > maxVisibility) {
                    maxVisibility = visibleHeight;
                    activeSection = section.id;
                }
            });

            if (activeSection) {
                sectionTimesRef.current[activeSection] = (sectionTimesRef.current[activeSection] || 0) + 1;
            }

            // Periodic Sync (Every 10 seconds)
            if (durationRef.current % 10 === 0 && visitIdRef.current) {
                updateVisit(visitIdRef.current);
            }
        }, 1000);

        // Final sync attempt on unmount or before close
        const handleUnload = () => {
            if (visitIdRef.current && durationRef.current > lastSyncRef.current) {
                const visitId = visitIdRef.current;
                const body = JSON.stringify({
                    duration: durationRef.current,
                    metadata: {
                        last_path: pathname,
                        paths: pathsRef.current,
                        sections: sectionTimesRef.current
                    }
                });
                // Using beacon for reliability on unload
                // Note: Supabase JS doesn't support beacon directly easily, 
                // but we can use native fetch with keepalive
                fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/visits?id=eq.${visitId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body,
                    keepalive: true
                });
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
            if (visitIdRef.current) updateVisit(visitIdRef.current);
        };
    }, [pathname]);

    return null;
}
