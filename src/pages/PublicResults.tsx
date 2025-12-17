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
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="text-center max-w-2xl relative z-10">
                    <div className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                        <span className="text-8xl relative z-10 animate-bounce block filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">⏳</span>
                    </div>
                    <h1 className="heading-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-float">
                        Les résultats arrivent bientôt...
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
                        Le jury est en train de délibérer. <br />
                        <span className="text-indigo-400 font-medium">La tension monte !</span>
                    </p>

                    <div className="card p-8 border-indigo-500/30 bg-slate-900/50 backdrop-blur-xl max-w-md mx-auto transform hover:scale-105 transition-transform duration-500">
                        <div className="flex justify-between items-center text-sm text-indigo-300 mb-3 font-medium tracking-wide">
                            <span>PROGRESSION DU JURY</span>
                            <span className="animate-pulse">EN COURS</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-slide-right rounded-full w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 overflow-x-hidden relative font-outfit">
            {/* Background ambient light */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] opacity-40"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] opacity-30"></div>
            </div>

            <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
                {!revealed ? (
                    <div className="animate-float py-16 min-h-[60vh] flex flex-col justify-center items-center">
                        <div className="flex items-center gap-8 mb-12">
                            <img src="/Rise.png" alt="RISE Logo" className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-300" />
                            <div className="h-16 w-[2px] bg-slate-700/50 rounded-full"></div>
                            <img src="/insi.png" alt="INSI Logo" className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-300" />
                        </div>

                        <div className="mb-8 inline-block p-4 px-6 rounded-full bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-xl">
                            <span className="text-xs md:text-sm font-mono text-indigo-300 uppercase tracking-[0.3em] font-bold">
                                {currentEvent?.name || 'Hackathon 2024'}
                            </span>
                        </div>

                        <h1 className="heading-1 text-5xl md:text-7xl mb-12 bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent px-4 py-2 drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)] tracking-tight leading-none max-w-4xl">
                            Résultats Finaux
                        </h1>

                        <button
                            onClick={handleReveal}
                            className="group relative inline-flex items-center justify-center px-8 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full focus:outline-none hover:scale-105 shadow-[0_0_50px_rgba(79,70,229,0.4)] hover:shadow-[0_0_80px_rgba(147,51,234,0.6)] ring-1 ring-white/20 hover:ring-white/40"
                        >
                            <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform duration-300"></span>
                            <span className="text-xl tracking-wide">Découvrir le classement</span>
                            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out"></div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in">
                        <header className="mb-16 flex flex-col items-center">
                            <div className="flex items-center gap-6 mb-8 opacity-80 hover:opacity-100 transition-opacity">
                                <img src="/Rise.png" alt="RISE Logo" className="h-16 md:h-20 object-contain" />
                                <div className="h-10 w-[1px] bg-slate-700"></div>
                                <img src="/insi.png" alt="INSI Logo" className="h-16 md:h-20 object-contain" />
                            </div>

                            <div className="inline-block relative">
                                <h1 className="heading-1 text-5xl md:text-7xl bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4 filter drop-shadow-[0_5px_15px_rgba(245,158,11,0.4)] tracking-tight">
                                    Classement Général
                                </h1>
                                <div className="absolute -inset-10 bg-amber-500/20 blur-[100px] rounded-full -z-10 opacity-50"></div>
                            </div>
                            <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                                Félicitations à toutes les équipes pour leur travail exceptionnel !
                            </p>
                        </header>

                        <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-20">
                            {sortedTeams.map((team, index) => {
                                const isPodium = index < 3;
                                const delay = index * 200;

                                return (
                                    <div
                                        key={team.id}
                                        className={`
                                            ranking-card group flex items-center p-5 md:p-6 rounded-2xl border backdrop-blur-xl transform transition-all duration-700
                                            ${isPodium
                                                ? 'bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-amber-500/20 hover:border-amber-500/50 shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                                                : 'bg-slate-900/60 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/80 shadow-lg'
                                            }
                                            opacity-0
                                        `}
                                        style={{
                                            animation: `slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${delay}ms`
                                        }}
                                    >
                                        <div className={`
                                            flex-shrink-0 w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center rounded-xl text-4xl md:text-5xl font-bold mr-6 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500
                                            ${index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-white border-2 border-amber-200 ring-4 ring-amber-500/20 shadow-amber-900/50' :
                                                index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white border-2 border-slate-200 ring-4 ring-slate-400/20 shadow-slate-900/50' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-2 border-amber-600 ring-4 ring-amber-800/20 shadow-amber-900/50' :
                                                        'bg-slate-800 text-slate-500 border border-slate-700'}
                                        `}>
                                            <span className="relative z-10 drop-shadow-md">{index + 1}</span>
                                            {isPodium && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                            )}
                                            {isPodium && <div className="absolute inset-0 bg-white/20 animate-[shimmer_3s_infinite]"></div>}
                                            {!isPodium && (
                                                <span className="text-[10px] font-mono mt-1 text-slate-600">RANK</span>
                                            )}
                                        </div>

                                        <div className="flex-1 text-left min-w-0 flex flex-col justify-center h-full py-1">
                                            <h3 className={`text-2xl md:text-3xl font-bold db-1 truncate mb-1 leading-tight ${isPodium ? 'text-white' : 'text-slate-300'}`}>
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${isPodium ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    Projet
                                                </span>
                                                <p className={`text-sm md:text-base font-medium tracking-wide truncate ${isPodium ? 'text-amber-200/60' : 'text-slate-500'}`}>
                                                    {team.email || 'Participation 2024'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right pl-4 border-l border-white/5 ml-4">
                                            <div className="relative">
                                                <div className={`text-3xl md:text-5xl font-black bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 leading-none ${isPodium ? 'from-amber-100 to-amber-400' : 'from-indigo-400 to-purple-400'}`}>
                                                    {team.score.toFixed(2)}
                                                </div>
                                                {isPodium && <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}
                                            </div>
                                            <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
                                                Points
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
                        transform: translateY(60px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
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
