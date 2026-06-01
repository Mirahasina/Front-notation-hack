import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { User } from '../types';

interface MessageInputProps {
    onSend: (content: string, recipient?: number | null, recipients?: number[]) => Promise<void>;
    userRole?: 'admin' | 'jury' | 'team';
    users?: User[];
    defaultRecipientId?: number | null;
}

export default function MessageInput({ onSend, userRole, users = [], defaultRecipientId }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<number[]>(
        defaultRecipientId ? [defaultRecipientId] : []
    );
    const [isMulti, setIsMulti] = useState(false);
    const [loading, setLoading] = useState(false);

    // Sync selectedRecipients when defaultRecipientId changes
    useEffect(() => {
        if (defaultRecipientId) {
            setSelectedRecipients([defaultRecipientId]);
            setIsMulti(false);
        } else if (!isMulti) {
            setSelectedRecipients([]);
        }
    }, [defaultRecipientId, isMulti]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            if (userRole === 'admin' && isMulti && selectedRecipients.length > 0) {
                await onSend(content, undefined, selectedRecipients);
            } else if (userRole === 'admin' && selectedRecipients.length === 1) {
                await onSend(content, selectedRecipients[0]);
            } else {
                await onSend(content, null);
            }
            setContent('');
            setSelectedRecipients([]);
            setIsMulti(false);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRecipient = (userId: number) => {
        setSelectedRecipients(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {userRole === 'admin' && !defaultRecipientId && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isMulti}
                                onChange={(e) => setIsMulti(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Envoyer à plusieurs destinataires</span>
                        </label>
                    </div>

                    {isMulti && (
                        <div className="border rounded p-3 max-h-40 overflow-y-auto bg-gray-50">
                            <p className="text-sm font-medium mb-2">Sélectionner les destinataires :</p>
                            {users.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucun utilisateur disponible</p>
                            ) : (
                                <div className="space-y-1">
                                    {users.map(user => (
                                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedRecipients.includes(Number(user.id))}
                                                onChange={() => toggleRecipient(Number(user.id))}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{user.username} ({user.role})</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!isMulti && users.length > 0 && (
                        <select
                            value={selectedRecipients[0] || ''}
                            onChange={(e) => setSelectedRecipients(e.target.value ? [Number(e.target.value)] : [])}
                            className="w-full border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Envoyer au Staff (Broadcast)</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.role})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            <div className="flex gap-3 items-end">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                        userRole === 'admin'
                            ? defaultRecipientId
                                ? `Répondre à ${users.find(u => Number(u.id) === defaultRecipientId)?.username}...`
                                : 'Tapez votre message...'
                            : 'Envoyer un message au Staff...'
                    }
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 transition-all font-medium"
                    rows={2}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || loading}
                    className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
                >
                    <Send size={20} />
                </button>
            </div>
        </form>
    );
}
