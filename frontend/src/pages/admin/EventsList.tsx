import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ChangePasswordModal } from '../../components/admin/ChangePasswordModal';
import type { Event } from '../../types';

export const EventsList = () => {
    const { user, logout } = useAuth();
    const { events, addEvent, updateEvent, deleteEvent, setCurrentEventId } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Event['status']>('upcoming');
    const [hasPresentations, setHasPresentations] = useState(true);
    const [presentationStartTime, setPresentationStartTime] = useState('08:00');
    const [presentationDuration, setPresentationDuration] = useState(10);

    const handleSubmit = async () => {
        if (!name || !date) return;

        const eventData = {
            name,
            date,
            description,
            status,
            has_presentations: hasPresentations,
            presentation_start_time: presentationStartTime,
            presentation_duration: presentationDuration
        };

        if (editingId) {
            await updateEvent(editingId, eventData);
        } else {
            await addEvent(eventData);
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setDate('');
        setDescription('');
        setStatus('upcoming');
        setHasPresentations(true);
        setPresentationStartTime('08:00');
        setPresentationDuration(10);
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (event: Event) => {
        setName(event.name);
        setDate(event.date.split('T')[0]);
        setDescription(event.description || '');
        setStatus(event.status);
        setHasPresentations(event.has_presentations ?? true);
        setPresentationStartTime(event.presentation_start_time || '08:00');
        setPresentationDuration(event.presentation_duration || 10);
        setEditingId(event.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            await deleteEvent(id);
        }
    };

    const handleManageEvent = (event: Event) => {
        setCurrentEventId(event.id);
        navigate('/admin/event-dashboard');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusBadge = (status: Event['status']) => {
        switch (status) {
            case 'upcoming':
                return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100">À venir</span>;
            case 'ongoing':
                return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs font-medium border border-amber-100">En cours</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium border border-emerald-100">Terminé</span>;
        }
    };

    const sortedEvents = [...events].sort((a, b) => {
        const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des événements</h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        Changer le mot de passe
                    </Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Nouvel événement
                    </Button>
                </div>
            </div>

            {events.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-200">

                    <h3 className="text-2xl font-bold text-slate-700 mb-2">Aucun événement</h3>
                    <p className="text-slate-500 mb-8">Créez votre premier événement pour commencer</p>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Créer un Événement
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sortedEvents.map(event => (
                        <Card key={event.id} className="group hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{event.name}</h3>
                                        {getStatusBadge(event.status)}
                                    </div>
                                    <p className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                                        {new Date(event.date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <div className="flex gap-4 mb-2">
                                        {!event.has_presentations ? (
                                            <span className="text-xs text-slate-500 italic">Pas de présentation</span>
                                        ) : (
                                            <div className="flex gap-3">
                                                <span className="text-xs text-slate-500">
                                                    Démarrage: <b>{event.presentation_start_time?.replace(':', 'h')}</b>
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Durée: <b>{event.presentation_duration} min/groupe</b>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {event.description && (
                                        <p className="text-slate-600 text-sm line-clamp-2 max-w-2xl">{event.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="primary" onClick={() => handleManageEvent(event)}>
                                        Gérer
                                    </Button>
                                    <Button variant="secondary" onClick={() => handleEdit(event)}>
                                        Modifier
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(event.id)}>
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
            >
                <div className="flex flex-col gap-5">
                    <div>
                        <Input
                            label="Nom de l'événement *"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: JuryHack 2025"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="hasPresentations"
                            checked={hasPresentations}
                            onChange={e => setHasPresentations(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="hasPresentations" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Cet événement comporte des présentations
                        </label>
                    </div>

                    {hasPresentations && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1.5">Heure de début</label>
                                <input
                                    type="time"
                                    value={presentationStartTime}
                                    onChange={e => setPresentationStartTime(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Durée / groupe (min)"
                                    type="number"
                                    value={presentationDuration}
                                    onChange={e => setPresentationDuration(parseInt(e.target.value) || 0)}
                                    min={1}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optionnel)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description de l'événement..."
                            rows={3}
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={resetForm}>Annuler</Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={!name || !date}>
                            {editingId ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </DashboardLayout>
    );
};
