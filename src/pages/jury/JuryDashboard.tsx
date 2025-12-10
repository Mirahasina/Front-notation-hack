import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getJuryProgress } from '../../utils/calculations';

export const JuryDashboard = () => {
    const { user } = useAuth();
    const { teams, teamScores } = useData();

    if (!user) return null;

    const progress = getJuryProgress(user.id, teams, teamScores);
    const isComplete = progress.scored === progress.total && progress.total > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
            <Navbar />
            <div className="container page-content">
                <div className="mb-8">
                    <h1 className="flex items-center gap-3">
                        <span className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            ⚖️
                        </span>
                        Tableau de Bord Jury
                    </h1>
                    <p className="text-slate-400 mt-1">Notez les équipes participantes</p>
                </div>

                {teams.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-6xl mb-4">⏳</div>
                        <h3 className="text-xl mb-2">Aucune équipe à noter</h3>
                        <p className="text-slate-400">Les équipes seront ajoutées par l'administrateur</p>
                    </div>
                ) : (
                    <>
                        {/* Progress Card */}
                        <div className="card mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Votre Progression</h3>
                                <span className={`badge text-lg px-4 py-2 ${isComplete ? 'badge-success' : 'badge-primary'}`}>
                                    {progress.percentage}%
                                </span>
                            </div>
                            <div className="progress-bar h-3 mb-4">
                                <div className="progress-bar-fill h-full" style={{ width: `${progress.percentage}%` }} />
                            </div>
                            <p className="text-center text-slate-400">
                                {progress.scored} / {progress.total} équipes notées
                            </p>
                        </div>

                        {/* Completion Message */}
                        {isComplete && (
                            <div className="card mb-8 text-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>
                                <p className="text-slate-400">
                                    Vous avez noté toutes les équipes. Merci pour votre contribution !
                                </p>
                            </div>
                        )}

                        {/* Teams Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teams.map(team => {
                                const score = teamScores.find(
                                    ts => ts.teamId === team.id && ts.juryId === user.id
                                );
                                const isScored = score?.locked || false;

                                return (
                                    <div
                                        key={team.id}
                                        className={`card transition-all hover:-translate-y-1 ${isScored
                                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                                : 'hover:border-indigo-500/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold">{team.name}</h3>
                                            {isScored && <span className="badge badge-success">✓ Noté</span>}
                                        </div>

                                        <Link
                                            to={`/jury/score/${team.id}`}
                                            className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${isScored
                                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {isScored ? 'Voir les notes' : 'Noter →'}
                                        </Link>

                                        {isScored && score?.submittedAt && (
                                            <p className="text-slate-500 text-xs text-center mt-3">
                                                Noté le {new Date(score.submittedAt).toLocaleString('fr-FR')}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
