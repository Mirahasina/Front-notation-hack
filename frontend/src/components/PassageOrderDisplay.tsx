import type { Team } from '../types';
import { sortByPassageOrder } from '../utils/randomizer';

interface PassageOrderDisplayProps {
    teams: Team[];
    onClear: () => void;
}

export const PassageOrderDisplay = ({ teams, onClear }: PassageOrderDisplayProps) => {
    const orderedTeams = sortByPassageOrder(teams).filter(t => t.passageOrder !== undefined);

    if (orderedTeams.length === 0) {
        return null;
    }

    return (
        <div className="container py-8">
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                        <span className="text-2xl"></span>
                        Ordre de passage
                    </h3>
                    <button onClick={onClear} className="btn-secondary text-sm">
                        Réinitialiser
                    </button>
                </div>

                <div className="grid gap-3">
                    {orderedTeams.map(team => {
                        const isTop3 = team.passageOrder && team.passageOrder <= 3;
                        const gradients: Record<number, string> = {
                            1: 'from-amber-400 to-yellow-500',
                            2: 'from-slate-300 to-slate-400',
                            3: 'from-amber-600 to-orange-600'
                        };

                        return (
                            <div
                                key={team.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-x-1 ${isTop3
                                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
                                    : 'bg-slate-800/50 border-slate-700/50'
                                    }`}
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${team.passageOrder && gradients[team.passageOrder]
                                        ? `bg-gradient-to-br ${gradients[team.passageOrder]}`
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                        }`}
                                >
                                    {team.passageOrder}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">{team.name}</h4>
                                </div>

                                {team.passageTime && (
                                    <div className="px-4 py-2 bg-indigo-500/20 rounded-lg font-semibold text-indigo-300 text-sm">
                                        {team.passageTime}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
