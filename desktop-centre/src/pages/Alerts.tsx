import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define the type for an alert object
interface Alert {
    id_alerte: number;
    groupe_requis: string;
    degre_urgence: 'NORMAL' | 'URGENT' | 'TRES_URGENT';
    quantite_requise: number;
    lieu: string;
    description: string;
    createdAt: string;
    initiateur: {
        nom: string;
        prenom: string;
    };
}

const UrgencyMap = {
    TRES_URGENT: { text: 'Urgence Critique', color: 'text-primary', bgColor: 'bg-primary/10' },
    URGENT: { text: 'Urgence Haute', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    NORMAL: { text: 'Standard', color: 'text-yellow-600', bgColor: 'bg-yellow-600/10' },
};

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPendingAlerts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/alerts/pending');
            if (response.data.success) {
                setAlerts(response.data.alerts);
                if (response.data.alerts.length > 0) {
                    setSelectedAlert(response.data.alerts[0]);
                }
            }
            setError(null);
        } catch (err) {
            setError("Erreur lors de la récupération des alertes.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAlerts();
    }, []);

    const handleValidate = async () => {
        if (!selectedAlert) return;
        try {
            await api.post(`/alerts/${selectedAlert.id_alerte}/validate`);
            // Refresh list after validation
            fetchPendingAlerts();
            setSelectedAlert(null);
        } catch (err) {
            console.error("Failed to validate alert:", err);
            setError("La validation de l'alerte a échoué.");
        }
    };

    const handleReject = async () => {
        if (!selectedAlert) return;
        try {
            await api.put(`/alerts/${selectedAlert.id_alerte}`, { statut: 'annule' });
            // Refresh list after rejection
            fetchPendingAlerts();
            setSelectedAlert(null);
        } catch (err) {
            console.error("Failed to reject alert:", err);
            setError("Le rejet de l'alerte a échoué.");
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden -m-8">
            {/* Left Pane: Request List */}
            <div className="w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/10">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a0d0d]">
                    <h3 className="font-bold text-sm">Requêtes en attente ({alerts.length})</h3>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer">filter_list</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading && <p className="p-4 text-sm text-slate-500">Chargement...</p>}
                    {error && <p className="p-4 text-sm text-red-500">{error}</p>}
                    {!loading && alerts.map((alert) => (
                        <div
                            key={alert.id_alerte}
                            className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${selectedAlert?.id_alerte === alert.id_alerte ? 'bg-white dark:bg-white/5 border-l-4 border-l-primary' : 'hover:bg-white dark:hover:bg-white/5'}`}
                            onClick={() => setSelectedAlert(alert)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase ${UrgencyMap[alert.degre_urgence]?.color || 'text-slate-500'}`}>
                                    {UrgencyMap[alert.degre_urgence]?.text || alert.degre_urgence}
                                </span>
                                <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}</span>
                            </div>
                            <div className="flex gap-3">
                                <div className={`size-10 rounded-lg ${UrgencyMap[alert.degre_urgence]?.bgColor || 'bg-slate-100'} flex items-center justify-center ${UrgencyMap[alert.degre_urgence]?.color || 'text-slate-700'} font-black text-lg`}>
                                    {alert.groupe_requis}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold">{alert.initiateur?.prenom} {alert.initiateur?.nom}</h4>
                                    <p className="text-xs text-slate-500">{alert.lieu} • {alert.quantite_requise} Unités</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 self-center">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Detail View */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1a0d0d] p-8">
                {selectedAlert ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">REQUÊTE SOS #{selectedAlert.id_alerte}</span>
                                    <span className="text-xs text-slate-500 italic">Demandé par {selectedAlert.initiateur?.prenom} {selectedAlert.initiateur?.nom}</span>
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">{selectedAlert.lieu}</h2>
                                <p className="text-slate-500 mt-1">{selectedAlert.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps Écoulé</p>
                                <p className="text-2xl font-mono font-bold text-primary tracking-tighter">{formatDistanceToNow(new Date(selectedAlert.createdAt), { locale: fr })}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Groupe Sanguin Requis</p>
                                <div className="flex items-center gap-3"><span className="text-4xl font-black text-primary">{selectedAlert.groupe_requis}</span><span className="material-symbols-outlined text-primary">bloodtype</span></div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Quantité Requise</p>
                                <div className="flex items-center gap-3"><span className="text-4xl font-black">{selectedAlert.quantite_requise}</span><span className="text-sm font-bold text-slate-500">Poches</span></div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Donneurs Disponibles (Est.)</p>
                                <div className="flex items-center gap-3"><span className="text-4xl font-black text-green-500">?</span><span className="material-symbols-outlined text-green-500">group</span></div>
                                <p className="text-[10px] mt-4 text-slate-400 leading-tight">L'estimation sera disponible après validation.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-white/10">
                            <button onClick={handleValidate} className="flex-1 bg-primary hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">send</span>
                                Valider & Diffuser le SOS
                            </button>
                            <button disabled className="flex-none bg-slate-100 dark:bg-white/10 text-slate-400 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                <span className="material-symbols-outlined">edit</span>
                                Modifier
                            </button>
                            <button onClick={handleReject} className="flex-none border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                                Rejeter la demande
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                        <h3 className="font-bold">Aucune requête en attente</h3>
                        <p className="text-sm">Les nouvelles demandes d'alerte SOS apparaîtront ici pour validation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
