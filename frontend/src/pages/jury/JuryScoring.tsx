import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import './JuryScoring.css';

export const JuryScoring = () => {
    const { user, logout } = useAuth();
    const { teams, criteria, saveTeamScore, getTeamScore, currentEventId } = useData();

    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [allCompleted, setAllCompleted] = useState(false);
    const [globalComments, setGlobalComments] = useState('');
    const [error, setError] = useState<string | null>(null);

    const currentTeam = teams[currentTeamIndex];

    useEffect(() => {
        if (user && teams.length > 0) {
            let firstUnscoredIndex = 0;
            for (let i = 0; i < teams.length; i++) {
                const existingScore = getTeamScore(user.id, teams[i].id);
                if (!existingScore || !existingScore.locked) {
                    firstUnscoredIndex = i;
                    break;
                }
                if (i === teams.length - 1) {
                    setAllCompleted(true);
                }
            }
            setCurrentTeamIndex(firstUnscoredIndex);
        }
    }, [user, teams, getTeamScore]);

    useEffect(() => {
        if (currentTeam && user) {
            const existingScore = getTeamScore(user.id, currentTeam.id);
            if (existingScore && !existingScore.locked) {
                setScores(existingScore.scores);
            } else {
                const initialScores: Record<string, number> = {};

                const visibleCriteria = (user.assigned_criteria && user.assigned_criteria.length > 0)
                    ? criteria.filter(c => user.assigned_criteria?.includes(c.id))
                    : criteria;

                visibleCriteria.forEach(c => {
                    initialScores[c.id] = 0;
                });
                setScores(initialScores);
                setGlobalComments('');
            }
        }
    }, [currentTeam, user, criteria, getTeamScore]);

    const handleScoreChange = (criterionId: string, value: number) => {
        const criterion = criteria.find(c => c.id === criterionId);
        if (!criterion) return;

        const clampedValue = Math.max(0, Math.min(value, criterion.max_score));
        setScores(prev => ({ ...prev, [criterionId]: clampedValue }));
    };

    const calculateTotal = () => {
        return Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);
    };

    const handleSubmit = () => {
        if (!globalComments.trim() || globalComments.trim().length < 10) {
            setError('Le feedback est obligatoire (minimum 10 caractères)');
            return;
        }
        setError(null);
        setIsConfirmModalOpen(true);
    };

    const confirmSubmit = async () => {
        if (!user || !currentTeam) return;

        if (!currentEventId) return;

        await saveTeamScore({
            jury: user.id,
            team: currentTeam.id,
            event: currentEventId,
            scores,
            criterion_comments: {},
            global_comments: globalComments,
            locked: true,
            submitted_at: new Date().toISOString()
        });

        setIsConfirmModalOpen(false);

        if (currentTeamIndex < teams.length - 1) {
            setCurrentTeamIndex(currentTeamIndex + 1);
        } else {
            setAllCompleted(true);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (!user || teams.length === 0) {
        return (
            <DashboardLayout userType="jury" userName={user?.username || 'Jury'} onLogout={handleLogout}>
                <div className="state-container">
                    <div className="state-card-white">
                        <h1>Aucune équipe disponible</h1>
                        <p className="text-slate-500 mt-4">Contactez l'administrateur</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (allCompleted) {
        return (
            <DashboardLayout userType="jury" userName={user?.username || 'Jury'} onLogout={handleLogout}>
                <div className="state-container">
                    <div className="state-card-white border-emerald-200 bg-emerald-50">
                        <h1 className="text-emerald-600">Félicitations !</h1>
                        <p className="text-xl mt-4 text-slate-800">
                            Vous avez noté toutes les équipes.
                        </p>
                        <p className="text-slate-500 mt-2">
                            Merci pour votre contribution !
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentTeam) return null;

    const total = calculateTotal();
    const maxTotal = criteria.reduce((sum, c) => sum + c.max_score, 0);

    return (
        <DashboardLayout userType="jury" userName={user?.username || 'Jury'} onLogout={handleLogout}>
            <div className="scoring-container-white">
                <div className="scoring-header">
                    <div className="flex flex-col gap-1">
                        <h1 className="scoring-title-white text-slate-900 leading-none">Évaluation en cours</h1>
                        <p className="text-sm text-slate-500 font-medium">Équipe {currentTeamIndex + 1} sur {teams.length}</p>
                    </div>
                    <div className="scoring-progress-indicator">
                        {teams.map((_, index) => (
                            <div
                                key={index}
                                className={`scoring-dot ${index < currentTeamIndex ? 'completed' : index === currentTeamIndex ? 'current' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="scoring-card-white">
                    <div className="team-name-display-white">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">Équipe en cours d'évaluation</p>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentTeam.name}</h2>
                    </div>

                    <div className="scoring-table-wrapper">
                        <table className="scoring-table">
                            <thead>
                                <tr>
                                    <th className="text-slate-500">Critère</th>
                                    <th className="text-slate-500">Note Max</th>
                                    <th className="text-slate-500">Votre Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criteria
                                    .filter(c => !user?.assigned_criteria || user.assigned_criteria.length === 0 || user.assigned_criteria.includes(c.id))
                                    .map(criterion => (
                                        <tr key={criterion.id}>
                                            <td className="bg-slate-50/50 border-slate-100">
                                                <span className="criterion-name-white text-slate-700 font-semibold">{criterion.name}</span>
                                            </td>
                                            <td className="bg-slate-50/50 border-slate-100 text-slate-400">
                                                / {criterion.max_score}
                                            </td>
                                            <td className="bg-white border-slate-100">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={criterion.max_score}
                                                    step="0.1"
                                                    value={scores[criterion.id] || 0}
                                                    onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                    className="score-input-white"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="total-row-display-white">
                        <span className="total-label-white text-slate-900">NOTE TOTALE</span>
                        <div className="total-value-group">
                            <span className="total-score-white">{total}</span>
                            <span className="total-max-white text-slate-400">/ {maxTotal} points</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Commentaires & Feedbacks <span className="text-red-500">*</span>
                            </label>
                            {error && <span className="text-xs font-bold text-red-500 animate-pulse">{error}</span>}
                        </div>
                        <textarea
                            value={globalComments}
                            onChange={(e) => {
                                setGlobalComments(e.target.value);
                                if (e.target.value.trim().length >= 10) setError(null);
                            }}
                            placeholder="Points forts, axes d'amélioration (obligatoire)..."
                            className={`w-full h-24 p-4 bg-slate-50 border rounded-xl text-slate-700 text-sm transition-all outline-none resize-none ${error ? 'border-red-300 ring-2 ring-red-50 focus:ring-red-100 focus:border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900'}`}
                        />
                    </div>

                    <div className="pt-8">
                        <button onClick={handleSubmit} className="btn-large-success-white shadow-lg shadow-slate-900/10">
                            Valider la notation
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
                    <p className="text-lg text-slate-700">
                        Vous êtes sur le point de valider vos notes pour <strong>{currentTeam.name}</strong>.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-xl mt-6 border border-slate-200">
                        <h4 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-wider">Récapitulatif</h4>
                        <ul className="recap-list">
                            {criteria.map(criterion => (
                                <li key={criterion.id} className="recap-item flex justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-600">{criterion.name}</span>
                                    <span className="font-bold text-slate-900">{scores[criterion.id] || 0} <span className="text-slate-400 font-normal">/ {criterion.max_score}</span></span>
                                </li>
                            ))}
                        </ul>
                        <div className="recap-total flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                            <span className="font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-black text-indigo-600">{total} / {maxTotal} pts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm">
                            Une fois validées, ces notes seront verrouillées et vous passerez automatiquement à l'équipe suivante.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-end">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                        Annuler
                    </button>
                    <button onClick={confirmSubmit} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                        Confirmer et Continuer
                    </button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
