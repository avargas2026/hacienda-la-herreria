'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { supabase } from '@/lib/supabaseClient';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
            const { data: visits, error } = await supabase
                .from('visits')
                .select('country');

            if (error) {
                console.error("Error fetching visits for map", error);
                setLoading(false);
                return;
            }

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
            setLoading(false);
        };

        fetchVisits();
    }, []);

    const maxVal = Math.max(...data.map(d => d.value), 1);

    const colorScale = scaleQuantile<string>()
        .domain(data.map(d => d.value))
        .range([
            "#d1fae5",
            "#a7f3d0",
            "#6ee7b7",
            "#34d399",
            "#10b981",
            "#059669"
        ]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 mt-8 p-6 relative">
            <h2 className="text-lg font-medium text-stone-800 mb-4">Origen de Visitantes</h2>
            {loading ? (
                <div className="h-96 flex items-center justify-center text-stone-400">Cargando mapa...</div>
            ) : (
                <div className="h-[650px] w-full bg-stone-50 rounded-lg overflow-hidden relative">
                    {tooltipContent && (
                        <div className="absolute top-2 right-2 z-10 bg-black/80 text-white px-3 py-1.5 rounded text-sm pointer-events-none shadow-lg">
                            {tooltipContent}
                        </div>
                    )}
                    <ComposableMap projectionConfig={{ scale: 160 }} width={800} height={600}>
                        <ZoomableGroup>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        // Simple matching by name
                                        // Uses country name from visits matching map property NAME
                                        const countryName = geo.properties.name;
                                        const cur = data.find(s => s.name === countryName);
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={cur ? colorScale(cur.value) : "#F5F4F6"}
                                                stroke="#D6D6DA"
                                                strokeWidth={0.5}
                                                onMouseEnter={() => {
                                                    const val = cur ? cur.value : 0;
                                                    setTooltipContent(`${countryName}: ${val} visitas`);
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltipContent("");
                                                }}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: "#F53", outline: "none", cursor: "pointer" },
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
            )}
        </div>
    );
}
