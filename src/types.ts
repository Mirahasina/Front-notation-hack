export interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'jury';
    eventId?: string; // Jury assigned to specific event
}

export interface Event {
    id: string;
    name: string;
    date: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    description?: string;
    createdAt: string;
}

export interface Criterion {
    id: string;
    eventId: string; // Belongs to specific event
    name: string;
    maxScore: number;
}

export interface Team {
    id: string;
    eventId: string; // Belongs to specific event
    name: string;
    description?: string;
    passageOrder?: number;      // 1, 2, 3... ordre de passage
    passageTime?: string;        // "09h00" timing optionnel
    importedFrom?: 'manual' | 'excel'; // Traçabilité
}

export interface TeamScore {
    id?: string;
    juryId: string;
    teamId: string;
    eventId: string; // Belongs to specific event
    scores: Record<string, number>; // criterionId -> score
    locked: boolean;
    submittedAt?: string;
}

export interface TeamResult {
    teamId: string;
    teamName: string;
    totalScore: number;
    juryScores: {
        juryId: string;
        juryName: string;
        scores: Record<string, number>;
        total: number;
    }[];
}

export interface AppData {
    users: User[];
    events: Event[];
    teams: Team[];
    criteria: Criterion[];
    teamScores: TeamScore[];
}
