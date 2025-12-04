import * as XLSX from 'xlsx';

export interface ExcelRow {
    [key: string]: any;
}

export interface ExcelPreview {
    headers: string[];
    rows: ExcelRow[];
    totalRows: number;
}

/**
 * Lit un fichier Excel et retourne les données brutes
 */
export const readExcelFile = async (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                resolve(rows as any[][]);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsBinaryString(file);
    });
};

/**
 * Convertit les données brutes en aperçu structuré
 */
export const parseExcelPreview = (rawData: any[][]): ExcelPreview => {
    if (rawData.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
    }

    // Première ligne = headers
    const headers = rawData[0].map((h, idx) =>
        h ? String(h) : `Colonne ${idx + 1}`
    );

    // Autres lignes = données
    const dataRows = rawData.slice(1);
    const rows = dataRows.map(row => {
        const rowObj: ExcelRow = {};
        headers.forEach((header, idx) => {
            rowObj[header] = row[idx] || '';
        });
        return rowObj;
    });

    return {
        headers,
        rows: rows.slice(0, 10), // Aperçu limité à 10 lignes
        totalRows: dataRows.length
    };
};

/**
 * Extrait les noms d'équipes depuis une colonne spécifique
 */
export const extractTeamsFromColumn = (
    preview: ExcelPreview,
    nameColumn: string,
    descriptionColumn?: string
): Array<{ name: string; description?: string }> => {
    const teams: Array<{ name: string; description?: string }> = [];

    // On utilise toutes les données, pas juste l'aperçu
    preview.rows.forEach(row => {
        const name = row[nameColumn];
        if (name && String(name).trim()) {
            teams.push({
                name: String(name).trim(),
                description: descriptionColumn ? String(row[descriptionColumn] || '').trim() : undefined
            });
        }
    });

    return teams;
};

/**
 * Valide un fichier Excel
 */
export const validateExcelFile = (file: File): { valid: boolean; error?: string } => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(extension)) {
        return {
            valid: false,
            error: 'Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv'
        };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'Fichier trop volumineux (max 5MB)'
        };
    }

    return { valid: true };
};
