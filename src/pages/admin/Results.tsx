import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { areAllTeamsScored, calculateResults } from '../../utils/calculations';

export const Results = () => {
    const { teams, criteria, teamScores, users } = useData();
    const [isFinalized, setIsFinalized] = useState(false);

    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);
    const results = calculateResults(teams, teamScores, juries, criteria);

    const getRankEmoji = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            case 3: return '❤️';
            default: return '';
        }
    };

    const getRankLabel = (index: number) => {
        switch (index) {
            case 0: return '1er Place - Gagnant';
            case 1: return '2ème Place';
            case 2: return '3ème Place';
            case 3: return '4ème Place - Coup de Cœur';
            default: return `${index + 1}ème Place`;
        }
    };

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Résultats</h1>
                        <p className="text-muted">Classement final des projets</p>
                    </div>
                    <Link to="/admin/dashboard" className="btn-secondary">
                        ← Retour
                    </Link>
                </div>

                {!allScored && (
                    <div className="card mb-lg" style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderColor: 'var(--color-warning)'
                    }}>
                        <h3>⏳ Notation en cours</h3>
                        <p className="text-muted">
                            Tous les jurys doivent noter tous les projets avant de finaliser les résultats.
                        </p>
                        <div className="mt-md">
                            <strong>Statut:</strong>
                            <ul style={{ marginTop: 'var(--spacing-sm)' }}>
                                <li>{teams.length} projets à noter</li>
                                <li>{juries.length} jurys actifs</li>
                                <li>{teamScores.filter(ts => ts.locked).length} / {teams.length * juries.length} notes enregistrées</li>
                            </ul>
                        </div>
                    </div>
                )}

                {allScored && !isFinalized && (
                    <div className="card mb-lg text-center" style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'var(--color-success)'
                    }}>
                        <h2>Tous les projets ont été notés!</h2>
                        <p className="text-muted">Vous pouvez maintenant finaliser et afficher les résultats officiels.</p>
                        <button
                            onClick={() => setIsFinalized(true)}
                            className="btn-success mt-md"
                            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
                        >
                            🏆 Finaliser les Résultats
                        </button>
                    </div>
                )}

                {(isFinalized || allScored) && results.length > 0 && (
                    <div className="results-container">
                        <div className="results-header text-center mb-xl">
                            <h2>🏆 Classement Final</h2>
                            <p className="text-muted">Par ordre décroissant de points</p>
                        </div>

                        <div className="results-list">
                            {results.map((result, index) => (
                                <div key={result.teamId} className="result-card card">
                                    <div className="result-header">
                                        <div className="rank-info">
                                            <span className="rank-emoji">{getRankEmoji(index)}</span>
                                            <div>
                                                <h2 className="team-name">{result.teamName}</h2>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-primary-light)',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {result.platformName}
                                                </p>
                                                <p className="rank-label">{getRankLabel(index)}</p>
                                            </div>
                                        </div>
                                        <div className="total-score">
                                            <div className="score-value">{result.averageScore.toFixed(1)}</div>
                                            <div className="score-label">moyenne</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                (Total: {result.totalScore.toFixed(1)} pts)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="result-details">
                                        <h4>Détails par Jury (anonyme)</h4>
                                        <div className="jury-scores-grid">
                                            {result.juryScores.map((juryScore, jIndex) => (
                                                <div key={juryScore.juryId} className="jury-score-card">
                                                    <div className="jury-label">
                                                        Jury {jIndex + 1}
                                                    </div>
                                                    <div className="jury-total">
                                                        {juryScore.total} pts
                                                    </div>
                                                    <div className="criteria-breakdown">
                                                        {criteria.map(criterion => (
                                                            <div key={criterion.id} className="criterion-score">
                                                                <span className="criterion-name">{criterion.name}</span>
                                                                <span className="criterion-value">
                                                                    {juryScore.scores[criterion.id] || 0}/{criterion.maxScore}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {teams.length === 0 && (
                    <div className="card text-center">
                        <h3>Aucun projet enregistré</h3>
                        <p className="text-muted">Ajoutez des projets dans la section "Gestion des Projets"</p>
                    </div>
                )}
            </div>
        </>
    );
};
