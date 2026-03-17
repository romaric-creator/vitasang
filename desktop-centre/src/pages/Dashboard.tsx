import React, { useState, useEffect } from 'react';
import { Activity, Droplet, Calendar, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        donationsThisMonth: 0,
        appointmentsToday: 0,
        activeAlerts: 0,
        totalStock: 0,
        bloodDetail: [] as any[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.centre?.id_centre) return;

            try {
                const response = await api.get(`/centres/${user.centre.id_centre}/stats`);
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Optionnel : refresh toutes les 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    if (loading) {
        return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Chargement du tableau de bord...</div>;
    }

    const lowStockGroups = stats.bloodDetail
        .filter(item => item.quantite_poches <= item.seuil_alerte_min)
        .map(item => item.groupe_sanguin);

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>Vue d'ensemble</h1>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>
                        {user?.centre?.nom_centre || 'Centre de Santé'} • Caméroun
                    </p>
                </div>
                <button className="btn btn-primary">
                    Télécharger le Rapport
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                {/* Card 1 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(230, 57, 70, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Droplet size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Dons ce mois</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{stats.donationsThisMonth}</h3>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(69, 123, 157, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rendez-vous aujourd'hui</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{stats.appointmentsToday}</h3>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(233, 196, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Alertes Stock</p>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                            {lowStockGroups.length > 0 ? lowStockGroups.join(', ') : 'Aucune'}
                        </h3>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(230, 57, 70, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>SOS Actifs</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{stats.activeAlerts}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Recent Activity Section */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Activités Récentes</h3>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Voir tout</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            Les activités récentes apparaîtront ici dès qu'une action sera enregistrée.
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Stock Overview */}
                <div className="card">
                    <h3 style={{ margin: '0 0 20px 0' }}>État des Stocks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {stats.bloodDetail.slice(0, 4).map(item => {
                            const percentage = (item.quantite_poches / 50) * 100; // Hypothetical max of 50 for visual
                            const color = item.quantite_poches <= item.seuil_alerte_min ? 'var(--danger)' : percentage < 40 ? 'var(--warning)' : 'var(--success)';

                            return (
                                <div key={item.groupe_sanguin}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 600 }}>{item.groupe_sanguin}</span>
                                        <span style={{ color, fontSize: '0.875rem', fontWeight: 600 }}>
                                            {item.quantite_poches} poches
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: color, transition: 'width 1s ease' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {stats.bloodDetail.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Aucune donnée de stock disponible.</p>
                        )}
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '30px' }}>Voir tout le stock</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
