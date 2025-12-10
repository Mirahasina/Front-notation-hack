import * as XLSX from 'xlsx';
import type { Team } from '../types';

export const exportTeamsToExcel = (teams: Team[]): void => {
    const data = teams.map((team, index) => {
        const platformName = `${team.name.replace(/\s+/g, '_')}_Team${index + 1}`;
        return {
            'Nom du Projet': team.name,
            'Nom Plateforme': platformName,
            'Email Généré': team.generatedEmail || '-',
            'Ordre de Passage': team.passageOrder || '-',
            'Heure de Passage': team.passageTime || '-'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Équipes');

    // Auto-size columns
    const colWidths = [
        { wch: 25 }, // Nom du Projet
        { wch: 30 }, // Nom Plateforme
        { wch: 35 }, // Email Généré
        { wch: 15 }, // Ordre
        { wch: 15 }  // Heure
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `equipes_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
