// ─── Ecran 1 : Accueil (fidèle au vrai code) ────────────────────────────────
function ScreenHome() {
  return (
    <svg viewBox="0 0 390 844" width="248" height="536" xmlns="http://www.w3.org/2000/svg" className="block">
      {/* Background */}
      <rect width="390" height="844" fill="#F8FAFC"/>

      {/* ── Header blanc ── */}
      <rect width="390" height="100" fill="white"/>
      {/* Photo profil */}
      <circle cx="36" cy="72" r="24" fill="#F1F5F9" stroke="#9E2016" strokeWidth="2"/>
      <circle cx="36" cy="68" r="10" fill="#CBD5E1"/>
      <ellipse cx="36" cy="86" rx="14" ry="8" fill="#CBD5E1"/>
      {/* Nom + tagline */}
      <text x="70" y="67" fill="#0F172A" fontSize="20" fontWeight="800" fontFamily="system-ui">Jean D.</text>
      <text x="70" y="86" fill="#94A3B8" fontSize="13" fontWeight="500" fontFamily="system-ui">Donnez. Sauvez. Vivez.</text>
      {/* Cloche */}
      <circle cx="354" cy="72" r="22" fill="#FEE2E2"/>
      <g transform="translate(343,61)">
        <path d="M11 4A5 5 0 0 0 6 9c0 5.5-2.5 7-2.5 7h15s-2.5-1.5-2.5-7a5 5 0 0 0-5-5zM9.27 18a2 2 0 0 0 3.46 0" stroke="#9E2016" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <circle cx="16" cy="5" r="4" fill="#9E2016"/>
      </g>

      {/* ── DonorStatusCard ── */}
      <rect x="16" y="108" width="358" height="110" rx="16" fill="white" stroke="#F1F5F9" strokeWidth="1.5"/>
      {/* Top row: groupe + pill */}
      <circle cx="60" cy="138" r="22" fill="#FFF1F2" stroke="#9E2016" strokeWidth="2"/>
      <text x="60" y="144" fill="#9E2016" fontSize="16" fontWeight="900" fontFamily="system-ui" textAnchor="middle">O+</text>
      <text x="90" y="132" fill="#64748B" fontSize="12" fontWeight="600" fontFamily="system-ui">Mon groupe</text>
      {/* Pill disponible */}
      <rect x="270" y="126" width="90" height="26" rx="13" fill="#DCFCE7"/>
      <circle cx="284" cy="139" r="5" fill="#16A34A"/>
      <text x="320" y="143" fill="#16A34A" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Disponible</text>
      {/* Divider */}
      <line x1="16" y1="170" x2="374" y2="170" stroke="#F1F5F9" strokeWidth="1"/>
      {/* Stats */}
      <text x="80" y="196" fill="#0F172A" fontSize="18" fontWeight="800" fontFamily="system-ui" textAnchor="middle">3</text>
      <text x="80" y="210" fill="#94A3B8" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">DONS</text>
      <line x1="165" y1="180" x2="165" y2="210" stroke="#F1F5F9" strokeWidth="1"/>
      <text x="195" y="196" fill="#0F172A" fontSize="18" fontWeight="800" fontFamily="system-ui" textAnchor="middle">9</text>
      <text x="195" y="210" fill="#94A3B8" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">VIES</text>
      <line x1="230" y1="180" x2="230" y2="210" stroke="#F1F5F9" strokeWidth="1"/>
      <text x="310" y="196" fill="#0F172A" fontSize="18" fontWeight="800" fontFamily="system-ui" textAnchor="middle">12j</text>
      <text x="310" y="210" fill="#94A3B8" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">DERNIER DON</text>

      {/* ── LaunchAlertButton ── */}
      <rect x="16" y="230" width="358" height="62" rx="18" fill="#7B1710"/>
      {/* Overlay top */}
      <rect x="16" y="230" width="358" height="34" rx="18" fill="rgba(255,255,255,0.06)"/>
      {/* Icon wrapper */}
      <rect x="32" y="245" width="32" height="32" rx="10" fill="rgba(255,255,255,0.15)"/>
      <text x="48" y="266" fill="white" fontSize="20" fontFamily="system-ui" textAnchor="middle">+</text>
      {/* Text */}
      <text x="76" y="258" fill="white" fontSize="15" fontWeight="800" fontFamily="system-ui">Lancer une alerte</text>
      <text x="76" y="276" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="500" fontFamily="system-ui">Notifier les donneurs autour de vous</text>
      {/* Arrow circle */}
      <circle cx="352" cy="261" r="17" fill="white"/>
      <text x="352" y="267" fill="#9E2016" fontSize="14" fontWeight="700" fontFamily="system-ui" textAnchor="middle">›</text>

      {/* ── UrgentAlertsSection ── */}
      {/* Header */}
      <circle cx="28" cy="322" r="5" fill="#EF4444"/>
      <text x="40" y="327" fill="#0F172A" fontSize="15" fontWeight="800" fontFamily="system-ui">Besoins Urgents</text>
      <rect x="180" y="312" width="26" height="22" rx="11" fill="#FEE2E2"/>
      <text x="193" y="327" fill="#EF4444" fontSize="11" fontWeight="800" fontFamily="system-ui" textAnchor="middle">2</text>
      <text x="345" y="327" fill="#9E2016" fontSize="12" fontWeight="600" fontFamily="system-ui">Voir tout</text>

      {/* Carte alerte 1 */}
      <rect x="16" y="338" width="358" height="70" rx="14" fill="white" stroke="#F1F5F9" strokeWidth="1.5"/>
      <rect x="28" y="351" width="48" height="44" rx="12" fill="#FEE2E2"/>
      <text x="52" y="378" fill="#EF4444" fontSize="18" fontWeight="900" fontFamily="system-ui" textAnchor="middle">O+</text>
      {/* Urgency pill */}
      <rect x="86" y="350" width="90" height="20" rx="6" fill="#FEE2E2"/>
      <circle cx="97" cy="360" r="4" fill="#EF4444"/>
      <text x="133" y="364" fill="#EF4444" fontSize="10" fontWeight="800" fontFamily="system-ui" textAnchor="middle">TRÈS URGENT</text>
      <text x="300" y="362" fill="#94A3B8" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">2 min</text>
      <text x="86" y="385" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="system-ui">Hôpital Général, Douala</text>
      {/* Arrow */}
      <circle cx="356" cy="373" r="14" fill="#F8FAFC"/>
      <text x="356" y="378" fill="#94A3B8" fontSize="14" fontFamily="system-ui" textAnchor="middle">›</text>

      {/* Carte alerte 2 */}
      <rect x="16" y="418" width="358" height="70" rx="14" fill="white" stroke="#F1F5F9" strokeWidth="1.5"/>
      <rect x="28" y="431" width="48" height="44" rx="12" fill="#FEF3C7"/>
      <text x="52" y="458" fill="#D97706" fontSize="18" fontWeight="900" fontFamily="system-ui" textAnchor="middle">B-</text>
      <rect x="86" y="430" width="68" height="20" rx="6" fill="#FEF3C7"/>
      <circle cx="97" cy="440" r="4" fill="#D97706"/>
      <text x="121" y="444" fill="#D97706" fontSize="10" fontWeight="800" fontFamily="system-ui" textAnchor="middle">URGENT</text>
      <text x="300" y="442" fill="#94A3B8" fontSize="10" fontWeight="600" fontFamily="system-ui" textAnchor="middle">15 min</text>
      <text x="86" y="465" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="system-ui">CHU Laquintini, Douala</text>
      <circle cx="356" cy="453" r="14" fill="#F8FAFC"/>
      <text x="356" y="458" fill="#94A3B8" fontSize="14" fontFamily="system-ui" textAnchor="middle">›</text>

      {/* ── Bottom nav ── */}
      <rect x="0" y="780" width="390" height="64" fill="white"/>
      <line x1="0" y1="780" x2="390" y2="780" stroke="#F1F5F9" strokeWidth="1"/>
      {/* Accueil actif */}
      <g transform="translate(38,790)">
        <path d="M12 2L2 9.5V20h6v-6h8v6h6V9.5z" fill="#9E2016" stroke="#9E2016" strokeWidth="0.5" strokeLinejoin="round"/>
      </g>
      <text x="50" y="826" fill="#9E2016" fontSize="11" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Accueil</text>
      {/* Carte */}
      <g transform="translate(136,790)">
        <path d="M1 4v16l7-4 8 4 7-4V0l-7 4-8-4z" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
        <line x1="8" y1="0" x2="8" y2="16" stroke="#94A3B8" strokeWidth="1.8"/>
        <line x1="16" y1="4" x2="16" y2="20" stroke="#94A3B8" strokeWidth="1.8"/>
      </g>
      <text x="148" y="826" fill="#94A3B8" fontSize="11" fontFamily="system-ui" textAnchor="middle">Carte</text>
      {/* Alertes */}
      <g transform="translate(233,790)">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round"/>
      </g>
      <text x="245" y="826" fill="#94A3B8" fontSize="11" fontFamily="system-ui" textAnchor="middle">Alertes</text>
      {/* Profil */}
      <g transform="translate(330,790)">
        <circle cx="12" cy="8" r="4" fill="none" stroke="#94A3B8" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round"/>
      </g>
      <text x="342" y="826" fill="#94A3B8" fontSize="11" fontFamily="system-ui" textAnchor="middle">Profil</text>
    </svg>
  );
}

function PhoneFrame({
  src,
  alt,
  rotate = 0,
}: {
  src: string;
  alt: string;
  rotate?: number;
}) {
  return (
    <div
      className="relative shrink-0 rounded-[36px] bg-[#111] p-[6px]"
      style={{
        width: 260,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      }}
    >
      {/* Encoche */}
      <div className="absolute left-1/2 top-[10px] z-10 h-[22px] w-[80px] -translate-x-1/2 rounded-full bg-[#111]" />
      {/* Écran */}
      <div className="overflow-hidden rounded-[30px]">
        <img
          src={src}
          alt={alt}
          className="block w-full"
        />
      </div>
    </div>
  );
}

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

export function AppMockups() {
  return (
    <section
      id="apercu"
      aria-labelledby="mockups-title"
      className="bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            Apercu de l'application
          </span>
          <h2
            id="mockups-title"
            className="reveal mt-3 text-4xl font-bold text-[#0F172A] md:text-5xl"
          >
            Simple pour le donneur.{" "}
            <span className="italic text-[#9E2016]">Puissant</span> pour
            l'hopital.
          </h2>
        </div>

        {/* Bloc 1 : Accueil — texte gauche, tel droite */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row md:gap-20">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-semibold text-[#9E2016]">
              Tableau de bord
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Tout votre profil donneur en un coup d'oeil
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Groupe sanguin, disponibilite, nombre de dons, alertes actives.
              Tout est accessible des l'ouverture de l'app.
            </p>
            <CheckList
              items={[
                "Statut donneur en temps reel",
                "Alertes urgentes a proximite",
                "Lancement d'alerte en 1 tap",
              ]}
            />
          </div>
          <div
            className="flex shrink-0 justify-center rounded-[36px] bg-[#111] p-[6px]"
            style={{
              transform: "rotate(3deg)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div className="overflow-hidden rounded-[30px]">
              <ScreenHome />
            </div>
          </div>
        </div>

        {/* Bloc 2 : Creer alerte — tel gauche, texte droite */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row-reverse md:gap-20">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#D97706]">
              Alerte instantanee
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Lancez une alerte de don en 10 secondes
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Choisissez le groupe sanguin, l'hopital et le niveau d'urgence.
              Les donneurs compatibles dans un rayon de 10 km sont notifies immediatement.
            </p>
            <CheckList
              items={[
                "Notification push instantanee",
                "Geolocalisation automatique",
                "Partage public sans compte",
              ]}
            />
          </div>
          <div className="flex shrink-0 justify-center">
            <PhoneFrame src="/screens/screen-alert.png" alt="Ecran creation alerte" rotate={-3} />
          </div>
        </div>

        {/* Bloc 3 : Profil — texte gauche, tel droite */}
        <div className="reveal mt-28 flex flex-col-reverse items-center gap-12 md:flex-row md:gap-20">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#16A34A]">
              Suivi personnel
            </span>
            <h3 className="mt-4 text-3xl font-bold text-[#0F172A]">
              Gerez votre disponibilite et suivez vos dons
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Activez ou desactivez votre disponibilite en un geste.
              Consultez votre historique, passez le test d'eligibilite,
              configurez vos notifications.
            </p>
            <CheckList
              items={[
                "Toggle disponibilite instantane",
                "Historique complet des dons",
                "Test d'eligibilite integre",
              ]}
            />
          </div>
          <div className="flex shrink-0 justify-center">
            <PhoneFrame src="/screens/screen-profile.png" alt="Ecran profil donneur" rotate={3} />
          </div>
        </div>
      </div>
    </section>
  );
}
