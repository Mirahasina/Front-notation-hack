import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import './JuryScoring.css';

export const ScoreTeam = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const { user } = useAuth();
    const { teams, criteria, saveTeamScore, getTeamScore, currentEventId } = useData();
    const navigate = useNavigate();

    const [scores, setScores] = useState<Record<string, number>>({});
    const [criterionComments, setCriterionComments] = useState<Record<string, string>>({});
    const [globalComments, setGlobalComments] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const team = teams.find(t => t.id === teamId);
    const existingScore = user && teamId ? getTeamScore(user.id, teamId) : undefined;
    const isLocked = existingScore?.locked || false;

    useEffect(() => {
        if (existingScore) {
            setScores(existingScore.scores || {});
            setCriterionComments(existingScore.criterion_comments || {});
            setGlobalComments(existingScore.global_comments || '');
        } else {
            const initialScores: Record<string, number> = {};
            const initialComments: Record<string, string> = {};
            criteria.forEach(c => {
                initialScores[c.id] = 0;
                initialComments[c.id] = '';
            });
            setScores(initialScores);
            setCriterionComments(initialComments);
            setGlobalComments('');
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
        const clampedValue = Math.max(0, Math.min(value, criterion.max_score));
        setScores(prev => ({ ...prev, [criterionId]: clampedValue }));
    };

    const handleCommentChange = (criterionId: string, value: string) => {
        if (isLocked) return;
        setCriterionComments(prev => ({ ...prev, [criterionId]: value }));
    };

    const calculateTotal = () => {
        let total = 0;
        Object.entries(scores).forEach(([id, score]) => {
            const criterion = criteria.find(c => c.id === id);
            const weight = criterion?.weight || 1.0;
            total += score * weight;
        });
        return Math.round(total * 100) / 100;
    };

    const calculateMaxTotal = () => {
        return criteria.reduce((sum, c) => sum + (c.max_score * (c.weight || 1.0)), 0);
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
            criterion_comments: criterionComments,
            global_comments: globalComments,
            locked: true,
            submitted_at: new Date().toISOString()
        });

        setIsModalOpen(false);
        navigate('/jury/dashboard');
    };

    const total = calculateTotal();
    const maxTotal = calculateMaxTotal();

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
                    {team.track && (
                        <p className="text-slate-400 mt-2">Parcours : <span className="text-indigo-400 font-bold">{team.track}</span></p>
                    )}
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
                                <div key={criterion.id} className="criterion-card p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="criterion-name text-lg font-bold">{criterion.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                                                Poids: {criterion.weight || 1.0} • Max: {criterion.max_score} pts
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-slate-700">
                                            <input
                                                type="number"
                                                min="0"
                                                max={criterion.max_score}
                                                step="0.5"
                                                value={scores[criterion.id] || 0}
                                                onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                disabled={isLocked}
                                                className="w-12 bg-transparent text-center font-bold text-indigo-400 focus:outline-none"
                                            />
                                            <span className="text-xs text-slate-500">/ {criterion.max_score}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative pt-2 pb-6">
                                            <input
                                                type="range"
                                                min="0"
                                                max={criterion.max_score}
                                                step="0.5"
                                                value={scores[criterion.id] || 0}
                                                onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                                                disabled={isLocked}
                                                className="score-slider w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 touch-pan-x"
                                            />
                                            <div className="flex justify-between mt-2 px-1">
                                                <span className="text-[10px] text-slate-600 font-bold">0</span>
                                                <span className="text-[10px] text-slate-600 font-bold">{criterion.max_score}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Commentaire (optionnel)</label>
                                            <textarea
                                                value={criterionComments[criterion.id] || ''}
                                                onChange={e => handleCommentChange(criterion.id, e.target.value)}
                                                disabled={isLocked}
                                                placeholder="Ex: Excellente démo, manque de clarté sur la partie technique..."
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="scoring-card mt-8">
                            <h3 className="text-lg font-bold mb-4">Feedback Global</h3>
                            <textarea
                                value={globalComments}
                                onChange={e => setGlobalComments(e.target.value)}
                                disabled={isLocked}
                                placeholder="Points forts, points faibles, et conseils pour l'équipe..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm focus:border-indigo-500 transition-all min-h-[120px]"
                            />
                        </div>

                        <div className="scoring-card sticky bottom-4 z-10 shadow-2xl border-indigo-500/30">
                            <div className="total-row-display mb-0 flex justify-between items-center">
                                <div>
                                    <span className="total-label block font-bold text-indigo-300">Total Pondéré</span>
                                    <span className="text-slate-400 text-xs">Prend en compte les coefficients</span>
                                </div>
                                <div className="total-value-group text-right">
                                    <span className="total-score text-3xl font-black text-white">{total}</span>
                                    <span className="total-max text-slate-500 block text-xs">sur {maxTotal} points possibles</span>
                                </div>
                            </div>

                            {!isLocked && (
                                <div className="scoring-actions mt-8">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                                    >
                                        ✓ Valider et Verrouiller les Notes
                                    </button>
                                    <p className="text-slate-500 mt-4 text-center text-xs flex items-center justify-center gap-1">
                                        <span className="text-amber-500">⚠️</span> Cette action est irréversible
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
                title="Validation Finale"
            >
                <div className="mb-8">
                    <p className="text-slate-300">
                        Vous confirmez les notes pour <strong>{team.name}</strong> ? Elles seront transmises à l'administrateur.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-2xl mt-6 border border-slate-800">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                            <span className="text-slate-400 font-bold uppercase text-xs">Total Final</span>
                            <span className="text-2xl font-black text-indigo-400">{total} <small className="text-xs text-slate-600">/ {maxTotal}</small></span>
                        </div>
                        <div className="space-y-3">
                            {criteria.map(c => (
                                <div key={c.id} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{c.name}</span>
                                    <span className="font-bold">{scores[c.id] || 0} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <span className="text-xl">🛑</span>
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                            <strong>Attention :</strong> Une fois validées, vous ne pourrez plus modifier ces notes, même en cas d'erreur.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">
                        Retour
                    </button>
                    <button onClick={confirmSubmit} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/20 transition-all">
                        Confirmer
                    </button>
                </div>
            </Modal>
        </div>
    );
};
