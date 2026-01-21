import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const { user, logout, isAdmin, isTeam } = useAuth();

    const getRoleDisplay = () => {
        if (isAdmin) return { icon: '👑', label: 'Admin' };
        if (isTeam) return { label: 'Équipe' };
        return { label: 'Jury' };
    };

    const role = getRoleDisplay();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
            <div className="container flex justify-between items-center py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                        🏆
                    </div>
                    <div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            JuryHack 2025
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">{role.icon}</span>
                            <span className="text-slate-400">{role.label}</span>
                        </div>
                        <span className="text-white font-medium">{user?.username}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/50 transition-all text-sm font-medium"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
};
