import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { ImportExcelModal } from '../../components/ImportExcelModal';
import { SpinningWheel } from '../../components/SpinningWheel';
import { PassageOrderDisplay } from '../../components/PassageOrderDisplay';
import { useData } from '../../contexts/DataContext';
import { assignPassageOrder, clearPassageOrder } from '../../utils/randomizer';
import type { Team } from '../../types';

export const ManageTeams = () => {
    const { teams, addTeam, updateTeam, deleteTeam, users, teamScores, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!name) return;

        if (!currentEventId) return;

        if (editingId) {
            updateTeam(editingId, { name, description, eventId: currentEventId });
        } else {
            addTeam({ name, description, eventId: currentEventId, importedFrom: 'manual' });
        }

        resetForm();
    };

    const handleImport = (imported: Array<{ name: string; description?: string }>) => {
        if (!currentEventId) return;

        imported.forEach(item => {
            addTeam({
                name: item.name,
                description: item.description,
                eventId: currentEventId,
                importedFrom: 'excel'
            });
        });
    };

    const handleSpinComplete = (orderedTeams: Team[]) => {
        orderedTeams.forEach(team => {
            updateTeam(team.id, {
                passageOrder: team.passageOrder,
                passageTime: team.passageTime
            });
        });
    };

    const handleRandomize = () => {
        const ordered = assignPassageOrder(teams, '09h00', 15);
        ordered.forEach(team => {
            updateTeam(team.id, {
                passageOrder: team.passageOrder,
                passageTime: team.passageTime
            });
        });
        setIsSpinModalOpen(false);
    };

    const handleClearOrder = () => {
        const cleared = clearPassageOrder(teams);
        cleared.forEach(team => {
            updateTeam(team.id, {
                passageOrder: undefined,
                passageTime: undefined
            });
        });
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (id: string) => {
        const team = teams.find(t => t.id === id);
        if (team) {
            setName(team.name);
            setDescription(team.description || '');
            setEditingId(id);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ? Toutes les notes associées seront également supprimées.')) {
            deleteTeam(id);
        }
    };

    const getTeamProgress = (teamId: string) => {
        const juries = users.filter(u => u.role === 'jury');
        if (juries.length === 0) return { scored: 0, total: 0 };

        const scored = teamScores.filter(ts => ts.teamId === teamId && ts.locked).length;
        return { scored, total: juries.length };
    };

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Gestion des Équipes</h1>
                        <p className="text-muted">Ajouter et gérer les équipes participantes</p>
                    </div>
                    <div className="flex gap-md">
                        <Link to="/admin/event-dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary">
                            📥 Importer Excel
                        </button>
                        {teams.length > 0 && (
                            <button onClick={() => setIsSpinModalOpen(true)} className="btn-primary">
                                🎲 Randomiser l'ordre
                            </button>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Nouvelle Équipe
                        </button>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucune équipe enregistrée</h3>
                        <p className="text-muted">Cliquez sur "Nouvelle Équipe" pour commencer</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {teams.map(team => {
                            const progress = getTeamProgress(team.id);
                            const percentage = progress.total > 0
                                ? Math.round((progress.scored / progress.total) * 100)
                                : 0;

                            return (
                                <div key={team.id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div style={{ flex: 1 }}>
                                            <h3>{team.name}</h3>
                                            {team.description && (
                                                <p className="text-muted">{team.description}</p>
                                            )}
                                            <div className="flex gap-md items-center mt-md">
                                                <span className="badge badge-primary">
                                                    {progress.scored}/{progress.total} jurys
                                                </span>
                                                {percentage === 100 && progress.total > 0 && (
                                                    <span className="badge badge-success">✓ Complété</span>
                                                )}
                                            </div>
                                            {progress.total > 0 && (
                                                <div className="mt-md">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-bar-fill"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-md">
                                            <button onClick={() => handleEdit(team.id)} className="btn-secondary">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(team.id)} className="btn-danger">
                                                Supprimer
                                            </button>
                                        </div>
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
                title={editingId ? 'Modifier l\'Équipe' : 'Nouvelle Équipe'}
            >
                <div className="form-group">
                    <label className="form-label">Nom de l'équipe *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Team Alpha"
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description (optionnel)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Brève description de l'équipe..."
                        rows={3}
                    />
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={resetForm} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!name}
                    >
                        {editingId ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </Modal>

            {/* Import Excel Modal */}
            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />

            {/* Spinning Wheel Modal */}
            <Modal
                isOpen={isSpinModalOpen}
                onClose={() => setIsSpinModalOpen(false)}
                title="🎲 Randomiser l'Ordre de Passage"
            >
                {teams.length <= 20 ? (
                    <>
                        <p className="text-muted mb-lg">
                            Faites tourner la roue pour déterminer l'ordre de passage des équipes
                        </p>
                        <SpinningWheel teams={teams} onComplete={handleSpinComplete} />
                        <div className="flex justify-end mt-lg">
                            <button onClick={() => setIsSpinModalOpen(false)} className="btn-secondary">
                                Fermer
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-muted mb-lg">
                            Trop d'équipes pour la roue visuelle. Randomisation directe.
                        </p>
                        <div className="flex gap-md justify-end">
                            <button onClick={() => setIsSpinModalOpen(false)} className="btn-secondary">
                                Annuler
                            </button>
                            <button onClick={handleRandomize} className="btn-primary">
                                Randomiser Maintenant
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Passage Order Display */}
            <PassageOrderDisplay teams={teams} onClear={handleClearOrder} />
        </>
    );
};
