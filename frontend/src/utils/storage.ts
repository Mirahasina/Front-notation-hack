import type { AppData, User, Event } from '../types';

const STORAGE_KEY = 'jury_platform_data_v2';
const DEFAULT_EVENT_ID = 'event-juryhack-2025';

const defaultAdmin: User = {
    id: 'admin-1',
    username: 'admin',
    password: 'admin_RISE@',
    role: 'admin'
};

const defaultEvent: Event = {
    id: DEFAULT_EVENT_ID,
    name: 'JuryHack 2025',
    date: new Date().toISOString(),
    status: 'ongoing',
    description: 'Événement par défaut',
    created_at: new Date().toISOString()
};

const getDefaultData = (): AppData => ({
    users: [defaultAdmin],
    events: [defaultEvent],
    teams: [],
    criteria: [],
    teamScores: []
});

const migrateData = (data: any): AppData => {
    if (!data.events || data.events.length === 0) {
        console.log('Migrating data to multi-event format...');

        const migratedData: AppData = {
            users: data.users || [defaultAdmin],
            events: [defaultEvent],
            teams: (data.teams || []).map((team: any) => ({
                ...team,
                event: team.event || team.eventId || DEFAULT_EVENT_ID
            })),
            criteria: (data.criteria || []).map((criterion: any) => ({
                ...criterion,
                event: criterion.event || criterion.eventId || DEFAULT_EVENT_ID
            })),
            teamScores: (data.teamScores || []).map((score: any) => ({
                ...score,
                event: score.event || score.eventId || DEFAULT_EVENT_ID
            }))
        };

        migratedData.users = migratedData.users.map(user => ({
            ...user,
            event: (user as any).event || (user as any).eventId || (user.role === 'jury' ? DEFAULT_EVENT_ID : undefined)
        }));

        return migratedData;
    }

    return data as AppData;
};

export const loadData = (): AppData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const migrated = migrateData(parsed);

            if (!parsed.events) {
                saveData(migrated);
            }

            return migrated;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return getDefaultData();
};

export const saveData = (data: AppData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

export const clearData = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export const exportData = (): string => {
    const data = loadData();
    return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
    try {
        const data = JSON.parse(jsonString) as AppData;
        const migrated = migrateData(data);
        saveData(migrated);
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
};

export { DEFAULT_EVENT_ID };
