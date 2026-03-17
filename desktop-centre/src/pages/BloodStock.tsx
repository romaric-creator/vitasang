import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BloodStockItem {
    groupe_sanguin: string;
    quantite_poches: number;
    seuil_alerte_min: number;
    // Assuming a max capacity for progress bar calculation
    max_stock?: number; 
}

const BloodStockCard: React.FC<{ stock: BloodStockItem }> = ({ stock }) => {
    const maxStock = stock.max_stock || 50; // Default max stock
    const percentage = (stock.quantite_poches / maxStock) * 100;

    let status: 'Critique' | 'Faible' | 'Suffisant' = 'Suffisant';
    let statusColor = 'green';
    if (stock.quantite_poches <= stock.seuil_alerte_min) {
        status = 'Critique';
        statusColor = 'red';
    } else if (percentage < 40) {
        status = 'Faible';
        statusColor = 'yellow';
    }

    const statusClasses = {
        Critique: {
            badge: 'bg-red-100 text-primary dark:bg-primary/20 dark:text-primary',
            ring: 'border-2 border-primary/50 ring-2 ring-primary/10',
            progress: 'bg-primary',
            button: 'bg-primary text-white shadow-md shadow-primary/20',
            icon: 'warning'
        },
        Faible: {
            badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            ring: '',
            progress: 'bg-yellow-500',
            button: 'bg-[#f4f0f0] dark:bg-[#3d2a2a] text-[#181111] dark:text-white hover:bg-primary hover:text-white',
            icon: ''
        },
        Suffisant: {
            badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            ring: '',
            progress: 'bg-green-500',
            button: 'bg-[#f4f0f0] dark:bg-[#3d2a2a] text-[#181111] dark:text-white hover:bg-primary hover:text-white',
            icon: ''
        }
    };
    const currentStatusStyle = statusClasses[status];

    return (
        <div className={`bg-white dark:bg-[#2a1a1a] rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors ${currentStatusStyle.ring}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-primary">{stock.groupe_sanguin}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${currentStatusStyle.badge}`}>
                    {currentStatusStyle.icon && <span className="material-symbols-outlined text-[12px]">{currentStatusStyle.icon}</span>}
                    {status}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${status === 'Critique' ? 'text-primary' : ''}`}>{stock.quantite_poches}</span>
                    <span className="text-[#886364] dark:text-white/40 font-medium">Poches</span>
                </div>
                <div className="w-full h-2 bg-[#f4f0f0] dark:bg-[#3d2a2a] rounded-full mt-2">
                    <div className={`h-full rounded-full ${currentStatusStyle.progress}`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
            <div className="flex flex-col gap-3 mt-2">
                <p className="text-xs text-[#886364] dark:text-white/40 italic flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span> Mis à jour il y a 5 min
                </p>
                <button className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${currentStatusStyle.button}`}>Mettre à jour</button>
            </div>
        </div>
    );
};


const BloodStock: React.FC = () => {
    const { user } = useAuth();
    const [stock, setStock] = useState<BloodStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            if (!user?.centre?.id_centre) return;
            try {
                setLoading(true);
                const response = await api.get(`/centres/${user.centre.id_centre}/stats`);
                if (response.data.success) {
                    setStock(response.data.stats.bloodDetail);
                }
            } catch (error) {
                console.error("Error fetching blood stock:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [user]);

    return (
        <div className="-m-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#181111] dark:text-white text-4xl font-black leading-tight tracking-tight">Inventaire Central</h1>
                        <p className="text-[#886364] dark:text-white/60 text-lg">{user?.centre?.nom_centre}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-[#2a1a1a] p-4 rounded-xl border border-[#e5dcdc] dark:border-[#3d2a2a] shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#181111] dark:text-white">Mode Urgence</span>
                            <span className="text-xs text-[#886364] dark:text-white/60">Notifier les donneurs immédiatement</span>
                        </div>
                        <label className="relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full bg-[#f4f0f0] dark:bg-[#3d2a2a] p-1 has-[:checked]:bg-primary transition-colors">
                            <input className="sr-only peer" type="checkbox" />
                            <div className="h-6 w-6 rounded-full bg-white shadow-md transform transition-transform peer-checked:translate-x-6"></div>
                        </label>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#886364] dark:text-white/40">search</span>
                        <input className="w-full h-12 pl-12 pr-4 rounded-xl border-none bg-white dark:bg-[#2a1a1a] shadow-sm focus:ring-2 focus:ring-primary/50 text-[#181111] dark:text-white placeholder:text-[#886364] dark:placeholder:text-white/40" placeholder="Rechercher des lots, IDs de donneurs..." />
                    </div>
                    <div className="flex gap-2">
                        <button className="h-12 px-6 flex items-center justify-center gap-2 bg-white dark:bg-[#2a1a1a] border border-[#e5dcdc] dark:border-[#3d2a2a] rounded-xl font-semibold text-[#181111] dark:text-white hover:bg-[#f4f0f0] dark:hover:bg-[#3d2a2a] transition-all">
                            <span className="material-symbols-outlined">filter_list</span> Filtrer
                        </button>
                        <button className="h-12 px-6 flex items-center justify-center gap-2 bg-white dark:bg-[#2a1a1a] border border-[#e5dcdc] dark:border-[#3d2a2a] rounded-xl font-semibold text-[#181111] dark:text-white hover:bg-[#f4f0f0] dark:hover:bg-[#3d2a2a] transition-all">
                            <span className="material-symbols-outlined">download</span> Exporter
                        </button>
                    </div>
                </div>

                {loading ? <p>Chargement de l'inventaire...</p> :
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {stock.map(item => <BloodStockCard key={item.groupe_sanguin} stock={item} />)}
                    </div>
                }

                {/* Near Expiry Table (Static Placeholder) */}
                <div className="bg-white dark:bg-[#2a1a1a] rounded-2xl border border-[#e5dcdc] dark:border-[#3d2a2a] overflow-hidden mb-12">
                    <div className="px-6 py-4 border-b border-[#e5dcdc] dark:border-[#3d2a2a] flex justify-between items-center">
                        <h3 className="font-bold text-lg">Lots proches de l'expiration (48h)</h3>
                        <a className="text-primary text-sm font-bold hover:underline" href="#">Voir tous les lots</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8f6f6] dark:bg-[#3d2a2a] text-xs uppercase text-[#886364] dark:text-white/40 font-bold">
                                <tr>
                                    <th className="px-6 py-3">ID Batch</th>
                                    <th className="px-6 py-3">Groupe</th>
                                    <th className="px-6 py-3">ID Donneur</th>
                                    <th className="px-6 py-3">Date Collecte</th>
                                    <th className="px-6 py-3">Date Expiration</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5dcdc] dark:divide-[#3d2a2a]">
                                <tr className="hover:bg-[#f4f0f0] dark:hover:bg-[#3d2a2a]/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono">B-992-04</td>
                                    <td className="px-6 py-4"><span className="font-bold text-primary">A-</span></td>
                                    <td className="px-6 py-4 text-sm text-[#886364] dark:text-white/60">#DON-1022</td>
                                    <td className="px-6 py-4 text-sm">12 Oct 2023</td>
                                    <td className="px-6 py-4 text-sm text-primary font-bold">18 Oct 2023 (Aujourd'hui)</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><span className="material-symbols-outlined">visibility</span></button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-[#f4f0f0] dark:hover:bg-[#3d2a2a]/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono">B-991-88</td>
                                    <td className="px-6 py-4"><span className="font-bold text-primary">O-</span></td>
                                    <td className="px-6 py-4 text-sm text-[#886364] dark:text-white/60">#DON-5541</td>
                                    <td className="px-6 py-4 text-sm">11 Oct 2023</td>
                                    <td className="px-6 py-4 text-sm text-yellow-600 font-bold">19 Oct 2023</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><span className="material-symbols-outlined">visibility</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodStock;
