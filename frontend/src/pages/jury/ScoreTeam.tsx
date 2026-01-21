import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DEFAULT_EVENT_ID } from '../../utils/storage';
import './JuryScoring.css';

export const ScoreTeam = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const { user } = useAuth();
    const { teams, criteria, saveTeamScore, getTeamScore, currentEventId } = useData();
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
            <div className="jury-scoring-page">
                <Navbar />
                <div className="state-container">
                    <div className="state-card">
                        <span className="state-icon">❌</span>
                        <h1>Équipe non trouvée</h1>
                        <Link to="/jury/dashboard" className="btn-primary mt-8 inline-block">
                            Retour au Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleScoreChange = (criterionId: string, value: number) => {
        if (isLocked) return;

        const criterion = criteria.find(c => c.id === criterionId);
        if (!criterion) return;

        // Clamp value between 0 and maxScore
        const clampedValue = Math.max(0, Math.min(value, criterion.max_score));
        setScores(prev => ({ ...prev, [criterionId]: clampedValue }));
    };

    const calculateTotal = () => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0);
    };

    const handleSubmit = () => {
        if (isLocked) return;
        setIsModalOpen(true);
    };

    const confirmSubmit = async () => {
        if (!user || !teamId || !currentEventId) return;

        await saveTeamScore({
            jury: user.id,
            team: teamId,
            event: currentEventId,
            scores,
            locked: true,
            submitted_at: new Date().toISOString()
        });

        setIsModalOpen(false);
        navigate('/jury/dashboard');
    };

    const total = calculateTotal();
    const maxTotal = criteria.reduce((sum, c) => sum + c.max_score, 0);

    return (
        <div className="jury-scoring-page">
            <Navbar />
            <div className="scoring-container">
                <Link to="/jury/dashboard" className="btn-secondary mb-8 inline-flex items-center gap-2">
                    ← Retour au Dashboard
                </Link>

                <div className="scoring-card mb-8">
                    <div className="scoring-header mb-0">
                        <h1 className="scoring-title mb-2">{team.name}</h1>
                        {isLocked && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                                <span>✓ Notes verrouillées</span>
                            </div>
                        )}
                    </div>
                </div>

                {criteria.length === 0 ? (
                    <div className="state-card">
                        <h3>Aucun critère défini</h3>
                        <p className="text-slate-400">Contactez l'administrateur pour ajouter des critères</p>
                    </div>
                ) : (
                    <>
                        <div className="scoring-grid-layout">
                            {criteria.map(criterion => (
                                <div key={criterion.id} className="criterion-card">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="criterion-name">{criterion.name}</h3>
                                        <span className="text-slate-400 text-sm">Max: {criterion.max_score} pts</span>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max={criterion.max_score}
                                            step="0.5"
                                            value={scores[criterion.id] || 0}
                                            onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                            disabled={isLocked}
                                            className="score-slider"
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">0</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={criterion.max_score}
                                                    step="0.5"
                                                    value={scores[criterion.id] || 0}
                                                    onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                    disabled={isLocked}
                                                    className="w-20 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-center font-bold"
                                                />
                                                <span className="text-slate-400">pts</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{criterion.max_score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="scoring-card">
                            <div className="total-row-display mb-0">
                                <div>
                                    <span className="total-label block">Total Provisoire</span>
                                    <span className="text-slate-400 text-sm">Somme de tous les critères</span>
                                </div>
                                <div className="total-value-group">
                                    <span className="total-score">{total}</span>
                                    <span className="total-max">/ {maxTotal} points</span>
                                </div>
                            </div>

                            {!isLocked && (
                                <div className="scoring-actions mt-8">
                                    <button
                                        onClick={handleSubmit}
                                        className="btn-large-success"
                                    >
                                        ✓ Valider les Notes
                                    </button>
                                    <p className="text-slate-500 mt-4 text-sm">
                                        ⚠️ Attention: Une fois validées, les notes ne pourront plus être modifiées
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirmer la Validation"
            >
                <div className="mb-8">
                    <p className="text-lg">
                        Vous êtes sur le point de valider vos notes pour <strong>{team.name}</strong>.
                    </p>

                    <div className="bg-slate-800/50 p-6 rounded-xl mt-6 border border-slate-700/50">
                        <h4 className="font-bold text-slate-300 mb-4 uppercase text-xs tracking-wider">Récapitulatif</h4>
                        <ul className="recap-list">
                            {criteria.map(criterion => (
                                <li key={criterion.id} className="recap-item">
                                    <span className="text-slate-300">{criterion.name}</span>
                                    <span><strong>{scores[criterion.id] || 0}</strong> <span className="text-slate-500">/ {criterion.max_score}</span></span>
                                </li>
                            ))}
                        </ul>
                        <div className="recap-total">
                            <span>Total</span>
                            <span>{total} / {maxTotal} pts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 text-amber-300/80 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-sm">
                            Une fois validées, ces notes seront verrouillées et vous ne pourrez plus les modifier.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-end">
                    <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
                        Annuler
                    </button>
                    <button onClick={confirmSubmit} className="btn-success">
                        Confirmer et Verrouiller
                    </button>
                </div>
            </Modal>
        </div>
    );
};
