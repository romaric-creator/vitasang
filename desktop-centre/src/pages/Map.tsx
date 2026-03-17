import React from 'react';

const Map: React.FC = () => {
    return (
        <div className="flex h-[calc(100vh-128px)] -m-8">
            {/* Filters Sidebar */}
            <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col shrink-0 z-40">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold mb-1">Filtres de Donneurs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Localisez les donneurs potentiels à proximité.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Groupe Sanguin</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <button className="h-10 border border-primary bg-primary/10 text-primary font-bold rounded-lg text-sm transition-all">A+</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">A-</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">B+</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">B-</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">AB+</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">AB-</button>
                            <button className="h-10 border border-primary bg-primary text-white font-bold rounded-lg text-sm transition-all">O+</button>
                            <button className="h-10 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm transition-all">O-</button>
                        </div>
                    </section>
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rayon de proximité</h4>
                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">15 km</span>
                        </div>
                        <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" max="50" min="1" type="range" defaultValue="15" />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                            <span>5km</span>
                            <span>25km</span>
                            <span>50km</span>
                        </div>
                    </section>
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Statut d'Éligibilité</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Éligible maintenant</span>
                                <div className="relative inline-flex items-center">
                                    <input defaultChecked type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                            </label>
                        </div>
                    </section>
                    <section className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Donneurs Trouvés</h4>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">124</span>
                            <span className="text-sm text-slate-500 mb-1">donneurs éligibles</span>
                        </div>
                    </section>
                </div>
                <div className="p-5 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined text-xl">emergency_share</span>
                        Lancer une Alerte SOS
                    </button>
                </div>
            </aside>

            {/* Map View */}
            <section className="flex-1 relative bg-slate-200 dark:bg-slate-900">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqrhRaM-QZOs3AmdAz5wp7YyiwCQRgLMAUPjFQ1etmiHdWBzOIzpmaf96X85zPubnSLJlH3JsCT9uiDoaHOM0lHj0Xkp6yf6tnujE7KK395ngedynOmHPFLauLiZ0gep75EhPQFQjJIllU-wZaTegnnSu-o9ebyrrrVLOUUgKHXL60H93ciFS4ScR3RwhtBFrtsWTfz0wH1kuO5zQzVfWsYCiAYgOu9bjQ6wMm6yaym3vf1IVWO746o6Hn7TgLLVtkdLcxxOgjFw')" }}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] dark:bg-black/20"></div>
                </div>
                {/* Placeholder for map markers and controls */}
            </section>
        </div>
    );
};

export default Map;
