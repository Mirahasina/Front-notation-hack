import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useData } from '../../contexts/DataContext';
import './ManageCriteria.css';

export const ManageCriteria = () => {
    const { criteria, addCriterion, updateCriterion, deleteCriterion, currentEventId, users, updateUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [priorityOrder, setPriorityOrder] = useState('');
    const [selectedJuryId, setSelectedJuryId] = useState<string>('');

    const juries = users.filter(u => u.role === 'jury');

    // Trier les critères par ordre de priorité
    const sortedCriteria = [...criteria].sort((a, b) => a.priorityOrder - b.priorityOrder);

    const handleSubmit = () => {
        if (!name || !maxScore || Number(maxScore) <= 0 || !priorityOrder || Number(priorityOrder) <= 0) return;

        if (!currentEventId) return;

        let targetId = editingId;

        if (editingId) {
            updateCriterion(editingId, {
                name,
                maxScore: Number(maxScore),
                priorityOrder: Number(priorityOrder),
                eventId: currentEventId
            });
        } else {
            const newCriterion = addCriterion({
                name,
                maxScore: Number(maxScore),
                priorityOrder: Number(priorityOrder),
                eventId: currentEventId
            });
            targetId = newCriterion.id;
        }

        // Update juries assignments (One Criterion -> One Jury)
        if (targetId) {
            juries.forEach(jury => {
                const currentassignments = jury.assignedCriteriaIds || [];
                const hasAssignment = currentassignments.includes(targetId as string);

                if (jury.id === selectedJuryId) {
                    // This is the chosen jury, ensure they have the assignment
                    if (!hasAssignment) {
                        updateUser(jury.id, {
                            assignedCriteriaIds: [...currentassignments, targetId as string]
                        });
                    }
                } else {
                    // This is NOT the chosen jury, remove assignment if present
                    if (hasAssignment) {
                        updateUser(jury.id, {
                            assignedCriteriaIds: currentassignments.filter(id => id !== targetId)
                        });
                    }
                }
            });
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setMaxScore('');
        setPriorityOrder('');
        setEditingId(null);
        setSelectedJuryId('');
        setIsModalOpen(false);
    };

    const handleEdit = (id: string) => {
        const criterion = criteria.find(c => c.id === id);
        if (criterion) {
            setName(criterion.name);
            setMaxScore(criterion.maxScore.toString());
            setPriorityOrder(criterion.priorityOrder?.toString() || '1');
            setEditingId(id);

            // Find the jury who has this criterion assigned
            const assignedJury = juries.find(j => j.assignedCriteriaIds?.includes(id));
            setSelectedJuryId(assignedJury ? assignedJury.id : '');

            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
            deleteCriterion(id);
        }
    };

    const handleOpenNewModal = () => {
        // Auto-increment priority order pour nouveau critère
        const nextPriority = criteria.length > 0
            ? Math.max(...criteria.map(c => c.priorityOrder || 0)) + 1
            : 1;
        setPriorityOrder(nextPriority.toString());
        setSelectedJuryId('');
        setIsModalOpen(true);
    };

    const totalMaxScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    return (
        <div className="manage-criteria-page">
            <Navbar />
            <div className="container page-content">
                <div className="criteria-header-section">
                    <div className="criteria-title">
                        <h1>Gestion des Critères</h1>
                        <p className="criteria-subtitle">Définissez les critères d'évaluation. L'ordre de priorité est utilisé pour le classement automatique.</p>
                    </div>
                    <div className="criteria-actions">
                        <Link to="/admin/dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={handleOpenNewModal} className="btn-primary">
                            + Nouveau Critère
                        </button>
                    </div>
                </div>

                <div className="info-card-grid">
                    {totalMaxScore > 0 && (
                        <div className="info-card total-score-card">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Total</h3>
                                <p className="text-slate-400 text-sm">Points possibles</p>
                            </div>
                            <div className="total-score-value">
                                {totalMaxScore} <span className="text-lg font-normal text-indigo-300">pts</span>
                            </div>
                        </div>
                    )}

                    {criteria.length > 0 && (
                        <div className="info-card priority-info-card">
                            <span className="priority-icon">💡</span>
                            <div>
                                <h3 className="text-amber-300 font-bold mb-1">Ordre de priorité</h3>
                                <p className="text-amber-100/70 text-sm">
                                    En cas d'égalité sur le score total, les équipes sont départagées selon le score du critère #1, puis #2, etc.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {criteria.length === 0 ? (
                    <div className="card text-center py-12">
                        <h3 className="text-xl font-bold mb-2">Aucun critère défini</h3>
                        <p className="text-slate-400">Cliquez sur "Nouveau Critère" pour commencer</p>
                    </div>
                ) : (
                    <div className="criteria-list">
                        {sortedCriteria.map(criterion => {
                            // Find assigned jury
                            const assignedJury = juries.find(j => j.assignedCriteriaIds?.includes(criterion.id));

                            return (
                                <div key={criterion.id} className="criterion-item">
                                    <div className="criterion-left">
                                        <div className="priority-badge">
                                            #{criterion.priorityOrder || '?'}
                                        </div>
                                        <div className="criterion-details">
                                            <h3>{criterion.name}</h3>
                                            <p className="criterion-max-score">Max: <span>{criterion.maxScore} pts</span></p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Assigné à : <span className={`font-medium ${assignedJury ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                    {assignedJury ? assignedJury.username : 'Non assigné'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="criterion-actions">
                                        <button onClick={() => handleEdit(criterion.id)} className="btn-icon-action" title="Modifier">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(criterion.id)} className="btn-icon-action delete" title="Supprimer">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingId ? 'Modifier le Critère' : 'Nouveau Critère'}
            >
                <div className="form-group mb-4">
                    <label className="form-label block mb-2">Nom du critère *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Innovation, Design..."
                        autoFocus
                        className="input-base w-full"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                        <label className="form-label block mb-2">Note maximale *</label>
                        <input
                            type="number"
                            value={maxScore}
                            onChange={e => setMaxScore(e.target.value)}
                            placeholder="Ex: 20"
                            min="1"
                            step="0.5"
                            className="input-base w-full"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label block mb-2">Priorité *</label>
                        <input
                            type="number"
                            value={priorityOrder}
                            onChange={e => setPriorityOrder(e.target.value)}
                            placeholder="1"
                            min="1"
                            className="input-base w-full"
                        />
                    </div>
                </div>

                <div className="form-group mb-6">
                    <label className="form-label block mb-2">Assigner à un jury (bêta)</label>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-2">
                        <select
                            value={selectedJuryId}
                            onChange={e => setSelectedJuryId(e.target.value)}
                            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">-- Sélectionner un jury --</option>
                            {juries.map(jury => (
                                <option key={jury.id} value={jury.id}>
                                    {jury.username} {jury.assignedCriteriaIds?.length ? `(${jury.assignedCriteriaIds.length} critères)` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2 px-1">
                            Un critère ne peut être corrigé que par un seul jury.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-slate-800">
                    <button onClick={resetForm} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!name || !maxScore || Number(maxScore) <= 0 || !priorityOrder || Number(priorityOrder) <= 0}
                    >
                        {editingId ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
