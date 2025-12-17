import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useData } from '../../contexts/DataContext';
import { generateJuryCredentials } from '../../utils/auth';
import { Modal } from '../../components/Modal';

export const ManageJuries = () => {
    const { users, addUser, deleteUser, currentEventId } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJuryName, setNewJuryName] = useState('');

    const juries = users.filter(u => u.role === 'jury');

    const handleAddJury = () => {
        if (!newJuryName.trim() || !currentEventId) return;

        const credentials = generateJuryCredentials(newJuryName);
        addUser({
            ...credentials,
            role: 'jury',
            eventId: currentEventId
        });

        setNewJuryName('');
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce jury ?')) {
            deleteUser(id);
        }
    };

    return (
        <div className="manage-juries-page">
            <Navbar />
            <div className="container page-content">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="heading-1 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Gestion des jurys</h1>
                        <p className="text-body text-lg">Gérez les comptes d'accès pour les membres du jury</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary bg-pink-600 hover:bg-pink-500">
                            <span className="text-lg">+</span> Nouveau Jury
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {juries.map((jury, index) => (
                        <div key={jury.id} className="card hover:border-pink-500/50 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"></span>
                                <button onClick={() => handleDelete(jury.id)} className="text-slate-500 hover:text-red-400 p-2 text-sm font-medium transition-colors">
                                    Supprimer
                                </button>
                            </div>

                            <h3 className="heading-3 mb-1">{jury.username}</h3>

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
                            <button onClick={() => setIsModalOpen(true)} className="text-pink-400 hover:text-pink-300 hover:underline">
                                Ajouter un membre du jury
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setNewJuryName('');
                    setIsModalOpen(false);
                }}
                title="Ajouter un Jury"
            >
                <div className="flex flex-col gap-6">
                    <div className="form-group">
                        <label className="form-label">Nom complet</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            </span>
                            <input
                                type="text"
                                value={newJuryName}
                                onChange={e => setNewJuryName(e.target.value)}
                                placeholder="Ex: Jean Dupont"
                                className="input-base pl-12"
                                autoFocus
                            />
                        </div>
                        {newJuryName && (
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                Un mot de passe sécurisé sera généré automatiquement.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleAddJury}
                            className="btn-primary bg-pink-600 hover:bg-pink-500"
                            disabled={!newJuryName.trim()}
                        >
                            Générer les accès
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
