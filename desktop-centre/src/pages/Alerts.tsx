import React from 'react';
import { AlertCircle, MapPin, Phone, Users, CheckCircle, XCircle } from 'lucide-react';

const Alerts: React.FC = () => {
    const alerts = [
        { id: 1, type: 'Urgence Vitale', group: 'O-', location: 'Bloc Opératoire B', patient: 'Anonyme', requiredBags: 3, status: 'Active', createdBy: 'Dr. Kamga', time: '10:05' },
        { id: 2, type: 'Recherche Ciblée', group: 'A+', location: 'Service Maternité', patient: 'A. Ndongo', requiredBags: 1, status: 'À Valider', createdBy: 'User Alerte', time: '09:20' },
        { id: 3, type: 'Alerte Bas Stock', group: 'B-', location: 'Banque Principale', patient: 'N/A', requiredBags: 5, status: 'Résolue', createdBy: 'Système', time: 'Hier' }
    ];

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 0' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>Alertes SOS</h1>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Centre de contrôle des urgences transfusionnelles</p>
                </div>
                <button className="btn btn-primary" style={{ background: 'var(--danger)' }}>
                    <AlertCircle size={18} /> Diffuser une Urgence
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px' }}>

                {/* Main Alerts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Alertes en cours</h2>

                    {/* Alert Card 1 - High Priority */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(230, 57, 70, 0.2)' }}>
                        <div style={{ background: 'var(--danger)', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                <AlertCircle size={18} />
                                URGENCE VITALE - BESOIN O-
                            </div>
                            <span style={{ fontSize: '0.875rem', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>Depuis 10:05</span>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>Patient: Anonyme</h3>
                                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> Bloc Opératoire B</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={16} /> Requis par: Dr. Kamga</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>3</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Poches requises</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.875rem', fontWeight: 600 }}>Statut Diffusion</p>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: '100%', height: '100%', background: 'var(--primary)' }}></div>
                                    </div>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Envoyé à 145 donneurs O- à proximité</p>
                                </div>
                                <button className="btn btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                                    <CheckCircle size={18} /> Marquer Résolue
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alert Card 2 - Validation needed */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(233, 196, 106, 0.4)' }}>
                        <div style={{ background: '#fcf6e3', color: '#b58500', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(233, 196, 106, 0.4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                <AlertCircle size={18} />
                                EN ATTENTE DE VALIDATION - A+
                            </div>
                            <span style={{ fontSize: '0.875rem', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Depuis 09:20</span>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>Patient: A. Ndongo</h3>
                                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> Service Maternité</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={16} /> Initiateur: +237 6XX...</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>1</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Poche requise</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger)' }}>
                                    <XCircle size={18} /> Rejeter
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1 }}>
                                    Approuver & Diffuser
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <h3 style={{ margin: '0 0 15px 0' }}>Statistiques d'Alertes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--background)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Générées ce mois</span>
                                <span style={{ fontWeight: 600 }}>14</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--background)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Taux de réponse</span>
                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>85%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--background)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Temps moyen (résolution)</span>
                                <span style={{ fontWeight: 600 }}>4h 20m</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ margin: '0 0 15px 0' }}>Protocoles d'Urgence</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                            En cas de besoin critique, l'alerte est poussée aux donneurs universels (O-) en priorité avec une notification sonore forcée si autorisé par l'OS mobile.
                        </p>
                        <a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Lire le protocole</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Alerts;
