import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pencil, Trash2 } from "lucide-react"


export const ManageCriteria = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { criteria, addCriterion, updateCriterion, deleteCriterion, currentEventId, users, updateUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [priorityOrder, setPriorityOrder] = useState('');
    const [weight, setWeight] = useState('1.0');
    const [selectedJuryId, setSelectedJuryId] = useState<string>('');

    const juries = users.filter(u => u.role === 'jury');
    const sortedCriteria = [...criteria].sort((a, b) => a.priority_order - b.priority_order);

    const handleSubmit = async () => {
        if (!name || !maxScore || Number(maxScore) <= 0 || !priorityOrder || Number(priorityOrder) <= 0) return;
        if (!currentEventId) return;

        let targetId: string | undefined = editingId || undefined;

        if (editingId) {
            await updateCriterion(editingId, {
                name,
                max_score: Number(maxScore),
                priority_order: Number(priorityOrder),
                event: currentEventId
            });
        } else {
            const newCriterion = await addCriterion({
                name,
                max_score: Number(maxScore),
                weight: Number(weight),
                priority_order: Number(priorityOrder),
                event: currentEventId
            });
            targetId = newCriterion.id;
        }

        if (targetId) {
            for (const jury of juries) {
                const currentassignments = jury.assigned_criteria || [];
                const hasAssignment = currentassignments.includes(targetId);

                if (jury.id === selectedJuryId) {
                    if (!hasAssignment) {
                        await updateUser(jury.id, {
                            assigned_criteria: [...currentassignments, targetId]
                        });
                    }
                } else {
                    if (hasAssignment) {
                        await updateUser(jury.id, {
                            assigned_criteria: currentassignments.filter(id => id !== targetId)
                        });
                    }
                }
            }
        }

        resetForm();
    };

    const resetForm = () => {
        setName('');
        setMaxScore('');
        setPriorityOrder('');
        setEditingId(null);
        setWeight('1.0');
        setSelectedJuryId('');
        setIsModalOpen(false);
    };

    const handleEdit = (id: string) => {
        const criterion = criteria.find(c => c.id === id);
        if (criterion) {
            setName(criterion.name);
            setMaxScore(criterion.max_score.toString());
            setPriorityOrder(criterion.priority_order?.toString() || '1');
            setWeight(criterion.weight?.toString() || '1.0');
            setEditingId(id);
            const assignedJury = juries.find(j => j.assigned_criteria?.includes(id));
            setSelectedJuryId(assignedJury ? assignedJury.id : '');
            setIsModalOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
            await deleteCriterion(id);
        }
    };

    const handleOpenNewModal = () => {
        const nextPriority = criteria.length > 0
            ? Math.max(...criteria.map(c => c.priority_order || 0)) + 1
            : 1;
        setPriorityOrder(nextPriority.toString());
        setWeight('1.0');
        setSelectedJuryId('');
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const totalMaxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);

    return (
        <DashboardLayout userType="admin" userName={user?.username || 'Admin'} onLogout={handleLogout}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Critères</h1>
                    <p className="text-slate-500 mt-1">Définissez les critères d'évaluation et leur pondération</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/admin/event-dashboard')}>
                        ← Retour
                    </Button>
                    <Button variant="primary" onClick={handleOpenNewModal}>
                        + Nouveau Critère
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {totalMaxScore > 0 && (
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none">
                        <div>
                            <h3 className="text-lg font-bold text-white/90 mb-1">Total Points</h3>
                            <p className="text-indigo-100 text-sm">Score maximum possible par équipe</p>
                        </div>
                        <div className="text-4xl font-bold mt-4">
                            {totalMaxScore} <span className="text-lg font-normal text-indigo-200">pts</span>
                        </div>
                    </Card>
                )}

                {criteria.length > 0 && (
                    <Card className="flex flex-col justify-between bg-amber-50 border-amber-100">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="text-lg font-bold text-amber-800 mb-1">Ordre de priorité</h3>
                                <p className="text-amber-700/80 text-sm leading-relaxed">
                                    En cas d'égalité, les équipes sont départagées selon le score du critère #1, puis #2, etc.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {criteria.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">Aucun critère défini</h3>
                    <p className="text-slate-500 mb-8">Commencez par ajouter des critères d'évaluation</p>
                    <Button variant="primary" onClick={handleOpenNewModal}>
                        Créer mon premier critère
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sortedCriteria.map(criterion => {
                        const assignedJury = juries.find(j => j.assigned_criteria?.includes(criterion.id));

                        return (
                            <Card key={criterion.id} className="group hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-4 py-4 px-6">
                                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg text-slate-600 font-bold text-lg shadow-sm">
                                    #{criterion.priority_order || '?'}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{criterion.name}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            Assigné à :
                                            <span className={`font-medium px-2 py-0.5 rounded text-xs ${assignedJury ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {assignedJury ? assignedJury.username : 'Non assigné'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            Coefficient :
                                            <span className="font-bold px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700">
                                                x {criterion.weight || 1.0}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center md:text-right px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[100px]">
                                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Max</span>
                                    <span className="text-xl font-bold text-slate-800">{criterion.max_score} pts</span>
                                </div>

                                <div className="flex gap-2">
                                    < Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(criterion.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(criterion.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
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
                title={editingId ? 'Modifier le Critère' : 'Nouveau Critère'}
            >
                <div className="flex flex-col gap-5">
                    <div>
                        <Input
                            label="Nom du critère *"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Innovation, Design..."
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Note maximale *"
                            type="number"
                            value={maxScore}
                            onChange={e => setMaxScore(e.target.value)}
                            placeholder="Ex: 20"
                            min="1"
                            step="0.5"
                        />
                        <Input
                            label="Priorité *"
                            type="number"
                            value={priorityOrder}
                            onChange={e => setPriorityOrder(e.target.value)}
                            placeholder="1"
                            min="1"
                        />
                        <Input
                            label="Coefficient (Poids) *"
                            type="number"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            placeholder="1.0"
                            min="0.1"
                            step="0.1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigner à un jury (bêta)</label>
                        <div className="relative">
                            <select
                                value={selectedJuryId}
                                onChange={e => setSelectedJuryId(e.target.value)}
                                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm appearance-none"
                            >
                                <option value="">-- Sélectionner un jury --</option>
                                {juries.map(jury => (
                                    <option key={jury.id} value={jury.id}>
                                        {jury.username} {jury.assigned_criteria?.length ? `(${jury.assigned_criteria.length} critères)` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Un critère ne peut être corrigé que par un seul jury.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={resetForm}>
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!name || !maxScore || Number(maxScore) <= 0 || !priorityOrder || Number(priorityOrder) <= 0}
                        >
                            {editingId ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
