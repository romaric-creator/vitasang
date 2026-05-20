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

const API_URL = import.meta.env.VITE_API_URL ?? "https://vitasang.onrender.com";

const URGENCE_CONFIG = {
  TRES_URGENT: {
    label: "TRÈS URGENT",
    barBg: "bg-red-600",
    pageBg: "bg-red-50",
    pulse: true,
  },
  URGENT: {
    label: "URGENT",
    barBg: "bg-orange-500",
    pageBg: "bg-orange-50",
    pulse: true,
  },
  NORMAL: {
    label: "En cours",
    barBg: "bg-blue-600",
    pageBg: "bg-[#f8f8f8]",
    pulse: false,
  },
} as const;

// SVG WhatsApp réutilisable
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
});

function AlertePage() {
  const { alerte, error } = Route.useLoaderData();
  const { token } = Route.useParams();

  if (error || !alerte) return <AlerteNotFound />;
  if (alerte.statut === "resolu") return <AlerteResolue groupe={alerte.groupe} />;
  if (alerte.statut === "annule") return <AlerteAnnulee />;
  if (alerte.statut === "expire") return <AlerteExpiree />;

  const cfg = URGENCE_CONFIG[alerte.urgence] ?? URGENCE_CONFIG.URGENT;
  const timeAgo = getTimeAgo(alerte.date);
  const shareText = `Besoin urgent de sang ${alerte.groupe} a ${alerte.lieu} — Aidez a trouver un donneur : ${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <div className={`min-h-screen ${cfg.pageBg} flex flex-col`}>
      {/* Bandeau deep-link discret */}
      <a
        href={`vitasang://alert-public/${token}`}
        className="flex items-center justify-center gap-2 bg-gray-900/90 text-white text-xs font-medium py-2 px-4 hover:bg-gray-900 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
        Ouvrir dans l'app VitaSang
      </a>

      {/* Barre d'urgence */}
      <div
        className={`${cfg.barBg} text-white text-center py-3 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2`}
      >
        {cfg.pulse && (
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
        )}
        {cfg.label}
      </div>

      <main className="flex-1 max-w-[440px] mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Carte groupe sanguin */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* En-tête rouge */}
          <div className="bg-[#9E2016] px-6 py-7 flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-4xl font-black text-white leading-none">{alerte.groupe}</span>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Besoin de sang</p>
              <p className="text-white text-lg font-bold mt-0.5">
                {alerte.quantite} poche{alerte.quantite > 1 ? "s" : ""} requise{alerte.quantite > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Infos */}
          <div className="px-5 py-5 flex flex-col gap-3">
            <InfoRow label="Lieu" value={alerte.lieu} />
            <InfoRow label="Signalé" value={timeAgo} />
            <InfoRow label="Groupe" value={alerte.groupe} highlight />
          </div>
        </div>

        {/* Explication du flux pour les visiteurs */}
        <div className="bg-white rounded-2xl shadow-md px-5 py-4 flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Comment ça marche</p>
          <ol className="flex flex-col gap-2.5">
            {[
              { n: "1", text: "Indiquez si vous pouvez donner ou non" },
              { n: "2", text: "Laissez votre nom et votre numéro WhatsApp" },
              { n: "3", text: "Votre réponse est transmise à l'initiateur — WhatsApp s'ouvre pour discuter directement" },
            ].map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9E2016] text-white text-xs font-black flex items-center justify-center mt-0.5">{n}</span>
                <p className="text-sm text-gray-700 leading-snug">{text}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-1 leading-relaxed">
            Aucun compte requis. Le don de sang est bénévole et gratuit. Votre numéro ne sera communiqué qu'à l'initiateur de cette alerte.
          </p>
        </div>

        {/* Formulaire de réponse */}
        <FormulaireReponse token={token} alerte={alerte} shareText={shareText} />

        {/* Partage — secondaire, après le formulaire */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <p className="text-xs text-gray-400 font-medium text-center">
            Vous ne pouvez pas donner ? Partagez pour trouver un donneur.
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] rounded-2xl py-3 px-5 font-semibold text-sm hover:bg-[#25D366]/5 transition-colors"
          >
            <WhatsAppIcon size={15} />
            Partager l'alerte sur WhatsApp
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          <Link to="/" className="text-[#9E2016] font-semibold hover:underline">VitaSang</Link>
          {" "}— Don de sang bénévole au Cameroun
        </p>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant formulaire de réponse
// ---------------------------------------------------------------------------

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
  // Numéro retourné par le POST — plus fiable que celui chargé à l'avance
  const [whatsappInitiateur, setWhatsappInitiateur] = useState<string | null>(null);

  // URL WhatsApp vers l'initiateur — construit après la réponse POST ou en fallback
  function buildWhatsAppUrl(numero: string): string {
    const msg =
      `Bonjour, j'ai vu votre alerte VitaSang pour du sang *${alerte.groupe}* a *${alerte.lieu}*.\n` +
      `\nJe suis disponible pour donner.\n\nNom : ${nom.trim()}\nTel : ${telephone.trim()}`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  }

  const contactDirectUrl = alerte.whatsapp
    ? `https://wa.me/${alerte.whatsapp}?text=${encodeURIComponent(
        `Bonjour, j'ai recu l'alerte pour du sang ${alerte.groupe} a ${alerte.lieu}. Je souhaite plus d'informations.`
      )}`
    : null;

  async function handleConfirm() {
    if (!nom.trim() || !telephone.trim()) {
      setError("Veuillez renseigner votre nom et votre numéro.");
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
      const data = await res.json();

      // Utilise whatsapp_initiateur retourné par le POST en priorité
      const numero: string | null =
        data.whatsapp_initiateur ?? alerte.whatsapp ?? null;

      setWhatsappInitiateur(numero);
      setEtape("confirme");

      // Ouvrir WhatsApp automatiquement si accepte + numéro disponible
      if (choix === "accepte" && numero) {
        window.open(buildWhatsAppUrl(numero), "_blank");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5">
      <h2 className="text-lg font-black text-gray-900 text-center leading-tight">
        Votre réponse peut sauver une vie
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
            Je peux donner
          </button>

          <button
            onClick={() => { setChoix("refuse"); setEtape("formulaire"); }}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 rounded-2xl py-4 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all"
          >
            Je ne peux pas donner
          </button>

          {/* Lien discret si whatsapp disponible */}
          {contactDirectUrl && (
            <a
              href={contactDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center text-[#25D366] hover:underline mt-1 font-medium"
            >
              Contacter directement sur WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Étape 2 — Formulaire */}
      {etape === "formulaire" && (
        <div className="flex flex-col gap-4">
          {/* Badge choix */}
          <div
            className={`text-center text-sm font-semibold px-4 py-2 rounded-xl ${
              choix === "accepte"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {choix === "accepte" ? "Je peux donner" : "Je ne peux pas donner"}
          </div>

          <p className="text-gray-500 text-sm text-center">
            Laissez vos coordonnées pour que l'équipe puisse vous contacter.
          </p>

          <input
            type="text"
            placeholder="Prénom et nom (ex. Marie Kouam)"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9E2016]/30 focus:border-[#9E2016] transition"
          />
          <input
            type="tel"
            placeholder="Numéro WhatsApp (ex. +237 6XX XXX XXX)"
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
            {loading ? "Envoi en cours…" : "Confirmer ma réponse"}
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
        <div className="flex flex-col items-center gap-4 py-2">
          {choix === "accepte" ? (
            <>
              {/* Icône succès sobre */}
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-green-700 font-bold text-base leading-snug">
                  Merci, votre réponse a été enregistrée.
                </p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  L'initiateur de l'alerte a été notifié. Discutez directement avec lui pour organiser le don.
                </p>
              </div>

              {/* Bouton WhatsApp principal — très visible */}
              {whatsappInitiateur ? (
                <a
                  href={buildWhatsAppUrl(whatsappInitiateur)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#25D366] text-white rounded-2xl py-4 px-6 font-bold text-base hover:bg-[#1da851] active:scale-95 transition-all w-full shadow-md"
                >
                  <WhatsAppIcon size={20} />
                  Discuter avec l'initiateur
                </a>
              ) : (
                <p className="text-gray-400 text-xs text-center">
                  L'initiateur va vous contacter bientôt sur WhatsApp.
                </p>
              )}

              {/* Partage secondaire */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
              >
                <WhatsAppIcon size={13} />
                Partager l'alerte pour aider à trouver d'autres donneurs
              </a>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-gray-700 font-semibold text-base leading-snug">
                  Compris, merci quand même.
                </p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Partagez l'alerte pour aider à trouver un donneur dans votre réseau.
                </p>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] rounded-2xl py-3 px-5 font-semibold text-sm hover:bg-[#25D366]/5 transition-colors w-full"
              >
                <WhatsAppIcon size={15} />
                Partager l'alerte
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composants utilitaires
// ---------------------------------------------------------------------------

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold ${highlight ? "text-[#9E2016]" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}

function AlerteNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8f8f8] text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-900">Alerte introuvable</h1>
      <p className="text-gray-500 mt-2 text-sm">Ce lien est invalide ou a expiré.</p>
      <Link to="/" className="mt-6 text-[#9E2016] font-bold underline text-sm">Retour à l'accueil</Link>
    </div>
  );
}

function AlerteResolue({ groupe }: { groupe: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8f8f8] text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-green-700">Alerte résolue</h1>
      <p className="text-gray-500 mt-2 text-sm">Le patient a reçu le sang {groupe}. Merci aux donneurs.</p>
      <Link to="/" className="mt-6 bg-[#9E2016] text-white px-6 py-3 rounded-2xl font-bold text-sm">
        Devenir donneur
      </Link>
    </div>
  );
}

function AlerteAnnulee() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8f8f8] text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-700">Alerte annulée</h1>
      <p className="text-gray-500 mt-2 text-sm">Cette demande a été annulée.</p>
      <Link to="/" className="mt-6 text-[#9E2016] font-bold underline text-sm">Retour à l'accueil</Link>
    </div>
  );
}

function AlerteExpiree() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8f8f8] text-center">
      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-700">Alerte expirée</h1>
      <p className="text-gray-500 mt-2 text-sm max-w-xs">Cette demande date de plus de 72h et n'est plus active.</p>
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
