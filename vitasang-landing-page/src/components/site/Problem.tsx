import { ShieldCheck, Activity, Users } from "lucide-react";
import problemImage from "@/assets/problem-hospital.jpg";

const stats = [
  { value: "50%", label: "des décès évitables par manque de sang disponible", icon: ShieldCheck },
  { value: "10x", label: "plus rapide : Le gain de temps estimé pour mobiliser un donneur", icon: Activity },
  { value: "0", label: "système centralisé de coordination au Cameroun actuellement", icon: Users },
];

export function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-title"
      className="bg-dark text-dark-foreground py-24 md:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">
              L'urgence au Cameroun
            </span>
            <h2
              id="problem-title"
              className="reveal mt-3 text-4xl md:text-6xl font-bold leading-tight"
            >
              Chaque seconde <br />
              <span className="text-primary-glow italic">compte vraiment.</span>
            </h2>
            <p className="reveal mt-6 text-lg text-dark-foreground/80 leading-relaxed max-w-lg">
              Le manque de sang n'est pas qu'une statistique lancinante. C'est le quotidien de familles camerounaises qui attendent un miracle en pleine urgence.
            </p>
          </div>
          <div className="reveal relative">
             <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
             <img
              src={problemImage}
              alt="Couloir d'un hôpital camerounais illustrant l'urgence médicale quotidienne faute de sang disponible"
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="reveal group rounded-3xl border border-white/5 bg-white/5 p-10 transition-all hover:bg-white/10"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <s.icon size={44} className="stroke-[1.5] text-primary-glow mb-6" />
              <div
                className="font-display text-5xl md:text-6xl font-extrabold text-white"
                aria-hidden="true"
              >
                {s.value}
              </div>
              <p className="mt-4 text-dark-foreground/70 leading-relaxed text-sm uppercase tracking-wide font-bold">
                <span className="sr-only">{s.value} — </span>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white text-sm hover:bg-primary/90 transition-all"
          >
            Je veux faire partie de la solution →
          </a>
        </div>
      </div>
    </section>
  );
}
