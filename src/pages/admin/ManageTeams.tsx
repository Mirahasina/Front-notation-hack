import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { ImportExcelModal } from '../../components/ImportExcelModal';
import { PassageOrderDisplay } from '../../components/PassageOrderDisplay';
import { useData } from '../../contexts/DataContext';
import { assignPassageOrder, clearPassageOrder } from '../../utils/randomizer';
import { exportTeamsToExcel } from '../../utils/excelExport';

const generatePlatformEmail = (baseEmail: string, teamName: string, index: number): string => {
    if (!baseEmail || !baseEmail.includes('@')) return '';
    const [localPart, domain] = baseEmail.split('@');
    const platformName = teamName.replace(/\s+/g, '_');
    return `${localPart}+${platformName}_Team${index + 1}@${domain}`;
};

export const ManageTeams = () => {
    const { teams, addTeam, updateTeam, deleteTeam, users, teamScores, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const generatePlatformName = (teamName: string, index: number) => {
        const baseName = teamName.replace(/\s+/g, '_');
        return `${baseName}_Team${index + 1}`;
    };

    const handleSubmit = () => {
        if (!name) return;
        if (!currentEventId) return;

        const teamIndex = editingId
            ? teams.findIndex(t => t.id === editingId)
            : teams.length;

        const generatedEmail = email ? generatePlatformEmail(email, name, teamIndex) : undefined;

        if (editingId) {
            updateTeam(editingId, {
                name,
                email: email || undefined,
                generatedEmail,
                eventId: currentEventId
            });
        } else {
            // Pas de mot de passe ici - généré à la première connexion
            addTeam({
                name,
                email: email || undefined,
                generatedEmail,
                hasLoggedIn: false,
                eventId: currentEventId,
                importedFrom: 'manual'
            });
        }

        resetForm();
    };

    const handleImport = (imported: Array<{ name: string; description?: string }>) => {
        if (!currentEventId) return;

        imported.forEach((item, idx) => {
            addTeam({
                name: item.name,
                email: item.description,
                generatedEmail: item.description ? generatePlatformEmail(item.description, item.name, teams.length + idx) : undefined,
                hasLoggedIn: false,
                eventId: currentEventId,
                importedFrom: 'excel'
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
        setEmail('');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (id: string) => {
        const team = teams.find(t => t.id === id);
        if (team) {
            setName(team.name);
            setEmail(team.email || '');
            setEditingId(id);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
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
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="heading-1">Gestion des Projets</h1>
                        <p className="text-body text-lg">Ajouter et gérer les projets participants</p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <Link to="/admin/event-dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary">
                            Importer excel
                        </button>
                        {teams.length > 0 && (
                            <>
                                <button onClick={() => exportTeamsToExcel(teams)} className="btn-success">
                                    Exporter excel
                                </button>
                                <button onClick={handleRandomize} className="btn-primary">
                                    Tour de passage
                                </button>
                            </>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Nouveau Projet
                        </button>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="card text-center p-12">
                        <h3 className="heading-3">Aucun projet enregistré</h3>
                        <p className="text-body">Cliquez sur "Nouveau Projet" pour commencer</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {teams.map((team, index) => {
                            const progress = getTeamProgress(team.id);
                            const percentage = progress.total > 0
                                ? Math.round((progress.scored / progress.total) * 100)
                                : 0;
                            const platformName = generatePlatformName(team.name, index);

                            return (
                                <div key={team.id} className="card p-8">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 space-y-2">
                                            <h3 className="heading-3 text-2xl mb-2">{team.name}</h3>
                                            <p className="text-sm text-indigo-400 font-mono">
                                                Plateforme: {platformName}
                                            </p>
                                            {team.generatedEmail && (
                                                <p className="text-sm text-emerald-400 font-mono">
                                                    Email: {team.generatedEmail}
                                                </p>
                                            )}
                                            {team.passageOrder && (
                                                <p className="text-base text-amber-400 font-bold">
                                                    Passage #{team.passageOrder} {team.passageTime && `à ${team.passageTime}`}
                                                </p>
                                            )}
                                            <div className="flex gap-3 items-center mt-4">
                                                <span className="badge badge-primary scale-110">
                                                    {progress.scored}/{progress.total} jurys
                                                </span>
                                                {percentage === 100 && progress.total > 0 && (
                                                    <span className="badge badge-success scale-110">✓ Complété</span>
                                                )}
                                                {team.hasLoggedIn && (
                                                    <span className="badge badge-warning scale-110">Connecté</span>
                                                )}
                                            </div>
                                            {progress.total > 0 && (
                                                <div className="progress-bar mt-4 h-3">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleEdit(team.id)} className="btn-secondary py-2 px-5">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(team.id)} className="btn-danger py-2 px-5">
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
                title={editingId ? 'Modifier le Projet' : 'Nouveau Projet'}
            >
                <div className="form-group space-y-4">
                    <label className="form-label">Nom du projet *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Lova UI"
                        className="input-base"
                        autoFocus
                    />
                    {name && (
                        <p className="text-xs text-indigo-400 font-mono mt-1">
                            📋 Nom plateforme: {name.replace(/\s+/g, '_')}_Team{editingId ? teams.findIndex(t => t.id === editingId) + 1 : teams.length + 1}
                        </p>
                    )}
                </div>

                <div className="form-group space-y-4">
                    <label className="form-label">Email du chef d'équipe</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="input-base"
                    />
                    {email && name && (
                        <p className="text-xs text-emerald-400 font-mono mt-1">
                            📧 Email généré: {generatePlatformEmail(email, name, editingId ? teams.findIndex(t => t.id === editingId) : teams.length)}
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                        Le mot de passe sera généré lors de la première connexion de l'équipe.
                    </p>
                </div>

                <div className="flex gap-4 justify-end mt-8">
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

            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />

            <PassageOrderDisplay teams={teams} onClear={handleClearOrder} />
        </>
    );
};
