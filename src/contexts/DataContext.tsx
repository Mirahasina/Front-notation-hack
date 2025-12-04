import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Team, Criterion, TeamScore, Event, AppData } from '../types';
import { loadData, saveData, DEFAULT_EVENT_ID } from '../utils/storage';

interface DataContextType {
    // Events
    events: Event[];
    currentEventId: string | null;
    setCurrentEventId: (id: string) => void;
    addEvent: (event: Omit<Event, 'id'>) => Event;
    updateEvent: (id: string, event: Partial<Event>) => void;
    deleteEvent: (id: string) => void;

    // Data (filtered by current event)
    users: User[];
    teams: Team[];
    criteria: Criterion[];
    teamScores: TeamScore[];

    // Users
    addUser: (user: Omit<User, 'id'>) => User;
    deleteUser: (id: string) => void;

    // Teams
    addTeam: (team: Omit<Team, 'id'>) => Team;
    updateTeam: (id: string, team: Partial<Team>) => void;
    deleteTeam: (id: string) => void;

    // Criteria
    addCriterion: (criterion: Omit<Criterion, 'id'>) => Criterion;
    updateCriterion: (id: string, criterion: Partial<Criterion>) => void;
    deleteCriterion: (id: string) => void;

    // Team Scores
    saveTeamScore: (score: TeamScore) => void;
    getTeamScore: (juryId: string, teamId: string) => TeamScore | undefined;

    // Refresh
    refresh: () => void;
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
    const [data, setData] = useState<AppData>(loadData());
    const [currentEventId, setCurrentEventId] = useState<string | null>(() => {
        // Initialize with default event or first available event
        const loadedData = loadData();
        if (loadedData.events.length > 0) {
            const defaultEvent = loadedData.events.find(e => e.id === DEFAULT_EVENT_ID);
            return defaultEvent ? DEFAULT_EVENT_ID : loadedData.events[0].id;
        }
        return null;
    });

    useEffect(() => {
        saveData(data);
    }, [data]);

    const refresh = () => {
        setData(loadData());
    };

    // Events Management
    const addEvent = (event: Omit<Event, 'id'>): Event => {
        const newEvent: Event = {
            ...event,
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
        };
        setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
        return newEvent;
    };

    const updateEvent = (id: string, updates: Partial<Event>) => {
        setData(prev => ({
            ...prev,
            events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    };

    const deleteEvent = (id: string) => {
        setData(prev => ({
            ...prev,
            events: prev.events.filter(e => e.id !== id),
            users: prev.users.filter(u => u.eventId !== id),
            teams: prev.teams.filter(t => t.eventId !== id),
            criteria: prev.criteria.filter(c => c.eventId !== id),
            teamScores: prev.teamScores.filter(ts => ts.eventId !== id)
        }));

        // If deleted event was current, switch to another event
        if (currentEventId === id) {
            const remaining = data.events.filter(e => e.id !== id);
            setCurrentEventId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    // Filtered data by current event
    const filteredUsers = currentEventId
        ? data.users.filter(u => u.role === 'admin' || u.eventId === currentEventId)
        : data.users.filter(u => u.role === 'admin');

    const filteredTeams = currentEventId
        ? data.teams.filter(t => t.eventId === currentEventId)
        : [];

    const filteredCriteria = currentEventId
        ? data.criteria.filter(c => c.eventId === currentEventId)
        : [];

    const filteredTeamScores = currentEventId
        ? data.teamScores.filter(ts => ts.eventId === currentEventId)
        : [];

    // Users
    const addUser = (user: Omit<User, 'id'>): User => {
        const newUser: User = {
            ...user,
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
        return newUser;
    };

    const deleteUser = (id: string) => {
        setData(prev => ({
            ...prev,
            users: prev.users.filter(u => u.id !== id)
        }));
    };

    // Teams
    const addTeam = (team: Omit<Team, 'id'>): Team => {
        const newTeam: Team = {
            ...team,
            id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setData(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
        return newTeam;
    };

    const updateTeam = (id: string, updates: Partial<Team>) => {
        setData(prev => ({
            ...prev,
            teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    };

    const deleteTeam = (id: string) => {
        setData(prev => ({
            ...prev,
            teams: prev.teams.filter(t => t.id !== id),
            teamScores: prev.teamScores.filter(ts => ts.teamId !== id)
        }));
    };

    // Criteria
    const addCriterion = (criterion: Omit<Criterion, 'id'>): Criterion => {
        const newCriterion: Criterion = {
            ...criterion,
            id: `criterion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setData(prev => ({ ...prev, criteria: [...prev.criteria, newCriterion] }));
        return newCriterion;
    };

    const updateCriterion = (id: string, updates: Partial<Criterion>) => {
        setData(prev => ({
            ...prev,
            criteria: prev.criteria.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    };

    const deleteCriterion = (id: string) => {
        setData(prev => ({
            ...prev,
            criteria: prev.criteria.filter(c => c.id !== id)
        }));
    };

    // Team Scores
    const saveTeamScore = (score: TeamScore) => {
        setData(prev => {
            const existing = prev.teamScores.findIndex(
                ts => ts.juryId === score.juryId && ts.teamId === score.teamId
            );

            if (existing >= 0) {
                const newScores = [...prev.teamScores];
                newScores[existing] = score;
                return { ...prev, teamScores: newScores };
            } else {
                return { ...prev, teamScores: [...prev.teamScores, score] };
            }
        });
    };

    const getTeamScore = (juryId: string, teamId: string): TeamScore | undefined => {
        return data.teamScores.find(
            ts => ts.juryId === juryId && ts.teamId === teamId
        );
    };

    const value: DataContextType = {
        events: data.events,
        currentEventId,
        setCurrentEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        users: filteredUsers,
        teams: filteredTeams,
        criteria: filteredCriteria,
        teamScores: filteredTeamScores,
        addUser,
        deleteUser,
        addTeam,
        updateTeam,
        deleteTeam,
        addCriterion,
        updateCriterion,
        deleteCriterion,
        saveTeamScore,
        getTeamScore,
        refresh
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
