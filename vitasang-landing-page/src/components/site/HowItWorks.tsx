import { Fragment } from "react";
import { Megaphone, Bell, Heart, Calendar, ArrowRight } from "lucide-react";
import phoneImage from "@/assets/how-phone.jpg";

const steps = [
  { icon: Megaphone, title: "L'alerte est lancée", desc: "Un hôpital ou une famille signale un besoin urgent. L'alerte est validée et diffusée en quelques secondes." },
  { icon: Bell, title: "Vous recevez l'appel", desc: "Si votre groupe sanguin est compatible et que vous êtes à proximité, une notification push vous alerte immédiatement." },
  { icon: Calendar, title: "Vous réservez votre créneau", desc: "Choisissez votre heure de passage au centre partenaire directement dans l'app. Zéro file d'attente." },
  { icon: Heart, title: "Vous sauvez une vie", desc: "Un geste de 20 minutes. Un impact immense pour une famille camerounaise." },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="bg-secondary py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Le processus
          </span>
          <h2 id="how-title" className="reveal mt-3 text-4xl md:text-5xl font-bold text-foreground">
            Le cercle de vie en 4 étapes
          </h2>
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[auto_1fr]">
          <div className="reveal mx-auto w-full max-w-xs">
            <img
              src={phoneImage}
              alt="Mains tenant un smartphone affichant une alerte de don de sang en forme de goutte rouge."
              width={1024}
              height={1280}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-[var(--shadow-elegant)]"
            />
          </div>

          <ol
            aria-label="Étapes du parcours VitaSang"
            className="grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-start"
          >
            {steps.map((s, i) => (
              <Fragment key={s.title}>
                <li
                  className="reveal text-center"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="relative mx-auto h-20 w-20">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full opacity-30 blur-xl"
                      style={{ background: "var(--gradient-primary)" }}
                    />
                    <div
                      className="relative flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-elegant)]"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <s.icon size={32} className="stroke-[1.5]" />
                    </div>
                    <span
                      aria-label={`Étape ${i + 1}`}
                      className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background"
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </li>
                  <li
                    aria-hidden="true"
                    className="reveal hidden md:flex items-center justify-center pt-6 text-primary/60"
                  >
                    <ArrowRight size={32} className="stroke-[1.5]" />
                  </li>
              </Fragment>
            ))}
          </ol>
        </div>
        <div className="mt-14 text-center">
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary text-primary px-8 py-4 font-bold text-sm hover:bg-primary hover:text-white transition-all"
          >
            Être averti au lancement →
          </a>
        </div>
      </div>
    </section>
  );
}
