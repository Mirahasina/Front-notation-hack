import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';
import { ChangePasswordModal } from '../../components/admin/ChangePasswordModal';

export const AdminDashboard = () => {
    const { users, teams, criteria, teamScores } = useData();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="heading-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard Administrateur</h1>
                        <p className="text-body text-lg">Gérez les jurys, critères, équipes et consultez les résultats</p>
                    </div>
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 hover:border-indigo-500 transition-all shadow-lg flex items-center gap-2 group"
                    >
                        <span>Changer mot de passe</span>
                    </button>
                </div>

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
                    </div>
                </div>

                <div className="admin-sections">
                    <Link to="/admin/juries" className="admin-section-card card group">
                        <div className="section-header">
                            <h3 className="heading-3 group-hover:text-indigo-400 transition-colors">Gestion des jurys</h3>
                            <span className="badge badge-primary">{juries.length}</span>
                        </div>
                        <p className="text-muted">
                            Créer des identifiants pour les jurys et suivre leur progression
                        </p>
                    </Link>

                    <Link to="/admin/criteria" className="admin-section-card card group">
                        <div className="section-header">
                            <h3 className="heading-3 group-hover:text-indigo-400 transition-colors">Gestion des critères</h3>
                            <span className="badge badge-primary">{criteria.length}</span>
                        </div>
                        <p className="text-muted">
                            Définir les critères de notation avec leurs notes maximales
                        </p>
                    </Link>

                    <Link to="/admin/teams" className="admin-section-card card group">
                        <div className="section-header">
                            <h3 className="heading-3 group-hover:text-indigo-400 transition-colors">Gestion des équipes</h3>
                            <span className="badge badge-primary">{teams.length}</span>
                        </div>
                        <p className="text-muted">
                            Ajouter et gérer les équipes participantes
                        </p>
                    </Link>

                    <a href="/results" target="_blank" rel="noopener noreferrer" className="admin-section-card card group">
                        <div className="section-header">
                            <h3 className="heading-3 group-hover:text-emerald-400 transition-colors">Résultats publics</h3>
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
                    <h2 className="heading-2 mb-6">Progression des jurys</h2>
                    <div className="jury-progress-list">
                        {juries.map(jury => {
                            const progress = getJuryProgress(jury.id, teams, teamScores);
                            return (
                                <div key={jury.id} className="card progress-card">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="heading-4">{jury.username}</h4>
                                            <p className="text-muted text-sm">{progress.scored} / {progress.total} équipes notées</p>
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

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
};
