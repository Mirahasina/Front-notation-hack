import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ImportExcelModal } from '../../components/ImportExcelModal';
import { PassageOrderDisplay } from '../../components/PassageOrderDisplay';
import { assignPassageOrder, clearPassageOrder } from '../../utils/randomizer';
import { exportTeamsToExcel } from '../../utils/excelExport';

const generatePlatformEmail = (baseEmail: string, teamName: string, index: number): string => {
    if (!baseEmail || !baseEmail.includes('@')) return '';
    const [localPart, domain] = baseEmail.split('@');
    const platformName = teamName.replace(/\s+/g, '_');
    return `${localPart}+${platformName}_Team${index + 1}@${domain}`;
};

export const ManageTeams = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { teams, addTeam, updateTeam, deleteTeam, deleteAllTeams, users, teamScores, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const generatePlatformName = (teamName: string, index: number) => {
        const baseName = teamName.replace(/\s+/g, '_');
        return `${baseName}_Team${index + 1}`;
    };

    const handleSubmit = async () => {
        if (!name) return;
        if (!currentEventId) return;

        const teamIndex = editingId
            ? teams.findIndex(t => t.id === editingId)
            : teams.length;

        const generated_email = email ? generatePlatformEmail(email, name, teamIndex) : undefined;

        if (editingId) {
            await updateTeam(editingId, {
                name,
                email: email || undefined,
                generated_email,
                event: currentEventId
            });
        } else {
            // Pas de mot de passe ici - généré à la première connexion
            await addTeam({
                name,
                email: email || undefined,
                generated_email,
                has_logged_in: false,
                event: currentEventId
            });
        }

        resetForm();
    };

    const handleImport = async (imported: Array<{ name: string; description?: string; email?: string }>) => {
        if (!currentEventId) return;

        for (let idx = 0; idx < imported.length; idx++) {
            const item = imported[idx];
            const teamEmail = item.email || item.description;
            const generated_email = teamEmail ? generatePlatformEmail(teamEmail, item.name, teams.length + idx) : undefined;
            await addTeam({
                name: item.name,
                email: teamEmail,
                generated_email,
                has_logged_in: false,
                event: currentEventId
            });
        }
    };

    const handleRandomize = async () => {
        const ordered = assignPassageOrder(teams, '08h00', 8);
        for (const team of ordered) {
            await updateTeam(team.id, {
                passage_order: team.passage_order,
                passage_time: team.passage_time
            });
        }
    };

    const handleClearOrder = async () => {
        const cleared = clearPassageOrder(teams);
        for (const team of cleared) {
            await updateTeam(team.id, {
                passage_order: undefined,
                passage_time: undefined
            });
        }
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

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            await deleteTeam(id);
        }
    };

    const handleDeleteAll = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les équipes ? Cette action est irréversible.')) {
            await deleteAllTeams();
        }
    };

    const getTeamProgress = (teamId: string) => {
        const juries = users.filter(u => u.role === 'jury');
        if (juries.length === 0) return { scored: 0, total: 0 };
        const scored = teamScores.filter(ts => ts.team === teamId && ts.locked).length;
        return { scored, total: juries.length };
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Projets</h1>
                    <p className="text-slate-500 mt-1">Gérez les équipes et leur ordre de passage</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        ← Retour
                    </Button>
                    <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                        Importer Excel
                    </Button>
                    {teams.length > 0 && (
                        <>
                            <Button variant="outline" onClick={() => exportTeamsToExcel(teams)}>
                                Exporter
                            </Button>
                            <Button variant="danger" onClick={handleDeleteAll}>
                                Tout effacer
                            </Button>
                            <Button variant="primary" onClick={handleRandomize}>
                                Tirage au sort
                            </Button>
                        </>
                    )}
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Nouveau Projet
                    </Button>
                </div>
            </div>

            {teams.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">Aucun projet enregistré</h3>
                    <p className="text-slate-500 mb-8 max-w-md text-center">Commencez par ajouter un projet manuellement ou importez une liste depuis un fichier Excel</p>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Créer mon premier projet
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {teams.map((team, index) => {
                        const progress = getTeamProgress(team.id);
                        const percentage = progress.total > 0
                            ? Math.round((progress.scored / progress.total) * 100)
                            : 0;
                        const platformName = generatePlatformName(team.name, index);

                        return (
                            <Card key={team.id} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{team.name}</h3>
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            <span className="text-xs font-mono text-slate-500 truncate" title={platformName}>
                                                {platformName}
                                            </span>
                                        </div>
                                        {team.generated_email && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                <span className="text-xs text-slate-500 truncate" title={team.generated_email}>
                                                    {team.generated_email}
                                                </span>
                                            </div>
                                        )}
                                        {team.passage_order && (
                                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Passage</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-amber-600">#{team.passage_order}</span>
                                                    {team.passage_time && <span className="text-xs text-amber-500">à {team.passage_time}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${progress.total > 0 && percentage === 100 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {progress.scored}/{progress.total} votes
                                        </span>
                                        {team.has_logged_in && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Connecté</span>
                                        )}
                                    </div>

                                    {progress.total > 0 && (
                                        <div className="mb-6">
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(team.id)}>
                                        Modifier
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(team.id)}>
                                        Supprimer
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingId ? 'Modifier le Projet' : 'Nouveau Projet'}
            >
                <div className="flex flex-col gap-6">
                    <div>
                        <Input
                            label="Nom du projet"
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: RISE UI"
                        />
                        {name && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-500 font-bold uppercase mb-1">Identifiant Plateforme</p>
                                <p className="text-sm font-mono text-slate-700">
                                    {name.replace(/\s+/g, '_')}_Team{editingId ? teams.findIndex(t => t.id === editingId) + 1 : teams.length + 1}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Email du chef d'équipe"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="contact@example.com"
                        />
                        {email && name && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Email de Connexion</p>
                                <p className="text-sm font-mono text-slate-700 break-all">
                                    {generatePlatformEmail(email, name, editingId ? teams.findIndex(t => t.id === editingId) : teams.length)}
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                            Le mot de passe sera généré lors de la première connexion.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <Button variant="secondary" onClick={resetForm}>
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!name}
                        >
                            {editingId ? 'Sauvegarder' : 'Créer le projet'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />

            <PassageOrderDisplay teams={teams} onClear={handleClearOrder} />
        </DashboardLayout>
    );
};
