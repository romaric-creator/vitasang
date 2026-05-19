import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

interface AlertePublique {
  token: string;
  groupe: string;
  urgence: "NORMAL" | "URGENT" | "TRES_URGENT";
  lieu: string;
  statut: "en_cours" | "resolu" | "annule";
  date: string;
  quantite: number;
  whatsapp?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "https://vitasang-api.onrender.com";

const URGENCE_CONFIG = {
  TRES_URGENT: { label: "TRÈS URGENT", bgClass: "bg-red-600", pulse: true },
  URGENT: { label: "URGENT", bgClass: "bg-orange-500", pulse: true },
  NORMAL: { label: "En cours", bgClass: "bg-blue-600", pulse: false },
} as const;

export const Route = createFileRoute("/alerte/$token")({
  component: AlertePage,
  loader: async ({ params }) => {
    try {
      const res = await fetch(`${API_URL}/api/alerts/public/${params.token}`);
      if (!res.ok) return { alerte: null, error: true };
      const data = await res.json();
      return { alerte: data.alerte as AlertePublique, error: false };
    } catch {
      return { alerte: null, error: true };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.alerte
          ? `🩸 Urgence ${loaderData.alerte.groupe} — ${loaderData.alerte.lieu} | VitaSang`
          : "Alerte Sang — VitaSang",
      },
      { property: "og:title", content: `🚨 Besoin urgent de sang ${loaderData?.alerte?.groupe ?? ""} — VitaSang` },
      {
        property: "og:description",
        content: `Un patient a besoin d'une transfusion à ${loaderData?.alerte?.lieu ?? "un hôpital proche"}. Vous pouvez sauver une vie.`,
      },
    ],
  }),
});

function AlertePage() {
  const { alerte, error } = Route.useLoaderData();
  const { token } = Route.useParams();

  if (error || !alerte) return <AlerteNotFound />;
  if (alerte.statut === "resolu") return <AlerteResolue groupe={alerte.groupe} />;
  if (alerte.statut === "annule") return <AlerteAnnulee />;

  const cfg = URGENCE_CONFIG[alerte.urgence] ?? URGENCE_CONFIG.URGENT;
  const timeAgo = getTimeAgo(alerte.date);
  const shareText = `🚨 Besoin urgent de sang ${alerte.groupe} à ${alerte.lieu} — Partagez ce lien pour aider : ${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Bandeau deep link app */}
      <a
        href={`vitasang://alert-public/${token}`}
        className="flex items-center justify-center gap-2 bg-[#9E2016] text-white text-sm font-semibold py-3 px-4 hover:bg-[#7a1a10] transition-colors text-center"
      >
        📱 Ouvrir dans l'app VitaSang
      </a>

      {/* Barre d'urgence */}
      <div className={`${cfg.bgClass} text-white text-center py-3 font-black text-base tracking-widest uppercase flex items-center justify-center gap-2`}>
        {cfg.pulse && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
        )}
        {cfg.label}
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100">
          <div className="bg-[#9E2016] px-6 py-8 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-3xl bg-white/20 flex items-center justify-center shadow-inner">
              <span className="text-5xl font-black text-white leading-none">{alerte.groupe}</span>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Besoin urgent</p>
              <p className="text-white text-xl font-bold mt-1">
                {alerte.quantite} poche{alerte.quantite > 1 ? "s" : ""} requise{alerte.quantite > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col gap-4">
            <InfoRow icon="📍" label="Lieu" value={alerte.lieu} />
            <InfoRow icon="⏱️" label="Signalé" value={timeAgo} />
            <InfoRow icon="🩸" label="Groupe" value={alerte.groupe} highlight />
          </div>
        </div>

        {/* Formulaire de réponse directe */}
        <FormulaireReponse token={token} alerte={alerte} shareText={shareText} />

        {/* Section téléchargement — secondaire */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
          <p className="text-center text-xs text-gray-400 font-medium">
            Pour recevoir les futures alertes, téléchargez l'app
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.vitasang"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 font-semibold hover:bg-gray-800 transition-colors text-xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.34.19.73.24 1.12.12l12.76-7.37-2.88-2.88L3.18 23.76zm-1.56-20.3C1.24 3.9 1 4.42 1 5.06v13.88c0 .64.24 1.16.62 1.6l.08.08 7.78-7.78v-.18L1.62 3.46zm18.1 8.54-2.62-1.52-3.24 3.24 3.24 3.24 2.64-1.52c.75-.43.75-1.01-.02-1.44zm-16.54 9.6 10.38-5.99-2.86-2.86L3.18 23.6z"/></svg>
              Google Play
            </a>
            <a
              href="https://apps.apple.com/app/vitasang"
              className="flex items-center justify-center gap-2 bg-[#9E2016] text-white rounded-xl py-3 font-semibold hover:bg-[#7a1a10] transition-colors text-xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          <Link to="/" className="text-[#9E2016] font-semibold hover:underline">VitaSang</Link>
          {" "}— Don de sang bénévole au Cameroun 🇨🇲
        </p>
      </main>
    </div>
  );
}

function FormulaireReponse({
  token,
  alerte,
  shareText,
}: {
  token: string;
  alerte: AlertePublique;
  shareText: string;
}) {
  const [etape, setEtape] = useState<"choix" | "formulaire" | "confirme">("choix");
  const [choix, setChoix] = useState<"accepte" | "refuse" | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappInfosUrl = alerte.whatsapp
    ? `https://wa.me/${alerte.whatsapp}?text=${encodeURIComponent(
        `Bonjour, j'ai reçu l'alerte pour du sang ${alerte.groupe} à ${alerte.lieu}. Je souhaite plus d'informations.`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function handleConfirm() {
    if (!nom.trim() || !telephone.trim()) {
      setError("Veuillez renseigner votre prénom/nom et votre numéro WhatsApp.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/alerts/public/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), telephone: telephone.trim(), reponse: choix }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setEtape("confirme");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-5">
      <h2 className="text-xl font-black text-gray-900 text-center leading-tight">
        Vous pouvez sauver une vie 🙏
      </h2>

      {/* Étape 1 — Choix */}
      {etape === "choix" && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-sm text-center">
            Répondez directement, sans télécharger l'app.
          </p>
          <button
            onClick={() => { setChoix("accepte"); setEtape("formulaire"); }}
            className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-2xl py-4 font-bold text-sm hover:bg-green-700 active:scale-95 transition-all"
          >
            ✅ J'accepte de donner
          </button>
          <button
            onClick={() => { setChoix("refuse"); setEtape("formulaire"); }}
            className="flex items-center justify-center gap-2 bg-[#9E2016] text-white rounded-2xl py-4 font-bold text-sm hover:bg-[#7a1a10] active:scale-95 transition-all"
          >
            ❌ Je ne peux pas
          </button>
          <a
            href={whatsappInfosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-2xl py-4 font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            💬 Je veux plus d'infos
          </a>
        </div>
      )}

      {/* Étape 2 — Formulaire */}
      {etape === "formulaire" && (
        <div className="flex flex-col gap-4">
          <div className={`text-center text-sm font-semibold px-4 py-2 rounded-xl ${choix === "accepte" ? "bg-green-50 text-green-700" : "bg-red-50 text-[#9E2016]"}`}>
            {choix === "accepte" ? "✅ Vous acceptez de donner" : "❌ Vous ne pouvez pas donner"}
          </div>
          <p className="text-gray-500 text-sm text-center">
            Laissez vos coordonnées pour que l'équipe puisse vous contacter.
          </p>
          <input
            type="text"
            placeholder="Votre prénom et nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9E2016]/30 focus:border-[#9E2016] transition"
          />
          <input
            type="tel"
            placeholder="Votre numéro WhatsApp"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9E2016]/30 focus:border-[#9E2016] transition"
          />
          {error && (
            <p className="text-xs text-red-600 text-center font-medium">{error}</p>
          )}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-[#9E2016] text-white rounded-2xl py-4 font-bold text-sm hover:bg-[#7a1a10] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi en cours…" : "Confirmer"}
          </button>
          <button
            onClick={() => { setEtape("choix"); setChoix(null); setError(null); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline text-center transition-colors"
          >
            Retour
          </button>
        </div>
      )}

      {/* Étape 3 — Confirmation */}
      {etape === "confirme" && (
        <div className="flex flex-col items-center gap-4 py-4">
          {choix === "accepte" ? (
            <>
              <span className="text-5xl">🙏</span>
              <p className="text-green-700 font-bold text-center text-base leading-snug">
                Merci ! L'équipe vous contactera bientôt sur WhatsApp.
              </p>
              <p className="text-gray-400 text-xs text-center">
                Votre geste peut sauver une vie.
              </p>
            </>
          ) : (
            <>
              <span className="text-5xl">💙</span>
              <p className="text-gray-700 font-semibold text-center text-base leading-snug">
                Compris, merci quand même.
              </p>
              <p className="text-gray-400 text-xs text-center">
                Partagez l'alerte pour aider à trouver un donneur.
              </p>
            </>
          )}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] rounded-2xl py-3 px-6 font-semibold hover:bg-[#25D366]/5 transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Partager sur WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl w-8 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold truncate ${highlight ? "text-[#9E2016]" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}

function AlerteNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
      <span className="text-6xl mb-4">🔍</span>
      <h1 className="text-2xl font-black text-gray-900">Alerte introuvable</h1>
      <p className="text-gray-500 mt-2 text-sm">Ce lien est invalide ou a expiré.</p>
      <Link to="/" className="mt-6 text-[#9E2016] font-bold underline text-sm">Retour à l'accueil</Link>
    </div>
  );
}

function AlerteResolue({ groupe }: { groupe: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
      <span className="text-6xl mb-4">✅</span>
      <h1 className="text-2xl font-black text-green-700">Alerte résolue !</h1>
      <p className="text-gray-500 mt-2 text-sm">Le patient a reçu le sang {groupe}. Merci aux donneurs.</p>
      <Link to="/" className="mt-6 bg-[#9E2016] text-white px-6 py-3 rounded-2xl font-bold text-sm">
        Devenir donneur →
      </Link>
    </div>
  );
}

function AlerteAnnulee() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
      <span className="text-6xl mb-4">ℹ️</span>
      <h1 className="text-2xl font-black text-gray-700">Alerte annulée</h1>
      <p className="text-gray-500 mt-2 text-sm">Cette demande a été annulée.</p>
      <Link to="/" className="mt-6 text-[#9E2016] font-bold underline text-sm">Retour à l'accueil</Link>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)} jours`;
}
