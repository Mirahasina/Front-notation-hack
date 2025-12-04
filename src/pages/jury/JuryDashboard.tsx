import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getJuryProgress } from '../../utils/calculations';
import './JuryDashboard.css';

export const JuryDashboard = () => {
    const { user } = useAuth();
    const { teams, teamScores } = useData();

    if (!user) return null;

    const progress = getJuryProgress(user.id, teams, teamScores);
    const isComplete = progress.scored === progress.total && progress.total > 0;

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <h1>Tableau de Bord Jury</h1>
                <p className="text-muted">Notez les équipes participantes</p>

                {teams.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucune équipe à noter</h3>
                        <p className="text-muted">Les équipes seront ajoutées par l'administrateur</p>
                    </div>
                ) : (
                    <>
                        <div className="progress-section card mb-xl">
                            <div className="flex justify-between items-center mb-md">
                                <h3>Votre Progression</h3>
                                <span className="badge badge-primary">{progress.percentage}%</span>
                            </div>
                            <div className="progress-bar-large">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                            <p className="text-center text-muted mt-md">
                                {progress.scored} / {progress.total} équipes notées
                            </p>
                        </div>

                        {isComplete && (
                            <div className="card mb-xl text-center" style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderColor: 'var(--color-success)'
                            }}>
                                <h2>🎉 Félicitations!</h2>
                                <p className="text-muted">
                                    Vous avez noté toutes les équipes. Merci pour votre contribution!
                                </p>
                            </div>
                        )}

                        <div className="teams-grid">
                            {teams.map(team => {
                                const score = teamScores.find(
                                    ts => ts.teamId === team.id && ts.juryId === user.id
                                );
                                const isScored = score?.locked || false;

                                return (
                                    <div key={team.id} className={`team-card card ${isScored ? 'scored' : ''}`}>
                                        <div className="team-header">
                                            <h3>{team.name}</h3>
                                            {isScored && (
                                                <span className="badge badge-success">✓ Noté</span>
                                            )}
                                        </div>

                                        {team.description && (
                                            <p className="team-description text-muted">{team.description}</p>
                                        )}

                                        <Link
                                            to={`/jury/score/${team.id}`}
                                            className={`btn-primary mt-md ${isScored ? 'btn-secondary' : ''}`}
                                            style={{ width: '100%' }}
                                        >
                                            {isScored ? 'Voir les notes' : 'Noter cette équipe'}
                                        </Link>

                                        {isScored && score?.submittedAt && (
                                            <p className="text-muted text-center mt-sm" style={{ fontSize: '0.75rem' }}>
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
        </>
    );
};
