import type { Team } from '../types';

/**
 * Mélange aléatoirement un tableau (Fisher-Yates shuffle)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Assigne un ordre de passage aux équipes
 */
export const assignPassageOrder = (
    teams: Team[],
    startTime?: string,
    intervalMinutes: number = 15
): Team[] => {
    const shuffled = shuffleArray(teams);

    return shuffled.map((team, index) => ({
        ...team,
        passageOrder: index + 1,
        passageTime: startTime ? calculateTimeSlot(startTime, index * intervalMinutes) : undefined
    }));
};

/**
 * Calcule un créneau horaire
 */
export const calculateTimeSlot = (startTime: string, minutesToAdd: number): string => {
    // Parse startTime (format: "09h00" ou "09:00")
    const timeMatch = startTime.match(/(\d{1,2})[:h](\d{2})/);
    if (!timeMatch) return startTime;

    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);

    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}h${String(newMinutes).padStart(2, '0')}`;
};

/**
 * Génère des créneaux horaires
 */
export const generateTimeSlots = (
    count: number,
    startTime: string = '09h00',
    intervalMinutes: number = 15
): string[] => {
    const slots: string[] = [];
    for (let i = 0; i < count; i++) {
        slots.push(calculateTimeSlot(startTime, i * intervalMinutes));
    }
    return slots;
};

/**
 * Réinitialise l'ordre de passage
 */
export const clearPassageOrder = (teams: Team[]): Team[] => {
    return teams.map(team => ({
        ...team,
        passageOrder: undefined,
        passageTime: undefined
    }));
};

/**
 * Trie les équipes par ordre de passage
 */
export const sortByPassageOrder = (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
        if (a.passageOrder === undefined && b.passageOrder === undefined) return 0;
        if (a.passageOrder === undefined) return 1;
        if (b.passageOrder === undefined) return -1;
        return a.passageOrder - b.passageOrder;
    });
};
