const techs = ["React Native", "Node.js", "MySQL", "Redis", "BullMQ", "Expo", "Cloudinary"];

export function TechStack() {
  return (
    <section aria-labelledby="tech-title" className="bg-dark text-dark-foreground py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 id="tech-title" className="reveal text-2xl md:text-3xl font-bold">
          Construit avec des technologies fiables
        </h2>
        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-3">
          {techs.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-dark-muted px-5 py-2.5 text-sm font-medium text-dark-foreground/80 transition-colors hover:border-primary/40 hover:text-dark-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
