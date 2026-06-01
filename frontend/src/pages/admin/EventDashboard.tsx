import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';
import { Save, LayoutGrid, Info, MessageSquare, CheckCircle2 } from 'lucide-react';

export const EventDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { users, teams, criteria, teamScores, events, currentEventId, updateEvent } = useData();
    const [instructions, setInstructions] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'settings'>('overview');

    const currentEvent = events.find(e => e.id === currentEventId);

    useEffect(() => {
        if (currentEvent) {
            setInstructions(currentEvent.instructions || '');
        }
    }, [currentEvent]);
    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    useEffect(() => {
        if (currentEvent && allScored && currentEvent.status === 'ongoing' && teams.length > 0 && juries.length > 0) {
            updateEvent(currentEvent.id, { status: 'completed' });
        }
    }, [allScored, currentEvent, teams.length, juries.length, updateEvent]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveInstructions = async () => {
        if (currentEvent) {
            await updateEvent(currentEvent.id, { instructions });
        }
    };

    if (!currentEvent) {
        return (
            <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-slate-700 mb-4">Événement non trouvé</h1>
                    <Button variant="primary" onClick={() => navigate('/admin/events')}>
                        ← Retour aux événements
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 leading-tight">{currentEvent.name}</h1>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentEvent.status === 'ongoing' ? 'bg-amber-100 text-amber-600' :
                            currentEvent.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                            {currentEvent.status}
                        </span>
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter mt-1">
                        {new Date(currentEvent.date).toLocaleDateString('fr-FR', {
                            weekday: 'short', day: 'numeric', month: 'short'
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/events')} className="h-9 px-4 rounded-xl border-slate-200 text-slate-500 font-bold text-xs">
                        ← Retour
                    </Button>
                </div>
            </div>

            {/* Compact Stats Row */}
            <div className="flex flex-wrap gap-3 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-black">
                        {juries.length}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jurys</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-black">
                        {teams.length}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipes</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-sm font-black">
                        {criteria.length}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critères</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-sm font-black">
                        {Math.round(juries.reduce((acc, j) => acc + getJuryProgress(j.id, teams, teamScores).percentage, 0) / (juries.length || 1))}%
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression Globale</span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Vue d'ensemble
                </button>
                <button
                    onClick={() => setActiveTab('management')}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'management' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Gestion
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Paramètres
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <CheckCircle2 className="text-indigo-600" size={24} />
                                    Progression des évaluations
                                </h2>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {juries.map(j => {
                                        const progress = getJuryProgress(j.id, teams, teamScores);
                                        return (
                                            <div key={j.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-slate-700">{j.username}</span>
                                                    <span className="text-[10px] font-black text-indigo-600">{progress.percentage}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                                                    <div
                                                        className="h-full bg-indigo-600 transition-all duration-500"
                                                        style={{ width: `${progress.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {juries.length === 0 && (
                                        <p className="text-center py-10 text-slate-400 italic">Aucun jury à suivre</p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="p-8 bg-indigo-900 text-white border-none h-full flex flex-col justify-center overflow-hidden relative">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-4">Statut de l'événement</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${allScored ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                                                {allScored ? '✓' : '!'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Évaluations</p>
                                                <p className="font-bold">{allScored ? 'Toutes terminées' : 'En cours'}</p>
                                            </div>
                                        </div>

                                        <a
                                            href={`/results/${currentEventId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-center font-bold transition-all border border-white/10"
                                        >
                                            Voir les résultats publics
                                        </a>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'management' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { to: "/admin/juries", title: "Jurys", desc: "Créer et suivre les jurys", variant: "blue", icon: <CheckCircle2 size={18} /> },
                            { to: "/admin/criteria", title: "Critères", desc: "Grille de notation", variant: "purple", icon: <CheckCircle2 size={18} /> },
                            { to: "/admin/teams", title: "Équipes", desc: "Gérer les projets", variant: "emerald", icon: <CheckCircle2 size={18} /> },
                            { to: "/admin/live-queue", title: "Live Queue", desc: "Ordre de passage", variant: "indigo", icon: <LayoutGrid size={18} /> },
                            { to: "/admin/messages", title: "Messages", desc: "Support & Chat", variant: "blue", icon: <MessageSquare size={18} /> },
                        ].map((m, i) => {
                            const colorsMap: Record<string, string> = {
                                blue: "hover:border-blue-200 bg-blue-50 text-blue-600",
                                purple: "hover:border-purple-200 bg-purple-50 text-purple-600",
                                emerald: "hover:border-emerald-200 bg-emerald-50 text-emerald-600",
                                indigo: "hover:border-indigo-200 bg-indigo-50 text-indigo-600",
                            };
                            const colors = colorsMap[m.variant] || colorsMap.indigo;

                            return (
                                <Link key={i} to={m.to} className="block">
                                    <Card className={`group hover:shadow-xl transition-all duration-300 p-6 bg-white border border-slate-100 ${colors.split(' ')[0]}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-black text-slate-900">{m.title}</h3>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colors.split(' ').slice(1).join(' ')}`}>
                                                {m.icon}
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-xs font-medium">{m.desc}</p>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white">
                            <div className="flex items-center gap-3 mb-6">
                                <Info size={20} className="text-indigo-600" />
                                <h2 className="text-xl font-black text-slate-900 leading-none">Configuration des Instructions</h2>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Ces instructions seront visibles par les équipes et les jurys sur leur tableau de bord respectif.</p>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Pitch de 5 min, diapositives obligatoires, code public..."
                                className="w-full h-48 p-6 rounded-2xl border-slate-100 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-slate-600 leading-relaxed font-medium bg-slate-50"
                            />
                            <div className="mt-6 flex justify-end">
                                <Button variant="primary" onClick={handleSaveInstructions} className="flex items-center gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-indigo-100">
                                    <Save size={18} /> Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>


        </DashboardLayout>
    );
};
