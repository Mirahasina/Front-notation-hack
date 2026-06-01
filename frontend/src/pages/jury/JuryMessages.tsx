import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import { messageApi } from '../../services/api';
import type { Message } from '../../types';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export const JuryMessages = () => {
    const { logout, user } = useAuth();
    const { markMessagesAsRead, currentEventId, unreadMessagesCount } = useData();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await messageApi.list();
            const messagesData = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setMessages(messagesData);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 60000);
        return () => clearInterval(interval);
    }, [loadMessages]);

    useEffect(() => {
        if (messages.length > 0) {
            markMessagesAsRead();
        }
    }, [messages, markMessagesAsRead]);

    const handleSendMessage = async (content: string) => {
        if (!currentEventId) {
            alert("L'événement n'est pas actif. Impossible d'envoyer un message.");
            return;
        }
        try {
            await messageApi.send({ content, event: currentEventId, recipient: null });
            await loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleDeleteMessage = async (id: number) => {
        if (!confirm('Souhaitez-vous supprimer ce message ?')) return;
        try {
            await messageApi.delete(id);
            await loadMessages();
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <DashboardLayout
            userType="jury"
            userName={user?.username || 'Jury'}
            onLogout={handleLogout}
        >
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/jury/scoring')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Retour au Scoring</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 relative">
                                    <MessageSquare className="text-white" size={28} />
                                    {unreadMessagesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                            {unreadMessagesCount}
                                        </span>
                                    )}
                                </div>
                                Support Juries
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium">Communiquez directement avec les organisateurs</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="space-y-8">
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm"> </div>
                            <p className="text-sm text-indigo-900 font-semibold leading-relaxed">
                                Utilisez ce canal pour signaler tout problème technique ou poser vos questions au staff.
                            </p>
                        </div>

                        {loading && messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des messages...</p>
                            </div>
                        ) : (
                            <MessageList
                                messages={messages}
                                currentUserId={Number(user?.id) || 0}
                                onDelete={handleDeleteMessage}
                            />
                        )}

                        <div className="pt-8 border-t border-slate-100">
                            <MessageInput
                                onSend={handleSendMessage}
                                userRole="jury"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
