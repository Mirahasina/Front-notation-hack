import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { generateJuryCredentials } from '../../utils/auth';
import { Modal } from '../../components/Modal';
import type { User } from '../../types';

export const ManageJuries = () => {
    const { users, addUser, updateUser, deleteUser, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJury, setEditingJury] = useState<User | null>(null);
    const [juryName, setJuryName] = useState('');
    const [juryPassword, setJuryPassword] = useState('');
    const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);

    const juries = users.filter(u => u.role === 'jury');

    // const eventCriteria = criteria;

    const handleOpenModal = (jury?: User) => {
        if (jury) {
            setEditingJury(jury);
            setJuryName(jury.username);
            setJuryPassword('');
            setSelectedCriteriaIds(jury.assignedCriteriaIds || []);
        } else {
            setEditingJury(null);
            setJuryName('');
            setJuryPassword('');
            setSelectedCriteriaIds([]);
        }
        setIsModalOpen(true);
    };

    const handleSaveJury = () => {
        if (!juryName.trim() || !currentEventId) return;

        if (editingJury) {
            const updates: Partial<User> = {
                username: juryName,
                assignedCriteriaIds: selectedCriteriaIds
            };
            if (juryPassword.trim()) {
                updates.password = juryPassword.trim();
            }
            updateUser(editingJury.id, updates);
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

            addUser({
                ...credentials,
                role: 'jury',
                eventId: currentEventId,
                assignedCriteriaIds: selectedCriteriaIds
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

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce jury ?')) {
            deleteUser(id);
        }
    };

    // const toggleCriterion = (id: string) => {
    //     setSelectedCriteriaIds(prev =>
    //         prev.includes(id)
    //             ? prev.filter(cId => cId !== id)
    //             : [...prev, id]
    //     );
    // };

    return (
        <div className="manage-juries-page">
            <Navbar />
            <div className="container page-content">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="heading-1 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Gestion des jurys</h1>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => handleOpenModal()} className="btn-primary bg-pink-600 hover:bg-pink-500">
                            <span className="text-lg">+</span> Nouveau jury
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {juries.map((jury, index) => (
                        <div key={jury.id} className="card hover:border-pink-500/50 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(jury)} className="text-slate-500 hover:text-indigo-400 p-2 text-sm font-medium transition-colors">
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(jury.id)} className="text-slate-500 hover:text-red-400 p-2 text-sm font-medium transition-colors">
                                        Supprimer
                                    </button>
                                </div>
                            </div>

                            <h3 className="heading-3 mb-1">{jury.username}</h3>

                            <div className="mt-3 mb-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Critères assignés</p>
                                <div className="flex flex-wrap gap-2">
                                    {!jury.assignedCriteriaIds || jury.assignedCriteriaIds.length === 0 ? (
                                        <span className="badge badge-warning">Aucun critère</span>
                                    ) : (
                                        <span className="badge badge-info">{jury.assignedCriteriaIds.length} critères</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 mt-4">
                                <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
                                    <span></span> Identifiants de connexion :
                                </div>
                                <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                                    <span className="text-slate-500">Login:</span>
                                    <span className="font-mono text-white select-all">{jury.username}</span>

                                    <span className="text-slate-500">Mdp:</span>
                                    <span className="font-mono text-white select-all">{jury.password}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {juries.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                            <span className="text-6xl block mb-4"></span>
                            <h3 className="text-xl text-slate-300 font-bold mb-2">Aucun jury enregistré</h3>
                            <button onClick={() => handleOpenModal()} className="text-pink-400 hover:text-pink-300 hover:underline">
                                Ajouter un membre du jury
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingJury ? "Modifier le Jury" : "Ajouter un Jury"}
            >
                <div className="flex flex-col gap-6">
                    <div className="form-group">
                        <label className="form-label">Nom complet</label>
                        <input
                            type="text"
                            value={juryName}
                            onChange={e => setJuryName(e.target.value)}
                            placeholder="Ex: Jean Dupont"
                            className="input-base"
                            autoFocus
                        />
                        {!editingJury && juryName && (
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                Un mot de passe sécurisé sera généré automatiquement.
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mot de passe {!editingJury && '*'}</label>
                        <input
                            type="text"
                            value={juryPassword}
                            onChange={e => setJuryPassword(e.target.value)}
                            placeholder={editingJury ? "Laisser vide pour ne pas changer" : "Mot de passe du jury"}
                            className="input-base"
                        />
                        {!editingJury && !juryPassword && (
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                Si vide, un mot de passe aléatoire sera généré.
                            </p>
                        )}
                    </div>

                    {/* <div className="form-group">
                        <label className="form-label mb-3">Critères à noter</label>
                        <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {eventCriteria.length === 0 ? (
                                <p className="text-slate-500 italic text-sm">Aucun critère défini pour cet événement.</p>
                            ) : (
                                eventCriteria.map(criterion => (
                                    <label
                                        key={criterion.id}
                                        className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${selectedCriteriaIds.includes(criterion.id)
                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCriteriaIds.includes(criterion.id)}
                                            onChange={() => toggleCriterion(criterion.id)}
                                            className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500/30 bg-slate-900 mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{criterion.name}</div>
                                            <div className="text-xs opacity-70">Max: {criterion.maxScore} pts</div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-400 px-1">
                            <span>{selectedCriteriaIds.length} sélectionné(s)</span>
                            <button
                                type="button"
                                onClick={() => setSelectedCriteriaIds(eventCriteria.map(c => c.id))}
                                className="text-indigo-400 hover:text-indigo-300"
                            >
                                Tout sélectionner
                            </button>
                        </div> */}
                    {/* </div> */}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={handleCloseModal}
                            className="btn-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSaveJury}
                            className="btn-primary bg-pink-600 hover:bg-pink-500"
                            disabled={!juryName.trim()}
                        >
                            {editingJury ? 'Enregistrer' : 'Créer le jury'}
                        </button>
                    </div>
                </div>
            </Modal >
        </div >
    );
};
