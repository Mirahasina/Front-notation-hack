import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { calculateResults, areAllTeamsScored } from '../utils/calculations';

export const PublicResults = () => {
    const { teams, users, teamScores, criteria, events, currentEventId } = useData();
    const [revealed, setRevealed] = useState(false);

    // Get current event
    const currentEvent = useMemo(() =>
        events.find(e => e.id === currentEventId),
        [events, currentEventId]
    );

    // Filter juries and check if everyone has voted
    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    // Calculate scores and sort teams
    const sortedTeams = useMemo(() => {
        const results = calculateResults(teams, teamScores, juries, criteria);
        return results.map(result => {
            const team = teams.find(t => t.id === result.teamId);
            return {
                ...team,
                ...result,
                id: result.teamId,
                name: result.teamName,
                score: result.totalScore
            };
        });
    }, [teams, teamScores, juries, criteria]);

    const handleReveal = () => {
        setRevealed(true);
    };

    if (!allScored && !revealed) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden relative">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="text-center max-w-2xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-6">
                        Les résultats arrivent...
                    </h1>
                    <p className="text-xl text-slate-500 mb-10 leading-relaxed font-light">
                        Le jury est en train de délibérer. <br />
                        <span className="text-blue-600 font-medium">La tension monte !</span>
                    </p>

                    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 max-w-md mx-auto relative overflow-hidden">
                        <div className="flex justify-between items-center text-sm text-slate-500 mb-3 font-medium tracking-wide">
                            <span>PROGRESSION DU JURY</span>
                            <span className="animate-pulse text-blue-600">EN COURS</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-slide-right rounded-full w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 overflow-x-hidden relative font-sans">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/80 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-50/80 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
                {!revealed ? (
                    <div className="py-16 min-h-[60vh] flex flex-col justify-center items-center">
                        <div className="flex items-center gap-8 mb-12">
                            <img src="/Rise.png" alt="RISE Logo" className="h-24 md:h-32 object-contain hover:scale-105 transition-transform duration-300" />
                            <div className="h-16 w-[2px] bg-slate-200 rounded-full"></div>
                            <img src="/insi.png" alt="INSI Logo" className="h-24 md:h-32 object-contain hover:scale-105 transition-transform duration-300" />
                        </div>

                        <div className="mb-8 inline-block p-3 px-6 rounded-full bg-white shadow-md border border-slate-100">
                            <span className="text-xs md:text-sm font-mono text-slate-500 uppercase tracking-[0.3em] font-bold">
                                {currentEvent?.name || 'Hackathon 2024'}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold mb-12 text-slate-900 tracking-tight leading-none max-w-4xl">
                            Résultats Finaux
                        </h1>

                        <button
                            onClick={handleReveal}
                            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-slate-900 rounded-full focus:outline-none hover:scale-105 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30"
                        >
                            <span className="text-xl tracking-wide">Découvrir le classement</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in">
                        <header className="mb-16 flex flex-col items-center">
                            <div className="flex items-center gap-6 mb-8 opacity-80 hover:opacity-100 transition-opacity">
                                <img src="/Rise.png" alt="RISE Logo" className="h-16 md:h-20 object-contain" />
                                <div className="h-10 w-[1px] bg-slate-200"></div>
                                <img src="/insi.png" alt="INSI Logo" className="h-16 md:h-20 object-contain" />
                            </div>

                            <div className="inline-block relative">
                                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-4 tracking-tight">
                                    Classement Général
                                </h1>
                            </div>
                            <p className="text-slate-500 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                                Félicitations à toutes les équipes pour leur travail exceptionnel !
                            </p>
                        </header>

                        <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-20">
                            {sortedTeams.map((team, index) => {
                                const isPodium = index < 3;
                                const delay = index * 200;

                                return (
                                    <div
                                        key={team.id}
                                        className={`
                                            ranking-card bg-white rounded-2xl flex items-center p-5 md:p-6 transition-all duration-700
                                            ${isPodium
                                                ? 'border-2 border-transparent shadow-xl relative z-10'
                                                : 'border border-slate-100 shadow-sm hover:shadow-md'
                                            }
                                            opacity-0
                                        `}
                                        style={{
                                            animation: `slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${delay}ms`
                                        }}
                                    >
                                        <div className={`
                                            flex-shrink-0 w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center rounded-2xl text-3xl md:text-4xl font-bold mr-6 shadow-sm
                                            ${index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                        'bg-slate-50 text-slate-400 border border-slate-100'}
                                        `}>
                                            <span className="relative z-10">{index + 1}</span>
                                            {!isPodium && (
                                                <span className="text-[10px] font-mono mt-1 text-slate-400 font-normal">RANG</span>
                                            )}
                                        </div>

                                        <div className="flex-1 text-left min-w-0">
                                            <h3 className={`text-xl md:text-2xl font-bold truncate mb-1 ${isPodium ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-500">
                                                    Projet
                                                </span>
                                                <p className="text-sm text-slate-500 truncate">
                                                    {team.email || 'Participation'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Score Visualization */}
                                        <div className="text-right pl-4 ml-4">
                                            <div className="flex flex-col items-end">
                                                <div className={`text-3xl md:text-5xl font-black tabular-nums tracking-tighter leading-none ${isPodium ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {team.score.toFixed(2)}
                                                </div>
                                                <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">
                                                    Points
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-150%) rotate(45deg); }
                    100% { transform: translateX(150%) rotate(45deg); }
                }
                @keyframes slide-right {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};
