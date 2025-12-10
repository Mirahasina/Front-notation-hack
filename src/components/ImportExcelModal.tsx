import { useState } from 'react';
import type { ExcelPreview } from '../utils/excelImport';
import { readExcelFile, parseExcelPreview, extractTeamsFromColumn, validateExcelFile } from '../utils/excelImport';
import { Modal } from './Modal';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (teams: Array<{ name: string; description?: string }>) => void;
}

export const ImportExcelModal = ({ isOpen, onClose, onImport }: ImportExcelModalProps) => {
    const [preview, setPreview] = useState<ExcelPreview | null>(null);
    const [selectedNameColumn, setSelectedNameColumn] = useState<string>('');
    const [selectedDescColumn, setSelectedDescColumn] = useState<string>('');
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
            const rawData = await readExcelFile(selectedFile);
            const previewData = parseExcelPreview(rawData);
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
        if (!preview || !selectedNameColumn) return;

        const teams = extractTeamsFromColumn(preview, selectedNameColumn, selectedDescColumn || undefined);

        if (teams.length === 0) {
            setError('Aucun projet trouvé dans la colonne sélectionnée');
            return;
        }

        onImport(teams);
        handleClose();
    };

    const handleClose = () => {
        setPreview(null);
        setSelectedNameColumn('');
        setSelectedDescColumn('');
        setError('');
        onClose();
    };

    const teamsCount = preview && selectedNameColumn
        ? extractTeamsFromColumn(preview, selectedNameColumn, selectedDescColumn || undefined).length
        : 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importer des projets depuis excel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

                <div className="form-group">
                    <label className="form-label">Fichier Excel (.xlsx, .xls, .csv)</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        style={{ width: '100%' }}
                    />
                    {error && (
                        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {error}
                        </p>
                    )}
                </div>

                {isLoading && (
                    <div className="text-center">
                        <p>Chargement du fichier...</p>
                    </div>
                )}

                {preview && !isLoading && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Aperçu du fichier ({preview.totalRows} lignes)</label>
                            <div style={{
                                overflowX: 'auto',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-surface)', position: 'sticky', top: 0 }}>
                                            {preview.headers.map((header, idx) => (
                                                <th key={idx} style={{ padding: 'var(--spacing-sm)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                {preview.headers.map((header, colIdx) => (
                                                    <td key={colIdx} style={{ padding: 'var(--spacing-sm)' }}>
                                                        {String(row[header] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Colonne "Nom" *</label>
                                <select
                                    value={selectedNameColumn}
                                    onChange={e => setSelectedNameColumn(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">-- Sélectionner --</option>
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
                                    style={{ width: '100%' }}
                                >
                                    <option value="">-- Aucune --</option>
                                    {preview.headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedNameColumn && (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-primary)'
                            }}>
                                <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 500 }}>
                                    📊 {teamsCount} projet{teamsCount > 1 ? 's' : ''} à importer
                                </p>
                            </div>
                        )}
                    </>
                )}

                <div className="flex gap-md justify-end">
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
