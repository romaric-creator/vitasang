const testimonials = [
  {
    name: "Mama Christelle",
    role: "Mère de famille · Douala, Akwa",
    avatar: "MC",
    color: "#FEE2E2",
    textColor: "#9E2016",
    quote:
      "Mon fils avait besoin de sang O+ en urgence à Laquintini. En 8 minutes après l'alerte, un donneur était là. VitaSang m'a sauvé mon enfant.",
    stars: 5,
  },
  {
    name: "Dr. Mbarga Paul",
    role: "Médecin urgentiste · CHU Yaoundé",
    avatar: "MP",
    color: "#EFF6FF",
    textColor: "#2563EB",
    quote:
      "Avant VitaSang, on passait des heures au téléphone pour trouver du sang. Maintenant les donneurs compatibles répondent en quelques minutes. C'est révolutionnaire pour nos urgences.",
    stars: 5,
  },
  {
    name: "Romaric T.",
    role: "Donneur bénévole · Douala, Bonamoussadi",
    avatar: "RT",
    color: "#DCFCE7",
    textColor: "#16A34A",
    quote:
      "J'ai donné 3 fois grâce aux alertes VitaSang. L'app me prévient quand quelqu'un de compatible est proche. C'est simple, rapide, et je sais que ça sauve des vies.",
    stars: 5,
  },
  {
    name: "Infirmière Solange",
    role: "Banque de sang · Hôpital Général de Douala",
    avatar: "IS",
    color: "#FEF3C7",
    textColor: "#D97706",
    quote:
      "Le système d'alerte géolocalisé est exactement ce dont le Cameroun avait besoin. Nos stocks critiques sont maintenant réapprovisionnés bien plus vite.",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="temoignages"
      aria-labelledby="testimonials-title"
      className="bg-[#F8FAFC] py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            Témoignages
          </span>
          <h2
            id="testimonials-title"
            className="mt-3 text-4xl font-bold text-[#0F172A] md:text-5xl"
          >
            Ils ont utilisé VitaSang.{" "}
            <span className="italic text-[#9E2016]">Ils témoignent.</span>
          </h2>
          <p className="mt-4 text-base text-[#475569]">
            Donneurs, familles, médecins — voici ce qu'ils disent de l'impact de l'app au quotidien.
          </p>
        </div>

        {/* Grid */}
        <div className="reveal mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-[#F1F5F9] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Stars */}
              <Stars count={t.stars} />

              {/* Quote */}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#475569]">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: t.color, color: t.textColor }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{t.name}</p>
                  <p className="text-xs text-[#94A3B8]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA laisser un avis */}
        <div className="reveal mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-[#475569]">
            Vous avez testé VitaSang ? Partagez votre expérience.
          </p>
          <a
            href="https://wa.me/237678261699?text=Bonjour%20Christian%2C%20je%20veux%20donner%20mon%20avis%20sur%20VitaSang%20!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15803D]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.5l5.797-1.52A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.524-5.287-1.437l-.379-.224-3.441.902.919-3.352-.247-.394A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Laisser un avis sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
