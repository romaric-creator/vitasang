import { useState, useEffect } from "react";
import api from "../services/api";
import type { Centre } from "../types";
import { MapPin, Phone, Clock } from "lucide-react";

const Map: React.FC = () => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<string[]>([
    "O+",
  ]);
  const [radius, setRadius] = useState(15);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/centres");
        if (response.data.centres) {
          setCentres(response.data.centres);
        }
      } catch (err: any) {
        console.error("Error fetching centres:", err);
        setError("Erreur lors de la récupération des centres");
      } finally {
        setLoading(false);
      }
    };

    fetchCentres();
  }, []);

  const toggleBloodGroup = (group: string) => {
    setSelectedBloodGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const filteredCentres = centres.filter((centre) => centre);

  return (
    <div className="flex h-[calc(100vh-128px)] -m-8">
      {/* Filters Sidebar */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#2a1a1a] flex flex-col shrink-0 z-40">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-1">Centres de Santé</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Localisez les centres agréés à proximité
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Types de Sang
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => toggleBloodGroup(group)}
                  className={`h-10 border font-bold rounded-lg text-sm transition-all ${
                    selectedBloodGroups.includes(group)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Rayon
              </h4>
              <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                {radius} km
              </span>
            </div>
            <input
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              max="50"
              min="1"
              type="range"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
              <span>1km</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Centres ({filteredCentres.length})
            </h4>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : filteredCentres.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun centre trouvé</p>
              ) : (
                filteredCentres.map((centre) => (
                  <div
                    key={centre.id_centre}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {centre.nom || centre.nom_centre}
                    </h5>
                    <div className="flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                      <MapPin size={12} className="mt-0.5" />
                      <span>
                        {centre.adresse ||
                          centre.ville ||
                          "Adresse non disponible"}
                      </span>
                    </div>
                    {centre.telephone && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                        <Phone size={12} />
                        <span>{centre.telephone}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Map Area */}
      <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        {/* Header Info */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#2a1a1a]">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Réseau des Centres
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {filteredCentres.length} centre
              {filteredCentres.length !== 1 ? "s" : ""} de santé agréé
              {filteredCentres.length !== 1 ? "s" : ""} trouvé
              {filteredCentres.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Grid of Centres */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Chargement des centres...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 w-12 h-12 opacity-50" />
                <p className="text-lg font-semibold">Aucun centre trouvé</p>
                <p className="text-sm">
                  Ajustez vos filtres pour voir les centres disponibles
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredCentres.map((centre) => (
                <div
                  key={centre.id_centre}
                  className="bg-white dark:bg-[#2a1a1a] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                >
                  {/* Centre Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {centre.nom || centre.nom_centre}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Centre de Santé Agréé
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Address */}
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Adresse
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {centre.adresse || "Non spécifiée"}
                        </p>
                        {centre.ville && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {centre.ville}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    {centre.telephone && (
                      <div className="flex gap-3">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Téléphone
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {centre.telephone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hours */}
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Heures
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          Lun-Ven: 08h-17h
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Samedi: 08h-12h
                        </p>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Capacité
                      </p>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {centre.capacite_stockage_max
                          ? `Capacité: ${centre.capacite_stockage_max} poches`
                          : "Capacité non disponible"}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
                      Visiter le centre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
