
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/Modal';

export const Login = () => {
    const navigate = useNavigate();
    const { login, loginTeam } = useAuth();
    const [isTeamLogin, setIsTeamLogin] = useState(false);

    // Admin/Jury State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Team State
    const [teamName, setTeamName] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // First login modal state
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
            const result = await loginTeam(teamName, teamPassword);

            if (result.success) {
                if (result.isFirstLogin && result.generatedPassword) {
                    setGeneratedPassword(result.generatedPassword);
                    setShowPasswordModal(true);
                } else {
                    navigate('/');
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
        <div className="min-h-screen bg-slate-900 flex relative overflow-hidden">

            {/* Left Column - Visual Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-transparent to-slate-900/40"></div>

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 px-16 text-center">
                    <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                        Bienvenue
                    </h1>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 mb-8 rounded-full"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light italic">
                        "L'innovation est ce qui distingue un leader d'un suiveur."
                    </p>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-8 lg:p-16 bg-white dark:bg-slate-950/50 backdrop-blur-sm">

                {/* Mobile Background Elements (Visible only on mobile) */}
                <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute bottom-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                </div>

                <div className="w-full max-w-lg z-10">

                    {/* Header with Logos */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-8 mb-8">
                            <div className="w-16 h-16 relative group">
                                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img src="/Rise.png" alt="RISE" className="w-full h-full object-contain relative transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <div className="h-10 w-[1px] bg-slate-700/50"></div>
                            <div className="w-16 h-16 relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img src="/insi.png" alt="INSI" className="w-full h-full object-contain relative transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight text-center">
                            Notation <span className="text-indigo-400">INSI</span>
                        </h2>
                        <p className="text-slate-400 mt-2">Connectez-vous à votre espace</p>
                    </div>

                    {/* Role Toggle Switch */}
                    <div className="grid grid-cols-2 p-2 mb-12 bg-slate-900/50 border border-slate-800 rounded-2xl relative overflow-hidden">
                        <div className={`absolute inset-y-2 transition-all duration-300 ease-out rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg ${isTeamLogin ? 'left-[calc(50%+0.5rem)] w-[calc(50%-1rem)]' : 'left-2 w-[calc(50%-1rem)]'}`}></div>
                        <button
                            onClick={() => setIsTeamLogin(false)}
                            className={`relative z-10 py-4 text-lg font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${!isTeamLogin ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Jury / Admin
                        </button>
                        <button
                            onClick={() => setIsTeamLogin(true)}
                            className={`relative z-10 py-4 text-lg font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${isTeamLogin ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Équipe projet
                        </button>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 animate-shake">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-red-200 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <div className="transform transition-all duration-500">
                        {!isTeamLogin ? (
                            <form onSubmit={handleLogin} className="space-y-2">
                                <div className="form-group pb-4">
                                    <label className="form-label">
                                        Identifiant
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="input-base"
                                        placeholder="Entrez votre identifiant"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-group pb-4">
                                    <label className="form-label">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="input-base pr-16"
                                            placeholder="••••••••"
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors scale-125"
                                        >
                                            {showPassword ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-8 py-5 bg-white text-slate-900 font-bold rounded-2xl text-xl hover:bg-slate-200 focus:ring-4 focus:ring-indigo-500/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            Se connecter
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleTeamLogin} className="space-y-2">
                                <div className="form-group pb-4">
                                    <label className="form-label">
                                        Nom du projet
                                    </label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={e => setTeamName(e.target.value)}
                                        className="input-base"
                                        placeholder="Ex: Lova UI"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-group pb-4">
                                    <label className="form-label">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={teamPassword}
                                            onChange={e => setTeamPassword(e.target.value)}
                                            className="input-base pr-16"
                                            placeholder="Laisser vide pour la 1ère connexion"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors scale-125"
                                        >
                                            {showPassword ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-medium">
                                        * Laissez vide pour la création
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-8 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl text-xl hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-500/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            Accéder au projet
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-6 text-center text-slate-600 text-xs font-medium uppercase tracking-widest">
                    © {new Date().getFullYear()} INSI • Tous droits réservés
                </div>
            </div>

            {/* Password Modal */}
            <Modal isOpen={showPasswordModal} onClose={handleClosePasswordModal} title="Bienvenue à bord">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-purple-500/30 animate-pulse">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Votre mot de passe unique</h3>
                        <p className="text-slate-400 text-sm">
                            Veuillez conserver précieusement ce mot de passe. Il ne sera affiché qu'une seule fois.
                        </p>
                    </div>

                    <div
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="relative group bg-slate-950 border-2 border-dashed border-indigo-500/30 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 transition-all hover:bg-slate-900"
                    >
                        <code className="text-3xl font-mono text-indigo-400 font-bold tracking-wider block text-center select-all group-hover:scale-110 transition-transform duration-300">
                            {generatedPassword}
                        </code>
                        <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500 font-semibold uppercase tracking-widest">
                            Cliquer pour copier
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => copyToClipboard(generatedPassword)}
                            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${passwordCopied
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {passwordCopied ? 'Copié !' : 'COPIER LE MOT DE PASSE'}
                        </button>
                        <button
                            onClick={async () => {
                                const result = await loginTeam(teamName, generatedPassword);
                                if (result.success) {
                                    setShowPasswordModal(false);
                                    navigate('/');
                                } else {
                                    setError('Erreur lors de la finalisation');
                                }
                            }}
                            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            J'AI BIEN NOTÉ MON MOT DE PASSE
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};