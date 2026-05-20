// Composant AppMockups — 3 mockups SVG inline représentant les vrais écrans VitaSang
import type { CSSProperties } from "react";

function PhoneFrame({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={style}>
      {/* Ombre portée */}
      <div className="absolute inset-0 translate-y-4 scale-95 rounded-[40px] bg-black/20 blur-2xl" />
      {/* Cadre téléphone */}
      <div className="relative rounded-[40px] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl">
        {/* Encoche dynamique */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <div className="h-[26px] w-[90px] rounded-b-2xl bg-[#1a1a1a]" />
        </div>
        {/* Bouton power */}
        <div className="absolute -right-[8px] top-24 h-14 w-[5px] rounded-r-full bg-[#2a2a2a]" />
        {/* Boutons volume */}
        <div className="absolute -left-[8px] top-20 h-9 w-[5px] rounded-l-full bg-[#2a2a2a]" />
        <div className="absolute -left-[8px] top-32 h-9 w-[5px] rounded-l-full bg-[#2a2a2a]" />
        {/* Écran */}
        <div className="overflow-hidden rounded-[34px] bg-[#F9FAFB]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Écran 1 : Accueil ───────────────────────────────────────────────────────
function ScreenHome() {
  return (
    <svg viewBox="0 0 280 560" width="280" height="560" xmlns="http://www.w3.org/2000/svg" aria-label="Écran Accueil VitaSang">
      {/* Fond global */}
      <rect width="280" height="560" fill="#F9FAFB" />

      {/* ── Header ── */}
      <rect width="280" height="90" fill="#9E2016" />
      {/* Status bar dots */}
      <text x="14" y="18" fill="white" fontSize="9" fontFamily="system-ui" opacity="0.8">9:41</text>
      <circle cx="258" cy="14" r="3.5" fill="white" opacity="0.7" />
      <rect x="248" y="11" width="10" height="7" rx="1.5" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
      {/* Salutation */}
      <text x="20" y="50" fill="white" fontSize="12" fontFamily="system-ui" opacity="0.85">Bonjour,</text>
      <text x="20" y="68" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui">Romaric 👋</text>
      {/* Icône notification */}
      <circle cx="254" cy="58" r="14" fill="rgba(255,255,255,0.15)" />
      <path d="M249 56 Q254 50 259 56 L259 63 Q254 66 249 63 Z" fill="white" opacity="0.9" />
      <circle cx="254" cy="65" r="2" fill="white" opacity="0.9" />
      <circle cx="260" cy="51" r="4" fill="#FBBF24" />

      {/* ── Carte donneur ── */}
      <rect x="14" y="100" width="252" height="110" rx="16" fill="white"
        style={{ filter: "drop-shadow(0 4px 16px rgba(158,32,22,0.10))" }} />
      {/* Cercle groupe sanguin */}
      <circle cx="52" cy="148" r="28" fill="#9E2016" />
      <text x="52" y="153" fill="white" fontSize="18" fontWeight="800" fontFamily="system-ui" textAnchor="middle">A+</text>
      {/* Nom & statut */}
      <text x="94" y="133" fill="#0F172A" fontSize="14" fontWeight="700" fontFamily="system-ui">Romaric T.</text>
      {/* Pill "Disponible" */}
      <rect x="94" y="139" width="74" height="18" rx="9" fill="#DCFCE7" />
      <circle cx="105" cy="148" r="4" fill="#16A34A" />
      <text x="113" y="152" fill="#16A34A" fontSize="10" fontWeight="600" fontFamily="system-ui">Disponible</text>
      {/* Séparateur stats */}
      <line x1="94" y1="163" x2="254" y2="163" stroke="#F1F5F9" strokeWidth="1" />
      {/* Stats */}
      <text x="110" y="180" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">3</text>
      <text x="110" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">dons</text>
      <line x1="150" y1="170" x2="150" y2="195" stroke="#F1F5F9" strokeWidth="1" />
      <text x="170" y="180" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">9</text>
      <text x="170" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">vies</text>
      <line x1="205" y1="170" x2="205" y2="195" stroke="#F1F5F9" strokeWidth="1" />
      <text x="225" y="180" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">2j</text>
      <text x="225" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">prochain</text>

      {/* ── Bouton alerte ── */}
      <rect x="14" y="224" width="252" height="50" rx="14" fill="#9E2016" />
      <text x="140" y="254" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui" textAnchor="middle">🚨 Lancer une alerte</text>

      {/* ── Section Alertes urgentes ── */}
      <text x="20" y="296" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="system-ui">Alertes urgentes</text>
      <rect x="232" y="283" width="34" height="16" rx="8" fill="#FEE2E2" />
      <text x="249" y="295" fill="#9E2016" fontSize="9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">2 actives</text>

      {/* Carte alerte 1 */}
      <rect x="14" y="308" width="252" height="68" rx="12" fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }} />
      <rect x="14" y="308" width="4" height="68" rx="2" fill="#9E2016" />
      {/* Badge groupe sanguin */}
      <rect x="26" y="320" width="30" height="30" rx="8" fill="#FEE2E2" />
      <text x="41" y="340" fill="#9E2016" fontSize="13" fontWeight="800" fontFamily="system-ui" textAnchor="middle">O+</text>
      <text x="66" y="330" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui">Besoin O+ urgent</text>
      <text x="66" y="344" fill="#475569" fontSize="9" fontFamily="system-ui">Laquintini · 2.3 km</text>
      <rect x="66" y="350" width="44" height="14" rx="7" fill="#FEE2E2" />
      <text x="88" y="361" fill="#9E2016" fontSize="8" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Critique</text>
      <text x="248" y="344" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="end">13 min</text>
      {/* Chevron */}
      <path d="M250 333 L255 338 L250 343" stroke="#CBD5E1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Carte alerte 2 */}
      <rect x="14" y="388" width="252" height="68" rx="12" fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }} />
      <rect x="14" y="388" width="4" height="68" rx="2" fill="#2563EB" />
      <rect x="26" y="400" width="30" height="30" rx="8" fill="#EFF6FF" />
      <text x="41" y="420" fill="#2563EB" fontSize="13" fontWeight="800" fontFamily="system-ui" textAnchor="middle">A-</text>
      <text x="66" y="410" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui">Besoin A-</text>
      <text x="66" y="424" fill="#475569" fontSize="9" fontFamily="system-ui">Hôpital Central · 5 km</text>
      <rect x="66" y="430" width="40" height="14" rx="7" fill="#FEF9C3" />
      <text x="86" y="441" fill="#CA8A04" fontSize="8" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Urgent</text>
      <text x="248" y="424" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="end">1h</text>
      <path d="M250 413 L255 418 L250 423" stroke="#CBD5E1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Bottom nav bar ── */}
      <rect x="0" y="508" width="280" height="52" fill="white" />
      <line x1="0" y1="508" x2="280" y2="508" stroke="#F1F5F9" strokeWidth="1" />
      {/* Home actif */}
      <circle cx="35" cy="524" r="14" fill="#FEE2E2" />
      <path d="M30 527 L35 520 L40 527 L40 532 L30 532 Z" fill="#9E2016" />
      <text x="35" y="546" fill="#9E2016" fontSize="8" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Accueil</text>
      {/* Map */}
      <circle cx="95" cy="524" r="14" fill="transparent" />
      <path d="M91 522 Q95 517 99 522 L99 529 Q95 533 91 529 Z" fill="#CBD5E1" />
      <text x="95" y="546" fill="#94A3B8" fontSize="8" fontFamily="system-ui" textAnchor="middle">Carte</text>
      {/* Bouton central alerte */}
      <circle cx="140" cy="520" r="20" fill="#9E2016" style={{ filter: "drop-shadow(0 4px 12px rgba(158,32,22,0.4))" }} />
      <text x="140" y="516" fontSize="12" textAnchor="middle">🚨</text>
      <text x="140" y="546" fill="#9E2016" fontSize="8" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Alerter</text>
      {/* Dons */}
      <circle cx="185" cy="524" r="14" fill="transparent" />
      <path d="M185 519 Q190 522 185 527 Q180 522 185 519 Z" fill="#CBD5E1" />
      <text x="185" y="546" fill="#94A3B8" fontSize="8" fontFamily="system-ui" textAnchor="middle">Dons</text>
      {/* Profil */}
      <circle cx="245" cy="524" r="14" fill="transparent" />
      <circle cx="245" cy="521" r="5" fill="#CBD5E1" />
      <path d="M238 532 Q245 527 252 532" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      <text x="245" y="546" fill="#94A3B8" fontSize="8" fontFamily="system-ui" textAnchor="middle">Profil</text>
    </svg>
  );
}

// ─── Écran 2 : Créer une alerte ──────────────────────────────────────────────
function ScreenCreateAlert() {
  return (
    <svg viewBox="0 0 280 560" width="280" height="560" xmlns="http://www.w3.org/2000/svg" aria-label="Écran Créer une alerte VitaSang">
      <rect width="280" height="560" fill="#F9FAFB" />

      {/* ── Header ── */}
      <rect width="280" height="72" fill="#9E2016" />
      <text x="14" y="18" fill="white" fontSize="9" fontFamily="system-ui" opacity="0.8">9:41</text>
      {/* Bouton X */}
      <circle cx="254" cy="50" r="14" fill="rgba(255,255,255,0.2)" />
      <path d="M249 45 L259 55 M259 45 L249 55" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <text x="140" y="54" fill="white" fontSize="16" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Lancer une alerte</text>

      {/* ── Badge notification ── */}
      <rect x="14" y="84" width="252" height="36" rx="10" fill="#FFF7ED" />
      <text x="26" y="107" fill="#EA580C" fontSize="12">🔔</text>
      <text x="44" y="107" fill="#EA580C" fontSize="10" fontFamily="system-ui">Notifie les donneurs à moins de 10 km</text>

      {/* ── Champ Groupe sanguin ── */}
      <text x="20" y="144" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui">Groupe sanguin requis</text>
      <rect x="14" y="150" width="252" height="44" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      {/* Pills groupes */}
      {[
        { label: "A+", x: 28, active: false },
        { label: "A-", x: 65, active: false },
        { label: "B+", x: 102, active: false },
        { label: "O+", x: 139, active: true },
        { label: "O-", x: 176, active: false },
        { label: "AB+", x: 210, active: false },
      ].map(({ label, x, active }) => (
        <g key={label}>
          <rect x={x} y="161" width={label.length > 2 ? 28 : 24} height="22" rx="11"
            fill={active ? "#9E2016" : "#F1F5F9"} />
          <text x={x + (label.length > 2 ? 14 : 12)} y="176"
            fill={active ? "white" : "#475569"} fontSize="10" fontWeight={active ? "700" : "500"}
            fontFamily="system-ui" textAnchor="middle">{label}</text>
        </g>
      ))}

      {/* ── Champ Hôpital ── */}
      <text x="20" y="214" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui">Hôpital</text>
      <rect x="14" y="220" width="252" height="48" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      {/* Icône localisation */}
      <circle cx="36" cy="244" r="10" fill="#FEE2E2" />
      <path d="M36 239 Q40 241 40 244 Q40 248 36 251 Q32 248 32 244 Q32 241 36 239 Z" fill="#9E2016" />
      <circle cx="36" cy="244" r="3" fill="white" />
      <text x="54" y="240" fill="#0F172A" fontSize="12" fontWeight="600" fontFamily="system-ui">CHU Laquintini</text>
      <text x="54" y="256" fill="#475569" fontSize="10" fontFamily="system-ui">Douala, Cameroun</text>
      <path d="M252 238 L257 244 L252 250" stroke="#CBD5E1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Champ Niveau d'urgence ── */}
      <text x="20" y="290" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui">Niveau d'urgence</text>
      <rect x="14" y="296" width="252" height="68" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      {/* Labels urgence */}
      <text x="26" y="316" fill="#16A34A" fontSize="9" fontFamily="system-ui">Normal</text>
      <text x="140" y="316" fill="#CA8A04" fontSize="9" fontFamily="system-ui" textAnchor="middle">Urgent</text>
      <text x="254" y="316" fill="#9E2016" fontSize="9" fontFamily="system-ui" textAnchor="end">Critique</text>
      {/* Track slider */}
      <rect x="26" y="324" width="228" height="6" rx="3" fill="#F1F5F9" />
      {/* Fill actif (positionné à ~80%) */}
      <rect x="26" y="324" width="183" height="6" rx="3" fill="#9E2016" />
      {/* Thumb */}
      <circle cx="209" cy="327" r="10" fill="white" stroke="#9E2016" strokeWidth="2.5" style={{ filter: "drop-shadow(0 2px 6px rgba(158,32,22,0.3))" }} />
      {/* Badge niveau sélectionné */}
      <rect x="168" y="340" width="82" height="18" rx="9" fill="#FEE2E2" />
      <text x="209" y="353" fill="#9E2016" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Critique 🔴</text>

      {/* ── Champ Quantité de poches ── */}
      <text x="20" y="384" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui">Quantité de poches</text>
      <rect x="14" y="390" width="252" height="44" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      <circle cx="44" cy="412" r="13" fill="#F1F5F9" />
      <text x="44" y="417" fill="#475569" fontSize="16" fontWeight="700" fontFamily="system-ui" textAnchor="middle">−</text>
      <text x="140" y="417" fill="#0F172A" fontSize="16" fontWeight="700" fontFamily="system-ui" textAnchor="middle">3</text>
      <circle cx="236" cy="412" r="13" fill="#FEE2E2" />
      <text x="236" y="417" fill="#9E2016" fontSize="16" fontWeight="700" fontFamily="system-ui" textAnchor="middle">+</text>

      {/* ── Champ Description (optionnel) ── */}
      <text x="20" y="452" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui">Note (optionnel)</text>
      <rect x="14" y="458" width="252" height="36" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      <text x="26" y="481" fill="#CBD5E1" fontSize="10" fontFamily="system-ui">Ex: Patient en chirurgie urgente…</text>

      {/* ── Bouton envoyer ── */}
      <rect x="14" y="504" width="252" height="48" rx="14" fill="#9E2016" />
      <text x="140" y="533" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Envoyer l'alerte</text>
    </svg>
  );
}

// ─── Écran 3 : Profil ────────────────────────────────────────────────────────
function ScreenProfile() {
  return (
    <svg viewBox="0 0 280 560" width="280" height="560" xmlns="http://www.w3.org/2000/svg" aria-label="Écran Profil VitaSang">
      <rect width="280" height="560" fill="#F9FAFB" />

      {/* ── Header rouge ── */}
      <rect width="280" height="140" fill="#9E2016" />
      <text x="14" y="18" fill="white" fontSize="9" fontFamily="system-ui" opacity="0.8">9:41</text>
      {/* Engrenage */}
      <circle cx="254" cy="50" r="14" fill="rgba(255,255,255,0.15)" />
      <circle cx="254" cy="50" r="6" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="254" cy="50" r="2.5" fill="white" />
      {/* Photo initiale */}
      <circle cx="74" cy="108" r="32" fill="white" opacity="0.15" />
      <circle cx="74" cy="108" r="28" fill="rgba(255,255,255,0.95)" />
      <text x="74" y="115" fill="#9E2016" fontSize="22" fontWeight="800" fontFamily="system-ui" textAnchor="middle">R</text>
      {/* Badge vérifié */}
      <circle cx="98" cy="130" r="9" fill="#16A34A" />
      <path d="M94 130 L97 133 L103 127" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Nom & info */}
      <text x="136" y="96" fill="white" fontSize="17" fontWeight="700" fontFamily="system-ui">Romaric T.</text>
      <text x="136" y="112" fill="rgba(255,255,255,0.8)" fontSize="11" fontFamily="system-ui">romaric@vitasang.cm</text>
      {/* Pill groupe sanguin */}
      <rect x="136" y="118" width="36" height="18" rx="9" fill="rgba(255,255,255,0.2)" />
      <text x="154" y="131" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">A+</text>

      {/* ── Carte stats ── */}
      <rect x="14" y="152" width="252" height="72" rx="16" fill="white"
        style={{ filter: "drop-shadow(0 4px 16px rgba(158,32,22,0.10))" }} />
      {/* Stat 1 */}
      <text x="70" y="185" fill="#9E2016" fontSize="24" fontWeight="800" fontFamily="system-ui" textAnchor="middle">3</text>
      <text x="70" y="202" fill="#475569" fontSize="10" fontFamily="system-ui" textAnchor="middle">Dons</text>
      <line x1="140" y1="168" x2="140" y2="212" stroke="#F1F5F9" strokeWidth="1.5" />
      {/* Stat 2 */}
      <text x="210" y="185" fill="#9E2016" fontSize="24" fontWeight="800" fontFamily="system-ui" textAnchor="middle">2</text>
      <text x="210" y="202" fill="#475569" fontSize="10" fontFamily="system-ui" textAnchor="middle">Alertes</text>

      {/* ── Toggle disponibilité ── */}
      <rect x="14" y="238" width="252" height="56" rx="14" fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.04))" }} />
      <text x="28" y="260" fill="#0F172A" fontSize="12" fontWeight="600" fontFamily="system-ui">Disponible pour donner</text>
      <text x="28" y="278" fill="#16A34A" fontSize="10" fontFamily="system-ui">Actif — tu recevras les alertes</text>
      {/* Toggle ON */}
      <rect x="220" y="254" width="36" height="20" rx="10" fill="#16A34A" />
      <circle cx="246" cy="264" r="8" fill="white" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))" }} />

      {/* ── Section menu ── */}
      <text x="20" y="316" fill="#475569" fontSize="10" fontWeight="600" fontFamily="system-ui" letterSpacing="0.08em">MON COMPTE</text>

      {/* Items menu */}
      {[
        { icon: "📋", label: "Historique des dons", sub: "3 dons · dernier il y a 2 mois", y: 330 },
        { icon: "🩺", label: "Test d'éligibilité", sub: "Dernière vérification: conforme", y: 392 },
        { icon: "🔔", label: "Notifications", sub: "Alertes activées · rayon 10 km", y: 454 },
        { icon: "❓", label: "Aide & Support", sub: "FAQ, contact, signaler un bug", y: 510 },
      ].map(({ icon, label, sub, y }) => (
        <g key={label}>
          <rect x="14" y={y} width="252" height="52" rx="14" fill="white"
            style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.04))" }} />
          {/* Icône */}
          <rect x="22" y={y + 11} width="30" height="30" rx="9" fill="#FEE2E2" />
          <text x="37" y={y + 31} fontSize="14" textAnchor="middle">{icon}</text>
          {/* Texte */}
          <text x="62" y={y + 23} fill="#0F172A" fontSize="12" fontWeight="600" fontFamily="system-ui">{label}</text>
          <text x="62" y={y + 37} fill="#94A3B8" fontSize="9" fontFamily="system-ui">{sub}</text>
          {/* Chevron */}
          <path d={`M252 ${y + 20} L257 ${y + 26} L252 ${y + 32}`} stroke="#CBD5E1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export function AppMockups() {
  return (
    <section
      id="apercu"
      aria-labelledby="mockups-title"
      className="relative overflow-hidden bg-background py-24 md:py-32"
    >
      {/* Décoration de fond */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, #9E2016 8%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* En-tête */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Aperçu de l'app
          </span>
          <h2
            id="mockups-title"
            className="reveal mt-3 text-4xl font-bold text-foreground md:text-6xl"
          >
            Votre compagnon de{" "}
            <span className="italic text-primary">don de sang</span>
          </h2>
          <p className="reveal mt-6 text-lg leading-relaxed text-muted-foreground">
            Simple, rapide, efficace. Chaque écran est pensé pour sauver des
            vies en quelques secondes.
          </p>
        </div>

        {/* Mockups */}
        <div className="mt-16 flex items-end justify-center gap-6 overflow-x-auto pb-8 md:gap-10">
          {/* Téléphone gauche — Profil */}
          <div className="reveal hidden flex-col items-center gap-4 lg:flex" style={{ transitionDelay: "0ms" }}>
            <PhoneFrame className="opacity-90" style={{ transform: "scale(0.92)" }}>
              <ScreenProfile />
            </PhoneFrame>
            <span className="text-sm font-medium text-muted-foreground">Profil donneur</span>
          </div>

          {/* Téléphone central — Accueil (hero, légèrement plus grand) */}
          <div className="reveal flex flex-col items-center gap-4" style={{ transitionDelay: "120ms" }}>
            <div
              className="relative"
              style={{
                transform: "scale(1.05)",
                transformOrigin: "bottom center",
                filter: "drop-shadow(0 24px 48px rgba(158,32,22,0.22))",
              }}
            >
              <PhoneFrame>
                <ScreenHome />
              </PhoneFrame>
            </div>
            <span className="mt-3 text-sm font-semibold text-foreground">Tableau de bord</span>
          </div>

          {/* Téléphone droit — Créer une alerte */}
          <div className="reveal hidden flex-col items-center gap-4 lg:flex" style={{ transitionDelay: "240ms" }}>
            <PhoneFrame className="opacity-90" style={{ transform: "scale(0.92)" }}>
              <ScreenCreateAlert />
            </PhoneFrame>
            <span className="text-sm font-medium text-muted-foreground">Lancer une alerte</span>
          </div>
        </div>

        {/* Indicateurs mobile (petits points pour montrer les 3 écrans) */}
        <div className="mt-6 flex justify-center gap-2 lg:hidden">
          <div className="h-2 w-6 rounded-full bg-primary" />
          <div className="h-2 w-2 rounded-full bg-primary/30" />
          <div className="h-2 w-2 rounded-full bg-primary/30" />
        </div>

        {/* Badges de rassurance */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            { icon: "🔒", label: "Données chiffrées" },
            { icon: "⚡", label: "Alertes en temps réel" },
            { icon: "📍", label: "Géolocalisation précise" },
            { icon: "🌍", label: "Conçu pour le Cameroun" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="reveal flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
