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
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="flex justify-between items-center mb-md">
                <h3>📊 Ordre de Passage</h3>
                <button onClick={onClear} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                    Réinitialiser
                </button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                {orderedTeams.map(team => (
                    <div
                        key={team.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: team.passageOrder === 1
                                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                    : team.passageOrder === 2
                                        ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                                        : team.passageOrder === 3
                                            ? 'linear-gradient(135deg, #CD7F32 0%, #B8733C 100%)'
                                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '1.125rem',
                                flexShrink: 0
                            }}
                        >
                            {team.passageOrder}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{team.name}</h4>
                            {team.description && (
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                    {team.description}
                                </p>
                            )}
                        </div>

                        {team.passageTime && (
                            <div
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    color: 'var(--color-primary)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {team.passageTime}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
