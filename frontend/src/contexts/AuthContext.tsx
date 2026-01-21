import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Team } from '../types';
import { authApi, teamApi } from '../services/api';
import api from '../services/api';

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
    login: (username: string, password: string) => Promise<LoginResult>;
    loginTeam: (email: string, password: string) => Promise<TeamLoginResult>;
    logout: () => Promise<void>;
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
        const token = localStorage.getItem('auth_token');
        const sessionUser = localStorage.getItem('current_user');
        const sessionTeam = localStorage.getItem('current_team');

        if (token && sessionUser) {
            setUser(JSON.parse(sessionUser));
        }
        if (sessionTeam) {
            setCurrentTeam(JSON.parse(sessionTeam));
        }
    }, []);



    const login = async (username: string, password: string): Promise<LoginResult> => {
        try {
            const response = await authApi.login({ username, password });
            const { token, user: loggedUser } = response.data;

            setUser(loggedUser);
            localStorage.setItem('auth_token', token);
            localStorage.setItem('current_user', JSON.stringify(loggedUser));

            return { success: true, role: loggedUser.role };
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || 'Identifiants incorrects';
            return { success: false, error: message };
        }
    };

    const loginTeam = async (email: string, password?: string): Promise<TeamLoginResult> => {
        try {
            const response = await teamApi.list({ generated_email: email });
            const team = response.data[0];

            if (!team) {
                console.log('Team not found for email:', email);
                return { success: false, isFirstLogin: false, error: 'Équipe non trouvée' };
            }

            console.log('Team found:', team.name, 'has_logged_in:', team.has_logged_in, 'has password:', !!team.password);

            // Première connexion - pas de mot de passe fourni ET l'équipe n'a jamais eu de mot de passe
            if (!password && !team.password) {
                const newPassword = generateRandomPassword();
                console.log('First login detected! Generating password:', newPassword);

                // Sauvegarder le mot de passe via API
                await teamApi.update(team.id, {
                    password: newPassword,
                    has_logged_in: true
                });

                return { success: true, isFirstLogin: true, generatedPassword: newPassword };
            }

            // Si le mot de passe est fourni, vérifier la correspondance
            if (password) {
                if (team.password && team.password === password) {
                    console.log('Password match! Logging in...');

                    try {
                        const authResponse = await authApi.login({ username: email, password });
                        const { token, user: loggedUser } = authResponse.data;

                        setUser(loggedUser);
                        setCurrentTeam(team);
                        localStorage.setItem('auth_token', token);
                        localStorage.setItem('current_user', JSON.stringify(loggedUser));
                        localStorage.setItem('current_team', JSON.stringify(team));

                        return { success: true, isFirstLogin: false };
                    } catch (error) {
                        return { success: false, isFirstLogin: false, error: 'Erreur d\'authentification' };
                    }
                } else {
                    return { success: false, isFirstLogin: false, error: 'Mot de passe incorrect' };
                }
            }

            // Cas où le mot de passe est manquant pour une équipe qui a déjà un mot de passe
            if (team.password && !password) {
                return { success: false, isFirstLogin: false, error: 'Veuillez entrer votre mot de passe' };
            }

            return { success: false, isFirstLogin: false, error: 'Erreur de connexion' };
        } catch (error) {
            console.error('Login team error:', error);
            return { success: false, isFirstLogin: false, error: 'Erreur lors de la connexion' };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setCurrentTeam(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            localStorage.removeItem('current_team');
        }
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
