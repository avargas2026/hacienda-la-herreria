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

    // Create or retrieve visit ID
    useEffect(() => {
        const initVisit = async () => {
            if (typeof window === 'undefined') return;

            // Check session storage
            let visitId = sessionStorage.getItem('current_visit_id');
            const storedDate = sessionStorage.getItem('visit_date');

            // New session if no ID or it's from a different day
            const isNewSession = !visitId || (storedDate && new Date(storedDate).getDate() !== new Date().getDate());

            if (isNewSession) {
                try {
                    const response = await fetch('https://ipapi.co/json/');
                    const data = await response.json();

                    // Capture Referrer and UTMs
                    const referrer = document.referrer;
                    const utmSource = searchParams.get('utm_source');
                    const utmMedium = searchParams.get('utm_medium');
                    const finalReferrer = utmSource ? `${utmSource} / ${utmMedium || 'link'}` : (referrer || 'Direct / None');

                    const { data: insertData, error } = await supabase.from('visits').insert({
                        ip: data.ip,
                        city: data.city,
                        country: data.country_name,
                        browser: navigator.userAgent,
                        os: navigator.platform,
                        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                        metadata: { paths: [pathname] },
                        duration: 0,
                        referrer: finalReferrer
                    }).select().single();

                    if (!error && insertData && insertData.id) {
                        const newId = insertData.id;
                        sessionStorage.setItem('current_visit_id', newId);
                        sessionStorage.setItem('visit_date', new Date().toISOString());
                        visitIdRef.current = newId;
                    }
                } catch (error) {
                    console.error('Error tracking visit:', error);
                }
            } else {
                // If it exists in session, just set the ref
                visitIdRef.current = visitId as string;
            }
        };

        if (!visitIdRef.current) {
            initVisit();
        }
    }, [pathname, searchParams]);

    // Track time and sections
    useEffect(() => {
        const updateVisit = async (visitId: string) => {
            await supabase.from('visits').update({
                duration: durationRef.current,
                metadata: {
                    last_path: pathname,
                    sections: sectionTimesRef.current
                }
            }).eq('id', visitId);
        };

        const interval = setInterval(() => {
            // 1. Increment total duration
            durationRef.current += 1;

            // 2. Track active section
            const sections = document.querySelectorAll('section[id], div[id]');
            let activeSection = 'unknown';
            let maxVisibility = 0;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Calculate how much of the section is visible
                const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);

                if (visibleHeight > maxVisibility) {
                    maxVisibility = visibleHeight;
                    activeSection = section.id || 'unknown';
                }
            });

            if (activeSection !== 'unknown') {
                sectionTimesRef.current[activeSection] = (sectionTimesRef.current[activeSection] || 0) + 1;
            }

            // 3. Sync to Supabase every 5 seconds
            if (durationRef.current % 5 === 0) {
                const currentVisitId = visitIdRef.current || sessionStorage.getItem('current_visit_id');
                if (currentVisitId) {
                    updateVisit(currentVisitId);
                }
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [pathname]);

    return null;
}
