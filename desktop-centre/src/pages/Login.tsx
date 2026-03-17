import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/users/login', {
                telephone: telephone,
                mot_de_passe: password
            });

            if (response.data.success) {
                const { token, user } = response.data;
                // Check if the user is personnel or admin
                if (user.role === 'personnel' || user.role === 'admin') {
                    login(token, user);
                    navigate('/');
                } else {
                    setError("Accès réservé au personnel des centres.");
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '100px', maxWidth: '400px' }}>
            <div className="card animate-fade-in shadow-lg">
                <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--primary)' }}>VitaSang Centre</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    Connectez-vous à votre espace personnel
                </p>

                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Numéro de téléphone</label>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="6XXXXXXXX"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mot de passe</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
