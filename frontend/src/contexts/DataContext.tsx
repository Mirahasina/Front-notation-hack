import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Team, Criterion, TeamScore, Event } from '../types';
import { eventApi, userApi, teamApi, criteriaApi, scoreApi } from '../services/api';
const DEFAULT_EVENT_ID = 'event-juryhack-2025';

interface DataContextType {
    events: Event[];
    currentEventId: string | null;
    setCurrentEventId: (id: string) => void;
    addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<Event>;
    updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    users: User[];
    teams: Team[];
    criteria: Criterion[];
    teamScores: TeamScore[];

    addUser: (user: Omit<User, 'id'>) => Promise<User>;
    updateUser: (id: string, user: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;

    addTeam: (team: Omit<Team, 'id' | 'created_at'>) => Promise<Team>;
    bulkAddTeams: (teams: Array<Omit<Team, 'id' | 'created_at'>>) => Promise<void>;
    updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
    deleteAllTeams: () => Promise<void>;

    addCriterion: (criterion: Omit<Criterion, 'id' | 'created_at'>) => Promise<Criterion>;
    updateCriterion: (id: string, criterion: Partial<Criterion>) => Promise<void>;
    deleteCriterion: (id: string) => Promise<void>;

    saveTeamScore: (score: TeamScore) => Promise<void>;
    getTeamScore: (juryId: string, teamId: string) => TeamScore | undefined;

    refresh: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentEventId, setCurrentEventIdState] = useState<string | null>(() => sessionStorage.getItem('current_event_id'));
    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setError(null);
            try {
                const response = await eventApi.list();
                const data = response.data as any;
                const eventsData = data.results || data;
                setEvents(eventsData);
                if (eventsData.length > 0 && !currentEventId) {
                    const def = eventsData.find((e: Event) => e.id === DEFAULT_EVENT_ID || e.name.includes('2025'));
                    const selectedId = def ? def.id : eventsData[0].id;
                    setCurrentEventId(selectedId);
                }
            } catch (err: any) {
                console.error('Error fetching events:', err);
                setError("Impossible de charger les événements. Le serveur est peut-être en train de redémarrer.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!currentEventId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [usersRes, teamsRes, criteriaRes, scoresRes] = await Promise.all([
                    userApi.list({ event_id: currentEventId }),
                    teamApi.list({ event_id: currentEventId }),
                    criteriaApi.list({ event_id: currentEventId }),
                    scoreApi.list({ event_id: currentEventId })
                ]);

                const uData = usersRes.data as any;
                const tData = teamsRes.data as any;
                const cData = criteriaRes.data as any;
                const sData = scoresRes.data as any;

                setUsers(uData.results || uData);
                setTeams(tData.results || tData);
                setCriteria(cData.results || cData);
                setTeamScores(sData.results || sData);
            } catch (err: any) {
                console.error('Error fetching event data:', err);
                setError("Erreur lors de la récupération des données. Vérifiez votre connexion.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentEventId]);

    const refresh = async () => {
        if (!currentEventId) return;
        setError(null);
        try {
            const [usersRes, teamsRes, criteriaRes, scoresRes] = await Promise.all([
                userApi.list({ event_id: currentEventId }),
                teamApi.list({ event_id: currentEventId }),
                criteriaApi.list({ event_id: currentEventId }),
                scoreApi.list({ event_id: currentEventId })
            ]);

            const uData = usersRes.data as any;
            const tData = teamsRes.data as any;
            const cData = criteriaRes.data as any;
            const sData = scoresRes.data as any;

            setUsers(uData.results || uData);
            setTeams(tData.results || tData);
            setCriteria(cData.results || cData);
            setTeamScores(sData.results || sData);
        } catch (err: any) {
            console.error('Refresh error:', err);
            setError("Impossible de rafraîchir les données.");
        }
    };

    const setCurrentEventId = (id: string | null) => {
        setCurrentEventIdState(id);
        if (id) {
            sessionStorage.setItem('current_event_id', id);
        } else {
            sessionStorage.removeItem('current_event_id');
        }
    };

    // Events Management
    const addEvent = async (event: Omit<Event, 'id' | 'created_at'>): Promise<Event> => {
        const response = await eventApi.create(event as any);
        const newEvent = response.data;
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
    };

    const updateEvent = async (id: string, updates: Partial<Event>): Promise<void> => {
        try {
            const response = await eventApi.update(id, updates);
            setEvents((prev: Event[]) => prev.map((e: Event) => e.id === id ? response.data : e));
        } catch (error) {
            console.error('Update event error:', error);
        }
    };

    const deleteEvent = async (id: string): Promise<void> => {
        try {
            await eventApi.delete(id);
            setEvents((prev: Event[]) => prev.filter((e: Event) => e.id !== id));
            if (currentEventId === id) {
                setCurrentEventId(null);
            }
        } catch (error) {
            console.error('Delete event error:', error);
        }
    };

    // Users
    const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
        const response = await userApi.create({ ...user, event: currentEventId || '' } as any);
        const newUser = response.data;
        setUsers((prev: User[]) => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
        const response = await userApi.update(id, updates);
        setUsers((prev: User[]) => prev.map((u: User) => u.id === id ? response.data : u));
    };

    const deleteUser = async (id: string): Promise<void> => {
        await userApi.delete(id);
        setUsers((prev: User[]) => prev.filter((u: User) => u.id !== id));
    };

    // Teams
    const addTeam = async (team: Omit<Team, 'id' | 'created_at'>): Promise<Team> => {
        const response = await teamApi.create({ ...team, event: currentEventId || '' } as any);
        const newTeam = response.data;
        setTeams((prev: Team[]) => [...prev, newTeam]);
        return newTeam;
    };

    const bulkAddTeams = async (teamsData: Array<Omit<Team, 'id' | 'created_at'>>): Promise<void> => {
        if (!currentEventId) return;
        try {
            const response = await teamApi.bulkCreate({
                event_id: currentEventId,
                teams: teamsData
            });
            const newTeams = response.data.teams;
            setTeams((prev: Team[]) => [...prev, ...newTeams]);
        } catch (error) {
            console.error('Bulk add teams error:', error);
            throw error;
        }
    };

    const updateTeam = async (id: string, updates: Partial<Team>): Promise<void> => {
        const response = await teamApi.update(id, updates);
        setTeams((prev: Team[]) => prev.map((t: Team) => t.id === id ? response.data : t));
    };

    const deleteTeam = async (id: string): Promise<void> => {
        await teamApi.delete(id);
        setTeams((prev: Team[]) => prev.filter((t: Team) => t.id !== id));
    };

    const deleteAllTeams = async (): Promise<void> => {
        if (!currentEventId) return;
        // In backend, we'd ideally have a bulk delete, but for now we loop
        for (const team of teams) {
            await teamApi.delete(team.id);
        }
        setTeams([]);
        setTeamScores([]);
    };

    // Criteria
    const addCriterion = async (criterion: Omit<Criterion, 'id' | 'created_at'>): Promise<Criterion> => {
        const response = await criteriaApi.create({ ...criterion, event: currentEventId || '' } as any);
        const newCriterion = response.data;
        setCriteria((prev: Criterion[]) => [...prev, newCriterion]);
        return newCriterion;
    };

    const updateCriterion = async (id: string, updates: Partial<Criterion>): Promise<void> => {
        const response = await criteriaApi.update(id, updates);
        setCriteria((prev: Criterion[]) => prev.map((c: Criterion) => c.id === id ? response.data : c));
    };

    const deleteCriterion = async (id: string): Promise<void> => {
        await criteriaApi.delete(id);
        setCriteria((prev: Criterion[]) => prev.filter((c: Criterion) => c.id !== id));
    };

    // Team Scores
    const saveTeamScore = async (score: TeamScore): Promise<void> => {
        const response = await scoreApi.save({ ...score, event: currentEventId || '' } as any);
        const savedScore = response.data;
        setTeamScores((prev: TeamScore[]) => {
            const index = prev.findIndex((s: TeamScore) => s.id === savedScore.id);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = savedScore;
                return updated;
            }
            return [...prev, savedScore];
        });
    };

    const getTeamScore = (juryId: string, teamId: string): TeamScore | undefined => {
        return teamScores.find(
            (ts: TeamScore) => ts.jury === juryId && ts.team === teamId
        );
    };

    const value: DataContextType = {
        events,
        currentEventId,
        setCurrentEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        users,
        teams,
        criteria,
        teamScores,
        addUser,
        updateUser,
        deleteUser,
        addTeam,
        bulkAddTeams,
        updateTeam,
        deleteTeam,
        deleteAllTeams,
        addCriterion,
        updateCriterion,
        deleteCriterion,
        saveTeamScore,
        getTeamScore,
        refresh,
        isLoading,
        error
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
