import type { Team, TeamScore, TeamResult, Criterion } from '../types';

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
    juries: { id: string; username: string }[],
    criteria: Criterion[] = []
): TeamResult[] => {
    const sortedCriteria = [...criteria].sort((a, b) => a.priorityOrder - b.priorityOrder);

    const results: TeamResult[] = teams.map((team, index) => {
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

        const baseName = team.name.replace(/\s+/g, '_');
        const platformName = `${baseName}_Team${index + 1}`;

        const criterionScores: Record<string, number> = {};
        criteria.forEach(c => {
            criterionScores[c.id] = juryScores.reduce(
                (sum, js) => sum + (js.scores[c.id] || 0),
                0
            );
        });

        const averageScore = juries.length > 0 ? totalScore / juries.length : 0;

        return {
            teamId: team.id,
            teamName: team.name,
            platformName,
            totalScore,
            averageScore,
            criterionScores,
            juryScores
        };
    });

    return results.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
        }

        for (const criterion of sortedCriteria) {
            const aScore = a.criterionScores[criterion.id] || 0;
            const bScore = b.criterionScores[criterion.id] || 0;
            if (bScore !== aScore) {
                return bScore - aScore;
            }
        }

        return 0;
    });
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
