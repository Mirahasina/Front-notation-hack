import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userType?: 'admin' | 'jury' | 'team';
    userName?: string;
    onLogout?: () => void;
    hideSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    userType = 'admin',
    userName = 'Utilisateur',
    onLogout,
    hideSidebar = false
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { error, isLoading, refresh, unreadMessagesCount, events, currentEventId } = useData();
    const currentEvent = events.find(e => e.id === currentEventId);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true); // Keep sidebar open on larger screens by default
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getNavItems = () => {
        switch (userType) {
            case 'admin':
                return [
                    { label: 'Gestion Événements', path: '/admin/events', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                    { label: 'Équipes', path: '/admin/teams', icon: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' },
                    { label: 'Jurys', path: '/admin/juries', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { label: 'Critères', path: '/admin/criteria', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                    { label: 'Messages', path: '/admin/messages', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                ];
            case 'jury':
                return [
                    { label: 'Évaluations', path: '/jury/scoring', subtitle: 'Noter les passages', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                    { label: 'Messages', path: '/jury/messages', subtitle: 'Contacter le Staff', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                    { label: 'Classement', path: '/results', subtitle: 'Résultats globaux', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                ];
            default:
                return [
                    { label: 'Accueil', path: '/team/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                    { label: 'Messages', path: '/team/dashboard', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                ];
        }
    };

    const navItems = getNavItems();

    // Full page loading / error states
    const isInitialLoad = isLoading && navItems.length > 0;

    if (error && isInitialLoad) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Problème de connexion</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed font-medium">{error}</p>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        className="rounded-2xl h-14 text-lg shadow-xl shadow-slate-900/10"
                        onClick={() => refresh()}
                    >
                        Réessayer maintenant
                    </Button>
                    <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Le serveur est peut-être en train de se réveiller</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/Rise.png" alt="R" className="h-6 w-6 object-contain opacity-50" />
                    </div>
                </div>
                <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Chargement sécurisé...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {!hideSidebar && (
                <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-40 gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/Rise.png" alt="Rise" className="h-6 object-contain" />
                        <span className="font-bold tracking-tight">Hackathon</span>
                    </div>
                </header>
            )}

            {isSidebarOpen && !hideSidebar && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {!hideSidebar && (
                <aside
                    className={`fixed md:sticky top-16 md:top-0 bottom-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 transform md:transform-none ${isSidebarOpen
                        ? 'translate-x-0 w-64'
                        : '-translate-x-full md:translate-x-0 md:w-20'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        <div className="h-20 hidden md:flex items-center justify-center border-b border-slate-100">
                            <div className="flex items-center gap-3 px-4">
                                <img src="/Rise.png" alt="Rise" className="h-8 object-contain" />
                                {isSidebarOpen && <span className="font-bold text-lg tracking-tight">Hackathon</span>}
                            </div>
                        </div>

                        {isSidebarOpen && userType === 'admin' && currentEvent && (
                            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Événement Actif</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-700 truncate">{currentEvent.name}</span>
                                </div>
                            </div>
                        )}

                        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        title={!isSidebarOpen ? item.label : ''}
                                    >
                                        <span className="relative shrink-0 flex items-center justify-center">
                                            <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                            </svg>
                                            {item.label === 'Messages' && unreadMessagesCount > 0 && !isSidebarOpen && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
                                            )}
                                        </span>
                                        {(isSidebarOpen || isMobile) && (
                                            <span className="flex-1 flex items-center justify-between min-w-0">
                                                <span className="flex flex-col items-start min-w-0">
                                                    <span className="font-medium text-sm leading-none truncate">{item.label}</span>
                                                    {(item as any).subtitle && (
                                                        <span className={`text-[10px] mt-1 font-medium uppercase tracking-wider ${(isActive ? 'text-white/60' : 'text-slate-400')} truncate`}>
                                                            {(item as any).subtitle}
                                                        </span>
                                                    )}
                                                </span>
                                                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                                                        {unreadMessagesCount}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-slate-100">
                            <div className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'md:justify-center'}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                {(isSidebarOpen || isMobile) && (
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                                        <p className="text-xs text-slate-500 capitalize">{userType}</p>
                                    </div>
                                )}
                            </div>
                            {(isSidebarOpen || isMobile) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 justify-start"
                                    onClick={onLogout}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    }
                                >
                                    Déconnexion
                                </Button>
                            )}
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-red-900">Problème de connexion</p>
                                    <p className="text-xs text-red-700 truncate">{error}</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 border-none shrink-0 rounded-xl px-4"
                                onClick={() => refresh()}
                            >
                                Réessayer
                            </Button>
                        </div>
                    )}

                    {!currentEventId && userType === 'admin' && location.pathname !== '/admin/dashboard' && (
                        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-amber-900 leading-tight">Aucun événement sélectionné</p>
                                    <p className="text-sm text-amber-700 font-medium mt-0.5">Vous devez sélectionner un événement dans la liste pour gérer les projets, jurys et critères.</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                className="bg-amber-600 hover:bg-amber-700 border-none shadow-lg shadow-amber-200 shrink-0 h-12 px-6 rounded-xl font-bold"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Choisir un événement
                            </Button>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};
