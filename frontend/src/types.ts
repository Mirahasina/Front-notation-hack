export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'jury' | 'team';
    event?: string;
    teamId?: string;
    assigned_criteria?: string[];
}

export interface Event {
    id: string;
    name: string;
    date: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    description?: string;
    created_at: string;
}

export interface Criterion {
    id: string;
    event: string;
    name: string;
    max_score: number;
    priority_order: number;
    created_at: string;
}

export interface Team {
    id: string;
    event: string;
    name: string;
    description?: string;
    email?: string;
    generated_email?: string;
    password?: string;
    has_logged_in?: boolean;
    passage_order?: number;
    passage_time?: string;
    created_at: string;
}

export interface TeamScore {
    id?: string;
    event: string;
    jury: string;
    jury_username?: string;
    team: string;
    team_name?: string;
    scores: Record<string, number>;
    locked: boolean;
    submitted_at?: string;
    created_at?: string;
    updated_at?: string;
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
