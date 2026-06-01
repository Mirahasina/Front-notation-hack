import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Team } from '../types';
import api, { authApi, teamApi } from '../services/api';

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
    const [user, setUser] = useState<User | null>(() => {
        const sessionUser = sessionStorage.getItem('current_user');
        return sessionUser ? JSON.parse(sessionUser) : null;
    });
    const [currentTeam, setCurrentTeam] = useState<Team | null>(() => {
        const sessionTeam = sessionStorage.getItem('current_team');
        return sessionTeam ? JSON.parse(sessionTeam) : null;
    });

    const login = async (username: string, password: string): Promise<LoginResult> => {
        try {
            const response = await authApi.login({ username, password });
            const { token, user: loggedUser } = response.data;

            setUser(loggedUser);
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('current_user', JSON.stringify(loggedUser));

            return { success: true, role: loggedUser.role };
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || 'Identifiants incorrects';
            return { success: false, error: message };
        }
    };

    const loginTeam = async (email: string, password?: string): Promise<TeamLoginResult> => {
        try {
            const response = await api.post('/auth/team-login/', { email, password });
            const data = response.data;

            if (data.isFirstLogin) {
                return {
                    success: true,
                    isFirstLogin: true,
                    generatedPassword: data.generatedPassword
                };
            }

            const { token, user: loggedUser, team } = data;

            setUser(loggedUser);
            setCurrentTeam(team);
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('current_user', JSON.stringify(loggedUser));
            sessionStorage.setItem('current_team', JSON.stringify(team));

            return { success: true, isFirstLogin: false };
        } catch (error: any) {
            console.error('Login team error:', error);
            const message = error.response?.data?.error || 'Erreur lors de la connexion';
            return { success: false, isFirstLogin: false, error: message };
        }
    };

    const logout = async () => {
        try {
            if (user && user.role !== 'team') {
                await authApi.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setCurrentTeam(null);
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('current_user');
            sessionStorage.removeItem('current_team');
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
