import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getJuryProgress, areAllTeamsScored } from '../../utils/calculations';
import { ChangePasswordModal } from '../../components/admin/ChangePasswordModal';

export const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { users, teams, criteria, teamScores } = useData();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const juries = users.filter(u => u.role === 'jury');
    const allScored = areAllTeamsScored(teams, juries, teamScores);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

     const statCards = [
       { title: 'Jurys', value: juries.length, color: 'bg-blue-50 text-blue-600' },
       { title: 'Équipes', value: teams.length, color: 'bg-purple-50 text-purple-600' },
       { title: 'Critères', value: criteria.length, color: 'bg-emerald-50 text-emerald-600' },
      { title: 'Statut', value: allScored ? 'Terminé' : 'En cours', color: allScored ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600' },
    ];

    const menuItems = [
        {
            title: 'Gestion des jurys',
            desc: 'Créer des comptes et suivre la progression',
            path: '/admin/jurys',
            count: juries.length,
            color: 'group-hover:text-blue-600'
        },
        {
            title: 'Gestion des équipes',
            desc: 'Inscrire et gérer les équipes participantes',
            path: '/admin/teams',
            count: teams.length,
            color: 'group-hover:text-purple-600'
        },
        {
            title: 'Gestion des critères',
            desc: 'Définir la grille de notation',
            path: '/admin/criteres',
            count: criteria.length,
            color: 'group-hover:text-emerald-600'
        },
        {
            title: 'Résultats Publics',
            desc: 'Visualiser le classement en direct',
            path: '/public/results',
            external: true, // handled by click
            count: null,
            color: 'group-hover:text-amber-600'
        },
    ];

    return (
        <DashboardLayout
            userType="admin"
            userName={user?.username || 'Admin'}
            onLogout={handleLogout}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
                    <p className="text-slate-500 mt-1">Vue d'ensemble du hackathon</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(true)}
                    leftIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    }
                >
                    Sécurité
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="flex items-center p-6 gap-4 border-l-4 border-l-transparent hover:border-l-slate-900 overflow-hidden relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {menuItems.map((item, idx) => (
                    <Card
                        key={idx}
                        className="group cursor-pointer p-6 hover:-translate-y-1 transition-all duration-300"
                        onClick={() => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            {item.count !== null && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                                    {item.count}
                                </span>
                            )}
                        </div>
                        <h3 className={`text-lg font-bold text-slate-900 mb-2 ${item.color} transition-colors`}>{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </Card>
                ))}
            </div>

            {/* Jury Progress */}
            {juries.length > 0 && teams.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Progression des Jurys</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {juries.map(jury => {
                            const progress = getJuryProgress(jury.id, teams, teamScores);
                            return (
                                <Card key={jury.id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{jury.username}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Jury Member</p>
                                        </div>
                                        <div className={`
                                            px-2 py-1 rounded-lg text-xs font-bold
                                            ${progress.percentage === 100
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-50 text-blue-700'}
                                        `}>
                                            {progress.percentage}%
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 text-right">
                                        {progress.scored} / {progress.total} équipes notées
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </DashboardLayout>
    );
};

