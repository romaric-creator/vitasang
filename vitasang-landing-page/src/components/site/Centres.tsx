import { MapPin, Clock } from "lucide-react";

const centres = [
  { nom: "Hôpital Général de Douala", ville: "Douala", horaires: "Lun–Sam · 7h–17h", badge: "Partenaire officiel" },
  { nom: "Centre Pasteur du Cameroun", ville: "Yaoundé", horaires: "Lun–Ven · 8h–16h", badge: "Banque de sang" },
  { nom: "Hôpital Central de Yaoundé", ville: "Yaoundé", horaires: "24h/24 · 7j/7", badge: "Urgences" },
  { nom: "Clinique La Référence", ville: "Douala", horaires: "Lun–Sam · 8h–18h", badge: "Centre agréé" },
];

export function Centres() {
  return (
    <section id="centres" aria-labelledby="centres-title" className="bg-background py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Réseau partenaire</span>
          <h2 id="centres-title" className="reveal mt-3 text-4xl md:text-5xl font-bold text-foreground">
            Centres de santé <span className="text-primary italic">agréés</span>
          </h2>
          <p className="reveal mt-5 text-lg text-muted-foreground">
            VitaSang collabore avec les hôpitaux et banques de sang officiels, conformément aux normes MINSANTE.
          </p>
        </div>

        <div className="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {centres.map((c) => (
            <div key={c.nom} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <MapPin size={20} className="text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-red-50 px-2 py-1 rounded-full">{c.badge}</span>
              </div>
              <h3 className="font-bold text-foreground leading-tight">{c.nom}</h3>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{c.ville}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                {c.horaires}
              </div>
            </div>
          ))}
        </div>

        <p className="reveal mt-8 text-center text-sm text-muted-foreground">
          + d'autres centres en cours d'intégration à Bafoussam, Buea et Ngaoundéré.
        </p>
      </div>
    </section>
  );
}
