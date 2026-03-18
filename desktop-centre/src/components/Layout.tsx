import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // A helper function to apply active styles for NavLink
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-[#1a0d0d] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8 p-6">
          {/* Brand Profile */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">
                bloodtype
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#181111] dark:text-white text-base font-bold leading-none">
                VitaSang
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {user?.centre?.nom || user?.centre?.nom_centre || "Centre"}
              </p>
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
              <span>Carte des centres</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 space-y-2">
          <button
            onClick={() => navigate("/alerts")}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_alert</span>
            <span className="text-sm uppercase tracking-wide">Créer SOS</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-8 bg-white dark:bg-[#1a0d0d] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Rechercher..."
                type="text"
              />
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold leading-tight">
                      {user?.nom} {user?.prenom}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || "Personnel"}
                    </p>
                  </div>
                  <img
                    alt="Avatar"
                    className="size-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary/50 transition-all"
                    src={`https://ui-avatars.com/api/?name=${user?.nom || "User"}&background=c7254e&color=fff`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.nom} {user?.prenom}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.email || user?.telephone}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        // Navigate to profile edit if needed
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        person
                      </span>
                      Mon profil
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        // Navigate to settings if needed
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        settings
                      </span>
                      Paramètres
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
