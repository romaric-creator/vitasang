import React from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>VitaSang</h2>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Espace Centre</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '15px', flex: 1 }}>
                    <NavLink
                        to="/dashboard"
                        style={({ isActive }) => ({ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-main)', background: isActive ? 'rgba(230, 57, 70, 0.1)' : 'transparent', fontWeight: isActive ? 600 : 500, transition: 'var(--transition)' })}
                    >
                        Tableau de bord
                    </NavLink>
                    <NavLink
                        to="/stock"
                        style={({ isActive }) => ({ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-main)', background: isActive ? 'rgba(230, 57, 70, 0.1)' : 'transparent', fontWeight: isActive ? 600 : 500, transition: 'var(--transition)' })}
                    >
                        Stock de Sang
                    </NavLink>
                    <NavLink
                        to="/appointments"
                        style={({ isActive }) => ({ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-main)', background: isActive ? 'rgba(230, 57, 70, 0.1)' : 'transparent', fontWeight: isActive ? 600 : 500, transition: 'var(--transition)' })}
                    >
                        Rendez-vous
                    </NavLink>
                    <NavLink
                        to="/alerts"
                        style={({ isActive }) => ({ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-main)', background: isActive ? 'rgba(230, 57, 70, 0.1)' : 'transparent', fontWeight: isActive ? 600 : 500, transition: 'var(--transition)' })}
                    >
                        Alertes SOS
                    </NavLink>

                    <div style={{ marginTop: 'auto' }}>
                        <NavLink
                            to="/login"
                            style={{ display: 'block', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500, transition: 'var(--transition)' }}
                        >
                            Déconnexion
                        </NavLink>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, backgroundColor: 'var(--background)', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
