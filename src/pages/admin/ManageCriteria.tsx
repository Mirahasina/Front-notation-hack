import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useData } from '../../contexts/DataContext';

export const ManageCriteria = () => {
    const { criteria, addCriterion, updateCriterion, deleteCriterion, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [maxScore, setMaxScore] = useState('');

    const handleSubmit = () => {
        if (!name || !maxScore || Number(maxScore) <= 0) return;

        if (!currentEventId) return;

        if (editingId) {
            updateCriterion(editingId, { name, maxScore: Number(maxScore), eventId: currentEventId });
        } else {
            addCriterion({ name, maxScore: Number(maxScore), eventId: currentEventId });
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setMaxScore('');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (id: string) => {
        const criterion = criteria.find(c => c.id === id);
        if (criterion) {
            setName(criterion.name);
            setMaxScore(criterion.maxScore.toString());
            setEditingId(id);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
            deleteCriterion(id);
        }
    };

    const totalMaxScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Gestion des Critères</h1>
                        <p className="text-muted">Définir les critères de notation</p>
                    </div>
                    <div className="flex gap-md">
                        <Link to="/admin/dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Nouveau Critère
                        </button>
                    </div>
                </div>

                {totalMaxScore > 0 && (
                    <div className="card mb-lg" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3>Note Maximale Totale</h3>
                                <p className="text-muted">Somme des notes max de tous les critères</p>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>
                                {totalMaxScore} pts
                            </div>
                        </div>
                    </div>
                )}

                {criteria.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucun critère défini</h3>
                        <p className="text-muted">Cliquez sur "Nouveau Critère" pour commencer</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {criteria.map(criterion => (
                            <div key={criterion.id} className="card">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3>{criterion.name}</h3>
                                        <p className="text-muted">Note maximale: {criterion.maxScore} points</p>
                                    </div>
                                    <div className="flex gap-md">
                                        <button onClick={() => handleEdit(criterion.id)} className="btn-secondary">
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(criterion.id)} className="btn-danger">
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingId ? 'Modifier le Critère' : 'Nouveau Critère'}
            >
                <div className="form-group">
                    <label className="form-label">Nom du critère</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Innovation, Design..."
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Note maximale</label>
                    <input
                        type="number"
                        value={maxScore}
                        onChange={e => setMaxScore(e.target.value)}
                        placeholder="Ex: 20"
                        min="1"
                    />
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={resetForm} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!name || !maxScore || Number(maxScore) <= 0}
                    >
                        {editingId ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </Modal>
        </>
    );
};
