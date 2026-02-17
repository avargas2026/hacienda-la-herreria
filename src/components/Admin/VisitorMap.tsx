'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { supabase } from '@/lib/supabaseClient';
import worldData from '@/data/world.json';

interface VisitData {
    name: string;
    value: number;
}

export default function VisitorMap() {
    const [tooltipContent, setTooltipContent] = useState("");
    const [data, setData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { data: visits, error } = await supabase
                    .from('visits')
                    .select('country');

                if (error) throw error;

                const counts: { [key: string]: number } = {};
                visits?.forEach((v: any) => {
                    if (v.country) {
                        const key = v.country;
                        counts[key] = (counts[key] || 0) + 1;
                    }
                });

                const stats = Object.keys(counts).map(key => ({
                    name: key,
                    value: counts[key]
                }));
                setData(stats);
            } catch (err) {
                console.error("Error fetching map data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, []);

    const colorScale = scaleQuantile<string>()
        .domain(data.length > 0 ? data.map(d => d.value) : [0, 1])
        .range([
            "#d1fae5",
            "#a7f3d0",
            "#6ee7b7",
            "#34d399",
            "#10b981",
            "#059669"
        ]);

    return (
        <div className="relative">
            <div className="w-full bg-stone-50 rounded-xl overflow-hidden relative shadow-inner border border-stone-100" style={{ height: '450px' }}>
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-50/50 backdrop-blur-sm">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {tooltipContent && (
                    <div className="absolute top-4 right-4 z-50 bg-stone-900/95 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm shadow-2xl font-medium animate-fadeIn border border-white/10">
                        {tooltipContent}
                    </div>
                )}

                <ComposableMap
                    projectionConfig={{ scale: 145, center: [0, 10] }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup zoom={1} maxZoom={3}>
                        <Geographies geography={worldData}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const countryName = geo.properties.name || geo.properties.NAME;
                                    const cur = data.find(s =>
                                        s.name.toLowerCase() === countryName?.toLowerCase() ||
                                        (countryName === "USA" && s.name === "United States") ||
                                        (countryName === "England" && s.name === "United Kingdom")
                                    );

                                    return (
                                        <Geography
                                            key={geo.rsmKey || countryName}
                                            geography={geo}
                                            fill={cur ? colorScale(cur.value) : "#cbd5e1"}
                                            stroke="#ffffff"
                                            strokeWidth={0.5}
                                            onMouseEnter={() => {
                                                const val = cur ? cur.value : 0;
                                                setTooltipContent(`${countryName}: ${val} visitas`);
                                            }}
                                            onMouseLeave={() => setTooltipContent("")}
                                            style={{
                                                default: { outline: "none", transition: 'all 250ms' },
                                                hover: { fill: "#10b981", outline: "none", cursor: "pointer" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.1s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-3px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
