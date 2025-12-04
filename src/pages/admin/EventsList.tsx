import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { useData } from '../../contexts/DataContext';
import type { Event } from '../../types';
import './EventsList.css';

export const EventsList = () => {
    const { events, addEvent, updateEvent, deleteEvent, setCurrentEventId } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setDate(event.date.split('T')[0]); // Format for date input
        setDescription(event.description || '');
        setStatus(event.status);
        setEditingId(event.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Toutes les données associées (jurys, équipes, critères, notes) seront également supprimées.')) {
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
        <>
            <Navbar />
            <div className="container page-content">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1>Gestion des Événements</h1>
                        <p className="text-muted">Créez et gérez vos compétitions</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        + Nouvel Événement
                    </button>
                </div>

                {events.length === 0 ? (
                    <div className="card text-center">
                        <h3>Aucun événement</h3>
                        <p className="text-muted">Créez votre premier événement pour commencer</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-lg">
                            + Créer un Événement
                        </button>
                    </div>
                ) : (
                    <div className="events-grid">
                        {sortedEvents.map(event => (
                            <div key={event.id} className="event-card card">
                                <div className="event-header">
                                    <div>
                                        <h3>{event.name}</h3>
                                        <p className="text-muted">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    {getStatusBadge(event.status)}
                                </div>

                                {event.description && (
                                    <p className="event-description">{event.description}</p>
                                )}

                                <div className="event-actions">
                                    <button
                                        onClick={() => handleManageEvent(event)}
                                        className="btn-primary"
                                    >
                                        📊 Gérer
                                    </button>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="btn-secondary"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="btn-danger"
                                    >
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
                title={editingId ? 'Modifier l\'Événement' : 'Nouvel Événement'}
            >
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
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
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

                <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select value={status} onChange={e => setStatus(e.target.value as Event['status'])}>
                        <option value="upcoming">À venir</option>
                        <option value="ongoing">En cours</option>
                        <option value="completed">Terminé</option>
                    </select>
                </div>

                <div className="flex gap-md justify-end">
                    <button onClick={resetForm} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!name || !date}
                    >
                        {editingId ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </Modal>
        </>
    );
};
