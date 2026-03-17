import React, { useState } from 'react';
import { Calendar, User, Clock, Check, X, Phone, FileText } from 'lucide-react';

const Appointments: React.FC = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [appointments, setAppointments] = useState([
        { id: 1, donorName: 'Jean Dupont', group: 'O+', date: 'Demain', time: '14:30', status: 'Confirmé', phone: '+237 6XX XXX XX', type: 'Don de sang total' },
        { id: 2, donorName: 'Marie Curie', group: 'AB+', date: 'Demain', time: '09:00', status: 'En attente', phone: '+237 6YY YYY YY', type: 'Don de plasma' },
        { id: 3, donorName: 'Luc Skywalker', group: 'A-', date: '12 Nov 2023', time: '10:15', status: 'Terminé', phone: '+237 6ZZ ZZZ ZZ', type: 'Don de sang total' },
    ]);

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 0' }}>

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>Rendez-vous</h1>
                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Gestion des donneurs planifiés</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{ background: 'none', border: 'none', padding: '10px 15px', fontSize: '1rem', fontWeight: activeTab === 'upcoming' ? 600 : 500, color: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'upcoming' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                    À venir (2)
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{ background: 'none', border: 'none', padding: '10px 15px', fontSize: '1rem', fontWeight: activeTab === 'history' ? 600 : 500, color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                    Historique
                </button>
            </div>

            {/* Appointments List */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {appointments
                    .filter(a => activeTab === 'upcoming' ? a.status !== 'Terminé' : a.status === 'Terminé')
                    .map((apt) => (
                        <div key={apt.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    <User size={24} />
                                </div>

                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{apt.donorName}  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{apt.group}</span></h3>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {apt.date}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {apt.time}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><DropIcon /> {apt.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-muted)' }} title="Appeler">
                                    <Phone size={18} />
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-muted)' }} title="Dossier">
                                    <FileText size={18} />
                                </button>

                                {activeTab === 'upcoming' && (
                                    <div style={{ display: 'flex', gap: '10px', marginLeft: '10px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                                        <button className="btn" style={{ background: 'rgba(230, 57, 70, 0.1)', color: 'var(--danger)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <X size={16} /> Refuser
                                        </button>
                                        <button className="btn btn-primary" style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'var(--success)' }}>
                                            <Check size={16} /> Valider Don
                                        </button>
                                    </div>
                                )}
                                {activeTab === 'history' && (
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, background: 'var(--background)', padding: '5px 10px', borderRadius: '6px' }}>Terminé</span>
                                )}

                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

// Helper icon
const DropIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
    </svg>
)

export default Appointments;
