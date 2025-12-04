import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        const success = login(username, password);

        if (success) {
            // Redirect will be handled by App.tsx
            navigate('/');
        } else {
            setError('Identifiants incorrects');
        }
    };

    return (
        <div className="login-page">
            <div className="logos-container">
                <img src="/Rise.png" alt="RISE" className="logo-img" />
                <img src="/insi.png" alt="INSI" className="logo-img" />
            </div>

            <div className="login-card card">
                <div className="login-header text-center">
                    <h1>🏆 JuryHack 2025</h1>
                    <p className="text-muted">Plateforme de Notation</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Nom d'utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Entrez votre nom d'utilisateur"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};
