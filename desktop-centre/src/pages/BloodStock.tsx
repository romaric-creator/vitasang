import React, { useState } from 'react';
import { Droplet, Search, Filter, Plus, Edit2, AlertCircle } from 'lucide-react';

const BloodStock: React.FC = () => {
    const [stock, setStock] = useState([
        { id: 1, group: 'O+', quantity: 42, minThreshold: 20, status: 'Optimal', lastUpdated: '2023-11-20 08:30' },
        { id: 2, group: 'O-', quantity: 12, minThreshold: 15, status: 'Moyen', lastUpdated: '2023-11-20 09:15' },
        { id: 3, group: 'A+', quantity: 38, minThreshold: 25, status: 'Optimal', lastUpdated: '2023-11-19 14:00' },
        { id: 4, group: 'A-', quantity: 3, minThreshold: 10, status: 'Critique', lastUpdated: '2023-11-20 10:45' },
        { id: 5, group: 'B+', quantity: 18, minThreshold: 15, status: 'Optimal', lastUpdated: '2023-11-18 16:20' },
        { id: 6, group: 'B-', quantity: 5, minThreshold: 8, status: 'Moyen', lastUpdated: '2023-11-19 11:10' },
        { id: 7, group: 'AB+', quantity: 10, minThreshold: 10, status: 'Moyen', lastUpdated: '2023-11-17 09:30' },
        { id: 8, group: 'AB-', quantity: 2, minThreshold: 5, status: 'Critique', lastUpdated: '2023-11-20 11:00' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Optimal': return 'var(--success)';
            case 'Moyen': return 'var(--warning)';
            case 'Critique': return 'var(--danger)';
            default: return 'var(--text-main)';
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 0' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>Stock de Sang</h1>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Gestion de l'inventaire des poches</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} /> Nouvelle Entrée
                </button>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-control" placeholder="Rechercher par groupe sanguin..." style={{ paddingLeft: '45px' }} />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} /> Filtrer
                </button>
            </div>

            {/* Stock Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--background)' }}>
                        <tr>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)' }}>Groupe</th>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)' }}>Poches Disponibles</th>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)' }}>Seuil Min.</th>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)' }}>Statut</th>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)' }}>Dernière Maj</th>
                            <th style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(230, 57, 70, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                            <Droplet size={16} />
                                        </div>
                                        {item.group}
                                    </div>
                                </td>
                                <td style={{ padding: '15px', fontSize: '1.1rem', fontWeight: 600 }}>{item.quantity}</td>
                                <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{item.minThreshold}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '4px 8px',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        background: `${getStatusColor(item.status)}20`, /* 20 is hex opacity for ~12% */
                                        color: getStatusColor(item.status)
                                    }}>
                                        {item.status === 'Critique' && <AlertCircle size={14} />}
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.lastUpdated}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px', borderRadius: '6px' }}>
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BloodStock;
