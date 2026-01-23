import { useState, useRef } from 'react';
import type { ExcelPreview } from '../utils/excelImport';
import { readExcelFile, parseExcelPreview, extractTeamsFromColumn, validateExcelFile } from '../utils/excelImport';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (teams: Array<{ name: string; email?: string }>) => void;
}

export const ImportExcelModal = ({ isOpen, onClose, onImport }: ImportExcelModalProps) => {
    const [preview, setPreview] = useState<ExcelPreview | null>(null);
    const [rawData, setRawData] = useState<any[][] | null>(null);
    const [selectedNameColumn, setSelectedNameColumn] = useState<string>('');
    const [selectedEmailColumn, setSelectedEmailColumn] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        processFile(selectedFile);
    };

    const processFile = async (file: File) => {
        const validation = validateExcelFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Fichier invalide');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const data = await readExcelFile(file);
            setRawData(data);
            const previewData = parseExcelPreview(data);
            setPreview(previewData);

            if (previewData.headers.length > 0) {
                setSelectedNameColumn(previewData.headers[0]);
                const lowerHeaders = previewData.headers.map(h => h.toLowerCase());
                const emailIdx = lowerHeaders.findIndex(h => h.includes('email') || h.includes('mail'));
                if (emailIdx !== -1) setSelectedEmailColumn(previewData.headers[emailIdx]);
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
            undefined,
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
        setSelectedEmailColumn('');
        setError('');
        onClose();
    };

    const teamsCount = preview && rawData && selectedNameColumn
        ? extractTeamsFromColumn(rawData, preview.headers, selectedNameColumn).length
        : 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importation Excel des Projets" width="xl">
            <div className="space-y-6">
                {!preview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">Cliquez pour téléverser</h4>
                        <p className="text-sm text-slate-500">Supporte .xlsx, .xls, .csv (Max 5MB)</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aperçu du fichier</p>
                                    <p className="text-sm font-bold text-slate-700">{preview.totalRows} lignes trouvées</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setPreview(null)} className="text-red-500 hover:text-red-600">
                                <X size={16} className="mr-2" /> Changer
                            </Button>
                        </div>

                        <div className="max-h-48 overflow-auto border border-slate-100 rounded-xl mb-6 shadow-inner bg-slate-50/50">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="sticky top-0 bg-white border-b border-slate-100">
                                    <tr>
                                        {preview.headers.map((header, idx) => (
                                            <th key={idx} className="p-3 font-bold text-slate-600 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-white transition-colors">
                                            {preview.headers.map((header, colIdx) => (
                                                <td key={colIdx} className="p-3 text-slate-500 truncate max-w-[150px]">{String(row[header] || '')}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <ChevronRight size={16} className="text-indigo-500" /> Mapping des colonnes
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Colonne "Nom" *</label>
                                    <select
                                        value={selectedNameColumn}
                                        onChange={e => setSelectedNameColumn(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    >
                                        <option value="">Sélectionner</option>
                                        {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Colonne "Email" (Optionnel)</label>
                                    <select
                                        value={selectedEmailColumn}
                                        onChange={e => setSelectedEmailColumn(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    >
                                        <option value="">Ignorer</option>
                                        {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {selectedNameColumn && teamsCount > 0 && (
                            <div className="mt-6 flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-200">
                                <CheckCircle2 size={24} />
                                <div>
                                    <p className="text-sm font-bold">Prêt pour l'importation</p>
                                    <p className="text-xs opacity-80">{teamsCount} projets identifiés avec succès.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Traitement en cours...</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <Button variant="outline" onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!preview || !selectedNameColumn || teamsCount === 0 || isLoading}
                        className="px-8 shadow-lg shadow-indigo-200"
                    >
                        {isLoading ? 'Importation...' : `Importer ${teamsCount > 0 ? teamsCount : ''} projet${teamsCount > 1 ? 's' : ''}`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
