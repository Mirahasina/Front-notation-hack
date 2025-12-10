export interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'jury' | 'team';
    eventId?: string; // Jury assigned to specific event
    teamId?: string; // Pour les utilisateurs team
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
    eventId: string;
    name: string;
    maxScore: number;
    priorityOrder: number;
}

export interface Team {
    id: string;
    eventId: string;
    name: string;
    email?: string; 
    generatedEmail?: string;
    password?: string;
    hasLoggedIn?: boolean;
    passageOrder?: number;
    passageTime?: string;
    importedFrom?: 'manual' | 'excel';
}

export interface TeamScore {
    id?: string;
    juryId: string;
    teamId: string;
    eventId: string;
    scores: Record<string, number>;
    locked: boolean;
    submittedAt?: string;
}

export interface TeamResult {
    teamId: string;
    teamName: string;
    platformName: string;
    totalScore: number;
    averageScore: number;
    criterionScores: Record<string, number>;
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
