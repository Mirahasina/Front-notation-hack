import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const Login = () => {
    const navigate = useNavigate();
    const { login, loginTeam } = useAuth();

    const [isTeamLogin, setIsTeamLogin] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [teamEmail, setTeamEmail] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordCopied, setPasswordCopied] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                navigate(result.role === 'admin' ? '/admin/dashboard' : '/jury/dashboard');
            } else {
                setError('Identifiants incorrects');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeamLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await loginTeam(teamEmail, teamPassword);

            if (result.success) {
                if (result.isFirstLogin && result.generatedPassword) {
                    setGeneratedPassword(result.generatedPassword);
                    setShowPasswordModal(true);
                } else {
                    navigate('/team/dashboard'); // ensure this route exists or redirect correctly
                }
            } else {
                setError(result.error || 'Connexion échouée');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        navigate('/');
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
    };

    return (
        <AuthLayout
            title={isTeamLogin ? "Espace Équipe" : "Espace Jury / Admin"}
            subtitle="Connectez-vous pour accéder à la plateforme"
        >
            {/* Toggle Switch */}
            <div className="flex p-1 mb-8 bg-slate-100 rounded-xl relative">
                <div
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-lg transition-all duration-300 ease-out ${isTeamLogin ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                />
                <button
                    onClick={() => setIsTeamLogin(false)}
                    className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${!isTeamLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Jury / Admin
                </button>
                <button
                    onClick={() => setIsTeamLogin(true)}
                    className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${isTeamLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Équipe Projet
                </button>
            </div>

            {/* Forms */}
            {isTeamLogin ? (
                <form onSubmit={handleTeamLogin} className="space-y-4">
                    <Input
                        label="Email de l'équipe"
                        placeholder="Ex: lova+RISE_Team1@gmail.com"
                        value={teamEmail}
                        onChange={e => setTeamEmail(e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Mot de passe"
                        type={showPassword ? "text" : "password"}
                        placeholder={teamPassword ? "••••••••" : "Vide pour la 1ère connexion"}
                        value={teamPassword}
                        onChange={e => setTeamPassword(e.target.value)}
                        helperText="Laisser vide lors de la première connexion"
                        fullWidth
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none hover:text-slate-600"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        }
                    />

                    {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

                    <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-4">
                        Accéder au projet
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        label="Identifiant"
                        placeholder="votre.identifiant"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        fullWidth
                    />
                    <Input
                        label="Mot de passe"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        fullWidth
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none hover:text-slate-600"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        }
                    />

                    {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

                    <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-4">
                        Se connecter
                    </Button>
                </form>
            )}

            <Modal
                isOpen={showPasswordModal}
                onClose={handleClosePasswordModal}
                title="Bienvenue à bord"
            >
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <p className="text-slate-600">
                        Voici votre mot de passe unique. <br />
                        <span className="font-bold text-slate-800">Conservez-le précieusement !</span>
                    </p>

                    <div
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 transition-colors group"
                    >
                        <code className="text-2xl font-mono font-bold text-blue-600 block mb-2">
                            {generatedPassword}
                        </code>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider group-hover:text-blue-500">
                            {passwordCopied ? 'Copié !' : 'Cliquer pour copier'}
                        </span>
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        onClick={async () => {
                            // Automatically log in with new password
                            const result = await loginTeam(teamEmail, generatedPassword);
                            if (result.success) {
                                setShowPasswordModal(false);
                                navigate('/team/dashboard');
                            }
                        }}
                    >
                        J'ai bien noté mon mot de passe
                    </Button>
                </div>
            </Modal>
        </AuthLayout>
    );
};