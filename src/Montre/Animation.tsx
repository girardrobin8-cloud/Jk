import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * Toute l'animation, pilotée par le temps ABSOLU du montage.
 *
 * Le composant est monté deux fois (avant et après le plan filmé du beat 7) et
 * lit la même horloge : les éléments miniaturisés en en-tête — badge de source
 * puis frises d'appareils et d'activités — se retrouvent donc au même endroit
 * de part et d'autre, sans avoir à dupliquer d'état.
 *
 * Aucune coupure sèche : chaque bloc laisse la place au suivant par une
 * miniaturisation ou un changement d'échelle, jamais par un fondu au noir.
 */

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], C);

const T = 5;

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    textAnchor={ancre}
    fontFamily={TITRE_FONT}
    fontSize={taille}
    fontWeight={700}
    fill={couleur}
    opacity={opacity}
  >
    {children}
  </text>
);

// ── Icônes ───────────────────────────────────────────────────────────────
const Montre: React.FC<{ c?: string }> = ({ c = M.vert }) => (
  <g fill="none" stroke={c} strokeWidth={T} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -26 -58 L -22 -76 L 22 -76 L 26 -58" />
    <path d="M -26 58 L -22 76 L 22 76 L 26 58" />
    <rect x={-40} y={-58} width={80} height={116} rx={22} fill={c} fillOpacity={0.14} />
    <path d="M 40 -16 L 50 -16 L 50 6 L 40 6" />
    <path d="M -16 6 L 0 6 L 0 -22" />
  </g>
);

const Bracelet: React.FC<{ c?: string }> = ({ c = M.vert }) => (
  <g fill="none" stroke={c} strokeWidth={T}>
    <ellipse cx={0} cy={0} rx={54} ry={68} />
    <ellipse cx={0} cy={0} rx={34} ry={46} opacity={0.6} />
    <rect x={-16} y={-64} width={32} height={22} rx={8} fill={c} fillOpacity={0.2} />
  </g>
);

const Anneau: React.FC<{ c?: string }> = ({ c = M.vert }) => (
  <g fill="none" stroke={c} strokeWidth={T}>
    <circle r={52} />
    <circle r={32} opacity={0.6} />
    <circle r={42} strokeWidth={T + 6} opacity={0.14} />
  </g>
);

const Marche: React.FC<{ c?: string }> = ({ c = M.ambre }) => (
  <g fill="none" stroke={c} strokeWidth={T} strokeLinecap="round">
    <circle cx={6} cy={-56} r={18} />
    <path d="M 4 -36 L -2 6" />
    <path d="M -2 6 L -24 52 M -2 6 L 22 48" />
    <path d="M 4 -26 L -22 -8 M 4 -26 L 28 -14" />
  </g>
);

const Velo: React.FC<{ c?: string }> = ({ c = M.ambre }) => (
  <g fill="none" stroke={c} strokeWidth={T} strokeLinecap="round">
    <circle cx={-42} cy={26} r={30} />
    <circle cx={42} cy={26} r={30} />
    <path d="M -42 26 L -8 -22 L 30 -22 L 42 26 M -8 -22 L 12 26 L -42 26" />
    <path d="M -14 -34 L 2 -34" />
  </g>
);

const Elliptique: React.FC<{ c?: string }> = ({ c = M.ambre }) => (
  <g fill="none" stroke={c} strokeWidth={T} strokeLinecap="round">
    <circle cx={-34} cy={30} r={24} />
    <path d="M -34 30 L 36 -34" />
    <path d="M 36 -34 L 36 34 M 14 34 L 58 34" />
    <path d="M 6 -6 L 46 -6" />
  </g>
);

const Course: React.FC<{ c?: string }> = ({ c = M.ambre }) => (
  <g fill="none" stroke={c} strokeWidth={T} strokeLinecap="round">
    <circle cx={16} cy={-56} r={18} />
    <path d="M 12 -36 L -6 0" />
    <path d="M -6 0 L -36 30 M -6 0 L 20 22 L 14 54" />
    <path d="M 8 -26 L -20 -30 M 8 -26 L 36 -6" />
  </g>
);

/** Badge de crédibilité : document tamponné. */
const Badge: React.FC<{ c?: string }> = ({ c = M.vert }) => (
  <g>
    <rect x={-52} y={-64} width={104} height={128} rx={14} fill={c} fillOpacity={0.13} stroke={c} strokeWidth={T} />
    <g stroke={c} strokeWidth={T - 1} strokeLinecap="round" opacity={0.75}>
      <path d="M -30 -32 L 30 -32" />
      <path d="M -30 -6 L 30 -6" />
      <path d="M -30 20 L 6 20" />
    </g>
    <circle cx={34} cy={40} r={24} fill={M.fond} stroke={c} strokeWidth={T - 1} />
    <path d="M 22 40 L 31 50 L 47 30" fill="none" stroke={c} strokeWidth={T} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const APPAREILS = [
  { I: Montre, nom: "MONTRE" },
  { I: Bracelet, nom: "BRACELET" },
  { I: Anneau, nom: "ANNEAU" },
];
const ACTIVITES = [
  { I: Marche, nom: "MARCHE" },
  { I: Velo, nom: "VÉLO" },
  { I: Elliptique, nom: "ELLIPTIQUE" },
  { I: Course, nom: "COURSE" },
];

/** Variables non mesurées : le nuage qui submerge l'écran. */
const NON_MESURE = [
  "sommeil", "hormones", "masse grasse", "génétique", "température",
  "digestion", "stress", "hydratation", "âge métabolique", "efficacité",
  "récupération", "médicaments", "altitude", "fibres musculaires",
  "microbiote", "cycle", "acclimatation", "posture",
];

const alea = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
};

export const Animation: React.FC<{ depart: number }> = ({ depart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = depart + frame / fps;
  const sp = (at: number, damping = 12, mass = 0.6) =>
    spring({ frame: frame - (at - depart) * fps, fps, config: { damping, mass } });

  // ── Beat 2 · compteur puis badge qui se miniaturise ──
  const compteur = r(t, 5.1, 5.6);
  const compteurOut = r(t, 6.9, 7.4);
  const badge = sp(7.0);
  const badgeHaut = r(t, 8.9, 9.8); // se réduit et monte en en-tête
  const badgeY = interpolate(badgeHaut, [0, 1], [780, 250]);
  const badgeEch = interpolate(badgeHaut, [0, 1], [1.5, 0.42]);

  // ── Beat 3 · le chiffre choc ──
  const choc = sp(10.1, 14, 0.9);
  const chocOut = r(t, 12.6, 13.2);

  // ── Beat 4 · empilement des appareils, puis frise ──
  const pileA = APPAREILS.map((_, i) => sp(13.2 + i * 0.42, 11, 0.5));
  const friseA = r(t, 16.8, 17.8);

  // ── Beat 5 · empilement des activités, puis frise ──
  const pileB = ACTIVITES.map((_, i) => sp(18.2 + i * 0.42, 11, 0.5));
  const friseB = r(t, 21.4, 22.3);
  const suspens = sp(22.2, 12, 0.7);
  const suspensOut = r(t, 23.2, 23.7);

  // ── Beat 6 · comparaison ──
  const barreReel = r(t, 23.5, 26.0);
  const barreAnnonce = r(t, 27.0, 29.4);
  const compOut = r(t, 29.4, 30.0);

  // ── Beat 8 · nuage de complexité ──
  const montreCentre = sp(36.2, 13, 0.7);
  const mesurees = [0, 1, 2, 3].map((i) => sp(36.9 + i * 0.45, 11, 0.5));
  const nuage = r(t, 40.0, 45.6);
  const nuageOut = r(t, 45.8, 46.4);

  // ── Beat 9 · l'objet et son prix ──
  const objet = sp(46.2, 14, 0.9);
  const prix = sp(47.4, 12, 0.7);

  const entete = badgeHaut; // les frises se rangent sous le badge

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(58% 44% at 50% 42%, rgba(47,191,113,0.13) 0%, transparent 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${M.grille} 1px, transparent 1px), linear-gradient(90deg, ${M.grille} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          maskImage: "radial-gradient(52% 40% at 50% 44%, black 10%, transparent 78%)",
        }}
      />

      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* ── Beat 2 · compteur ── */}
        {compteur > 0 && compteurOut < 1 ? (
          <g opacity={compteur * (1 - compteurOut)}>
            <Txt x={540} y={840} taille={200} couleur={M.vert}>
              0
            </Txt>
            <Txt x={540} y={920} taille={32}>
              CALORIES MESURÉES EN LABORATOIRE
            </Txt>
          </g>
        ) : null}

        {/* ── Badge de crédibilité, qui reste ensuite en en-tête ── */}
        {badge > 0.01 ? (
          <g
            transform={`translate(${interpolate(badgeHaut, [0, 1], [540, 180])} ${badgeY}) scale(${Math.min(badge, 1.05) * badgeEch})`}
            opacity={Math.min(1, badge)}
          >
            <Badge />
          </g>
        ) : null}
        {badge > 0.01 ? (
          <g opacity={Math.min(1, badge) * (1 - badgeHaut * 0.45)}>
            <Txt
              x={interpolate(badgeHaut, [0, 1], [540, 268])}
              y={interpolate(badgeHaut, [0, 1], [920, 262])}
              taille={interpolate(badgeHaut, [0, 1], [36, 28])}
              ancre={badgeHaut > 0.5 ? "start" : "middle"}
            >
              ÉTUDE EN LABORATOIRE
            </Txt>
          </g>
        ) : null}

        {/* ── Beat 3 · + 50 % ── */}
        {choc > 0.01 && chocOut < 1 ? (
          <g
            transform={`translate(540 860) scale(${Math.min(choc, 1.06)})`}
            opacity={Math.min(1, choc) * (1 - chocOut)}
          >
            <Txt x={0} y={0} taille={230} couleur={M.corail}>
              + 50 %
            </Txt>
            <Txt x={0} y={80} taille={34}>
              D’ÉCART AVEC LA RÉALITÉ
            </Txt>
          </g>
        ) : null}

        {/* ── Beat 4 · appareils : pile verticale, puis frise en en-tête ── */}
        {pileA[0] > 0.01 ? (
          <g>
            {APPAREILS.map((a, i) => {
              const p = Math.min(1, pileA[i]);
              if (p <= 0) return null;
              const x = interpolate(friseA, [0, 1], [400, 210 + i * 104]);
              const y = interpolate(friseA, [0, 1], [700 + i * 190, 420]);
              const e = interpolate(friseA, [0, 1], [1, 0.3]) * p;
              const A = a.I;
              return (
                <g key={a.nom}>
                  <g transform={`translate(${x} ${y}) scale(${e})`}>
                    <A />
                  </g>
                  <g opacity={p * (1 - friseA)}>
                    <Txt x={x + 150} y={y + 14} ancre="start" taille={38} couleur={M.vert}>
                      {a.nom}
                    </Txt>
                  </g>
                </g>
              );
            })}
            <g opacity={friseA * (1 - r(t, 29.6, 30.0))}>
              {/* Libellé sous la frise : posé à sa hauteur, il recouvrait
                  les icônes. */}
              <Txt x={314} y={492} taille={24}>
                APPAREILS
              </Txt>
            </g>
          </g>
        ) : null}

        {/* ── Beat 5 · activités : même gabarit, réutilisé à l'identique ── */}
        {pileB[0] > 0.01 ? (
          <g>
            {ACTIVITES.map((a, i) => {
              const p = Math.min(1, pileB[i]);
              if (p <= 0) return null;
              const x = interpolate(friseB, [0, 1], [400, 626 + i * 90]);
              const y = interpolate(friseB, [0, 1], [660 + i * 165, 420]);
              const e = interpolate(friseB, [0, 1], [1, 0.27]) * p;
              const A = a.I;
              return (
                <g key={a.nom}>
                  <g transform={`translate(${x} ${y}) scale(${e})`}>
                    <A />
                  </g>
                  <g opacity={p * (1 - friseB)}>
                    <Txt x={x + 150} y={y + 14} ancre="start" taille={38} couleur={M.ambre}>
                      {a.nom}
                    </Txt>
                  </g>
                </g>
              );
            })}
            <g opacity={friseB * (1 - r(t, 29.6, 30.0))}>
              <Txt x={761} y={492} taille={24}>
                ACTIVITÉS
              </Txt>
            </g>
          </g>
        ) : null}

        {/* ── Suspens ── */}
        {suspens > 0.01 && suspensOut < 1 ? (
          <g
            transform={`translate(540 880) scale(${Math.min(suspens, 1.1)})`}
            opacity={Math.min(1, suspens) * (1 - suspensOut)}
          >
            <Txt x={0} y={0} taille={190} couleur={M.ambre}>
              ?
            </Txt>
          </g>
        ) : null}

        {/* ── Beat 6 · comparaison ── */}
        {barreReel > 0 && compOut < 1 ? (
          <g opacity={1 - compOut}>
            {[
              { p: barreReel, x: 360, h: 300, c: M.gris, lab: "MESURÉ", val: "430" },
              { p: barreAnnonce, x: 720, h: 560, c: M.corail, lab: "ANNONCÉ", val: "800" },
            ].map((b) => (
              <g key={b.lab}>
                <rect
                  x={b.x - 90}
                  y={1180 - b.h * b.p}
                  width={180}
                  height={b.h * b.p}
                  rx={14}
                  fill={b.c}
                  fillOpacity={0.2}
                  stroke={b.c}
                  strokeWidth={T}
                />
                <g opacity={b.p > 0.85 ? 1 : 0}>
                  <Txt x={b.x} y={1180 - b.h * b.p - 30} taille={56} couleur={b.c}>
                    {b.val}
                  </Txt>
                </g>
                <Txt x={b.x} y={1250} taille={32} opacity={b.p > 0.15 ? 1 : 0}>
                  {b.lab}
                </Txt>
              </g>
            ))}
            <line x1={230} y1={1190} x2={850} y2={1190} stroke={M.gris} strokeWidth={4} />
            {/* Sous les libellés : posé plus haut, il passait derrière la
                barre « annoncé » une fois celle-ci montée. */}
            <Txt x={540} y={1350} taille={44} opacity={barreAnnonce > 0.9 ? 1 : 0} couleur={M.corail}>
              PRESQUE LE DOUBLE
            </Txt>
          </g>
        ) : null}

        {/* ── Beat 8 · nuage de complexité ── */}
        {montreCentre > 0.01 && nuageOut < 1 ? (
          <g opacity={1 - nuageOut}>
            <g transform={`translate(540 800) scale(${Math.min(montreCentre, 1.05) * 1.7})`}>
              <Montre />
            </g>
            {[
              { l: "rythme cardiaque", a: -140 },
              { l: "âge", a: -40 },
              { l: "poids", a: 40 },
              { l: "mouvement", a: 140 },
            ].map((b, i) => {
              const p = Math.min(1, mesurees[i]);
              if (p <= 0) return null;
              const rad = (b.a * Math.PI) / 180;
              const x = 540 + Math.cos(rad) * 320;
              const y = 800 + Math.sin(rad) * 250;
              return (
                <g key={b.l} transform={`translate(${x} ${y}) scale(${p})`}>
                  <rect
                    x={-140}
                    y={-34}
                    width={280}
                    height={68}
                    rx={34}
                    fill={M.vert}
                    fillOpacity={0.16}
                    stroke={M.vert}
                    strokeWidth={4}
                  />
                  <Txt x={0} y={10} taille={26} couleur={M.vert}>
                    {b.l}
                  </Txt>
                </g>
              );
            })}

            {/* Ce que le capteur ne voit pas : surcharge volontaire */}
            {NON_MESURE.map((l, i) => {
              const p = Math.min(1, nuage * NON_MESURE.length - i);
              if (p <= 0) return null;
              const x = 110 + alea(i) * 860;
              const y = 460 + alea(i + 40) * 900;
              const ech = 0.7 + alea(i + 80) * 0.5;
              return (
                <g key={l} transform={`translate(${x} ${y}) scale(${p * ech})`} opacity={0.75}>
                  <rect
                    x={-125}
                    y={-28}
                    width={250}
                    height={56}
                    rx={28}
                    fill={M.fondCase}
                    stroke={M.gris}
                    strokeWidth={3}
                  />
                  <Txt x={0} y={9} taille={24} couleur={M.gris}>
                    {l}
                  </Txt>
                </g>
              );
            })}
          </g>
        ) : null}

        {/* ── Beat 9 · l'objet et son prix ── */}
        {objet > 0.01 ? (
          <g opacity={Math.min(1, objet)}>
            <g transform={`translate(540 700) scale(${Math.min(objet, 1.04) * 3.4})`}>
              <Montre c={M.gris} />
            </g>
            {/* Le prix est posé sous la montre, pas incrusté dessus : par-dessus
                le boîtier, il se confondait avec le tracé de l'objet. */}
            <g transform={`translate(540 1150) scale(${Math.min(prix, 1.08)})`} opacity={Math.min(1, prix)}>
              <Txt x={0} y={0} taille={150} couleur={M.vert}>
                1200 €
              </Txt>
              <Txt x={0} y={62} taille={34}>
                ET TOUJOURS PAS EXACT
              </Txt>
            </g>
          </g>
        ) : null}

        {/* Filigrane de l'en-tête, gardé pendant toute la suite */}
        <g opacity={entete * 0.0} />
      </svg>
    </AbsoluteFill>
  );
};
