import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useData } from '../../contexts/DataContext';

export const ManageJuries = () => {
    const { users, addUser, deleteUser, currentEventId, events } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const currentEvent = events.find(e => e.id === currentEventId);
    const juries = users.filter(u => u.role === 'jury' && u.eventId === currentEventId);

    const handleSubmit = () => {
        if (!username || !password || !currentEventId) return;

        addUser({
            username,
            password,
            role: 'jury',
            eventId: currentEventId
        });

        resetForm();
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce jury ? Toutes ses notes seront également supprimées.')) {
            deleteUser(id);
        }
    };

    if (!currentEvent) {
        return (
            <>
                <Navbar />
                <div className="container page-content text-center">
                    <h1>Aucun événement sélectionné</h1>
                    <Link to="/admin/events" className="btn-primary mt-lg">
                        ← Retour aux événements
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Gestion des Jurys</h1>
                        <p className="text-muted">Événement: {currentEvent.name}</p>
                    </div>
                    <div className="flex gap-md">
                        <Link to="/admin/event-dashboard" className="btn-secondary">
                            ← Retour
                        </Link>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Nouveau Jury
                        </button>
                    </div>
                </div>

                {juries.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucun jury enregistré</h3>
                        <p className="text-muted">Cliquez sur "Nouveau Jury" pour commencer</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {juries.map(jury => (
                            <div key={jury.id} className="card">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3>👤 {jury.username}</h3>
                                        <p className="text-muted">
                                            Identifiant: <code>{jury.username}</code> / Mot de passe: <code>{jury.password}</code>
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(jury.id)} className="btn-danger">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title="Nouveau Jury"
            >
                <div className="form-group">
                    <label className="form-label">Nom d'utilisateur *</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="jury1"
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mot de passe *</label>
                    <input
                        type="text"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="password123"
                    />
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Le mot de passe sera visible par l'admin pour le communiquer au jury
                    </p>
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={resetForm} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!username || !password}
                    >
                        Créer
                    </button>
                </div>
            </Modal>
        </>
    );
};
