import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface MessageListProps {
    messages: Message[];
    currentUserId: number;
    onDelete?: (id: number) => void;
    isAdmin?: boolean;
}

export default function MessageList({ messages, currentUserId, onDelete, isAdmin }: MessageListProps) {
    if (messages.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Aucun message pour le moment
            </div>
        );
    }

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
        return `Il y a ${Math.floor(seconds / 86400)} j`;
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'border-indigo-200 bg-indigo-50 text-indigo-700';
            case 'jury': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'team': return 'border-purple-200 bg-purple-50 text-purple-700';
            default: return 'border-slate-200 bg-slate-50 text-slate-700';
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="space-y-6 max-h-[500px] overflow-y-auto px-2 py-4">
            {messages.map((message) => {
                const isSent = message.sender === currentUserId;
                const canDelete = isAdmin || isSent;

                return (
                    <div
                        key={message.id}
                        className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`flex items-center gap-2 mb-1 px-1 ${isSent ? 'flex-row-reverse' : ''}`}>
                            <span className="font-bold text-xs text-slate-600">
                                {message.sender_username}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getRoleColor(message.sender_role)}`}>
                                {message.sender_role === 'admin' ? 'Staff' :
                                    message.sender_role === 'jury' ? 'Jury' : 'Team'}
                            </span>
                        </div>

                        <div className={`group relative max-w-[85%] md:max-w-[70%]`}>
                            <div
                                className={`px-4 py-3 rounded-2xl shadow-sm border ${isSent
                                    ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                                    : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                <div className={`text-[10px] mt-2 font-medium ${isSent ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                                    {formatTimeAgo(new Date(message.created_at))}
                                </div>
                            </div>

                            {onDelete && canDelete && (
                                <button
                                    onClick={() => onDelete(message.id)}
                                    className={`absolute top-0 ${isSent ? '-left-8' : '-right-8'} p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full hover:bg-slate-100`}
                                    title="Supprimer le message"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
