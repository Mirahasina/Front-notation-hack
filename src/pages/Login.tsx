import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginMode, setLoginMode] = useState<'staff' | 'team'>('staff');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const { login, loginTeam } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (loginMode === 'staff') {
            if (!username || !password) {
                setError('Veuillez remplir tous les champs');
                return;
            }
            const success = login(username, password);
            if (success) navigate('/');
            else setError('Identifiants incorrects');
        } else {
            if (!username) {
                setError('Veuillez entrer votre email de plateforme');
                return;
            }

            const result = loginTeam(username, password);

            if (result.success) {
                if (result.isFirstLogin && result.generatedPassword) {
                    setGeneratedPassword(result.generatedPassword);
                    setShowPasswordModal(true);
                } else navigate('/');
            } else {
                if (!password) setError('Email non trouvé ou mot de passe requis.');
                else setError('Mot de passe incorrect');
            }
        }
    };

    const handleCopyPassword = async () => {
        try {
            await navigator.clipboard.writeText(generatedPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = generatedPassword;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handlePasswordModalClose = () => {
        setShowPasswordModal(false);
        navigate('/');
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4"
                style={{ background: '#080810' }}>

                <div className="fixed inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.12) 0%, transparent 50%)'
                    }} />

                <div className="relative z-10 w-full max-w-[520px]">

                    <div className="flex justify-center gap-12 mb-28">
                        <img src="/Rise.png" alt="RISE" className="h-24 sm:h-32 object-contain" />
                        <img src="/insi.png" alt="INSI" className="h-24 sm:h-32 object-contain" />
                    </div>

                    <div style={{
                        background: 'linear-gradient(145deg, rgba(30,27,75,0.6) 0%, rgba(15,15,30,0.8) 100%)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '32px',
                        padding: '56px 44px',
                        boxShadow: '0 0 80px rgba(99,102,241,0.15), 0 30px 60px rgba(0,0,0,0.4)'
                    }}>

                        <div className="text-center mb-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                                <span className="text-4xl">🏆</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Système de notation</h1>
                        </div>

                        <div className="flex gap-4 p-2 rounded-2xl mb-20"
                            style={{ background: 'rgba(0,0,0,0.3)' }}>

                            <button
                                type="button"
                                onClick={() => setLoginMode('staff')}
                                className={`flex-1 py-4 rounded-xl text-base font-bold transition-all ${loginMode === 'staff' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                style={loginMode === 'staff' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                            >
                                Staff / Jury
                            </button>

                            <button
                                type="button"
                                onClick={() => setLoginMode('team')}
                                className={`flex-1 py-4 rounded-xl text-base font-bold transition-all ${loginMode === 'team' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                style={loginMode === 'team' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                            >
                                Équipe
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-16">

                                {/* USERNAME */}
                                <div className="flex flex-col gap-5">
                                    <label className="text-base font-medium text-slate-300 ml-1">
                                        {loginMode === 'staff' ? "Nom d'utilisateur" : "Email de plateforme"}
                                    </label>

                                    <input
                                        type={loginMode === 'team' ? 'email' : 'text'}
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder={loginMode === 'staff' ? "admin" : "contact+Projet_Team1@email.com"}
                                        className="w-full px-6 py-5 bg-slate-800/50 border border-slate-700 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                        autoFocus
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div className="flex flex-col gap-5">
                                    <label className="text-base font-medium text-slate-300 ml-1">
                                        Mot de passe
                                        {loginMode === 'team' && (
                                            <span className="text-xs text-slate-500 ml-2 font-normal">(laisser vide si 1ère connexion)</span>
                                        )}
                                    </label>

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder=" • • • • • • • • "
                                        className="w-full px-6 py-5 bg-slate-800/50 border border-slate-700 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                    />
                                </div>

                                {/* ERREUR */}
                                {error && (
                                    <div
                                        className="flex items-center gap-3 px-6 py-4 rounded-xl text-red-200 text-base font-medium animate-pulse"
                                        style={{
                                            background: 'rgba(239,68,68,0.2)',
                                            border: '1px solid rgba(239,68,68,0.4)'
                                        }}
                                    >
                                        <span className="text-xl">⚠️</span> {error}
                                    </div>
                                )}

                                {/* BUTTON */}
                                <div className="flex justify-center pt-10">
                                    <button
                                        type="submit"
                                        className="w-full py-5 rounded-2xl text-xl font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                                            boxShadow: '0 10px 40px rgba(99,102,241,0.5)'
                                        }}
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            </div>
                        </form>


                        {loginMode === 'team' && (
                            <p className="text-slate-600 text-xs text-center mt-16 pt-10"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                💡 Première connexion ? Laissez le mot de passe vide.
                            </p>
                        )}
                    </div>

                    <p className="text-slate-700 text-xs text-center mt-16">
                        © 2025 RISE & INSI Madagascar
                    </p>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.95)' }}>
                    <div className="w-full max-w-md rounded-3xl p-8"
                        style={{
                            background: 'linear-gradient(180deg, #1e1b4b 0%, #0f0f23 100%)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            boxShadow: '0 0 80px rgba(99,102,241,0.2)'
                        }}>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                style={{ background: 'rgba(99,102,241,0.2)' }}>
                                <span className="text-4xl">🔐</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Votre mot de passe</h2>
                            <p className="text-slate-500 text-sm mt-1">Généré automatiquement</p>
                        </div>

                        <div className="rounded-xl p-4 mb-6"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)' }}>
                            <p className="text-amber-400 font-semibold text-sm">⚠️ IMPORTANT</p>
                            <p className="text-amber-300/70 text-xs mt-1">Copiez et sauvegardez ce mot de passe. Il ne sera plus affiché.</p>
                        </div>

                        <div className="rounded-xl p-5 mb-6 text-center"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="font-mono text-3xl tracking-widest text-white font-bold select-all">
                                {generatedPassword}
                            </span>
                        </div>

                        <button
                            onClick={handleCopyPassword}
                            className="w-full py-4 rounded-xl font-bold text-white mb-3 transition-all"
                            style={{
                                background: copied
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                boxShadow: copied
                                    ? '0 8px 30px rgba(16,185,129,0.4)'
                                    : '0 8px 30px rgba(99,102,241,0.4)'
                            }}
                        >
                            {copied ? '✓ Copié dans le presse-papier !' : 'Copier le mot de passe'}
                        </button>

                        <button
                            onClick={handlePasswordModalClose}
                            className="w-full py-3 rounded-xl font-medium text-slate-400 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                            Continuer →
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
