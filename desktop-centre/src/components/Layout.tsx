import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    // A helper function to apply active styles for NavLink
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
        }`;

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 antialiased">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-[#1a0d0d] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0">
                <div className="flex flex-col gap-8 p-6">
                    {/* Brand Profile */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">bloodtype</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#181111] dark:text-white text-base font-bold leading-none">VitaSang</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{user?.centre?.nom_centre || 'Hôpital Central'}</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1">
                        <NavLink to="/dashboard" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Tableau de bord</span>
                        </NavLink>
                        <NavLink to="/alerts" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">emergency</span>
                            <span>Demandes SOS</span>
                        </NavLink>
                        <NavLink to="/stock" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">inventory_2</span>
                            <span>Gestion des stocks</span>
                        </NavLink>
                        <NavLink to="/appointments" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">event_available</span>
                            <span>Rendez-vous</span>
                        </NavLink>
                        <NavLink to="/map" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">map</span>
                            <span>Carte des donneurs</span>
                        </NavLink>
                        {/* These links are in the design but not in the app yet */}
                        {/* <NavLink to="/reports" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">monitoring</span>
                            <span>Rapports</span>
                        </NavLink> */}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6">
                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <span className="material-symbols-outlined text-lg">add_alert</span>
                        <span className="text-sm uppercase tracking-wide">Lancer un SOS</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header is now part of the Layout, but the title should be handled by each page */}
                <header className="h-16 flex items-center justify-end px-8 bg-white dark:bg-[#1a0d0d] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative hidden lg:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                            <input className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Rechercher..." type="text" />
                        </div>

                        {/* Icons & Profile */}
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-[#1a0d0d]"></span>
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <div className="h-8 w-[1px] bg-gray-200 dark:border-gray-800 mx-2"></div>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{user?.nom || 'Dr. Mamadou'}</p>
                                    <p className="text-xs text-gray-500">{user?.role || 'Administrateur'}</p>
                                </div>
                                <img alt="Avatar" className="size-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary/50 transition-all" src={user?.photo_url || `https://ui-avatars.com/api/?name=${user?.nom || 'Dr'}&background=random`} />
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
