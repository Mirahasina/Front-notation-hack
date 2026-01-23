import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';
import { Save, LayoutGrid, Info } from 'lucide-react';

export const EventDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { users, teams, criteria, teamScores, events, currentEventId, updateEvent } = useData();
    const [instructions, setInstructions] = useState('');

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{currentEvent.name}</h1>
                    <p className="text-slate-500 mt-1">
                        {new Date(currentEvent.date).toLocaleDateString('fr-FR', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/events')}>
                    ← Retour
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="flex flex-col items-center justify-center p-8 group hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl font-black text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                        {juries.length}
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Jurys</div>
                </Card>
                <Card className="flex flex-col items-center justify-center p-8 group hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl font-black text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                        {teams.length}
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Équipes</div>
                </Card>
                <Card className="flex flex-col items-center justify-center p-8 group hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl font-black text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                        {criteria.length}
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Critères</div>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Link to="/admin/juries" className="block">
                    <Card className="group hover:shadow-lg hover:border-indigo-200 transition-all duration-300 h-full p-6 bg-gradient-to-br from-white to-blue-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Gestion des jurys</h3>
                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">{juries.length}</span>
                        </div>
                        <p className="text-slate-500">Créer et suivre les comptes des jurys</p>
                    </Card>
                </Link>

                <Link to="/admin/criteria" className="block">
                    <Card className="group hover:shadow-lg hover:border-purple-200 transition-all duration-300 h-full p-6 bg-gradient-to-br from-white to-purple-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Gestion des critères</h3>
                            <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">{criteria.length}</span>
                        </div>
                        <p className="text-slate-500">Définir la grille de notation</p>
                    </Card>
                </Link>

                <Link to="/admin/teams" className="block">
                    <Card className="group hover:shadow-lg hover:border-emerald-200 transition-all duration-300 h-full p-6 bg-gradient-to-br from-white to-emerald-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Gestion des projets</h3>
                            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold">{teams.length}</span>
                        </div>
                        <p className="text-slate-500">Ajouter et gérer les équipes</p>
                    </Card>
                </Link>

                <Link to="/admin/live-queue" className="block">
                    <Card className="group hover:shadow-lg hover:border-indigo-200 transition-all duration-300 h-full p-6 bg-gradient-to-br from-white to-indigo-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Live Queue</h3>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <LayoutGrid size={18} />
                            </div>
                        </div>
                        <p className="text-slate-500">Suivre l'ordre de passage en direct</p>
                    </Card>
                </Link>

                <a href={`/results/${currentEventId}`} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300 h-full p-6 bg-gradient-to-br from-white to-amber-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Résultats publics</h3>
                            {allScored && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Prêt</span>}
                        </div>
                        <p className="text-slate-500">Voir la page de classement en temps réel</p>
                    </Card>
                </a>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                            <Info size={20} className="text-indigo-600" />
                            <h2 className="text-xl font-bold text-slate-900">Instructions de l'événement</h2>
                        </div>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Instructions pour les équipes et les jurys (ex: temps de pitch, format des supports...)"
                            className="w-full h-40 p-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-600 leading-relaxed resize-none bg-slate-50"
                        />
                        <div className="mt-4 flex justify-end">
                            <Button variant="primary" onClick={handleSaveInstructions} className="flex items-center gap-2">
                                <Save size={18} /> Enregistrer les instructions
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {/* Placeholder for future action or stats */}
                    <Card className="p-8 bg-indigo-900 text-white border-none h-full flex flex-col justify-center overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Conseil Admin</h3>
                            <p className="text-indigo-200 text-sm">
                                N'oubliez pas de configurer les poids des critères pour une notation équilibrée.
                            </p>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </Card>
                </div>
            </div>

            {juries.length > 0 && teams.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Progression des jurys</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {juries.map(jury => {
                            const progress = getJuryProgress(jury.id, teams, teamScores);
                            return (
                                <Card key={jury.id} className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{jury.username}</h4>
                                            <p className="text-slate-500 text-sm font-medium">{progress.scored}/{progress.total} équipes</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${progress.percentage === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {progress.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
