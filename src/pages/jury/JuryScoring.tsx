import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import './JuryScoring.css';

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
            <div className="jury-scoring-page">
                <Navbar />
                <div className="state-container">
                    <div className="state-card">
                        <span className="state-icon"></span>
                        <h1>Aucune équipe disponible</h1>
                        <p className="text-slate-400 mt-4">Contactez l'administrateur</p>
                    </div>
                </div>
            </div>
        );
    }

    if (allCompleted) {
        return (
            <div className="jury-scoring-page">
                <Navbar />
                <div className="state-container">
                    <div className="state-card" style={{ borderColor: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <h1 className="text-emerald-400">Félicitations !</h1>
                        <p className="text-xl mt-4 text-white">
                            Vous avez noté toutes les équipes.
                        </p>
                        <p className="text-slate-400 mt-2">
                            Merci pour votre contribution !
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentTeam) return null;

    const total = calculateTotal();
    const maxTotal = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    return (
        <div className="jury-scoring-page">
            <Navbar />
            <div className="scoring-container">
                <div className="scoring-header">
                    <h1 className="scoring-title">Notation - Équipe {currentTeamIndex + 1}/{teams.length}</h1>
                    <div className="scoring-progress-indicator">
                        {teams.map((_, index) => (
                            <div
                                key={index}
                                className={`scoring-dot ${index < currentTeamIndex ? 'completed' : index === currentTeamIndex ? 'current' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="scoring-card">
                    <div className="team-name-display">
                        <h2>{currentTeam.name}</h2>
                    </div>

                    <div className="scoring-table-wrapper">
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
                                        <td>
                                            <span className="criterion-name">{criterion.name}</span>
                                        </td>
                                        <td>
                                            / {criterion.maxScore}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max={criterion.maxScore}
                                                value={scores[criterion.id] || 0}
                                                onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                className="score-input"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="total-row-display">
                        <span className="total-label">NOTE TOTALE</span>
                        <div className="total-value-group">
                            <span className="total-score">{total}</span>
                            <span className="total-max">/ {maxTotal} points</span>
                        </div>
                    </div>

                    <div className="scoring-actions">
                        <button onClick={handleSubmit} className="btn-large-success">
                            Valider et Passer à la Suivante
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirmer la Notation"
            >
                <div className="mb-8">
                    <p className="text-lg">
                        Vous êtes sur le point de valider vos notes pour <strong>{currentTeam.name}</strong>.
                    </p>

                    <div className="bg-slate-800/50 p-6 rounded-xl mt-6 border border-slate-700/50">
                        <h4 className="font-bold text-slate-300 mb-4 uppercase text-xs tracking-wider">Récapitulatif</h4>
                        <ul className="recap-list">
                            {criteria.map(criterion => (
                                <li key={criterion.id} className="recap-item">
                                    <span className="text-slate-300">{criterion.name}</span>
                                    <span><strong>{scores[criterion.id] || 0}</strong> <span className="text-slate-500">/ {criterion.maxScore}</span></span>
                                </li>
                            ))}
                        </ul>
                        <div className="recap-total">
                            <span>Total</span>
                            <span>{total} / {maxTotal} pts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 text-amber-300/80 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                        <span className="text-2xl"></span>
                        <p className="text-sm">
                            Une fois validées, ces notes seront verrouillées et vous passerez automatiquement à l'équipe suivante.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-end">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="btn-secondary">
                        Annuler
                    </button>
                    <button onClick={confirmSubmit} className="btn-success">
                        Confirmer et Continuer
                    </button>
                </div>
            </Modal>
        </div>
    );
};
