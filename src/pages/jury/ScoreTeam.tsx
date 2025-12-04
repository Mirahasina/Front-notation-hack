import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DEFAULT_EVENT_ID } from '../../utils/storage';
import './ScoreTeam.css';

export const ScoreTeam = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const { user } = useAuth();
    const { teams, criteria, saveTeamScore, getTeamScore } = useData();
    const navigate = useNavigate();

    const [scores, setScores] = useState<Record<string, number>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const team = teams.find(t => t.id === teamId);
    const existingScore = user && teamId ? getTeamScore(user.id, teamId) : undefined;
    const isLocked = existingScore?.locked || false;

    useEffect(() => {
        if (existingScore) {
            setScores(existingScore.scores);
        } else {
            // Initialize scores with 0
            const initialScores: Record<string, number> = {};
            criteria.forEach(c => {
                initialScores[c.id] = 0;
            });
            setScores(initialScores);
        }
    }, [existingScore, criteria]);

    if (!team || !user) {
        return (
            <>
                <Navbar />
                <div className="container page-content text-center">
                    <h1>Équipe non trouvée</h1>
                    <Link to="/jury/dashboard" className="btn-primary mt-lg">
                        Retour au Dashboard
                    </Link>
                </div>
            </>
        );
    }

    const handleScoreChange = (criterionId: string, value: number) => {
        if (isLocked) return;

        const criterion = criteria.find(c => c.id === criterionId);
        if (!criterion) return;

        // Clamp value between 0 and maxScore
        const clampedValue = Math.max(0, Math.min(value, criterion.maxScore));
        setScores(prev => ({ ...prev, [criterionId]: clampedValue }));
    };

    const calculateTotal = () => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0);
    };

    const handleSubmit = () => {
        if (isLocked) return;
        setIsModalOpen(true);
    };

    const confirmSubmit = () => {
        if (!user || !teamId) return;

        saveTeamScore({
            juryId: user.id,
            teamId: teamId,
            eventId: DEFAULT_EVENT_ID,
            scores,
            locked: true,
            submittedAt: new Date().toISOString()
        });

        setIsModalOpen(false);
        navigate('/jury/dashboard');
    };

    const total = calculateTotal();
    const maxTotal = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <Link to="/jury/dashboard" className="btn-secondary mb-lg">
                    ← Retour au Dashboard
                </Link>

                <div className="score-header card mb-xl">
                    <h1>{team.name}</h1>
                    {team.description && (
                        <p className="text-muted">{team.description}</p>
                    )}
                    {isLocked && (
                        <div className="mt-md">
                            <span className="badge badge-success">✓ Notes verrouillées</span>
                            <p className="text-muted mt-sm" style={{ fontSize: '0.875rem' }}>
                                Vous avez déjà noté cette équipe. Les notes ne peuvent plus être modifiées.
                            </p>
                        </div>
                    )}
                </div>

                {criteria.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucun critère défini</h3>
                        <p className="text-muted">Contactez l'administrateur pour ajouter des critères</p>
                    </div>
                ) : (
                    <>
                        <div className="scoring-grid">
                            {criteria.map(criterion => (
                                <div key={criterion.id} className="criterion-card card">
                                    <div className="criterion-header">
                                        <h3>{criterion.name}</h3>
                                        <span className="criterion-max">Max: {criterion.maxScore} pts</span>
                                    </div>

                                    <div className="score-input-container">
                                        <input
                                            type="range"
                                            min="0"
                                            max={criterion.maxScore}
                                            value={scores[criterion.id] || 0}
                                            onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                            disabled={isLocked}
                                            className="score-slider"
                                        />
                                        <div className="score-display">
                                            <input
                                                type="number"
                                                min="0"
                                                max={criterion.maxScore}
                                                value={scores[criterion.id] || 0}
                                                onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                disabled={isLocked}
                                                className="score-number-input"
                                            />
                                            <span className="score-unit">pts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="total-section card">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2>Total</h2>
                                    <p className="text-muted">Somme de tous les critères</p>
                                </div>
                                <div className="total-display">
                                    <span className="total-value">{total}</span>
                                    <span className="total-max">/ {maxTotal} pts</span>
                                </div>
                            </div>
                        </div>

                        {!isLocked && (
                            <div className="text-center mt-xl">
                                <button
                                    onClick={handleSubmit}
                                    className="btn-success"
                                    style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}
                                >
                                    ✓ Valider les Notes
                                </button>
                                <p className="text-muted mt-md">
                                    ⚠️ Attention: Une fois validées, les notes ne pourront plus être modifiées
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirmer la Validation"
            >
                <div className="mb-lg">
                    <p>
                        Vous êtes sur le point de valider vos notes pour <strong>{team.name}</strong>.
                    </p>
                    <div className="card mt-md" style={{ background: 'var(--color-bg-tertiary)' }}>
                        <h4>Récapitulatif:</h4>
                        <ul style={{ marginTop: 'var(--spacing-md)' }}>
                            {criteria.map(criterion => (
                                <li key={criterion.id}>
                                    {criterion.name}: <strong>{scores[criterion.id] || 0}</strong> / {criterion.maxScore} pts
                                </li>
                            ))}
                        </ul>
                        <div className="mt-md" style={{
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: 'var(--spacing-md)',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}>
                            Total: {total} / {maxTotal} pts
                        </div>
                    </div>
                    <p className="text-muted mt-md" style={{ fontSize: '0.875rem' }}>
                        ⚠️ Une fois validées, ces notes seront verrouillées et vous ne pourrez plus les modifier.
                    </p>
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
                        Annuler
                    </button>
                    <button onClick={confirmSubmit} className="btn-success">
                        Confirmer et Verrouiller
                    </button>
                </div>
            </Modal>
        </>
    );
};
