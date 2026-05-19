import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function CtaFinal() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section
      id="download"
      aria-labelledby="cta-title"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 35%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center text-white">
        <h2
          id="cta-title"
          className="reveal text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Soyez averti dès <br /> que nous serons prêts.
        </h2>
        <p className="reveal mx-auto mt-6 max-w-xl text-lg text-white/90 leading-relaxed">
          Soyez parmi les premiers à aider. Laissez votre email pour recevoir <br className="hidden md:block" /> votre invitation exclusive lors du lancement officiel.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setSent(true);
          }}
          className="reveal mx-auto mt-10 flex max-w-lg flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
        >
          <input
            id="beta-email"
            type="email"
            required
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-xl bg-transparent px-6 py-3 text-foreground font-medium focus:outline-none"
          />
          <button
            type="submit"
            className="group flex items-center justify-center gap-3 whitespace-nowrap rounded-xl bg-primary px-10 py-4 font-bold text-white hover:bg-primary-glow transition-all md:min-w-[240px]"
          >
            {sent ? (
              <CheckCircle2 size={22} className="stroke-[1.5]" />
            ) : (
              <Send size={22} className="stroke-[1.5]" />
            )}
            {sent ? "Merci !" : "Rejoindre le mouvement"}
          </button>
        </form>
      </div>
    </section>
  );
}
