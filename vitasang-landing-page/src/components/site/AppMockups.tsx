// AppMockups — pattern "Feature phones" : 3 blocs feature avec téléphone SVG alterné
// Inspiré des patterns Linear / Raycast / Clerk

// ─── Téléphone SVG générique ────────────────────────────────────────────────
function PhoneSVG({
  children,
  rotate = 0,
}: {
  children: React.ReactNode;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 260 520"
      width="260"
      height="520"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
        flexShrink: 0,
      }}
    >
      {/* Cadre téléphone */}
      <rect x="0" y="0" width="260" height="520" rx="32" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
      {/* Écran */}
      <rect x="8" y="8" width="244" height="504" rx="24" fill="#F9FAFB" />
      {/* Encoche */}
      <rect x="100" y="8" width="60" height="18" rx="8" fill="#1a1a2e" />
      {children}
    </svg>
  );
}

// ─── Écran 1 : Créer une alerte ──────────────────────────────────────────────
function ScreenCreateAlert() {
  const pills = [
    { label: "O", active: false },
    { label: "A", active: false },
    { label: "B", active: false },
    { label: "AB", active: false },
  ];
  return (
    <PhoneSVG rotate={3}>
      {/* Header rouge */}
      <rect x="8" y="26" width="244" height="64" rx="0" fill="#9E2016" />
      <rect x="8" y="26" width="244" height="20" fill="#9E2016" />
      <text x="130" y="67" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui" textAnchor="middle">🚨 Lancer une alerte</text>

      {/* Groupe sanguin */}
      <text x="20" y="112" fill="#475569" fontSize="10" fontWeight="600" fontFamily="system-ui">Groupe sanguin requis</text>
      <rect x="16" y="118" width="228" height="40" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Pills O A B AB avec +/- */}
      {[
        { label: "O+", x: 26, active: true },
        { label: "A+", x: 78, active: false },
        { label: "B+", x: 130, active: false },
        { label: "AB+", x: 178, active: false },
      ].map(({ label, x, active }) => (
        <g key={label}>
          <rect x={x} y="126" width={label.length > 2 ? 36 : 30} height="22" rx="11"
            fill={active ? "#9E2016" : "#F1F5F9"} />
          <text x={x + (label.length > 2 ? 18 : 15)} y="141"
            fill={active ? "white" : "#475569"} fontSize="10" fontWeight={active ? "700" : "500"}
            fontFamily="system-ui" textAnchor="middle">{label}</text>
        </g>
      ))}

      {/* Hôpital */}
      <text x="20" y="178" fill="#475569" fontSize="10" fontWeight="600" fontFamily="system-ui">Hôpital</text>
      <rect x="16" y="184" width="228" height="44" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="36" cy="206" r="9" fill="#FEE2E2" />
      <text x="36" y="210" fill="#9E2016" fontSize="9" textAnchor="middle">📍</text>
      <text x="52" y="202" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="system-ui">CHU Laquintini, Douala</text>
      <text x="52" y="216" fill="#94A3B8" fontSize="9" fontFamily="system-ui">Changer d'hôpital →</text>

      {/* Urgence slider */}
      <text x="20" y="250" fill="#475569" fontSize="10" fontWeight="600" fontFamily="system-ui">Niveau d'urgence</text>
      <rect x="16" y="256" width="228" height="56" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="26" y="274" fill="#16A34A" fontSize="8" fontFamily="system-ui">Normal</text>
      <text x="130" y="274" fill="#CA8A04" fontSize="8" fontFamily="system-ui" textAnchor="middle">Urgent</text>
      <text x="234" y="274" fill="#9E2016" fontSize="8" fontFamily="system-ui" textAnchor="end">Critique</text>
      <rect x="26" y="280" width="208" height="5" rx="2.5" fill="#F1F5F9" />
      <rect x="26" y="280" width="167" height="5" rx="2.5" fill="#9E2016" />
      <circle cx="193" cy="282" r="8" fill="white" stroke="#9E2016" strokeWidth="2" />
      <rect x="158" y="293" width="70" height="14" rx="7" fill="#FEE2E2" />
      <text x="193" y="303" fill="#9E2016" fontSize="9" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Critique 🔴</text>

      {/* Bouton envoyer */}
      <rect x="16" y="332" width="228" height="46" rx="14" fill="#9E2016" />
      <text x="130" y="360" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Envoyer l'alerte</text>

      {/* Badge donneurs notifiés */}
      <rect x="16" y="392" width="228" height="36" rx="12" fill="#DCFCE7" />
      <text x="130" y="415" fill="#16A34A" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">🔔 47 donneurs compatibles notifiés</text>

      {/* Quantité de poches */}
      <text x="20" y="452" fill="#475569" fontSize="10" fontWeight="600" fontFamily="system-ui">Quantité de poches</text>
      <rect x="16" y="458" width="228" height="40" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="42" cy="478" r="11" fill="#F1F5F9" />
      <text x="42" y="483" fill="#475569" fontSize="14" fontWeight="700" fontFamily="system-ui" textAnchor="middle">−</text>
      <text x="130" y="483" fill="#0F172A" fontSize="15" fontWeight="700" fontFamily="system-ui" textAnchor="middle">3</text>
      <circle cx="218" cy="478" r="11" fill="#FEE2E2" />
      <text x="218" y="483" fill="#9E2016" fontSize="14" fontWeight="700" fontFamily="system-ui" textAnchor="middle">+</text>
    </PhoneSVG>
  );
}

// ─── Écran 2 : Alerte reçue ──────────────────────────────────────────────────
function ScreenAlertReceived() {
  return (
    <PhoneSVG rotate={-3}>
      {/* Notification push */}
      <rect x="16" y="34" width="228" height="58" rx="14" fill="white"
        style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.10))" }} />
      <text x="28" y="54" fill="#9E2016" fontSize="11">🩸</text>
      <text x="46" y="54" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="system-ui">Besoin O+ urgent · Laquintini</text>
      <text x="46" y="68" fill="#475569" fontSize="9" fontFamily="system-ui">2.3 km · Il y a 1 min</text>
      <text x="224" y="50" fill="#9E2016" fontSize="8" fontFamily="system-ui" textAnchor="end">maintenant</text>

      {/* Carte alerte principale */}
      <rect x="16" y="104" width="228" height="160" rx="16" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      {/* Badge URGENT */}
      <rect x="28" y="116" width="52" height="18" rx="9" fill="#FEE2E2" />
      <text x="54" y="129" fill="#9E2016" fontSize="9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">URGENT</text>
      {/* Groupe sanguin */}
      <circle cx="200" cy="130" r="22" fill="#9E2016" />
      <text x="200" y="136" fill="white" fontSize="16" fontWeight="800" fontFamily="system-ui" textAnchor="middle">O+</text>
      {/* Infos */}
      <text x="28" y="150" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="system-ui">Besoin de sang urgent</text>
      <text x="28" y="166" fill="#475569" fontSize="10" fontFamily="system-ui">🏥 CHU Laquintini, Douala</text>
      <text x="28" y="180" fill="#475569" fontSize="10" fontFamily="system-ui">📍 2.3 km de votre position</text>
      <line x1="28" y1="192" x2="232" y2="192" stroke="#F1F5F9" strokeWidth="1" />
      <text x="28" y="208" fill="#64748B" fontSize="9" fontFamily="system-ui">⏱ Répond sous 2h · 3 donneurs ont déjà accepté</text>
      <text x="28" y="222" fill="#64748B" fontSize="9" fontFamily="system-ui">Critique — demande immédiate</text>

      {/* Boutons réponse */}
      <rect x="16" y="278" width="108" height="42" rx="12" fill="#16A34A" />
      <text x="70" y="304" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">✓ Je peux donner</text>
      <rect x="136" y="278" width="108" height="42" rx="12" fill="#F1F5F9" />
      <text x="190" y="304" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui" textAnchor="middle">✗ Pas disponible</text>

      {/* Info additionnelle */}
      <rect x="16" y="334" width="228" height="50" rx="12" fill="#EFF6FF" />
      <text x="130" y="354" fill="#2563EB" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Votre groupe sanguin O+ correspond</text>
      <text x="130" y="370" fill="#2563EB" fontSize="9" fontFamily="system-ui" textAnchor="middle">à cette alerte — vous pouvez aider</text>

      {/* Alerte secondaire */}
      <rect x="16" y="398" width="228" height="58" rx="14" fill="white" stroke="#F1F5F9" strokeWidth="1.5" />
      <rect x="16" y="398" width="4" height="58" rx="2" fill="#2563EB" />
      <rect x="26" y="410" width="26" height="26" rx="7" fill="#EFF6FF" />
      <text x="39" y="427" fill="#2563EB" fontSize="11" fontWeight="800" fontFamily="system-ui" textAnchor="middle">A-</text>
      <text x="62" y="420" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="system-ui">Besoin A-</text>
      <text x="62" y="434" fill="#475569" fontSize="9" fontFamily="system-ui">Hôpital Central · 5 km · Urgent</text>
      <path d="M234 421 L239 427 L234 433" stroke="#CBD5E1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Filtre groupes */}
      <rect x="16" y="470" width="228" height="36" rx="10" fill="#F8FAFC" />
      <text x="130" y="492" fill="#94A3B8" fontSize="9" fontFamily="system-ui" textAnchor="middle">Vos alertes · filtrées par groupe sanguin O+</text>
    </PhoneSVG>
  );
}

// ─── Écran 3 : Profil / Stats ────────────────────────────────────────────────
function ScreenProfile() {
  return (
    <PhoneSVG rotate={3}>
      {/* Header rouge */}
      <rect x="8" y="26" width="244" height="110" rx="0" fill="#9E2016" />
      <rect x="8" y="26" width="244" height="20" fill="#9E2016" />
      {/* Avatar */}
      <circle cx="68" cy="96" r="28" fill="rgba(255,255,255,0.2)" />
      <circle cx="68" cy="96" r="24" fill="rgba(255,255,255,0.95)" />
      <text x="68" y="103" fill="#9E2016" fontSize="18" fontWeight="800" fontFamily="system-ui" textAnchor="middle">R</text>
      {/* Badge vérifié */}
      <circle cx="88" cy="116" r="8" fill="#16A34A" />
      <path d="M84.5 116 L87 118.5 L92 113" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Nom */}
      <text x="106" y="82" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui">Romaric T.</text>
      {/* Pill groupe */}
      <rect x="106" y="88" width="32" height="16" rx="8" fill="rgba(255,255,255,0.25)" />
      <text x="122" y="100" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui" textAnchor="middle">A+</text>
      <text x="106" y="118" fill="rgba(255,255,255,0.8)" fontSize="9" fontFamily="system-ui">Donneur actif depuis 1 an</text>

      {/* Carte stats */}
      <rect x="16" y="148" width="228" height="68" rx="14" fill="white"
        style={{ filter: "drop-shadow(0 4px 16px rgba(158,32,22,0.10))" }} />
      <text x="64" y="176" fill="#9E2016" fontSize="22" fontWeight="800" fontFamily="system-ui" textAnchor="middle">3</text>
      <text x="64" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">Dons</text>
      <line x1="108" y1="162" x2="108" y2="206" stroke="#F1F5F9" strokeWidth="1.5" />
      <text x="152" y="176" fill="#9E2016" fontSize="22" fontWeight="800" fontFamily="system-ui" textAnchor="middle">9</text>
      <text x="152" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">Vies</text>
      <line x1="196" y1="162" x2="196" y2="206" stroke="#F1F5F9" strokeWidth="1.5" />
      <text x="220" y="176" fill="#9E2016" fontSize="22" fontWeight="800" fontFamily="system-ui" textAnchor="middle">1 an</text>
      <text x="220" y="192" fill="#475569" fontSize="9" fontFamily="system-ui" textAnchor="middle">Fidélité</text>

      {/* Timeline dons */}
      <text x="20" y="240" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="system-ui">Historique des dons</text>

      {[
        { date: "12 Mar 2026", hopital: "CHU Laquintini", groupe: "A+", color: "#9E2016", bgColor: "#FEE2E2", y: 250 },
        { date: "04 Jan 2026", hopital: "Hôpital Central", groupe: "A+", color: "#2563EB", bgColor: "#EFF6FF", y: 310 },
        { date: "08 Nov 2025", hopital: "Clinique Joie", groupe: "A+", color: "#16A34A", bgColor: "#DCFCE7", y: 370 },
      ].map(({ date, hopital, groupe, color, bgColor, y }) => (
        <g key={y}>
          <rect x="16" y={y} width="228" height="52" rx="12" fill="white" stroke="#F1F5F9" strokeWidth="1" />
          {/* Ligne timeline */}
          <rect x="28" y={y + 4} width="3" height="44" rx="1.5" fill={color} />
          {/* Badge groupe */}
          <rect x="38" y={y + 14} width="28" height="22" rx="8" fill={bgColor} />
          <text x="52" y={y + 29} fill={color} fontSize="10" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{groupe}</text>
          {/* Texte */}
          <text x="74" y={y + 24} fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="system-ui">{hopital}</text>
          <text x="74" y={y + 38} fill="#94A3B8" fontSize="9" fontFamily="system-ui">{date}</text>
        </g>
      ))}

      {/* Badge fidélité */}
      <rect x="16" y="436" width="228" height="40" rx="12" fill="#FFF7ED" />
      <text x="130" y="461" fill="#EA580C" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">🏆 Donneur régulier — Niveau Or</text>

      {/* Prochain don */}
      <rect x="16" y="488" width="228" height="28" rx="8" fill="#F0FDF4" />
      <text x="130" y="506" fill="#16A34A" fontSize="9" fontFamily="system-ui" textAnchor="middle">⏰ Prochain don possible dans 2 jours</text>
    </PhoneSVG>
  );
}

// ─── Composant CheckList ─────────────────────────────────────────────────────
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-[#475569]">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export function AppMockups() {
  return (
    <section
      id="apercu"
      aria-labelledby="mockups-title"
      className="bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* En-tête centré */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            Tout ce dont vous avez besoin
          </span>
          <h2
            id="mockups-title"
            className="reveal mt-3 text-4xl font-bold text-[#0F172A] md:text-5xl"
          >
            Simple pour le donneur.{" "}
            <span className="italic text-[#9E2016]">Puissant</span> pour
            l'hôpital.
          </h2>
        </div>

        {/* ── Bloc 1 : texte gauche, téléphone droite ── */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row md:gap-20">
          {/* Texte */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-semibold text-[#9E2016]">
              Alerte instantanée
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Lancez une alerte de don en 10 secondes
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Choisissez le groupe sanguin, l'hôpital, et envoyez. Les donneurs
              compatibles dans un rayon de 10 km sont notifiés immédiatement.
            </p>
            <CheckList
              items={[
                "Notification push instantanée",
                "Géolocalisation automatique",
                "Sans création de compte",
              ]}
            />
          </div>
          {/* Téléphone */}
          <div className="flex shrink-0 justify-center">
            <ScreenCreateAlert />
          </div>
        </div>

        {/* ── Bloc 2 : téléphone gauche, texte droite ── */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row-reverse md:gap-20">
          {/* Texte */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#D97706]">
              Temps réel
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Recevez les alertes qui vous correspondent
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Votre groupe sanguin, votre localisation. Vous n'êtes notifié que
              quand c'est vraiment utile.
            </p>
            <CheckList
              items={[
                "Filtrage par groupe sanguin",
                "Distance configurée par vous",
                "Réponse en 1 tap",
              ]}
            />
          </div>
          {/* Téléphone */}
          <div className="flex shrink-0 justify-center">
            <ScreenAlertReceived />
          </div>
        </div>

        {/* ── Bloc 3 : texte gauche, téléphone droite ── */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row md:gap-20">
          {/* Texte */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#16A34A]">
              Impact personnel
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Chaque don compte. Mesurez votre impact.
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Historique complet, vies sauvées estimées, badges de fidélité.
              Votre générosité laisse une trace.
            </p>
            <CheckList
              items={[
                "Historique complet des dons",
                "Estimation des vies sauvées",
                "Rappels intelligents",
              ]}
            />
          </div>
          {/* Téléphone */}
          <div className="flex shrink-0 justify-center">
            <ScreenProfile />
          </div>
        </div>
      </div>
    </section>
  );
}
