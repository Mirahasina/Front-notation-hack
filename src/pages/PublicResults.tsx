import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { calculateResults } from '../utils/calculations';
import './PublicResults.css';

export const PublicResults = () => {
    const { eventId } = useParams<{ eventId?: string }>();
    const { teams, teamScores, users, events } = useData();
    const [revealed, setRevealed] = useState<number>(0);
    const [showFullList, setShowFullList] = useState(false);

    // If no eventId, show list of completed events
    if (!eventId) {
        const completedEvents = events.filter(e => e.status === 'completed');

        return (
            <div className="public-results-page">
                <div className="logos-header">
                    <img src="/Rise.png" alt="RISE" className="logo-img-public" />
                    <img src="/insi.png" alt="INSI" className="logo-img-public" />
                </div>

                <div className="container page-content">
                    <h1 className="text-center mb-xl">🏆 Résultats des Compétitions</h1>

                    {completedEvents.length === 0 ? (
                        <div className="card text-center">
                            <h3>Aucun événement terminé</h3>
                            <p className="text-muted">Les résultats seront affichés une fois les événements complétés</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {completedEvents.map(event => (
                                <Link
                                    key={event.id}
                                    to={`/results/${event.id}`}
                                    className="event-card card"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="event-header">
                                        <div>
                                            <h3>{event.name}</h3>
                                            <p className="text-muted">
                                                {new Date(event.date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <span className="badge badge-success">Terminé</span>
                                    </div>
                                    {event.description && (
                                        <p className="event-description">{event.description}</p>
                                    )}
                                    <div className="mt-md">
                                        <button className="btn-primary" style={{ width: '100%' }}>
                                            Voir les Résultats
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Event-specific results
    const currentEvent = events.find(e => e.id === eventId);
    const eventTeams = teams.filter(t => t.eventId === eventId);
    const eventScores = teamScores.filter(ts => ts.eventId === eventId);
    const juries = users.filter(u => u.role === 'jury' && (u.eventId === eventId || !u.eventId));

    if (!currentEvent) {
        return (
            <div className="public-results-page">
                <div className="logos-header">
                    <img src="/Rise.png" alt="RISE" className="logo-img-public" />
                    <img src="/insi.png" alt="INSI" className="logo-img-public" />
                </div>
                <div className="container page-content text-center">
                    <h1>Événement non trouvé</h1>
                    <Link to="/results" className="btn-primary mt-lg">
                        ← Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const results = calculateResults(eventTeams, eventScores, juries);

    if (eventTeams.length === 0) {
        return (
            <div className="public-results-page">
                <div className="logos-header">
                    <img src="/Rise.png" alt="RISE" className="logo-img-public" />
                    <img src="/insi.png" alt="INSI" className="logo-img-public" />
                </div>

                <div className="container page-content text-center">
                    <h1>🏆 {currentEvent.name}</h1>
                    <p className="text-muted">Résultats non encore disponibles</p>
                    <Link to="/results" className="btn-secondary mt-lg">
                        ← Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const getRankDisplay = (rank: number) => {
        const totalTeams = results.length;

        // Special labels for top positions
        if (rank === 0) return { emoji: '🥇', label: '1ère Place - GAGNANT', color: '#FFD700' };
        if (rank === 1) return { emoji: '🥈', label: '2ème Place', color: '#C0C0C0' };
        if (rank === 2) return { emoji: '🥉', label: '3ème Place', color: '#CD7F32' };

        // Special label for last place if there are 4+ teams
        if (totalTeams >= 4 && rank === 3) {
            return { emoji: '❤️', label: '4ème Place - Coup de Cœur', color: '#ec4899' };
        }

        return { emoji: '', label: `${rank + 1}ème Place`, color: '#818cf8' };
    };

    const handleRevealNext = () => {
        if (revealed < results.length) {
            setRevealed(revealed + 1);
        }
    };

    const handleShowFullList = () => {
        setShowFullList(true);
    };

    if (showFullList) {
        return (
            <div className="public-results-page">
                <div className="logos-header">
                    <img src="/Rise.png" alt="RISE" className="logo-img-public" />
                    <img src="/insi.png" alt="INSI" className="logo-img-public" />
                </div>

                <div className="container page-content">
                    <h1 className="text-center mb-xl">🏆 Classement Complet - {currentEvent.name}</h1>

                    <div className="full-results-list">
                        {results.map((result, index) => {
                            const display = getRankDisplay(index);
                            return (
                                <div key={result.teamId} className="full-result-card card">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-lg">
                                            <span className="rank-number">{index + 1}</span>
                                            <div>
                                                <h3>{result.teamName}</h3>
                                                <p className="text-muted">{display.label}</p>
                                            </div>
                                        </div>
                                        <div className="result-score">
                                            {result.totalScore} pts
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-xl">
                        <button onClick={() => setShowFullList(false)} className="btn-secondary">
                            ← Retour à l'affichage animé
                        </button>
                        <Link to="/results" className="btn-secondary ml-md">
                            Tous les événements
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic display order: show from last place to first
    const displayOrder = results.map((_, idx) => results.length - 1 - idx); // [n-1, n-2, ..., 1, 0]
    const currentRankToShow = displayOrder[revealed - 1];
    const currentResult = results[currentRankToShow];
    const totalTeams = results.length;

    return (
        <div className="public-results-page">
            <div className="logos-header">
                <img src="/Rise.png" alt="RISE" className="logo-img-public" />
                <img src="/insi.png" alt="INSI" className="logo-img-public" />
            </div>

            <div className="container page-content">
                <h1 className="text-center mb-2xl">🏆 {currentEvent.name} - Résultats</h1>

                {revealed === 0 && (
                    <div className="reveal-intro text-center">
                        <p className="intro-text">
                            Découvrez les résultats de la compétition !
                        </p>
                        <button onClick={handleRevealNext} className="btn-primary btn-reveal">
                            Révéler les Résultats
                        </button>
                    </div>
                )}

                {revealed > 0 && revealed <= totalTeams && currentResult && (
                    <div className="reveal-container">
                        <div className="revealed-card card fade-in">
                            <div className="reveal-rank">
                                {getRankDisplay(currentRankToShow).emoji}
                            </div>
                            <div className="reveal-label" style={{ color: getRankDisplay(currentRankToShow).color }}>
                                {getRankDisplay(currentRankToShow).label}
                            </div>
                            <div className="reveal-team-name">
                                {currentResult.teamName}
                            </div>
                            <div className="reveal-score">
                                {currentResult.totalScore} points
                            </div>
                        </div>

                        <div className="reveal-actions text-center mt-xl">
                            {revealed < totalTeams ? (
                                <button onClick={handleRevealNext} className="btn-primary btn-reveal">
                                    Révéler le Suivant
                                </button>
                            ) : (
                                <button onClick={handleShowFullList} className="btn-success btn-reveal">
                                    Voir le Classement Complet
                                </button>
                            )}
                        </div>
                        <div className="revealed-summary mt-xl">
                            <h3 className="text-center mb-md">Déjà révélés:</h3>
                            <div className="summary-grid">
                                {displayOrder.slice(0, revealed).map((rankIndex) => {
                                    const res = results[rankIndex];
                                    const display = getRankDisplay(rankIndex);
                                    return (
                                        <div key={res.teamId} className="summary-item">
                                            <span className="summary-emoji">{display.emoji}</span>
                                            <span className="summary-team">{res.teamName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mt-xl">
                    <Link to="/results" className="btn-secondary">
                        ← Tous les événements
                    </Link>
                </div>
            </div>
        </div>
    );
};
