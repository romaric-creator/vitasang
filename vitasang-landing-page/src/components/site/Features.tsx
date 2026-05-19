import { Bell, Calendar, MessageSquare, Activity } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Alertes vitales",
    desc: "Soyez notifié instantanément si une urgence nécessite votre groupe sanguin à proximité. Ne manquez jamais une occasion d'agir.",
  },
  {
    icon: Calendar,
    title: "Donnez sans attendre",
    desc: "Fini les files d'attente interminables. Réservez votre créneau en 3 clics dans nos centres partenaires agréés.",
  },
  {
    icon: MessageSquare,
    title: "Coordination Humaine",
    desc: "Communiquez directement avec les familles et les centres pour une coordination fluide et sécurisée.",
  },
  {
    icon: Activity,
    title: "Soin en temps réel",
    desc: "Notre infrastructure est pensée pour la vitesse, permettant une réponse immédiate aux demandes critiques.",
  },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Une nouvelle ère
          </span>
          <h2 id="features-title" className="reveal mt-3 text-4xl md:text-6xl font-bold text-foreground">
            L'appli qui <span className="text-primary italic">connecte</span> les cœurs.
          </h2>
          <p className="reveal mt-6 text-lg text-muted-foreground leading-relaxed">
            VitaSang n'est pas seulement une application, c'est un réseau de solidarité intelligent conçu pour sauver des vies en temps réel au Cameroun.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-all hover:bg-white hover:shadow-2xl hover:border-primary/20"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary"
                style={{ background: "color-mix(in oklab, var(--primary) 8%, transparent)" }}
              >
                <f.icon size={28} className="stroke-[1.5]" />
              </div>
              <h3 className="relative mt-6 text-xl font-bold text-foreground">{f.title}</h3>
              <p className="relative mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
