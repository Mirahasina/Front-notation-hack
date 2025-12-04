import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-brand">
                    <h2>🏆 JuryHack 2025</h2>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-role">{isAdmin ? '👑 Admin' : '⚖️ Jury'}</span>
                        <span className="user-name">{user?.username}</span>
                    </div>
                    <button onClick={logout} className="btn-secondary btn-sm">
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
};
