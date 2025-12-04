import type { Team, TeamScore, TeamResult } from '../types';

export const calculateTeamTotal = (
    teamId: string,
    teamScores: TeamScore[]
): number => {
    const scores = teamScores.filter(ts => ts.teamId === teamId);
    let total = 0;

    scores.forEach(score => {
        Object.values(score.scores).forEach(value => {
            total += value;
        });
    });

    return total;
};

export const calculateResults = (
    teams: Team[],
    teamScores: TeamScore[],
    juries: { id: string; username: string }[]
): TeamResult[] => {
    const results: TeamResult[] = teams.map(team => {
        const juryScores = juries.map(jury => {
            const score = teamScores.find(
                ts => ts.teamId === team.id && ts.juryId === jury.id
            );

            const scores = score?.scores || {};
            const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

            return {
                juryId: jury.id,
                juryName: jury.username,
                scores,
                total
            };
        });

        const totalScore = juryScores.reduce((sum, js) => sum + js.total, 0);

        return {
            teamId: team.id,
            teamName: team.name,
            totalScore,
            juryScores
        };
    });

    // Sort by total score descending
    return results.sort((a, b) => b.totalScore - a.totalScore);
};

export const areAllTeamsScored = (
    teams: Team[],
    juries: { id: string }[],
    teamScores: TeamScore[]
): boolean => {
    if (teams.length === 0 || juries.length === 0) return false;

    for (const team of teams) {
        for (const jury of juries) {
            const score = teamScores.find(
                ts => ts.teamId === team.id && ts.juryId === jury.id && ts.locked
            );
            if (!score) return false;
        }
    }

    return true;
};

export const getJuryProgress = (
    juryId: string,
    teams: Team[],
    teamScores: TeamScore[]
): { scored: number; total: number; percentage: number } => {
    const total = teams.length;
    const scored = teamScores.filter(
        ts => ts.juryId === juryId && ts.locked
    ).length;

    return {
        scored,
        total,
        percentage: total > 0 ? Math.round((scored / total) * 100) : 0
    };
};
