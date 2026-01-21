import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Navbar } from '../../components/Navbar';

export const TeamDashboard = () => {
    const { currentTeam } = useAuth();
    const { teams } = useData();

    if (!currentTeam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
                <Navbar />
                <div className="container page-content text-center">
                    <h1>Erreur</h1>
                    <p className="text-slate-400">Aucune équipe connectée</p>
                </div>
            </div>
        );
    }

    const teamIndex = teams.findIndex(t => t.id === currentTeam.id);
    const platformName = `${currentTeam.name.replace(/\s+/g, '_')}_Team${teamIndex + 1}`;
    const githubRepo = platformName;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
            <Navbar />
            <div className="container page-content">
                <div className="mb-8">
                    <h1 className="flex items-center gap-3">
                        Espace Équipe
                    </h1>
                    <p className="text-slate-400 mt-1">Bienvenue dans votre espace dédié</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card group hover:border-indigo-500/50 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Nom d'équipe</p>
                                <p className="text-lg font-bold text-indigo-400 font-mono break-all leading-tight">
                                    {platformName}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:border-purple-500/50 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Repository GitHub</p>
                                <p className="text-lg font-bold text-purple-400 font-mono break-all leading-tight">
                                    {githubRepo}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Utilisez ce nom pour votre repo</p>
                            </div>
                        </div>
                    </div>

                    <div className="card group hover:border-amber-500/50 hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Ordre de passage</p>
                                {currentTeam.passage_order ? (
                                    <>
                                        <p className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                            #{currentTeam.passage_order}
                                        </p>
                                        {currentTeam.passage_time && (
                                            <p className="text-amber-400 font-semibold">
                                                à {currentTeam.passage_time}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xl text-slate-600 font-semibold">
                                        Non défini
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold">Instructions</h3>
                    </div>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400">→</span>
                            Utilisez le nom d'équipe <code className="px-2 py-1 bg-indigo-500/20 rounded text-indigo-300 font-mono text-sm">{platformName}</code> pour toutes vos soumissions
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-400">→</span>
                            Créez votre repository : <code className="px-2 py-1 bg-purple-500/20 rounded text-purple-300 font-mono text-sm">https://github.com/Mirahasina/{platformName}</code>
                        </li>
                        {currentTeam.passage_order && (
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400">→</span>
                                Votre présentation est en position <span className="text-amber-400 font-bold">#{currentTeam.passage_order}</span>
                                {currentTeam.passage_time && <> à <span className="text-amber-400 font-bold">{currentTeam.passage_time}</span></>}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};
