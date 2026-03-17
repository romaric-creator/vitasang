import React, { useState, useEffect } from 'react';
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
                setLoading(true);
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
    }, [user]);

    const lowStockGroups = stats.bloodDetail
        .filter(item => item.quantite_poches <= item.seuil_alerte_min)
        .map(item => item.groupe_sanguin);

    if (loading) {
        return <div className="text-center mt-24">Chargement du tableau de bord...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Title */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vue d'ensemble</h2>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SOS Card */}
                <div className="bg-white dark:bg-[#1a0d0d] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SOS Actifs</p>
                            <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeAlerts}</h3>
                            {/* Static data for trend */}
                            <div className="flex items-center gap-1 mt-2 text-red-500 font-semibold text-xs">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>+20% depuis hier</span>
                            </div>
                        </div>
                        <div className="p-3 bg-primary/10 text-primary rounded-lg">
                            <span className="material-symbols-outlined">emergency_share</span>
                        </div>
                    </div>
                </div>

                {/* Stock Alert Card */}
                <div className="bg-white dark:bg-[#1a0d0d] p-6 rounded-xl border-2 border-primary/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 bg-primary text-white text-[10px] font-bold px-3 rounded-bl-lg uppercase">Alerte Critique</div>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alertes Stock Bas</p>
                            <div className="flex items-center gap-2 mt-2">
                                {lowStockGroups.length > 0 ? lowStockGroups.slice(0, 2).map(group => (
                                    <span key={group} className="px-2 py-1 bg-primary text-white rounded text-sm font-bold uppercase">{group}</span>
                                )) : <span className="text-sm text-gray-500">Aucune</span>}
                            </div>
                            {lowStockGroups.length > 0 &&
                                <p className="text-xs text-primary mt-3 font-semibold flex items-center gap-1 italic">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Moins de 5 unités restantes
                                </p>
                            }
                        </div>
                        <div className="p-3 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">opacity</span>
                        </div>
                    </div>
                </div>

                {/* Appointments Card */}
                <div className="bg-white dark:bg-[#1a0d0d] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rendez-vous prévus</p>
                            <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.appointmentsToday}</h3>
                            {/* Static data for trend */}
                            <div className="flex items-center gap-1 mt-2 text-green-500 font-semibold text-xs">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>Taux de présence 95%</span>
                            </div>
                        </div>
                        <div className="p-3 bg-secondary-blue/10 text-secondary-blue rounded-lg">
                            <span className="material-symbols-outlined">event_available</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live SOS Monitor Table Section (Static Placeholder) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">sensors</span>
                            Moniteur SOS en direct
                        </h2>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider">Temps réel</span>
                    </div>
                    <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                        Voir tout l'historique
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
                <div className="bg-white dark:bg-[#1a0d0d] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Table Head */}
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient / ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type Sanguin</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Niveau d'Urgence</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Temps Écoulé</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            {/* Table Body - Static Data */}
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {/* Row 1: Critical */}
                                <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">JD</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Jean Dupont</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Ref: #VS-9821</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">O-</span></td>
                                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm shadow-red-200"><span className="size-1.5 bg-white rounded-full animate-ping"></span>CRITIQUE</span></td>
                                    <td className="px-6 py-4"><span className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">En attente de validation</span></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-sm font-semibold text-primary"><span className="material-symbols-outlined text-sm">schedule</span>04 min</div></td>
                                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-tighter">Valider</button><button className="text-gray-400 hover:text-gray-600 p-1"><span className="material-symbols-outlined text-xl">more_vert</span></button></div></td>
                                </tr>
                                {/* Row 2: Urgent */}
                                <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">MK</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Marie Kona</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Ref: #VS-9820</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">A+</span></td>
                                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">URGENT</span></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="size-2 bg-green-500 rounded-full"></span><span className="text-sm font-medium text-gray-600 dark:text-gray-400">Actif - 2 donneurs en route</span></div></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600"><span className="material-symbols-outlined text-sm">schedule</span>18 min</div></td>
                                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button className="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-tighter">Détails</button><button className="text-gray-400 hover:text-gray-600 p-1"><span className="material-symbols-outlined text-xl">more_vert</span></button></div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Summary / Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Stock Snapshot */}
                <div className="flex-1 bg-white dark:bg-[#1a0d0d] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Aperçu du stock disponible (unités)
                    </h4>
                    <div className="space-y-4">
                        {stats.bloodDetail.length > 0 ? stats.bloodDetail.slice(0, 3).map(item => {
                            const maxStock = 50; // Hypothetical max
                            const percentage = (item.quantite_poches / maxStock) * 100;
                            const isLow = item.quantite_poches <= item.seuil_alerte_min;
                            const color = isLow ? 'bg-primary' : percentage < 40 ? 'bg-orange-500' : 'bg-green-500';
                            const textColor = isLow ? 'text-primary' : percentage < 40 ? 'text-orange-500' : 'text-green-500';

                            return (
                                <div key={item.groupe_sanguin}>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>{item.groupe_sanguin}</span>
                                        <span className={textColor}>{item.quantite_poches}/{maxStock}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-sm text-gray-500">Aucune donnée de stock.</p>}
                    </div>
                </div>

                {/* Upcoming Schedule Mini (Static) */}
                <div className="w-full lg:w-80 bg-white dark:bg-[#1a0d0d] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-4">Prochains Rendez-vous</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold leading-tight text-center w-10">
                                <span className="block">14</span><span className="block uppercase">OCT</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-tight">M. Sani Bakari</p>
                                <p className="text-[10px] text-gray-500">Don de sang - 10:30</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold leading-tight text-center w-10">
                                <span className="block">14</span><span className="block uppercase">OCT</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-tight">Mme. Clarisse N.</p>
                                <p className="text-[10px] text-gray-500">Don de plaquettes - 11:15</p>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 transition-colors">
                            Gérer l'agenda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
