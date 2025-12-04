import type { AppData, User, Event } from '../types';

const STORAGE_KEY = 'jury_platform_data';
const DEFAULT_EVENT_ID = 'event-juryhack-2025';

const defaultAdmin: User = {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
};

const defaultEvent: Event = {
    id: DEFAULT_EVENT_ID,
    name: 'JuryHack 2025',
    date: new Date().toISOString(),
    status: 'ongoing',
    description: 'Événement par défaut',
    createdAt: new Date().toISOString()
};

const getDefaultData = (): AppData => ({
    users: [defaultAdmin],
    events: [defaultEvent],
    teams: [],
    criteria: [],
    teamScores: []
});

/**
 * Migrate old data format to new multi-event format
 */
const migrateData = (data: any): AppData => {
    // If events array doesn't exist, this is old format
    if (!data.events || data.events.length === 0) {
        console.log('Migrating data to multi-event format...');

        const migratedData: AppData = {
            users: data.users || [defaultAdmin],
            events: [defaultEvent],
            teams: (data.teams || []).map((team: any) => ({
                ...team,
                eventId: team.eventId || DEFAULT_EVENT_ID
            })),
            criteria: (data.criteria || []).map((criterion: any) => ({
                ...criterion,
                eventId: criterion.eventId || DEFAULT_EVENT_ID
            })),
            teamScores: (data.teamScores || []).map((score: any) => ({
                ...score,
                eventId: score.eventId || DEFAULT_EVENT_ID
            }))
        };

        // Assign jury users to default event if they don't have one
        migratedData.users = migratedData.users.map(user => ({
            ...user,
            eventId: user.role === 'jury' && !user.eventId ? DEFAULT_EVENT_ID : user.eventId
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

            // Save migrated data back
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
