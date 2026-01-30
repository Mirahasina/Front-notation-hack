import * as XLSX from 'xlsx';
import type { Team } from '../types';

export const exportTeamsToExcel = (teams: Team[]): void => {
    const data = teams.map((team) => {
        const platformName = `${team.name.replace(/\s+/g, '_')}`;
        return {
            'Nom du Projet': team.name,
            'Nom Plateforme': platformName,
            'Email Généré': team.generated_email || '-',
            'Ordre de Passage': team.passage_order || '-',
            'Heure de Passage': team.passage_time || '-'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Équipes');

    // Auto-size columns
    const colWidths = [
        { wch: 25 },
        { wch: 30 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `equipes_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
