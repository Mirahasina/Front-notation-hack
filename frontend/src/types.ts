export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'jury' | 'team';
    first_name?: string;
    last_name?: string;
    email?: string;
    event?: string;
    track?: string;
    assigned_criteria?: string[];
    teamId?: string;
}

export interface Event {
    id: string;
    name: string;
    date: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    description?: string;
    instructions?: string;
    created_at: string;
}

export interface Criterion {
    id: string;
    event: string;
    name: string;
    max_score: number;
    weight: number;
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
    passage_order?: number | null;
    passage_time?: string | null;
    track?: string;
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
    criterion_comments: Record<string, string>;
    global_comments: string;
    locked: boolean;
    submitted_at?: string;
    total?: number;
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
    perfectScoresCount: number;
    standardDeviation: number;
}

export interface AppData {
    users: User[];
    events: Event[];
    teams: Team[];
    criteria: Criterion[];
    teamScores: TeamScore[];
}
