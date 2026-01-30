import type { Team, TeamScore, TeamResult, Criterion } from '../types';

export const calculateTeamTotal = (
    teamId: string,
    teamScores: TeamScore[]
): number => {
    const scores = teamScores.filter(ts => ts.team === teamId);
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
    const sortedCriteria = [...criteria].sort((a, b) => a.priority_order - b.priority_order);

    const results: TeamResult[] = teams.map((team, index) => {
        const juryScores = juries.map(jury => {
            const score = teamScores.find(
                ts => ts.team === team.id && ts.jury === jury.id
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
        const platformName = `${baseName}`;

        const criterionScores: Record<string, number> = {};
        criteria.forEach(c => {
            criterionScores[c.id] = juryScores.reduce(
                (sum, js) => sum + (js.scores[c.id] || 0),
                0
            );
        });

        const averageScore = juries.length > 0 ? totalScore / juries.length : 0;

        let perfectScoresCount = 0;
        criteria.forEach(criterion => {
            juryScores.forEach(js => {
                if (js.scores[criterion.id] === criterion.max_score) {
                    perfectScoresCount++;
                }
            });
        });

        const juryTotals = juryScores.map(js => js.total);
        const mean = averageScore;
        const variance = juries.length > 0
            ? juryTotals.reduce((sum, total) => sum + Math.pow(total - mean, 2), 0) / juries.length
            : 0;
        const standardDeviation = Math.sqrt(variance);

        return {
            teamId: team.id,
            teamName: team.name,
            platformName,
            totalScore,
            averageScore,
            criterionScores,
            juryScores,
            perfectScoresCount,
            standardDeviation
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

        if (b.perfectScoresCount !== a.perfectScoresCount) {
            return b.perfectScoresCount - a.perfectScoresCount;
        }
        return a.standardDeviation - b.standardDeviation;
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
                ts => ts.team === team.id && ts.jury === jury.id && ts.locked
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
        ts => ts.jury === juryId && ts.locked
    ).length;

    return {
        scored,
        total,
        percentage: total > 0 ? Math.round((scored / total) * 100) : 0
    };
};
