import { useState } from 'react';
import type { ExcelPreview } from '../utils/excelImport';
import { readExcelFile, parseExcelPreview, extractTeamsFromColumn, validateExcelFile } from '../utils/excelImport';
import { Modal } from './Modal';
import './ImportExcelModal.css';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (teams: Array<{ name: string; description?: string }>) => void;
}

export const ImportExcelModal = ({ isOpen, onClose, onImport }: ImportExcelModalProps) => {
    const [preview, setPreview] = useState<ExcelPreview | null>(null);
    const [rawData, setRawData] = useState<any[][] | null>(null);
    const [selectedNameColumn, setSelectedNameColumn] = useState<string>('');
    const [selectedDescColumn, setSelectedDescColumn] = useState<string>('');
    const [selectedEmailColumn, setSelectedEmailColumn] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const validation = validateExcelFile(selectedFile);
        if (!validation.valid) {
            setError(validation.error || 'Fichier invalide');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const data = await readExcelFile(selectedFile);
            setRawData(data);
            const previewData = parseExcelPreview(data);
            setPreview(previewData);

            if (previewData.headers.length > 0) {
                setSelectedNameColumn(previewData.headers[0]);
            }
        } catch (err) {
            setError('Erreur lors de la lecture du fichier');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = () => {
        if (!preview || !rawData || !selectedNameColumn) return;

        const teams = extractTeamsFromColumn(
            rawData,
            preview.headers,
            selectedNameColumn,
            selectedDescColumn || undefined,
            selectedEmailColumn || undefined
        );

        if (teams.length === 0) {
            setError('Aucun projet trouvé dans la colonne sélectionnée');
            return;
        }

        onImport(teams);
        handleClose();
    };

    const handleClose = () => {
        setPreview(null);
        setRawData(null);
        setSelectedNameColumn('');
        setSelectedDescColumn('');
        setSelectedEmailColumn('');
        setError('');
        onClose();
    };

    const teamsCount = preview && rawData && selectedNameColumn
        ? extractTeamsFromColumn(rawData, preview.headers, selectedNameColumn).length
        : 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importer des projets depuis excel">
            <div className="import-modal-container">

                <div className="import-file-input-wrapper">
                    <label className="form-label text-left mb-2 block">Fichier Excel (.xlsx, .xls, .csv)</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="import-file-input"
                    />
                    {error && (
                        <p className="import-error-msg">
                            ⚠️ {error}
                        </p>
                    )}
                </div>

                {isLoading && (
                    <div className="import-loading">
                        <p>Chargement du fichier...</p>
                    </div>
                )}

                {preview && !isLoading && (
                    <div className="import-preview-section">
                        <div className="form-group mb-6">
                            <label className="form-label">Aperçu du fichier ({preview.totalRows} lignes trouvées)</label>
                            <div className="import-table-wrapper">
                                <table className="import-preview-table">
                                    <thead>
                                        <tr>
                                            {preview.headers.map((header, idx) => (
                                                <th key={idx}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row, idx) => (
                                            <tr key={idx}>
                                                {preview.headers.map((header, colIdx) => (
                                                    <td key={colIdx}>
                                                        {String(row[header] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="import-selectors-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-group">
                                <label className="form-label">Colonne "Nom" *</label>
                                <select
                                    value={selectedNameColumn}
                                    onChange={e => setSelectedNameColumn(e.target.value)}
                                    className="import-select input-base"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {preview.headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Colonne "Email" (optionnel)</label>
                                <select
                                    value={selectedEmailColumn}
                                    onChange={e => setSelectedEmailColumn(e.target.value)}
                                    className="import-select input-base"
                                >
                                    <option value="">-- Aucune --</option>
                                    {preview.headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Colonne "Description" (optionnel)</label>
                                <select
                                    value={selectedDescColumn}
                                    onChange={e => setSelectedDescColumn(e.target.value)}
                                    className="import-select input-base"
                                >
                                    <option value="">-- Aucune --</option>
                                    {preview.headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedNameColumn && (
                            <div className="import-summary-box mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <p className="import-summary-text text-center text-indigo-300 font-medium">
                                    {teamsCount} projet{teamsCount > 1 ? 's' : ''} prêt{teamsCount > 1 ? 's' : ''} à être importé{teamsCount > 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="import-actions flex justify-end gap-4 mt-8">
                    <button onClick={handleClose} className="btn-secondary">
                        Annuler
                    </button>
                    <button
                        onClick={handleImport}
                        className="btn-primary"
                        disabled={!preview || !selectedNameColumn || teamsCount === 0}
                    >
                        Importer {teamsCount > 0 && teamsCount} {teamsCount > 0 && (teamsCount > 1 ? 'projets' : 'projet')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
