import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';

export const EventDashboard = () => {
    const { users, teams, criteria, teamScores, events, currentEventId, updateEvent } = useData();

    const currentEvent = events.find(e => e.id === currentEventId);
    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    useEffect(() => {
        if (currentEvent && allScored && currentEvent.status === 'ongoing' && teams.length > 0 && juries.length > 0) {
            updateEvent(currentEvent.id, { status: 'completed' });
        }
    }, [allScored, currentEvent, teams.length, juries.length, updateEvent]);

    if (!currentEvent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
                <Navbar />
                <div className="container page-content text-center">
                    <h1>Événement non trouvé</h1>
                    <Link to="/admin/events" className="btn-primary mt-4">← Retour aux événements</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
            <Navbar />
            <div className="container page-content">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                    <div>
                        <h1 className="heading-1 flex items-center gap-3">
                            <span >
                            </span>
                            {currentEvent.name}
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            {new Date(currentEvent.date).toLocaleDateString('fr-FR', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <Link to="/admin/events" className="btn-secondary">← Retour</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="card text-center py-10 px-6 hover:-translate-y-2 transition-transform">
                        <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            {juries.length}
                        </div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Jurys</div>
                    </div>
                    <div className="card text-center py-10 px-6 hover:-translate-y-2 transition-transform">
                        <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            {teams.length}
                        </div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Équipes</div>
                    </div>
                    <div className="card text-center py-10 px-6 hover:-translate-y-2 transition-transform">
                        <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            {criteria.length}
                        </div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Critères</div>
                    </div>
                    <div className="card text-center py-10 px-6 hover:-translate-y-2 transition-transform">
                        <div className="text-4xl mb-4">{allScored ? '✅' : '⏳'}</div>
                        <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                            {allScored ? 'Fait' : 'En cours'}
                        </div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Statut</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                    <Link to="/admin/juries" className="card group hover:-translate-y-2 hover:border-indigo-500/50 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="heading-3 flex items-center gap-3">
                                <span className="text-3xl">👥</span> Gestion des Jurys
                            </h3>
                            <span className="badge badge-primary scale-110">{juries.length}</span>
                        </div>
                        <p className="text-slate-400 text-base">Créer et suivre les jurys</p>
                    </Link>

                    <Link to="/admin/criteria" className="card group hover:-translate-y-2 hover:border-purple-500/50 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="heading-3 flex items-center gap-3">
                                <span className="text-3xl">📋</span> Gestion des Critères
                            </h3>
                            <span className="badge badge-primary scale-110">{criteria.length}</span>
                        </div>
                        <p className="text-slate-400 text-base">Définir les critères de notation</p>
                    </Link>

                    <Link to="/admin/teams" className="card group hover:-translate-y-2 hover:border-emerald-500/50 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="heading-3 flex items-center gap-3">
                                <span className="text-3xl">🚀</span> Gestion des Projets
                            </h3>
                            <span className="badge badge-primary scale-110">{teams.length}</span>
                        </div>
                        <p className="text-slate-400 text-base">Ajouter et gérer les projets</p>
                    </Link>

                    <a href={`/results/${currentEventId}`} target="_blank" rel="noopener noreferrer" className="card group hover:-translate-y-2 hover:border-amber-500/50 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="heading-3 flex items-center gap-3">
                                <span className="text-3xl">📊</span> Résultats Publics
                            </h3>
                            {allScored && <span className="badge badge-success scale-110">Prêt</span>}
                        </div>
                        <p className="text-slate-400 text-base">Page publique des résultats</p>
                    </a>
                </div>

                {juries.length > 0 && teams.length > 0 && (
                    <div className="mt-16">
                        <h2 className="heading-2 mb-8">Progression des Jurys</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {juries.map(jury => {
                                const progress = getJuryProgress(jury.id, teams, teamScores);
                                return (
                                    <div key={jury.id} className="card p-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="heading-4">{jury.username}</h4>
                                                <p className="text-slate-400 text-sm font-medium">{progress.scored}/{progress.total} équipes</p>
                                            </div>
                                            <span className={`badge ${progress.percentage === 100 ? 'badge-success' : 'badge-primary'}`}>
                                                {progress.percentage}%
                                            </span>
                                        </div>
                                        <div className="progress-bar h-3">
                                            <div className="progress-bar-fill" style={{ width: `${progress.percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
