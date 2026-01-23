import axios from 'axios';
import type { User, Team, Criterion, TeamScore, Event } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            localStorage.removeItem('current_team');

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials: any) => api.post('/auth/login/', credentials),
    logout: () => api.post('/auth/logout/'),
};

export const eventApi = {
    list: () => api.get<Event[]>('/events/'),
    get: (id: string) => api.get<Event>(`/events/${id}/`),
    create: (data: Omit<Event, 'id'>) => api.post<Event>('/events/', data),
    update: (id: string, data: Partial<Event>) => api.patch<Event>(`/events/${id}/`, data),
    delete: (id: string) => api.delete(`/events/${id}/`),
};

export const userApi = {
    list: (params?: any) => api.get<User[]>('/users/', { params }),
    get: (id: string) => api.get<User>(`/users/${id}/`),
    create: (data: Omit<User, 'id'>) => api.post<User>('/users/', data),
    update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}/`, data),
    delete: (id: string) => api.delete(`/users/${id}/`),
};

export const criteriaApi = {
    list: (params?: any) => api.get<Criterion[]>('/criteria/', { params }),
    create: (data: Omit<Criterion, 'id'>) => api.post<Criterion>('/criteria/', data),
    update: (id: string, data: Partial<Criterion>) => api.patch<Criterion>(`/criteria/${id}/`, data),
    delete: (id: string) => api.delete(`/criteria/${id}/`),
};

export const teamApi = {
    list: (params?: any) => api.get<Team[]>('/teams/', { params }),
    create: (data: Omit<Team, 'id'>) => api.post<Team>('/teams/', data),
    update: (id: string, data: Partial<Team>) => api.patch<Team>(`/teams/${id}/`, data),
    delete: (id: string) => api.delete(`/teams/${id}/`),
};

export const scoreApi = {
    list: (params?: any) => api.get<TeamScore[]>('/team-scores/', { params }),
    save: (data: TeamScore) => {
        if (data.id) {
            return api.patch<TeamScore>(`/team-scores/${data.id}/`, data);
        }
        return api.post<TeamScore>('/team-scores/', data);
    },
    lock: (id: string) => api.post<TeamScore>(`/team-scores/${id}/lock/`),
};

export const reportApi = {
    getResults: (eventId: string) => api.get('/results/', { params: { event_id: eventId } }),
    checkCompletion: (eventId: string) => api.get('/check-completion/', { params: { event_id: eventId } }),
    getJuryProgress: (juryId: string) => api.get(`/jury-progress/${juryId}/`),
};

export default api;
