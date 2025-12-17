import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Team } from '../types';
import { loadData, saveData } from '../utils/storage';

// Générer un mot de passe aléatoire
const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export interface LoginResult {
    success: boolean;
    role?: 'admin' | 'team' | 'jury';
    error?: string;
}

export interface TeamLoginResult {
    success: boolean;
    isFirstLogin: boolean;
    generatedPassword?: string;
    error?: string;
}

interface AuthContextType {
    user: User | null;
    currentTeam: Team | null;
    login: (username: string, password: string) => LoginResult;
    loginTeam: (email: string, password: string) => TeamLoginResult;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isTeam: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

    useEffect(() => {
        const sessionUser = localStorage.getItem('current_user');
        const sessionTeam = localStorage.getItem('current_team');
        if (sessionUser) {
            setUser(JSON.parse(sessionUser));
        }
        if (sessionTeam) {
            setCurrentTeam(JSON.parse(sessionTeam));
        }
    }, []);



    const login = (username: string, password: string): LoginResult => {
        const data = loadData();
        const foundUser = data.users.find(
            u => u.username === username && u.password === password
        );

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('current_user', JSON.stringify(foundUser));
            return { success: true, role: foundUser.role };
        }

        return { success: false, error: 'Identifiants incorrects' };
    };

    const loginTeam = (email: string, password: string): TeamLoginResult => {
        const data = loadData();

        // Chercher l'équipe par email généré
        const team = data.teams.find(t => t.generatedEmail === email);

        if (!team) {
            console.log('Team not found for email:', email);
            return { success: false, isFirstLogin: false, error: 'Équipe non trouvée' };
        }

        console.log('Team found:', team.name, 'hasLoggedIn:', team.hasLoggedIn, 'has password:', !!team.password);

        // Première connexion - pas de mot de passe fourni ET l'équipe n'a jamais eu de mot de passe
        if (!password && !team.password) {
            const newPassword = generateRandomPassword();
            console.log('First login detected! Generating password:', newPassword);

            // Sauvegarder le mot de passe
            team.password = newPassword;
            team.hasLoggedIn = true;
            const teamIndex = data.teams.findIndex(t => t.id === team.id);
            data.teams[teamIndex] = team;
            saveData(data);

            // Note: On ne connecte pas encore l'utilisateur pour éviter la redirection immédiate
            // Le Login.tsx affichera la modale, puis connectera l'utilisateur

            return { success: true, isFirstLogin: true, generatedPassword: newPassword };
        }

        // Si le mot de passe est fourni, vérifier la correspondance
        if (password) {
            if (team.password && team.password === password) {
                console.log('Password match! Logging in...');
                const teamUser: User = {
                    id: `team-user-${team.id}`,
                    username: team.generatedEmail || team.name,
                    password: team.password,
                    role: 'team',
                    teamId: team.id
                };

                setUser(teamUser);
                setCurrentTeam(team);
                localStorage.setItem('current_user', JSON.stringify(teamUser));
                localStorage.setItem('current_team', JSON.stringify(team));

                return { success: true, isFirstLogin: false };
            } else {
                return { success: false, isFirstLogin: false, error: 'Mot de passe incorrect' };
            }
        }

        // Cas où le mot de passe est manquant pour une équipe qui a déjà un mot de passe
        if (team.password && !password) {
            return { success: false, isFirstLogin: false, error: 'Veuillez entrer votre mot de passe' };
        }

        // Mot de passe incorrect ou manquant pour une équipe qui a déjà un mot de passe (fallback)
        console.log('Password mismatch or missing');
        return { success: false, isFirstLogin: false, error: 'Erreur de connexion' };
    };

    const logout = () => {
        setUser(null);
        setCurrentTeam(null);
        localStorage.removeItem('current_user');
        localStorage.removeItem('current_team');
    };

    const value: AuthContextType = {
        user,
        currentTeam,
        login,
        loginTeam,
        logout,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'admin',
        isTeam: user?.role === 'team'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
