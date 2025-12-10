import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export const JuryScoring = () => {
    const { user } = useAuth();
    const { teams, criteria, saveTeamScore, getTeamScore, currentEventId } = useData();

    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [allCompleted, setAllCompleted] = useState(false);

    const currentTeam = teams[currentTeamIndex];

    useEffect(() => {
        // Find first unscored team
        if (user && teams.length > 0) {
            let firstUnscoredIndex = 0;
            for (let i = 0; i < teams.length; i++) {
                const existingScore = getTeamScore(user.id, teams[i].id);
                if (!existingScore || !existingScore.locked) {
                    firstUnscoredIndex = i;
                    break;
                }
                if (i === teams.length - 1) {
                    // All teams scored
                    setAllCompleted(true);
                }
            }
            setCurrentTeamIndex(firstUnscoredIndex);
        }
    }, [user, teams, getTeamScore]);

    useEffect(() => {
        // Initialize scores for current team
        if (currentTeam && user) {
            const existingScore = getTeamScore(user.id, currentTeam.id);
            if (existingScore && !existingScore.locked) {
                setScores(existingScore.scores);
            } else {
                const initialScores: Record<string, number> = {};
                criteria.forEach(c => {
                    initialScores[c.id] = 0;
                });
                setScores(initialScores);
            }
        }
    }, [currentTeam, user, criteria, getTeamScore]);

    const handleScoreChange = (criterionId: string, value: number) => {
        const criterion = criteria.find(c => c.id === criterionId);
        if (!criterion) return;

        const clampedValue = Math.max(0, Math.min(value, criterion.maxScore));
        setScores(prev => ({ ...prev, [criterionId]: clampedValue }));
    };

    const calculateTotal = () => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0);
    };

    const handleSubmit = () => {
        setIsConfirmModalOpen(true);
    };

    const confirmSubmit = () => {
        if (!user || !currentTeam) return;

        if (!currentEventId) return;

        saveTeamScore({
            juryId: user.id,
            teamId: currentTeam.id,
            eventId: currentEventId,
            scores,
            locked: true,
            submittedAt: new Date().toISOString()
        });

        setIsConfirmModalOpen(false);

        // Move to next team or finish
        if (currentTeamIndex < teams.length - 1) {
            setCurrentTeamIndex(currentTeamIndex + 1);
        } else {
            setAllCompleted(true);
        }
    };

    if (!user || teams.length === 0) {
        return (
            <>
                <Navbar />
                <div className="container page-content text-center">
                    <h1>Aucune équipe disponible</h1>
                    <p className="text-muted">Contactez l'administrateur</p>
                </div>
            </>
        );
    }

    if (allCompleted) {
        return (
            <>
                <Navbar />
                <div className="container page-content text-center">
                    <div className="card" style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'var(--color-success)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <h1>🎉 Félicitations !</h1>
                        <p style={{ fontSize: '1.25rem', marginTop: 'var(--spacing-lg)' }}>
                            Vous avez noté toutes les équipes.
                        </p>
                        <p className="text-muted">
                            Merci pour votre contribution !
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (!currentTeam) return null;

    const total = calculateTotal();
    const maxTotal = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="scoring-header">
                    <h1>Notation - Équipe {currentTeamIndex + 1}/{teams.length}</h1>
                    <div className="progress-indicator">
                        {teams.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index < currentTeamIndex ? 'completed' : index === currentTeamIndex ? 'current' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="scoring-table-container card">
                    <div className="team-name-display">
                        <h2>{currentTeam.name}</h2>
                    </div>

                    <table className="scoring-table">
                        <thead>
                            <tr>
                                <th>Critère</th>
                                <th>Note Max</th>
                                <th>Votre Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criteria.map(criterion => (
                                <tr key={criterion.id}>
                                    <td className="criterion-name-cell">{criterion.name}</td>
                                    <td className="max-score-cell">{criterion.maxScore} pts</td>
                                    <td className="score-input-cell">
                                        <input
                                            type="number"
                                            min="0"
                                            max={criterion.maxScore}
                                            value={scores[criterion.id] || 0}
                                            onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                            className="score-input-number"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="total-row">
                                <td><strong>TOTAL</strong></td>
                                <td>{maxTotal} pts</td>
                                <td>
                                    <strong className="total-score-display">{total} pts</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="scoring-actions">
                        <button onClick={handleSubmit} className="btn-success btn-large">
                            ✓ Valider et Passer à l'Équipe Suivante
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirmer la NotationTitle"
            >
                <div className="mb-lg">
                    <p>
                        Vous êtes sur le point de valider vos notes pour <strong>{currentTeam.name}</strong>.
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
                        ⚠️ Une fois validées, ces notes seront verrouillées et vous passerez automatiquement à l'équipe suivante.
                    </p>
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="btn-secondary">
                        Annuler
                    </button>
                    <button onClick={confirmSubmit} className="btn-success">
                        Confirmer et Continuer
                    </button>
                </div>
            </Modal>
        </>
    );
};
