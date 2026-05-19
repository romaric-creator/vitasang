import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://vitasang.christiantendainfo2006.workers.dev";

export function CtaFinal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.alreadyExists ? "Vous êtes déjà sur la liste !" : "Merci ! On vous contacte bientôt 🎉");
      } else {
        throw new Error(data.message || "Erreur");
      }
    } catch {
      setStatus("error");
      setMessage("Une erreur s'est produite. Réessayez.");
    }
  };

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
          Soyez parmi les premiers à aider. Laissez votre email pour recevoir{" "}
          <br className="hidden md:block" /> votre invitation exclusive lors du lancement officiel.
        </p>

        {status === "success" ? (
          <div className="reveal mx-auto mt-10 flex max-w-lg items-center justify-center gap-3 rounded-2xl bg-white/20 px-8 py-6 text-white">
            <CheckCircle2 size={28} className="shrink-0" />
            <p className="text-lg font-bold">{message}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="reveal mx-auto mt-10 flex max-w-lg flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
          >
            <input
              id="beta-email"
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 rounded-xl bg-transparent px-6 py-3 text-foreground font-medium focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className="stroke-[1.5]" />
              )}
              {status === "loading" ? "Envoi..." : "Rejoindre le mouvement"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-white/80">{message}</p>
        )}
      </div>
    </section>
  );
}
