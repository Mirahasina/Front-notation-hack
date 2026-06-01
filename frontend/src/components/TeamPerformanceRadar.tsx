import React from 'react';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

interface TeamPerformanceRadarProps {
    data: Array<{
        subject: string;
        A: number;
        B: number;
        fullMark: number;
    }>;
}

export const TeamPerformanceRadar: React.FC<TeamPerformanceRadarProps> = ({ data }) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (data.length === 0 || !isMounted) return (
        <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-slate-50/50 rounded-[2rem]">
            <div className="animate-pulse text-slate-300 font-bold uppercase tracking-widest text-[10px]">Chargement du Radar...</div>
        </div>
    );

    return (
        <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#cbd5e1', fontSize: 10 }}
                    />
                    <Radar
                        name="Votre Équipe"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.5}
                    />
                    <Radar
                        name="Moyenne Événement"
                        dataKey="B"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-bold text-slate-600">Votre Équipe</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-xs font-bold text-slate-600">Moyenne</span>
                </div>
            </div>
        </div>
    );
};
