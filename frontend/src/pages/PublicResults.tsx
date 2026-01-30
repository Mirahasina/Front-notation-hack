import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateResults, areAllTeamsScored } from '../utils/calculations';
import * as XLSX from 'xlsx';
import { Download, Trophy, Users, Star, Medal, AlertCircle } from 'lucide-react';

export const PublicResults = () => {
    const { isAdmin } = useAuth();
    const { teams, users, teamScores, criteria, events, currentEventId, isLoading, error, refresh } = useData();
    const [revealed, setRevealed] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const currentEvent = useMemo(() =>
        events.find(e => e.id === currentEventId),
        [events, currentEventId]
    );

    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

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

    const handleExport = () => {
        setIsExporting(true);
        try {
            const data = sortedTeams.map((team, index) => {
                const row: any = {
                    'Rang': index + 1,
                    'Équipe': team.name,
                    'Email': team.email || 'N/A',
                    'Track': team.track || 'Standard',
                    'Note Finale': team.score.toFixed(2),
                };

                criteria.forEach(c => {
                    const avgScore = teamScores
                        .filter(ts => ts.team === team.id && ts.scores[c.id] !== undefined)
                        .reduce((acc, ts, _, arr) => acc + (ts.scores[c.id] || 0) / arr.length, 0);

                    row[`${c.name} (Max ${c.max_score}, Poids ${c.weight})`] = avgScore.toFixed(2);
                });

                const comments = teamScores
                    .filter(ts => ts.team === team.id && ts.global_comments)
                    .map(ts => {
                        const juryName = ts.jury_username || users.find(u => u.id === ts.jury)?.username || 'Jury';
                        return `[${juryName}]: ${ts.global_comments}`;
                    })
                    .join(' | ');

                row['Commentaires Jurys'] = comments;

                return row;
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Résultats RISE');

            const colWidths = [
                { wch: 5 },
                { wch: 30 },
                { wch: 25 },
                { wch: 15 },
                { wch: 12 },
                ...criteria.map(() => ({ wch: 20 })),
                { wch: 100 }
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `resultats_rise_${currentEvent?.name.replace(/\s+/g, '_') || 'export'}.xlsx`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const totalExpectedEvaluations = teams.length * juries.length;
    const currentEvaluations = teamScores.filter(ts => ts.event === currentEventId).length;
    const progressPercentage = totalExpectedEvaluations > 0
        ? Math.min(100, Math.round((currentEvaluations / totalExpectedEvaluations) * 100))
        : 0;

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-red-100 border border-red-100 max-w-lg w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Données indisponibles</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button
                        onClick={() => refresh()}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        Réessayer la connexion
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading && !revealed) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy size={20} className="text-blue-600" />
                    </div>
                </div>
                <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Chargement des scores...</p>
            </div>
        );
    }

    if (!allScored && !revealed) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden relative">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="text-center max-w-3xl relative z-10 p-8">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 animate-bounce-slow">
                        <Trophy size={40} className="text-yellow-500" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Délibération
                        </span><br />
                        en cours...
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-xl mx-auto font-light">
                        Les jurys finalisent leurs notes. La tension monte alors que nous approchons du verdict final !
                    </p>

                    {/* Progress Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 max-w-lg mx-auto transform transition-all hover:scale-105 duration-500">
                        <div className="flex justify-between items-end mb-4">
                            <div className="text-left">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Progression globale</p>
                                <p className="text-3xl font-black text-slate-900">{progressPercentage}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Évaluations</p>
                                <p className="text-lg font-bold text-slate-900">{currentEvaluations} <span className="text-slate-400">/</span> {totalExpectedEvaluations}</p>
                            </div>
                        </div>

                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            En attente de la validation finale
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes bounce-slow {
                        0%, 100% { transform: translateY(-5%); }
                        50% { transform: translateY(5%); }
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 3s infinite ease-in-out;
                    }
                `}</style>
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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleReveal}
                                className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-slate-900 rounded-full focus:outline-none hover:scale-105 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30"
                            >
                                <span className="text-xl tracking-wide">Découvrir le classement</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="inline-flex items-center justify-center px-8 py-5 font-bold text-slate-700 transition-all duration-300 bg-white border-2 border-slate-200 rounded-full focus:outline-none hover:bg-slate-50 hover:border-slate-300 shadow-md gap-3 disabled:opacity-50"
                                >
                                    <Download size={24} className={isExporting ? 'animate-bounce' : ''} />
                                    <span>{isExporting ? 'Export...' : 'Export Excel'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in pb-24">
                        <header className="flex flex-col items-center mb-12">
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
                                Vue agrégée des scores de toutes les équipes.
                            </p>
                        </header>

                        {/* Summary Stats */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
                            <div className="bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Équipes</p>
                                    <p className="text-2xl font-black text-slate-900">{teams.length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Medal size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Moyenne</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {(sortedTeams.reduce((acc, t) => acc + t.score, 0) / (sortedTeams.length || 1)).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Top Score</p>
                                    <p className="text-2xl font-black text-slate-900">{sortedTeams[0]?.score.toFixed(1) || '0.0'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Podium View */}
                        <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-20 px-4 min-h-[400px]">
                            {/* 2nd Place */}
                            {sortedTeams[1] && (
                                <div className="order-2 md:order-1 w-full md:w-80 flex flex-col items-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                                    <div className="relative w-full aspect-square max-w-[200px] mb-4 group">
                                        <div className="absolute inset-0 bg-slate-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative w-full h-full bg-slate-50 border-4 border-slate-200 rounded-full flex flex-col items-center justify-center shadow-xl">
                                            <span className="text-6xl font-black text-slate-300">2</span>
                                            <Trophy size={32} className="text-slate-400 mt-2" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
                                        <h3 className="text-xl font-bold text-slate-800 truncate mb-1">{sortedTeams[1].name}</h3>
                                        <p className="text-slate-500 text-sm mb-4">{sortedTeams[1].email}</p>
                                        <div className="text-3xl font-black text-slate-900">{sortedTeams[1].score.toFixed(2)} pts</div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {sortedTeams[0] && (
                                <div className="order-1 md:order-2 w-full md:w-96 flex flex-col items-center -mt-12 z-10 animate-slide-up">
                                    <div className="relative w-full aspect-square max-w-[240px] mb-6 group">
                                        <div className="absolute inset-0 bg-amber-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                        <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 border-4 border-amber-300 rounded-full flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                            <span className="text-8xl font-black text-amber-500 drop-shadow-sm">1</span>
                                            <Trophy size={48} className="text-amber-500 mt-2 animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-amber-900/10 border border-amber-100 w-full text-center relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                                        <h3 className="text-2xl font-black text-slate-900 truncate mb-2">{sortedTeams[0].name}</h3>
                                        <p className="text-slate-500 font-medium mb-6">{sortedTeams[0].email}</p>
                                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-yellow-600">
                                            {sortedTeams[0].score.toFixed(2)} <span className="text-lg text-slate-400 font-bold">pts</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {sortedTeams[2] && (
                                <div className="order-3 w-full md:w-80 flex flex-col items-center animate-slide-up" style={{ animationDelay: '400ms' }}>
                                    <div className="relative w-full aspect-square max-w-[200px] mb-4 group">
                                        <div className="absolute inset-0 bg-orange-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative w-full h-full bg-orange-50/50 border-4 border-orange-200 rounded-full flex flex-col items-center justify-center shadow-xl">
                                            <span className="text-6xl font-black text-orange-300">3</span>
                                            <Trophy size={32} className="text-orange-400 mt-2" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-300"></div>
                                        <h3 className="text-xl font-bold text-slate-800 truncate mb-1">{sortedTeams[2].name}</h3>
                                        <p className="text-slate-500 text-sm mb-4">{sortedTeams[2].email}</p>
                                        <div className="text-3xl font-black text-slate-900">{sortedTeams[2].score.toFixed(2)} pts</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List for the rest */}
                        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                            <h3 className="text-center text-slate-400 font-bold uppercase tracking-widest text-sm mb-8">Suite du classement</h3>
                            {sortedTeams.slice(3).map((team, index) => {
                                const realIndex = index + 3;
                                return (
                                    <div
                                        key={team.id}
                                        className="bg-white border border-slate-100 rounded-xl flex items-center p-4 hover:shadow-md transition-shadow animate-slide-up"
                                        style={{ animationDelay: `${(index + 3) * 100}ms` }}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center font-bold text-slate-400 bg-slate-50 rounded-lg mr-6">
                                            {realIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">{team.name}</h3>
                                            <p className="text-sm text-slate-500">{team.email || 'Participation'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-slate-900 text-lg">{team.score.toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Points</div>
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
