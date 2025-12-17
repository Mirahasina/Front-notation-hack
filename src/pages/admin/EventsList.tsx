import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useData } from '../../contexts/DataContext';
import { ChangePasswordModal } from '../../components/admin/ChangePasswordModal';
import type { Event } from '../../types';

export const EventsList = () => {
    const { events, addEvent, updateEvent, deleteEvent, setCurrentEventId } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Event['status']>('upcoming');

    const handleSubmit = () => {
        if (!name || !date) return;

        if (editingId) {
            updateEvent(editingId, { name, date, description, status });
        } else {
            addEvent({ name, date, description, status, createdAt: new Date().toISOString() });
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setDate('');
        setDescription('');
        setStatus('upcoming');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (event: Event) => {
        setName(event.name);
        setDate(event.date.split('T')[0]);
        setDescription(event.description || '');
        setStatus(event.status);
        setEditingId(event.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            deleteEvent(id);
        }
    };

    const handleManageEvent = (event: Event) => {
        setCurrentEventId(event.id);
        navigate('/admin/event-dashboard');
    };

    const getStatusBadge = (status: Event['status']) => {
        switch (status) {
            case 'upcoming':
                return <span className="badge badge-info">À venir</span>;
            case 'ongoing':
                return <span className="badge badge-warning">En cours</span>;
            case 'completed':
                return <span className="badge badge-success">Terminé</span>;
        }
    };

    const sortedEvents = [...events].sort((a, b) => {
        const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
            <Navbar />
            <div className="container page-content">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div>
                        <h1 className="flex items-center gap-3">
                            <span>Gestion des événements</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all text-sm font-semibold flex items-center gap-2"
                        >
                            <span></span> Changer le mot de passe
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Nouvel événement
                        </button>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl mb-2">Aucun événement</h3>
                        <p className="text-slate-400 mb-6">Créez votre premier événement pour commencer</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            + Créer un Événement
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:gap-6">
                        {sortedEvents.map(event => (
                            <div key={event.id} className="card group hover:-translate-y-1">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{event.name}</h3>
                                            {getStatusBadge(event.status)}
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2">
                                            📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        {event.description && (
                                            <p className="text-slate-500 text-sm line-clamp-2">{event.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleManageEvent(event)} className="btn-primary">
                                            Gérer
                                        </button>
                                        <button onClick={() => handleEdit(event)} className="btn-secondary">
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="btn-danger">
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
                title={editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
            >
                <div className="space-y-5">
                    <div className="form-group">
                        <label className="form-label">Nom de l'événement *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: JuryHack 2025"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date *</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (optionnel)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description de l'événement..."
                            rows={3}
                        />
                    </div>

                    {/* <div className="form-group">
                        <label className="form-label">Statut</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Event['status'])}>
                            <option value="upcoming">À venir</option>
                            <option value="ongoing">En cours</option>
                            <option value="completed">Terminé</option>
                        </select>
                    </div> */}

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                        <button onClick={resetForm} className="btn-secondary">Annuler</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={!name || !date}>
                            {editingId ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};
