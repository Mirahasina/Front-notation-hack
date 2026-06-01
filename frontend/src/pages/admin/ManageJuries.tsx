import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { generateJuryCredentials } from '../../utils/auth';
import type { User } from '../../types';

export const ManageJuries = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { users, addUser, updateUser, deleteUser, criteria, currentEventId, events } = useData();
    const currentEvent = events.find(e => e.id === currentEventId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJury, setEditingJury] = useState<User | null>(null);
    const [juryName, setJuryName] = useState('');
    const [juryPassword, setJuryPassword] = useState('');
    const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const juries = users.filter(u => u.role === 'jury');

    const handleOpenModal = (jury?: User) => {
        if (jury) {
            setEditingJury(jury);
            setJuryName(jury.username);
            setJuryPassword('');
            setSelectedCriteriaIds(jury.assigned_criteria || []);
        } else {
            setEditingJury(null);
            setJuryName('');
            setJuryPassword('');
            setSelectedCriteriaIds([]);
        }
        setIsModalOpen(true);
    };

    const handleSaveJury = async () => {
        setError(null);
        if (!juryName.trim() || !currentEventId) return;

        try {
            if (editingJury) {
                const updates: Partial<User> = {
                    username: juryName,
                    assigned_criteria: selectedCriteriaIds
                };
                if (juryPassword.trim()) {
                    updates.password = juryPassword.trim();
                }
                await updateUser(editingJury.id, updates);
            } else {
                // Generate base username
                const cleanName = juryName.toLowerCase().replace(/[^a-z0-9]/g, '');
                let username = cleanName;
                let counter = 1;

                // Check for duplicates and append counter if needed
                while (users.some(u => u.username === username)) {
                    counter++;
                    username = `${cleanName}${counter}`;
                }

                let credentials;
                if (juryPassword.trim()) {
                    // Manual password
                    credentials = {
                        username,
                        password: juryPassword.trim()
                    };
                } else {
                    // Auto generated password
                    const { password } = generateJuryCredentials(juryName); // Just get the password
                    credentials = {
                        username,
                        password
                    };
                }

                await addUser({
                    ...credentials,
                    role: 'jury',
                    event: currentEventId,
                    assigned_criteria: selectedCriteriaIds
                });
            }

            handleCloseModal();
        } catch (err: any) {
            console.error("Error saving jury:", err);

            // Check if error is about username duplication
            const errorData = err.response?.data;
            const isUsernameError = errorData?.username &&
                Array.isArray(errorData.username) &&
                errorData.username.some((msg: string) => msg.includes("existe déjà") || msg.includes("already exists"));

            if (isUsernameError && !editingJury) {
                // Auto-retry with random suffix if creating a new user
                console.log("Username conflict detected, retrying with suffix...");
                try {
                    // Generate new credentials with aggressive random suffix
                    const cleanName = juryName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const newUsername = `${cleanName}${randomSuffix}`;

                    const { password } = generateJuryCredentials(juryName);
                    const credentials = {
                        username: newUsername,
                        password: juryPassword.trim() || password
                    };

                    await addUser({
                        ...credentials,
                        role: 'jury',
                        event: currentEventId,
                        assigned_criteria: selectedCriteriaIds
                    });

                    handleCloseModal();
                    return; // Success on retry
                } catch (retryErr) {
                    console.error("Retry failed:", retryErr);
                    // Fall through to show error if retry fails
                }
            }

            if (err.response?.data) {
                // Handle field-specific errors
                if (typeof errorData === 'object' && !errorData.detail) {
                    const messages = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${(msgs as any[]).join(', ')}`)
                        .join(' | ');
                    setError(messages);
                } else {
                    setError(errorData.detail || "Une erreur est survenue lors de l'enregistrement");
                }
            } else {
                setError(err.message || "Une erreur inconnue est survenue");
            }
        }
    };

    const handleCloseModal = () => {
        setJuryName('');
        setJuryPassword('');
        setSelectedCriteriaIds([]);
        setEditingJury(null);
        setError(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce jury ?')) {
            await deleteUser(id);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Gestion des jurys {currentEvent ? `- ${currentEvent.name}` : ''}
                    </h1>
                    <p className="text-slate-500 mt-1">Créez et gérez les comptes des membres du jury</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/admin/event-dashboard')}>
                        ← Retour
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleOpenModal()}
                        disabled={!currentEventId}
                        title={!currentEventId ? "Veuillez d'abord sélectionner un événement" : ""}
                    >
                        + Nouveau jury
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {juries.map((jury) => (
                    <Card key={jury.id} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {jury.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{jury.username}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Critères assignés</p>
                                <div className="flex flex-wrap gap-2">
                                    {!jury.assigned_criteria || jury.assigned_criteria.length === 0 ? (
                                        <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs font-medium border border-amber-100">Aucun critère spécifique</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100">{jury.assigned_criteria.length} critères</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Identifiants</span>
                                </div>
                                <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                                    <span className="text-slate-500 font-medium">Login:</span>
                                    <span className="font-mono text-slate-700 select-all bg-white px-1 rounded border border-slate-100">{jury.username}</span>

                                    <span className="text-slate-500 font-medium">Mdp:</span>
                                    <span className="font-mono text-slate-700 select-all bg-white px-1 rounded border border-slate-100">{jury.password}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(jury)}>
                                Modifier
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(jury.id)}>
                                Supprimer
                            </Button>
                        </div>
                    </Card>
                ))}

                {juries.length === 0 && (
                    <Card className="col-span-full flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Aucun jury enregistré</h3>
                        <p className="text-slate-500 mb-8">Ajoutez des membres au jury pour commencer la notation</p>
                        <Button
                            variant="primary"
                            onClick={() => handleOpenModal()}
                            disabled={!currentEventId}
                            title={!currentEventId ? "Veuillez d'abord sélectionner un événement" : ""}
                        >
                            Ajouter un membre du jury
                        </Button>
                    </Card>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingJury ? "Modifier le Jury" : "Ajouter un Jury"}
            >
                <div className="flex flex-col gap-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                    <div>
                        <Input
                            label="Nom complet"
                            autoFocus
                            value={juryName}
                            onChange={e => setJuryName(e.target.value)}
                            placeholder="Ex: RISE Jury"
                        />
                        {!editingJury && juryName && (
                            <p className="text-xs text-slate-500 mt-2 ml-1">
                                Un mot de passe sécurisé sera généré automatiquement.
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            label={`Mot de passe ${!editingJury ? '*' : ''}`}
                            value={juryPassword}
                            onChange={e => setJuryPassword(e.target.value)}
                            placeholder={editingJury ? "Laisser vide pour ne pas changer" : "Mot de passe du jury"}
                        />
                        {!editingJury && !juryPassword && (
                            <p className="text-xs text-slate-500 mt-2 ml-1">
                                Si vide, un mot de passe aléatoire sera généré.
                            </p>
                        )}
                    </div>


                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-3">Critères assignés</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                            {criteria.map(crit => (
                                <label key={crit.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedCriteriaIds.includes(crit.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCriteriaIds([...selectedCriteriaIds, crit.id]);
                                            } else {
                                                setSelectedCriteriaIds(selectedCriteriaIds.filter(id => id !== crit.id));
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{crit.name}</span>
                                </label>
                            ))}
                            {criteria.length === 0 && (
                                <p className="col-span-full text-xs text-slate-400 italic text-center py-2">
                                    Aucun critère défini pour cet événement.
                                </p>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-1 uppercase font-bold tracking-widest">
                            Si aucun critère n'est sélectionné, le jury évaluera TOUS les critères.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveJury}
                            disabled={!currentEventId || !juryName.trim()}
                        >
                            {editingJury ? 'Enregistrer' : 'Créer le jury'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
