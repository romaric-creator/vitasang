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
            {/* <div className="flex-shrink-0">
              <div className="relative inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-glow p-1 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-black text-primary">CT</span>
                </div>
                <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md border-2 border-white">
                   <Shield size={14} fill="currentColor" />
                </div>
              </div>
            </div> */}
            <div className="flex-1">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-2xl font-bold text-foreground font-display">
                  Christian Tenda
                </h3>
                <p className="text-xs text-primary font-black uppercase tracking-[0.2em] mt-1">
                  Fondateur de VitaSang
                </p>
              </div>
              <div className="relative mt-8">
                <span className="absolute -left-4 -top-6 text-6xl text-primary/10 font-serif" aria-hidden="true">"</span>
                <p className="text-lg md:text-xl font-medium text-foreground/80 italic leading-relaxed leading-snug">
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
