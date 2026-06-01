import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import { messageApi } from '../../services/api';
import type { Message } from '../../types';
import { MessageSquare, ArrowLeft, Trash2 } from 'lucide-react';

export const AdminMessages = () => {
    const { logout, user } = useAuth();
    const { users, markMessagesAsRead, currentEventId } = useData();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMessages();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            markMessagesAsRead(selectedUserId);
        }
    }, [selectedUserId, messages]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const response = await messageApi.list();
            const messagesData = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setMessages(messagesData);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
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

    const handleClearConversation = async (userId: number, username: string) => {
        if (!confirm(`Souhaitez-vous supprimer TOUS les messages avec ${username} ?`)) return;
        try {
            await messageApi.clearConversation(userId);
            await loadMessages();
        } catch (error) {
            console.error('Failed to clear conversation:', error);
        }
    };

    const handleSendMessage = async (content: string, recipient?: number | null, recipients?: number[]) => {
        if (!currentEventId) {
            alert("Veuillez d'abord sélectionner un événement.");
            return;
        }
        try {
            await messageApi.send({ content, event: currentEventId, recipient, recipients });
            await loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Get all non-admin users for recipient selection
    const availableUsers = users.filter(u => u.role !== 'admin');

    return (
        <DashboardLayout
            userType="admin"
            userName={user?.username || 'Admin'}
            onLogout={handleLogout}
        >
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Retour au tableau de bord</span>
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="text-indigo-600" size={32} />
                        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
                    </div>
                    <p className="text-slate-500">
                        Communiquez avec les équipes et les jurys
                    </p>
                    <div className="mt-2">
                        <button
                            onClick={() => {
                                if (confirm('Marquer tous les messages comme lus ?')) {
                                    markMessagesAsRead();
                                    // small timeout to refresh
                                    setTimeout(() => window.location.reload(), 500);
                                }
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                            Marquer tout comme lu (Debug)
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
                    {/* Conversations Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 space-y-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                Discussions
                            </h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">

                            {availableUsers
                                .filter(u => {
                                    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
                                    if (searchTerm) return matchesSearch;

                                    return messages.some(m =>
                                        m.sender === Number(u.id) || m.recipient === Number(u.id)
                                    );
                                })
                                .map(u => {
                                    const unreadFromUser = messages.filter(m =>
                                        m.sender === Number(u.id) &&
                                        (Number(m.recipient) === Number(user?.id) || m.recipient === null) &&
                                        !m.is_read
                                    ).length;

                                    const isActive = selectedUserId === Number(u.id);

                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => setSelectedUserId(Number(u.id))}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group cursor-pointer ${isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50'
                                                : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{u.username}</span>
                                                    {unreadFromUser > 0 && !isActive && (
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold tracking-tighter ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                    {u.role === 'team' ? 'Équipe' : 'Jury'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {unreadFromUser > 0 && !isActive && (
                                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100 italic">
                                                        {unreadFromUser} nouveau{unreadFromUser > 1 ? 'x' : ''}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClearConversation(Number(u.id), u.username);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-all ${isActive
                                                        ? 'text-indigo-200 hover:text-white hover:bg-white/10'
                                                        : 'text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                                                        }`}
                                                    title="Effacer discussion"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                            {searchTerm && availableUsers.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-xs text-slate-400 italic">Aucun résultat pour "{searchTerm}"</p>
                                </div>
                            )}

                            {availableUsers.length > 0 && !searchTerm && messages.every(m =>
                                !availableUsers.some(u => m.sender === Number(u.id) || m.recipient === Number(u.id))
                            ) && (
                                    <div className="text-center py-10 px-4">
                                        <p className="text-xs text-slate-400 italic leading-relaxed">
                                            Aucune discussion active.<br />
                                            Utilisez la recherche pour contacter quelqu'un.
                                        </p>
                                    </div>
                                )}

                            {availableUsers.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-xs text-slate-400 italic">Aucun utilisateur disponible</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                        {selectedUserId ? (
                            <>
                                {/* Discussion Header */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                                            {availableUsers.find(u => Number(u.id) === selectedUserId)?.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900">
                                                {availableUsers.find(u => Number(u.id) === selectedUserId)?.username}
                                            </h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                Discussion en direct
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedUserId(null)}
                                        className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all font-bold text-xs uppercase tracking-widest"
                                    >
                                        Fermer
                                    </button>
                                </div>

                                {/* Message List Container */}
                                <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-0 flex flex-col">
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        {loading ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement...</p>
                                            </div>
                                        ) : (
                                            <MessageList
                                                messages={messages.filter(m =>
                                                    m.sender === selectedUserId || m.recipient === selectedUserId
                                                )}
                                                currentUserId={Number(user?.id) || 0}
                                                isAdmin={true}
                                                onDelete={handleDeleteMessage}
                                            />
                                        )}
                                    </div>

                                    {/* Input Area */}
                                    <div className="mt-8 pt-8 border-t border-slate-50">
                                        <MessageInput
                                            onSend={handleSendMessage}
                                            userRole="admin"
                                            users={availableUsers}
                                            defaultRecipientId={selectedUserId}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty State / Select User or Broadcast */
                            <div className="flex-1 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center group">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <MessageSquare className="text-slate-300" size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4">Votre Messagerie Admin</h2>
                                <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                                    Sélectionnez un membre du jury ou une équipe dans la liste de gauche pour démarrer une conversation individuelle.
                                </p>

                                <div className="mt-12 w-full max-w-md bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                                        Ou Envoyez à Tout le monde
                                    </h3>
                                    <MessageInput
                                        onSend={handleSendMessage}
                                        userRole="admin"
                                        users={availableUsers}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
