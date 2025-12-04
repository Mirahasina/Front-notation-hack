import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const { users, teams, criteria, teamScores } = useData();

    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <h1>Dashboard  Administrateur</h1>
                <p className="text-muted">Gérez les jurys, critères, équipes et consultez les résultats</p>

                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon">⚖️</div>
                        <div className="stat-value">{juries.length}</div>
                        <div className="stat-label">Jurys</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{teams.length}</div>
                        <div className="stat-label">Équipes</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{criteria.length}</div>
                        <div className="stat-label">Critères</div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon">{allScored ? '✅' : '⏳'}</div>
                        <div className="stat-value">{allScored ? 'Complété' : 'En cours'}</div>
                        <div className="stat-label">Statut</div>
                    </div>
                </div>

                <div className="admin-sections">
                    <Link to="/admin/juries" className="admin-section-card card">
                        <div className="section-header">
                            <h3>⚖️ Gestion des Jurys</h3>
                            <span className="badge badge-primary">{juries.length}</span>
                        </div>
                        <p className="text-muted">
                            Créer des identifiants pour les jurys et suivre leur progression
                        </p>
                    </Link>

                    <Link to="/admin/criteria" className="admin-section-card card">
                        <div className="section-header">
                            <h3>📋 Gestion des Critères</h3>
                            <span className="badge badge-primary">{criteria.length}</span>
                        </div>
                        <p className="text-muted">
                            Définir les critères de notation avec leurs notes maximales
                        </p>
                    </Link>

                    <Link to="/admin/teams" className="admin-section-card card">
                        <div className="section-header">
                            <h3>👥 Gestion des Équipes</h3>
                            <span className="badge badge-primary">{teams.length}</span>
                        </div>
                        <p className="text-muted">
                            Ajouter et gérer les équipes participantes
                        </p>
                    </Link>

                    <a href="/results" target="_blank" rel="noopener noreferrer" className="admin-section-card card">
                        <div className="section-header">
                            <h3>🏆 Résultats Publics</h3>
                            {allScored && <span className="badge badge-success">Prêt</span>}
                        </div>
                        <p className="text-muted">
                            Page publique des résultats (accessible à tous)
                        </p>
                    </a>
                </div>
            </div>

            {juries.length > 0 && teams.length > 0 && (
                <div className="jury-progress-section">
                    <h2>Progression des Jurys</h2>
                    <div className="jury-progress-list">
                        {juries.map(jury => {
                            const progress = getJuryProgress(jury.id, teams, teamScores);
                            return (
                                <div key={jury.id} className="card progress-card">
                                    <div className="flex justify-between items-center mb-md">
                                        <div>
                                            <h4>{jury.username}</h4>
                                            <p className="text-muted">{progress.scored} / {progress.total} équipes notées</p>
                                        </div>
                                        <span className="badge badge-primary">{progress.percentage}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};
