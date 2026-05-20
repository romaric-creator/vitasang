import { HeartHandshake, Shield, Zap } from "lucide-react";

export function AboutUs() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Title */}
        <div className="reveal max-w-2xl">
          <h2
            id="about-title"
            className="text-3xl md:text-5xl font-bold text-foreground font-display"
          >
            L'équipe derrière l'impact
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Nous ne construisons pas seulement du code. Nous construisons des ponts
            entre la technologie et l'urgence vitale au Cameroun.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="reveal mt-14 grid gap-8 md:grid-cols-3">
          {/* Value 1: Ethique */}
          <div className="rounded-lg border border-primary/20 bg-white/50 p-6 backdrop-blur">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <HeartHandshake size={24} className="text-primary stroke-[1.5]" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground font-display">
              100% Bénévole
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Le don de sang est un acte héroïque non rémunéré. VitaSang combat activement la vente illégale de sang au Cameroun en promouvant la solidarité pure.
            </p>
          </div>

          {/* Value 2: Transparence */}
          <div className="rounded-lg border border-primary/20 bg-white/50 p-6 backdrop-blur">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Shield size={24} className="text-blue-600 stroke-[1.5]" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground font-display">
              Confiance Totale
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Nous collaborons avec les banques de sang officielles et les hôpitaux agréés pour garantir un parcours de don sécurisé et conforme aux normes MINSANTE.
            </p>
          </div>

          {/* Value 3: Rapidité */}
          <div className="rounded-lg border border-primary/20 bg-white/50 p-6 backdrop-blur">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Zap size={24} className="text-yellow-600 stroke-[1.5]" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground font-display">
              Urgence Zéro
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Délai record. En supprimant les intermédiaires, nous réduisons le temps d'attente pour que l'alerte arrive au bon donneur en quelques secondes.
            </p>
          </div>
        </div>

        {/* Founder Section */}
        <div className="reveal mt-20 relative overflow-hidden rounded-[2rem] border-2 border-primary/10 bg-white p-8 md:p-12 shadow-xl shadow-primary/5">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          
          <div className="relative flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-8 md:gap-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative inline-flex h-28 w-28 rounded-full bg-gradient-to-tr from-primary to-red-400 p-1 shadow-lg">
                <img
                  src="/christian-tenda.jpg"
                  alt="Christian Tenda"
                  className="h-full w-full rounded-full object-cover object-top"
                />
                <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md border-2 border-white">
                  <Shield size={14} fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-2xl font-bold text-foreground font-display">
                  Christian Tenda
                </h3>
                <p className="text-xs text-primary font-black uppercase tracking-[0.2em] mt-1">
                  Fondateur · Étudiant en Génie Logiciel · Douala, Cameroun
                </p>
                {/* Réseaux sociaux */}
                <div className="flex items-center gap-3 mt-4">
                  <a
                    href="https://cm.linkedin.com/in/christian-tenda-5a3529354"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://wa.me/237678261699"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.5l5.797-1.52A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.524-5.287-1.437l-.379-.224-3.441.902.919-3.352-.247-.394A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="relative mt-8">
                <span className="absolute -left-4 -top-6 text-6xl text-primary/10 font-serif" aria-hidden="true">"</span>
                <p className="text-lg md:text-xl font-medium text-foreground/80 italic leading-relaxed">
                  J'ai vu trop de familles à Douala perdre un proche faute de sang. VitaSang est ma réponse technologique à ce drame. Nous ne créons pas seulement une app, nous construisons le futur de l'urgence sanitaire au Cameroun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
