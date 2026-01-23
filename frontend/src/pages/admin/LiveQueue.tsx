import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Clock, Play, CheckCircle } from 'lucide-react';

export const LiveQueue = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { teams, users, teamScores } = useData();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const orderedTeams = [...teams].sort((a, b) => (a.passage_order || 999) - (b.passage_order || 999));

    // Find "current" team (first one with passage_order and not fully scored)
    const currentTeam = orderedTeams.find(team => {
        const scoredCount = teamScores.filter(ts => ts.team === team.id && ts.locked).length;
        const juriesCount = users.filter(u => u.role === 'jury').length;
        return team.passage_order && scoredCount < juriesCount;
    });

    const nextTeams = orderedTeams.filter(team =>
        team.passage_order &&
        (!currentTeam || team.passage_order > (currentTeam.passage_order || 0))
    ).slice(0, 5);

    const completedTeams = orderedTeams.filter(team => {
        const scoredCount = teamScores.filter(ts => ts.team === team.id && ts.locked).length;
        const juriesCount = users.filter(u => u.role === 'jury').length;
        return team.passage_order && scoredCount >= juriesCount;
    }).sort((a, b) => (b.passage_order || 0) - (a.passage_order || 0));

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Queue</h1>
                    <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest">Suivi des passages en temps réel</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/event-dashboard')}>
                    ← Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Pitching */}
                <div className="lg:col-span-2">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Play size={16} className="text-emerald-500 fill-emerald-500" /> Actuellement sur scène
                    </h2>
                    {currentTeam ? (
                        <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none p-8 shadow-2xl shadow-indigo-200">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md">
                                    Ordre #{currentTeam.passage_order}
                                </span>
                                <span className="flex items-center gap-2 text-indigo-100 font-medium">
                                    <Clock size={16} /> {currentTeam.passage_time || '--h--'}
                                </span>
                            </div>
                            <h3 className="text-5xl font-black mb-4 tracking-tighter">{currentTeam.name}</h3>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-indigo-500 flex items-center justify-center backdrop-blur-sm">
                                            <Users size={14} />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-indigo-100 text-sm font-medium">L'équipe est en cours d'évaluation...</span>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-slate-400">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Aucune équipe en cours</p>
                            <p className="text-sm">Vérifiez l'ordre de passage dans la gestion des projets</p>
                        </Card>
                    )}

                    {/* Next Up */}
                    <div className="mt-10">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">À suivre</h2>
                        <div className="space-y-3">
                            {nextTeams.map((team) => (
                                <Card key={team.id} className="p-4 flex justify-between items-center group hover:border-indigo-300 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                                            {team.passage_order}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{team.name}</h4>
                                            <span className="text-xs text-slate-500">{team.track || 'Parcours Standard'}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono text-slate-400">{team.passage_time}</span>
                                </Card>
                            ))}
                            {nextTeams.length === 0 && <p className="text-slate-400 text-sm italic">Fin de la journée approchant...</p>}
                        </div>
                    </div>
                </div>

                {/* Recently Completed */}
                <div className="lg:col-span-1">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-slate-400" /> Terminés
                    </h2>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-[calc(100vh-280px)] overflow-y-auto space-y-3">
                        {completedTeams.map(team => (
                            <div key={team.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <CheckCircle size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{team.name}</span>
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-bold">#{team.passage_order}</span>
                            </div>
                        ))}
                        {completedTeams.length === 0 && (
                            <p className="text-center py-10 text-slate-300 text-sm italic">Personne n'a encore fini</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
