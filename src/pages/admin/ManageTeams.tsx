import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { ImportExcelModal } from '../../components/ImportExcelModal';
import { PassageOrderDisplay } from '../../components/PassageOrderDisplay';
import { useData } from '../../contexts/DataContext';
import { assignPassageOrder, clearPassageOrder } from '../../utils/randomizer';
import { exportTeamsToExcel } from '../../utils/excelExport';
import './ManageTeams.css';

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

    const handleImport = (imported: Array<{ name: string; description?: string; email?: string }>) => {
        if (!currentEventId) return;

        imported.forEach((item, idx) => {
            const teamEmail = item.email || item.description; // Fallback to description if email is missing (legacy behavior support)
            addTeam({
                name: item.name,
                email: teamEmail,
                generatedEmail: teamEmail ? generatePlatformEmail(teamEmail, item.name, teams.length + idx) : undefined,
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
        <div className="manage-teams-page">
            <Navbar />
            <div className="container page-content">
                <div className="teams-header-section flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="heading-1 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Gestion des Projets</h1>
                        <p className="text-body text-lg">Gérez les équipes et leur ordre de passage</p>
                    </div>
                    <div className="teams-actions flex flex-wrap gap-3">
                        <Link to="/admin/event-dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary">
                            <span className="text-lg"></span> Importer Excel
                        </button>
                        {teams.length > 0 && (
                            <>
                                <button onClick={() => exportTeamsToExcel(teams)} className="btn-success">
                                    <span className="text-lg"></span> Exporter
                                </button>
                                <button onClick={handleRandomize} className="btn-primary">
                                    <span className="text-lg"></span> Tirage au sort
                                </button>
                            </>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary bg-indigo-600 hover:bg-indigo-500">
                            <span className="text-lg">+</span> Nouveau Projet
                        </button>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="empty-state-card card flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-700">
                        <span className="text-6xl mb-6"></span>
                        <h3 className="heading-2 text-slate-300">Aucun projet enregistré</h3>
                        <p className="text-slate-400 mb-8">Commencez par ajouter un projet ou importez une liste Excel</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            Créer mon premier projet
                        </button>
                    </div>
                ) : (
                    <div className="teams-grid">
                        {teams.map((team, index) => {
                            const progress = getTeamProgress(team.id);
                            const percentage = progress.total > 0
                                ? Math.round((progress.scored / progress.total) * 100)
                                : 0;
                            const platformName = generatePlatformName(team.name, index);

                            return (
                                <div key={team.id} className="team-card card hover:border-indigo-500/50 group">
                                    <div className="team-card-content">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="team-name heading-3">{team.name}</h3>
                                            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-400 border border-slate-700">
                                                #{index + 1}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-6 p-4 bg-slate-950/30 rounded-xl border border-slate-800/50">
                                            <p className="team-info-row team-platform flex items-center gap-3 text-sm text-slate-300">
                                                <span className="text-indigo-400"></span>
                                                <span className="font-mono text-xs md:text-sm truncate" title={platformName}>{platformName}</span>
                                            </p>
                                            {team.generatedEmail && (
                                                <p className="team-info-row team-email flex items-center gap-3 text-sm text-slate-300">
                                                    <span className="text-emerald-400"></span>
                                                    <span className="truncate" title={team.generatedEmail}>{team.generatedEmail}</span>
                                                </p>
                                            )}
                                            {team.passageOrder && (
                                                <div className="team-passage mt-2 pt-2 border-t border-slate-800/50 flex flex-col">
                                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Ordre de passage</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xl font-bold text-amber-400">#{team.passageOrder}</span>
                                                        {team.passageTime && <span className="text-sm text-amber-200">à {team.passageTime}</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="team-badges flex flex-wrap gap-2 mb-4">
                                            <span className="badge badge-primary">
                                                {progress.scored}/{progress.total} votes
                                            </span>
                                            {percentage === 100 && progress.total > 0 && (
                                                <span className="badge badge-success">✓ Complété</span>
                                            )}
                                            {team.hasLoggedIn && (
                                                <span className="badge badge-warning">Connecté</span>
                                            )}
                                        </div>

                                        {progress.total > 0 && (
                                            <div className="team-progress-wrapper mb-6">
                                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                    <span>Progression</span>
                                                    <span>{percentage}%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="team-actions-footer grid grid-cols-2 gap-3 mt-auto">
                                            <button onClick={() => handleEdit(team.id)} className="btn-secondary text-sm py-2">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(team.id)} className="btn-danger text-sm py-2">
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
                <div className="flex flex-col gap-6">
                    <div className="form-group">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: RISE UI"
                                className="input-base pl-12"
                                autoFocus
                            />
                        </div>
                        {name && (
                            <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-3">
                                <span className="text-indigo-400 mt-0.5">
                                </span>
                                <div>
                                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Identifiant Plateforme</p>
                                    <p className="text-sm font-mono text-white">
                                        {name.replace(/\s+/g, '_')}_Team{editingId ? teams.findIndex(t => t.id === editingId) + 1 : teams.length + 1}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email du chef d'équipe</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="contact@example.com"
                                className="input-base pl-12"
                            />
                        </div>
                        {email && name && (
                            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                                <span className="text-emerald-400 mt-0.5"></span>
                                <div>
                                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Email de Connexion</p>
                                    <p className="text-sm font-mono text-white break-all">
                                        {generatePlatformEmail(email, name, editingId ? teams.findIndex(t => t.id === editingId) : teams.length)}
                                    </p>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <span></span> Le mot de passe sera généré lors de la première connexion.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-end mt-4 pt-6 border-t border-slate-800">
                        <button onClick={resetForm} className="btn-secondary">
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={!name}
                        >
                            {editingId ? 'Sauvegarder' : 'Créer le projet'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />

            <PassageOrderDisplay teams={teams} onClear={handleClearOrder} />
        </div>
    );
};
