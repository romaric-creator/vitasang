import React, { useState } from "react";
import api from "../services/api";

export default function Campaigns() {
    const [titre, setTitre] = useState("");
    const [message, setMessage] = useState("");
    const [groupeSanguin, setGroupeSanguin] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await api.post('/campaigns', {
                titre,
                message,
                filtres: {
                    groupe_sanguin: groupeSanguin || undefined,
                },
            });

            if (response.data.success) {
                setSuccessMsg(
                    `${response.data.message} (Environ ${response.data.donneursTouches} donneurs touchés)`
                );
                setTitre("");
                setMessage("");
                setGroupeSanguin("");
            } else {
                setErrorMsg(response.data.message || "Erreur lors de l'envoi.");
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(
                err.response?.data?.message || "Erreur de connexion au serveur."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Campagnes de Don
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Lancez des appels au don groupés pour les donneurs disponibles.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a0d0d] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Nouvelle Campagne
                </h3>

                {successMsg && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Titre de la campagne
                        </label>
                        <input
                            required
                            type="text"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            placeholder="Ex: Besoin urgent de plaquettes"
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Groupe Sanguin ciblé (Optionnel)
                        </label>
                        <select
                            value={groupeSanguin}
                            onChange={(e) => setGroupeSanguin(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                        >
                            <option value="">Tous les groupes</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Rédigez le message qui sera envoyé en notification push aux donneurs..."
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                        ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90"
                                }`}
                        >
                            {loading ? (
                                <span>Envoi...</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">
                                        campaign
                                    </span>
                                    <span>Lancer la campagne</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
