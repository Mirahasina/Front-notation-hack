import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { TeamPerformanceRadar } from '../../components/TeamPerformanceRadar';
import { Target, MessageSquare, Info, Zap, LayoutDashboard, Trophy, LogOut } from 'lucide-react';

export const TeamDashboard = () => {
    const { currentTeam, logout } = useAuth();
    const { teams, events, teamScores, criteria, users } = useData();
    const [activeTab, setActiveTab] = useState<'home' | 'instructions' | 'results'>('home');
    const navigate = useNavigate();

    const currentEvent = events.find(e => e.id === currentTeam?.event);
    const myScores = teamScores.filter(ts => ts.team === currentTeam?.id && ts.locked);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!currentTeam) {
        return (
            <DashboardLayout userType="team" userName="Équipe" onLogout={handleLogout}>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-slate-700 mb-4">Erreur</h1>
                    <p className="text-slate-500">Aucune équipe connectée</p>
                </div>
            </DashboardLayout>
        );
    }

    const platformName = `${currentTeam.name.replace(/\s+/g, '_')}`;

    const now = new Date();
    const eventDate = currentEvent ? new Date(currentEvent.date) : new Date();
    const resultsDay = new Date(eventDate);
    resultsDay.setDate(resultsDay.getDate() + 1);
    const isResultsDay = now >= resultsDay;

    const getRank = () => {
        if (!currentEvent) return null;

        const teamTotals = teams
            .filter(t => t.event === currentEvent.id)
            .map(t => {
                const results = teamScores.filter(ts => ts.team === t.id && ts.locked);
                if (results.length === 0) return { id: t.id, total: 0 };

                let totalWeighted = 0;
                results.forEach(rs => {
                    Object.entries(rs.scores).forEach(([critId, score]) => {
                        const crit = criteria.find(c => c.id === critId);
                        totalWeighted += (score * (crit?.weight || 1.0));
                    });
                });
                return { id: t.id, total: totalWeighted / results.length }; 
            })
            .sort((a, b) => b.total - a.total);

        const rank = teamTotals.findIndex(t => t.id === currentTeam.id) + 1;
        return rank > 0 ? rank : null;
    };

    const myRank = getRank();

    const radarData = criteria
        .filter(c => c.event === currentEvent?.id)
        .map(crit => {
            const myCritScores = myScores.map(s => Number(s.scores[crit.id]) || 0);
            const myAverage = myCritScores.length > 0
                ? myCritScores.reduce((a, b) => a + b, 0) / myCritScores.length
                : 0;

            const allCritScores = teamScores
                .filter(s => s.locked && s.event === currentEvent?.id)
                .map(s => Number(s.scores[crit.id]) || 0);
            const globalAverage = allCritScores.length > 0
                ? allCritScores.reduce((a, b) => a + b, 0) / allCritScores.length
                : 0;

            return {
                subject: crit.name,
                A: (myAverage / crit.max_score) * 100,
                B: (globalAverage / crit.max_score) * 100,
                fullMark: 100
            };
        });

    const orderedTeams = [...teams].sort((a, b) => (a.passage_order || 999) - (b.passage_order || 999));
    const juriesCount = users.filter(u => u.role === 'jury').length;

    const currentlyPitching = orderedTeams.find(team => {
        const scoredCount = teamScores.filter(ts => ts.team === team.id && ts.locked).length;
        return team.passage_order && scoredCount < juriesCount;
    });

    const myPosition = currentTeam.passage_order || 0;
    const currentPosition = currentlyPitching?.passage_order || 0;
    const teamsAhead = myPosition > 0 && currentPosition > 0
        ? Math.max(0, myPosition - currentPosition)
        : myPosition > 0 ? myPosition - 1 : 0;

    const teamBefore = myPosition > 1 ? orderedTeams.find(t => t.passage_order === myPosition - 1) : null;
    const teamAfter = orderedTeams.find(t => t.passage_order === myPosition + 1);

    return (
        <DashboardLayout userType="team" userName={currentTeam.name} onLogout={handleLogout} hideSidebar={true}>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src="/Rise.png" alt="Rise" className="h-12 w-12 object-contain bg-white p-2 rounded-2xl shadow-sm border border-slate-100" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{currentTeam.name}</h1>
                        </div>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutDashboard size={20} />
                            Accueil
                        </button>
                        <button
                            onClick={() => setActiveTab('instructions')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'instructions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Info size={20} />
                            Consignes
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'results' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Trophy size={20} />
                            Résultats
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-red-500 hover:bg-red-50"
                        >
                            <LogOut size={20} />
                            Quitter
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'home' && (
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-3xl font-black text-slate-900">{currentTeam.name}</h2>
                            </div>

                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-slate-500 font-medium font-mono text-sm">{platformName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                    <span className="text-slate-500 font-medium font-mono text-sm">{currentTeam.email || currentTeam.generated_email}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Passage</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-orange-500">#{currentTeam.passage_order || '?'}</span>
                                        {currentTeam.passage_time && (
                                            <span className="text-sm font-bold text-orange-400">à {currentTeam.passage_time}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full w-fit">
                                <span className="text-xs font-bold text-slate-400">{myScores.length}/{juriesCount} votes</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Chronologie des passages</p>
                                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400">
                                        LIVE
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {teamBefore && (
                                        <div className="flex items-center gap-4 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-500">
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold">
                                                {teamBefore.passage_order}
                                            </div>
                                            <span className="text-sm font-medium">{teamBefore.name}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center w-8 gap-1 opacity-20">
                                        <div className="w-0.5 h-4 bg-white rounded-full"></div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                            <span className="text-xl font-black">{myPosition || '?'}</span>
                                        </div>
                                        <div className="flex-1">
                                            {currentlyPitching?.id === currentTeam.id ? (
                                                <div>
                                                    <h3 className="text-2xl font-black italic tracking-tight text-emerald-400 uppercase">C'est votre tour !</h3>
                                                    <p className="text-slate-400 text-xs font-medium uppercase mt-1">Rejoignez la scène</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight uppercase italic">
                                                        {teamsAhead === 0 ? "Passage terminé" : `${teamsAhead} Équipes avant vous`}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs font-medium uppercase mt-1">
                                                        {teamsAhead === 0 ? "Merci pour votre participation" : "Préparez votre matériel"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center w-8 gap-1 opacity-20">
                                        <div className="w-0.5 h-4 bg-white rounded-full"></div>
                                    </div>

                                    {teamAfter && (
                                        <div className="flex items-center gap-4 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-500">
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold">
                                                {teamAfter.passage_order}
                                            </div>
                                            <span className="text-sm font-medium">{teamAfter.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Zap className="absolute -bottom-8 -right-8 w-64 h-64 text-white/5 rotate-12 group-hover:text-indigo-500/10 transition-all duration-700" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                            <h4 className="text-indigo-900 font-bold mb-4">Accès Rapide</h4>
                            <div className="space-y-3">
                                <button onClick={() => setActiveTab('instructions')} className="w-full text-left p-4 bg-white rounded-2xl border border-indigo-200 hover:border-indigo-400 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-indigo-900">Consignes</span>
                                        <Info size={18} className="text-indigo-300 group-hover:text-indigo-500" />
                                    </div>
                                </button>
                                <button onClick={() => setActiveTab('results')} className="w-full text-left p-4 bg-white rounded-2xl border border-indigo-200 hover:border-indigo-400 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-indigo-900">Résultats</span>
                                        <Trophy size={18} className="text-indigo-300 group-hover:text-indigo-500" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                            <h4 className="text-slate-900 font-bold mb-4 italic">Besoin d'aide ?</h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Adressez-vous aux organisateurs portant des badges <span className="font-black text-indigo-600">RISE COMMUNITY</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'instructions' && (
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-black text-slate-900 mb-8">Instructions officielles</h2>

                        {currentEvent?.instructions ? (
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {currentEvent.instructions}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <div className="flex gap-6">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-200">1</div>
                                        <div className="pt-2">
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Identifiants Équipe</h4>
                                            <p className="text-slate-500 leading-relaxed italic">
                                                Votre identifiant unique est <strong>{platformName}</strong>. Utilisez-le pour vos commits Git et vos documents de présentation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-200">2</div>
                                        <div className="pt-2">
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Dépôt GitHub</h4>
                                            <p className="text-slate-500 leading-relaxed italic">
                                                L'URL de votre dépôt doit suivre ce format : <br />
                                                <code className="text-indigo-600 font-mono text-sm bg-indigo-50 px-2 py-1 rounded">https://github.com/[votre-profil]/{platformName}</code>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-200">3</div>
                                        <div className="pt-2">
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Pitch & Chronomètre</h4>
                                            <p className="text-slate-500 leading-relaxed italic">
                                                Vous avez 5 minutes de pitch suivies de 3 minutes de Q&A. Soyez présents dans la zone d'attente 10 minutes avant votre passage (prévu à {currentTeam.passage_time || 'l\'heure indiquée'}).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="space-y-8">
                    {myScores.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Analysis Card */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <Target className="text-indigo-500" size={24} />
                                    Radar de Performance
                                </h3>
                                <TeamPerformanceRadar data={radarData} />
                                <p className="text-xs text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
                                    Vos points forts vs Moyenne de l'événement
                                </p>
                            </div>

                            {/* Rankings & Scores Card (Conditional) */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                {isResultsDay ? (
                                    <div className="relative z-10 space-y-8">
                                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                            <Trophy className="text-amber-400" size={24} />
                                            Classement Final
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-6xl font-black text-amber-400">#{myRank}</span>
                                                <span className="text-xl font-bold">sur {teams.length} équipes</span>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Score Total</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black italic">
                                                        {(myScores.reduce((acc, curr) => acc + (curr.total || 0), 0) / myScores.length).toFixed(2)}
                                                    </span>
                                                    <span className="text-slate-400 font-bold">points</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative z-10 h-full flex flex-col justify-center">
                                        <h3 className="text-2xl font-bold mb-4">Classement indisponible</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Les scores chiffrés et le classement final seront révélés le lendemain de l'événement.
                                            Revenez le <strong>{resultsDay.toLocaleDateString()}</strong> pour découvrir votre rang !
                                        </p>
                                        <div className="mt-8 p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                            <p className="text-sm font-medium text-indigo-300 italic">
                                                Tip : Utilisez le radar à gauche pour identifier vos axes de progression en attendant.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <Trophy className="absolute -bottom-8 -right-8 w-64 h-64 text-white/5 -rotate-12" />
                            </div>

                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <MessageSquare className="text-indigo-500" size={24} />
                                    Feedbacks des Jurys
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {myScores.map((score, idx) => (
                                        <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-slate-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="px-3 py-1 bg-white rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-200">Jury #{idx + 1}</span>
                                            </div>

                                            {score.global_comments ? (
                                                <p className="text-slate-700 font-medium italic leading-relaxed text-lg mb-6">"{score.global_comments}"</p>
                                            ) : (
                                                <p className="text-slate-400 italic mb-6">Aucun commentaire global.</p>
                                            )}

                                            {Object.entries(score.criterion_comments).length > 0 && (
                                                <div className="pt-6 border-t border-slate-200 space-y-4">
                                                    {Object.entries(score.criterion_comments).map(([critId, comment]) => {
                                                        const critName = criteria.find(c => c.id === critId)?.name || 'Critère';
                                                        return (
                                                            <div key={critId}>
                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">{critName}</span>
                                                                <p className="text-slate-600 text-sm font-medium leading-snug">{comment}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-8">
                                <Trophy size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 italic">Résultats en attente</h3>
                            <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                                Vos feedbacks et analyses apparaîtront ici dès que les jurys auront terminé leurs évaluations. Soyez patients !
                            </p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};
