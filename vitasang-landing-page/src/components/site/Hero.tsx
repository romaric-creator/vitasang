import { Bell, Heart, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-donor.jpg";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Heartbeat line */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto opacity-60"
        width="100%"
        height="80"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0,40 L250,40 L290,15 L320,65 L360,10 L400,70 L440,40 L800,40 L840,15 L870,65 L910,10 L950,70 L990,40 L1200,40"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeDasharray="1000"
          style={{ animation: "draw-line 5s ease-in-out infinite" }}
        />
      </svg>

      {/* Animated background elements */}
      <div className="absolute inset-x-0 top-20 -z-10 flex justify-center opacity-20 blur-3xl" aria-hidden="true">
        <div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#ef4444] to-[#3b82f6]" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
        <div className="text-center md:text-left">
          <h1
            id="hero-title"
            className="reveal font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl md:text-7xl"
          >
            Trouvez un donneur
            <br />
            <span
              className="bg-clip-text text-transparent animate-pulse-slow"
              style={{ backgroundImage: "var(--gradient-primary)", filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.15))" }}
            >
              en quelques clics.
            </span>
          </h1>

          <p className="reveal mt-6 max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            L'application qui connecte instantanément les banques de sang, les familles et les donneurs bénévoles au Cameroun.
          </p>

          <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <a
              href="#download"
              aria-label="S'inscrire pour le lancement de VitaSang"
              className="group relative inline-flex min-w-[260px] items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:bg-primary-glow hover:scale-105 active:scale-95"
            >
              <Bell size={20} className="stroke-[1.5]" />
              Rejoindre le mouvement
            </a>
            <a
              href="#problem"
              aria-label="Pourquoi VitaSang est indispensable ?"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-white/50 px-7 py-4 text-base font-bold text-primary backdrop-blur transition-all hover:border-primary hover:bg-white"
            >
              <Heart size={20} className="stroke-[1.5]" />
              Découvrir l'urgence
            </a>
          </div>

        </div>

        <div className="reveal relative mx-auto w-full max-w-sm md:max-w-md mt-10 md:mt-0">
          {/* Trust Floating Badges */}
          <div className="absolute -left-12 top-20 z-40 hidden animate-[float_4s_ease-in-out_infinite] md:block">
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-primary/20 bg-white/90 p-3 shadow-xl backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <ShieldCheck size={20} className="text-primary stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Standards MINSANTE</span>
            </div>
          </div>
          
          <div className="absolute -right-12 bottom-40 z-40 hidden animate-[float_5s_ease-in-out_infinite] md:block [animation-delay:1s]">
            <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-white/90 p-3 shadow-xl backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Heart size={18} fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Impact Social</p>
                <p className="text-sm font-bold">100% Gratuit</p>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute -inset-10 rounded-[3rem] opacity-30 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          
          {/* Smartphone Mockup Frame */}
          <div className="relative mx-auto h-[550px] w-[280px] rounded-[3rem] border-[8px] border-dark bg-dark p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] md:h-[700px] md:w-[350px]">
            {/* Reflective Glare */}
            <div className="absolute inset-2 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-30" />
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-dark z-20" />
            
            {/* Screen Content */}
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
              <img
                src={heroImage}
                alt="Interface de l'application VitaSang"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Overlay elements to simulate app UI */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-6 right-6 text-white text-left">
                <div className="h-1.5 w-10 bg-primary rounded-full mb-3" />
                <p className="font-bold text-xl leading-tight">Urgences à proximité</p>
                <p className="text-sm opacity-80 mt-1">Douala • Hôpital Général</p>
              </div>
            </div>
            
            {/* Side Buttons */}
            <div className="absolute -left-2.5 top-24 h-12 w-1 rounded-l-lg bg-dark" />
            <div className="absolute -left-2.5 top-40 h-12 w-1 rounded-l-lg bg-dark" />
            <div className="absolute -right-2.5 top-32 h-20 w-1 rounded-r-lg bg-dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
