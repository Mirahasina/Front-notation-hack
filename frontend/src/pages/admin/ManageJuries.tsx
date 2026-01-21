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
    const { users, addUser, updateUser, deleteUser, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJury, setEditingJury] = useState<User | null>(null);
    const [juryName, setJuryName] = useState('');
    const [juryPassword, setJuryPassword] = useState('');
    const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);

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
        if (!juryName.trim() || !currentEventId) return;

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
    };

    const handleCloseModal = () => {
        setJuryName('');
        setJuryPassword('');
        setSelectedCriteriaIds([]);
        setEditingJury(null);
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
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Jurys</h1>
                    <p className="text-slate-500 mt-1">Créez et gérez les comptes des membres du jury</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        ← Retour
                    </Button>
                    <Button variant="primary" onClick={() => handleOpenModal()}>
                        + Nouveau jury
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {juries.map((jury, index) => (
                    <Card key={jury.id} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {jury.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{jury.username}</h3>
                                        <p className="text-xs text-slate-500">Jury</p>
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
                        <Button variant="primary" onClick={() => handleOpenModal()}>
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
                    <div>
                        <Input
                            label="Nom complet"
                            autoFocus
                            value={juryName}
                            onChange={e => setJuryName(e.target.value)}
                            placeholder="Ex: Jean Dupont"
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveJury}
                            disabled={!juryName.trim()}
                        >
                            {editingJury ? 'Enregistrer' : 'Créer le jury'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
