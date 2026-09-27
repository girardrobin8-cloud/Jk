import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { ANIM_DEBUT, ANIM_FIN } from "./reperes";

/**
 * Les 52 s de motion design de « NEAT », en UN SEUL composant continu.
 *
 * `t` est le temps ABSOLU du montage, pour que les bornes de reperes.ts
 * s'appliquent sans conversion — et pour qu'un recalage sur la vraie prise ne
 * soit qu'un changement de nombres dans T.
 *
 * Les règles du brief, tenues par la structure :
 *
 * 1. AUCUNE SUPERPOSITION, avec un vrai espacement. Chaque élément a sa bande
 *    horizontale réservée, et à l'intérieur de la scène les positions sont
 *    déclarées une fois dans POSTES, commentées avec leur emprise. Le passage
 *    le plus contraint est la comparaison des deux silhouettes, où l'accolade
 *    centrale doit tenir entre une grille d'icônes à gauche et une silhouette à
 *    droite : elle est coupée en deux segments pour laisser son étiquette
 *    respirer au milieu, plutôt que de la poser par-dessus.
 * 2. AUCUNE COUPE SÈCHE. Le camembert ne disparaît pas pour laisser place aux
 *    silhouettes : il se contracte vers son centre pendant qu'elles montent. La
 *    flèche « +1000 kcal » ne s'efface pas non plus, elle se divise en ses deux
 *    branches. Les trois parts du camembert se dessinent à la suite l'une de
 *    l'autre, jamais en fondu.
 * 3. AUCUN BRUITAGE. Rien à faire ici — le montage ne porte que la voix.
 * 4. JAMAIS D'ÉCRAN FIGÉ PLUS DE DEUX OU TROIS SECONDES. Le beat le plus long
 *    (B7, quinze secondes) est découpé en trois temps distincts, eux-mêmes
 *    subdivisés.
 *
 * Les repères de temps sont PRÉDITS et non mesurés : voir l'avertissement en
 * tête de reperes.ts.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));
const melange = (a: number, b: number, p: number) => a + (b - a) * p;

// ── Repères de temps, en secondes absolues ───────────────────────────────
/**
 * Les fenêtres citées en commentaire sont le découpage syllabique interne à
 * chaque beat. Règle tenue partout : un élément qui illustre un mot COMMENCE à
 * monter avant ce mot, pour être en place quand il est dit.
 */
const T = {
  debut: ANIM_DEBUT,

  // ── B2 — 4,83 → 11,14 : le cercle et sa légende
  cercle: 4.9, // « Ce que ton corps dépense chaque jour… »  [4,83 → 7,80]
  legende: [7.75, 8.95, 9.65], // « …métabolisme, digestion, activité »

  // ── B3 — 11,14 → 19,68 : le métabolisme de base
  part1: 11.3, // le camembert se dessine pendant toute la phrase
  pourcent1: 16.5, // « …soixante à soixante-dix pour cent »  [15,04 → 19,68]

  // ── B4 — 19,68 → 22,66 : la digestion
  part2: 19.75,
  pourcent2: 21.55, // « …encore dix pour cent »

  // ── B5 — 22,66 → 29,34 : le sport structuré
  part3: 23.0, // « Et ta séance de sport ? »               [22,66 → 23,77]
  haltere: 23.25,
  centKcal: 27.8, // « …moins de cent calories par jour »    [26,74 → 29,34]

  // ── B6 — 29,34 → 41,78 : la révélation
  sortieCamembert: 29.45, // le camembert se contracte, les silhouettes montent
  silhouettes: 29.9,
  // Les quatre icônes suivent l'énumération, une par terme.
  icones: [32.85, 33.5, 34.15, 34.8], // « marcher, escaliers, debout, gigoter »
  neat: 35.35, // « Ça s'appelle le NEAT »                   [35,47 → 36,40]
  accolade: 36.9,
  deuxMille: 37.3, // « …jusqu'à deux mille calories »       [36,40 → 41,78]

  // ── B7 — 41,78 → 56,82 : l'étude
  sortieSilhouettes: 41.85,
  grille: 42.3, // les seize volontaires
  fleche: 43.1, // « …suralimenté des volontaires de mille calories »
  semaines: 45.6, // « …pendant huit semaines »              [41,78 → 47,72]
  branches: 47.85, // la flèche se divise                    [47,72 → 53,29]
  brancheNeat: 48.5, // « les deux tiers… »
  brancheReste: 49.5,
  sortieBranches: 52.9,
  barres: 53.35, // « …une différence de prise de graisse »  [53,29 → 56,82]
  dixFois: 55.1, // « …allant jusqu'à dix fois »

  fin: ANIM_FIN,
};

// ── Bandes horizontales réservées ────────────────────────────────────────
const GOUTTIERE = 72;

const BANDES = (() => {
  const enTete = { haut: 210, bas: 470 };
  const scene = { haut: enTete.bas + GOUTTIERE, bas: enTete.bas + GOUTTIERE + 664 };
  const socle = { haut: scene.bas + GOUTTIERE, bas: scene.bas + GOUTTIERE + 282 };
  return { enTete, scene, socle };
})();

const CX = 540;

/**
 * Les postes de la scène, avec leur emprise réelle.
 *
 * Les trois temps de l'animation — camembert, comparaison, étude — ne sont
 * jamais à l'écran ensemble et peuvent donc partager les mêmes coordonnées. À
 * l'intérieur d'un temps, en revanche, aucune emprise n'en recoupe une autre.
 */
const POSTES = {
  /** Camembert.                                x 340..740   y 650..1050 */
  camembert: { x: CX, y: 850, r: 200 },
  /** Légende : trois étiquettes en arc, hors du disque.
   *  gauche  x 104..304 · droite x 845..1020 · bas x 428..678 y 1122..1158 */
  legende: [
    { puce: 76, texte: 104, y: 780, ancre: "start" as const },
    { puce: 1020, texte: 1000, y: 780, ancre: "end" as const },
    { puce: 400, texte: 428, y: 1140, ancre: "start" as const },
  ],

  /** Comparaison.  icônes x 135..365 · accolade x 432..648 · droite x 760..900 */
  silhouetteG: { x: 250, y: 1020 },
  silhouetteD: { x: 830, y: 1020 },
  icones: [
    { x: 175, y: 690 },
    { x: 325, y: 690 },
    { x: 175, y: 810 },
    { x: 325, y: 810 },
  ],
  accolade: { x: CX, haut: 650, bas: 1150, creux: 856, reprise: 944 },

  /** Étude, temps 1 : la grille de seize.     x 375..705   y 793..1107 */
  grille: { x: CX, y: 950, pas: 110, ligne: 105 },
  flecheHaut: 600,
  flecheBas: 770,
  /** Étude, temps 2 : les deux branches.      x 300..770   y 700..1000 */
  branches: { sommet: 700, bas: 1000, gauche: [300, 560], droite: [640, 770] },
  /** Étude, temps 3 : les deux barres.        x 280..800   y 600..1150 */
  barres: { bas: 1150, gauche: 340, droite: 740, largeur: 120 },
};

const BASE = M.bleuClair; // métabolisme de base : la part dominante
const DIGESTION = M.ambre;
const SPORT = M.texte; // la part minuscule : le blanc la rend visible malgré sa taille
const ACCENT = M.bleuClair;
const APPUI = M.gris;

/** Les trois parts, dans l'ordre où elles se dessinent. */
const PARTS = [
  { cle: "base", de: 0, a: 0.65, couleur: BASE, haut: "MÉTABOLISME", bas: "DE BASE" },
  { cle: "digestion", de: 0.65, a: 0.75, couleur: DIGESTION, haut: "DIGESTION", bas: "" },
  { cle: "sport", de: 0.75, a: 0.785, couleur: SPORT, haut: "ACTIVITÉ PHYSIQUE", bas: "" },
];

// ── Petites briques de dessin ────────────────────────────────────────────

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  poids?: number;
  espace?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = APPUI, opacity = 1, poids = 700, espace = 0, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    fill={couleur}
    fontSize={taille}
    fontWeight={poids}
    letterSpacing={espace}
    opacity={opacity}
    textAnchor={ancre}
    dominantBaseline="middle"
    fontFamily={TITRE_FONT}
  >
    {children}
  </text>
);

/**
 * Une part de camembert, de `de` à `a` en fraction de tour, depuis midi et dans
 * le sens horaire. Renvoie null si la part est vide, pour que rien ne soit
 * tracé avant que le remplissage n'ait commencé.
 */
const part = (cx: number, cy: number, rayon: number, de: number, a: number) => {
  if (a - de <= 0.0005) return null;
  const point = (f: number) => {
    const ang = (f * 360 - 90) * (Math.PI / 180);
    return [cx + rayon * Math.cos(ang), cy + rayon * Math.sin(ang)];
  };
  const [x1, y1] = point(de);
  const [x2, y2] = point(a);
  const grand = a - de > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${rayon} ${rayon} 0 ${grand} 1 ${x2} ${y2} Z`;
};

/** Silhouette debout, de face. */
const Silhouette: React.FC<{ x: number; y: number; k?: number; couleur?: string; opacity?: number }> = ({
  x,
  y,
  k = 1,
  couleur = M.texte,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={opacity}>
    <circle cx={0} cy={-104} r={26} fill={couleur} />
    <path d="M0 -74 L0 6" stroke={couleur} strokeWidth={17} strokeLinecap="round" />
    <path d="M0 -64 L-36 -6 M0 -64 L36 -6" stroke={couleur} strokeWidth={13} strokeLinecap="round" />
    <path d="M0 6 L-26 94 M0 6 L26 94" stroke={couleur} strokeWidth={15} strokeLinecap="round" />
  </g>
);

/** Haltère miniature. */
const Haltere: React.FC<{ x: number; y: number; k?: number; couleur?: string }> = ({
  x,
  y,
  k = 1,
  couleur = SPORT,
}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-26} y={-5} width={52} height={10} rx={4} fill={couleur} />
    <rect x={-40} y={-19} width={15} height={38} rx={5} fill={couleur} />
    <rect x={25} y={-19} width={15} height={38} rx={5} fill={couleur} />
  </g>
);

/** Les quatre gestes du NEAT. Dessinés dans un carré de 80 centré sur l'origine. */
const Marche: React.FC = () => (
  <g stroke={ACCENT} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={4} cy={-30} r={9} fill={ACCENT} stroke="none" />
    <path d="M4 -20 L0 4" />
    <path d="M0 4 L-16 30 M0 4 L18 26" />
    <path d="M2 -12 L-16 -4 M2 -12 L20 -18" />
  </g>
);

/**
 * Trois marches, dessinées comme un profil d'escalier continu et non comme
 * trois barres séparées : trois rectangles croissants se lisaient comme un
 * histogramme, ce qui, dans une vidéo pleine de graphiques, était le pire
 * contresens possible.
 */
const Escaliers: React.FC = () => (
  <g>
    <path
      d="M-36 32 L-36 10 L-12 10 L-12 -8 L12 -8 L12 -26 L36 -26 L36 32 Z"
      fill={ACCENT}
    />
    <path
      d="M-36 10 L-12 10 L-12 -8 L12 -8 L12 -26 L36 -26"
      fill="none"
      stroke={M.fond}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </g>
);

const Debout: React.FC = () => (
  <g stroke={ACCENT} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-30} r={9} fill={ACCENT} stroke="none" />
    <path d="M0 -20 L0 8" />
    <path d="M0 -14 L-13 2 M0 -14 L13 2" />
    <path d="M0 8 L-8 30 M0 8 L8 30" />
    <path d="M-24 34 L24 34" opacity={0.55} />
  </g>
);

const Gigoter: React.FC = () => (
  <g stroke={ACCENT} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={0} r={13} fill={ACCENT} stroke="none" />
    <path d="M-22 -16 C-30 -6 -30 6 -22 16" />
    <path d="M22 -16 C30 -6 30 6 22 16" />
    <path d="M-34 -26 C-46 -10 -46 10 -34 26" opacity={0.5} />
    <path d="M34 -26 C46 -10 46 10 34 26" opacity={0.5} />
  </g>
);

const GESTES = [
  { cle: "marche", Icone: Marche },
  { cle: "escaliers", Icone: Escaliers },
  { cle: "debout", Icone: Debout },
  { cle: "gigoter", Icone: Gigoter },
];

// ── L'animation ──────────────────────────────────────────────────────────

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const vie = Math.min(rd(t, T.debut, T.debut + 0.4), 1 - rd(t, T.fin - 0.26, T.fin));
  if (vie <= 0) return null;

  const souffle = 1 + 0.006 * Math.sin(2 * Math.PI * (t - T.debut) / 7.5);

  // ── Le camembert ───────────────────────────────────────────────────────
  const cercle = rd(t, T.cercle, T.cercle + 0.6);
  /**
   * Le camembert ne s'efface pas : il se contracte vers son centre pendant que
   * les silhouettes montent. Les deux mouvements se chevauchent dans le TEMPS,
   * jamais dans l'espace — le disque a déjà perdu l'essentiel de son rayon
   * quand les silhouettes atteignent leur place.
   */
  const contraction = rd(t, T.sortieCamembert, T.sortieCamembert + 0.75);
  const rayon = POSTES.camembert.r * (1 - contraction);
  const vivant = cercle * (1 - contraction);
  const avancees = [
    rd(t, T.part1, T.part1 + 5.0),
    rd(t, T.part2, T.part2 + 1.5),
    rd(t, T.part3, T.part3 + 0.9),
  ];

  const pourcent1 = rd(t, T.pourcent1, T.pourcent1 + 0.6) * (1 - contraction);
  const pourcent2 = rd(t, T.pourcent2, T.pourcent2 + 0.5) * (1 - contraction);
  const haltere = rd(t, T.haltere, T.haltere + 0.5) * (1 - contraction);
  const centKcal = rd(t, T.centKcal, T.centKcal + 0.55) * (1 - rd(t, T.sortieCamembert, T.sortieCamembert + 0.4));

  // ── La comparaison ─────────────────────────────────────────────────────
  const sortieComparaison = 1 - rd(t, T.sortieSilhouettes, T.sortieSilhouettes + 0.5);
  const silhouettes = rd(t, T.silhouettes, T.silhouettes + 0.65) * sortieComparaison;
  const neat = rd(t, T.neat, T.neat + 0.55) * sortieComparaison;
  const accolade = rd(t, T.accolade, T.accolade + 0.6) * sortieComparaison;
  const deuxMille = rd(t, T.deuxMille, T.deuxMille + 0.55) * sortieComparaison;

  // ── L'étude ────────────────────────────────────────────────────────────
  const sortieGrille = 1 - rd(t, T.branches - 0.55, T.branches - 0.05);
  const grille = rd(t, T.grille, T.grille + 0.6) * sortieGrille;
  const fleche = rd(t, T.fleche, T.fleche + 0.6) * sortieGrille;
  const semaines = rd(t, T.semaines, T.semaines + 0.5) * sortieGrille;

  const sortieBranches = 1 - rd(t, T.sortieBranches, T.sortieBranches + 0.4);
  const branches = rd(t, T.branches, T.branches + 0.7) * sortieBranches;
  const brancheNeat = rd(t, T.brancheNeat, T.brancheNeat + 0.5) * sortieBranches;
  const brancheReste = rd(t, T.brancheReste, T.brancheReste + 0.5) * sortieBranches;

  const barres = rd(t, T.barres, T.barres + 0.7);
  const dixFois = rd(t, T.dixFois, T.dixFois + 0.55);

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: vie }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>
          {/* ══ CAMEMBERT ═════════════════════════════════════════════════ */}
          {vivant > 0 && (
            <g opacity={vivant}>
              <circle
                cx={POSTES.camembert.x}
                cy={POSTES.camembert.y}
                r={rayon}
                fill="none"
                stroke={M.noir}
                strokeWidth={5}
              />
              {PARTS.map((p, i) => {
                const d = part(
                  POSTES.camembert.x,
                  POSTES.camembert.y,
                  rayon,
                  p.de,
                  melange(p.de, p.a, avancees[i]),
                );
                return d === null ? null : <path key={p.cle} d={d} fill={p.couleur} opacity={0.92} />;
              })}
              {/* Le disque est évidé en son centre. Ce n'est pas un ornement :
                  le brief demande que « 60-70 % » s'incruste au centre, et un
                  camembert rempli aux trois quarts laisse un quartier de fond
                  nu — le nombre y devenait illisible dès qu'il le croisait.
                  L'évidement lui donne un fond uniforme quel que soit le
                  remplissage. */}
              <circle
                cx={POSTES.camembert.x}
                cy={POSTES.camembert.y}
                r={rayon * 0.62}
                fill={M.fond}
              />
            </g>
          )}

          {/* Légende : trois étiquettes en arc, hors du disque, chacune avec la
              puce de couleur de sa part. C'est la puce qui fait l'association,
              pas la position — la part « sport » est trop fine pour qu'une
              étiquette puisse la désigner de l'extérieur. */}
          {PARTS.map((p, i) => {
            const e = rd(t, T.legende[i], T.legende[i] + 0.55) * (1 - contraction);
            if (e <= 0) return null;
            const poste = POSTES.legende[i];
            return (
              <g key={`leg-${p.cle}`} opacity={e} transform={`translate(0 ${melange(14, 0, e)})`}>
                <circle cx={poste.puce} cy={poste.y} r={11} fill={p.couleur} />
                {/* Une étiquette sur deux lignes se centre sur son poste : la
                    première remonte, la seconde descend. Sur une seule ligne,
                    le poste est la ligne. */}
                <Txt x={poste.texte} y={p.bas ? poste.y - 19 : poste.y} taille={28} couleur={M.texte} espace={2} ancre={poste.ancre}>
                  {p.haut}
                </Txt>
                {p.bas && (
                  <Txt x={poste.texte} y={poste.y + 19} taille={28} couleur={M.texte} espace={2} ancre={poste.ancre}>
                    {p.bas}
                  </Txt>
                )}
              </g>
            );
          })}

          {/* « 60-70 % » au centre du disque, une fois le remplissage terminé. */}
          {pourcent1 > 0 && (
            <Txt
              x={POSTES.camembert.x}
              y={POSTES.camembert.y}
              taille={melange(48, 56, pourcent1)}
              couleur={BASE}
              opacity={pourcent1}
            >
              60-70 %
            </Txt>
          )}

          {/* « 10 % » sous l'étiquette de la digestion. */}
          {pourcent2 > 0 && (
            <Txt
              x={POSTES.legende[1].texte}
              y={POSTES.legende[1].y + melange(48, 42, pourcent2)}
              taille={46}
              couleur={DIGESTION}
              opacity={pourcent2}
              ancre="end"
            >
              10 %
            </Txt>
          )}

          {/* L'haltère, à côté de l'étiquette « activité physique ». */}
          {haltere > 0 && (
            <g opacity={haltere}>
              <Haltere x={POSTES.legende[2].texte + 125} y={POSTES.legende[2].y + 48} k={0.62} />
            </g>
          )}

          {/* ══ SILHOUETTES ═══════════════════════════════════════════════ */}
          {silhouettes > 0 && (
            <g opacity={silhouettes} transform={`translate(0 ${melange(48, 0, silhouettes)})`}>
              <Silhouette x={POSTES.silhouetteG.x} y={POSTES.silhouetteG.y} />
              <Silhouette x={POSTES.silhouetteD.x} y={POSTES.silhouetteD.y} />
            </g>
          )}

          {/* Les quatre gestes, autour de la silhouette de gauche seulement. */}
          {GESTES.map(({ cle, Icone }, i) => {
            const e = rd(t, T.icones[i], T.icones[i] + 0.5) * sortieComparaison;
            if (e <= 0) return null;
            const poste = POSTES.icones[i];
            return (
              <g
                key={cle}
                opacity={e}
                transform={`translate(${poste.x} ${poste.y}) scale(${melange(0.62, 1, e)})`}
              >
                <Icone />
              </g>
            );
          })}

          {/* Un seul geste, très pâle, du côté droit : « quasi absentes ». */}
          {silhouettes > 0 && (
            <g
              opacity={rd(t, T.icones[1], T.icones[1] + 0.6) * sortieComparaison * 0.3}
              transform={`translate(${POSTES.silhouetteD.x} 750) scale(0.9)`}
            >
              <Debout />
            </g>
          )}

          {/* L'accolade, en DEUX segments : son étiquette se loge dans le creux
              au lieu de se poser dessus. */}
          {accolade > 0 && (
            <g opacity={accolade} stroke={APPUI} strokeWidth={5} fill="none" strokeLinecap="round">
              {(
                [
                  [POSTES.accolade.haut, POSTES.accolade.creux],
                  [POSTES.accolade.reprise, POSTES.accolade.bas],
                ] as const
              ).map(([a, b], i) => {
                const h = melange(a, b, accolade);
                return (
                  <g key={i}>
                    <line x1={POSTES.accolade.x} y1={a} x2={POSTES.accolade.x} y2={h} />
                    <line x1={POSTES.accolade.x - 18} y1={a} x2={POSTES.accolade.x + 18} y2={a} />
                  </g>
                );
              })}
            </g>
          )}

          {deuxMille > 0 && (
            <Txt
              x={POSTES.accolade.x}
              y={(POSTES.accolade.creux + POSTES.accolade.reprise) / 2}
              taille={melange(38, 42, deuxMille)}
              couleur={ACCENT}
              espace={1}
              opacity={deuxMille}
            >
              2000 KCAL
            </Txt>
          )}

          {/* ══ ÉTUDE ═════════════════════════════════════════════════════ */}
          {grille > 0 &&
            Array.from({ length: 16 }, (_, i) => {
              const col = i % 4;
              const ligne = Math.floor(i / 4);
              // Apparition en cascade : la grille se peuple, elle ne surgit pas.
              const e = rd(grille, i / 16, i / 16 + 0.22);
              if (e <= 0) return null;
              return (
                <Silhouette
                  key={i}
                  x={POSTES.grille.x + (col - 1.5) * POSTES.grille.pas}
                  y={POSTES.grille.y + (ligne - 1.5) * POSTES.grille.ligne + 42}
                  k={0.36}
                  couleur={APPUI}
                  opacity={e * grille}
                />
              );
            })}

          {/* La flèche de suralimentation, qui descend sur le groupe. */}
          {fleche > 0 && (
            <g opacity={fleche}>
              <line
                x1={CX}
                y1={POSTES.flecheHaut}
                x2={CX}
                y2={melange(POSTES.flecheHaut, POSTES.flecheBas, fleche)}
                stroke={DIGESTION}
                strokeWidth={9}
                strokeLinecap="round"
              />
              <path
                d={`M ${CX - 20} ${POSTES.flecheBas - 26} L ${CX} ${POSTES.flecheBas} L ${CX + 20} ${POSTES.flecheBas - 26}`}
                fill="none"
                stroke={DIGESTION}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={rd(fleche, 0.72, 1)}
              />
            </g>
          )}

          {semaines > 0 && (
            <Txt x={CX} y={melange(1168, 1160, semaines)} taille={32} couleur={APPUI} espace={4} opacity={semaines}>
              16 VOLONTAIRES · 8 SEMAINES
            </Txt>
          )}

          {/* Les deux branches, asymétriques : deux tiers et un tiers. */}
          {branches > 0 && (
            <g opacity={branches}>
              {/* Le tronc de la flèche reste visible au-dessus du point de
                  division : sans lui, les deux branches surgiraient d'un point
                  sans origine et la lecture « ça se divise en deux » se perd. */}
              <line
                x1={CX}
                y1={POSTES.flecheHaut}
                x2={CX}
                y2={POSTES.branches.sommet}
                stroke={DIGESTION}
                strokeWidth={9}
                strokeLinecap="round"
              />
              {(
                [
                  { bornes: POSTES.branches.gauche, sommet: [CX - 10, CX - 2], couleur: ACCENT, e: brancheNeat, haut: "NEAT", bas: "2 / 3" },
                  { bornes: POSTES.branches.droite, sommet: [CX + 2, CX + 10], couleur: APPUI, e: brancheReste, haut: "RESTE", bas: "1 / 3" },
                ] as const
              ).map((b, i) => {
                const bas = melange(POSTES.branches.sommet, POSTES.branches.bas, branches);
                const [g, d] = b.bornes;
                // Les deux branches partent de MOITIÉS distinctes du sommet.
                // Elles partaient toutes deux de CX-9 à CX+9 et se recouvraient
                // donc sur toute la largeur du tronc, ce que le brief interdit.
                const [sg, sd] = b.sommet;
                return (
                  <g key={i}>
                    <path
                      d={`M ${sg} ${POSTES.branches.sommet} L ${sd} ${POSTES.branches.sommet} L ${d} ${bas} L ${g} ${bas} Z`}
                      fill={b.couleur}
                      opacity={0.85}
                    />
                    {b.e > 0 && (
                      <g opacity={b.e}>
                        <Txt x={(g + d) / 2} y={POSTES.branches.bas + 52} taille={34} couleur={b.couleur} espace={3}>
                          {b.haut}
                        </Txt>
                        <Txt x={(g + d) / 2} y={POSTES.branches.bas + 100} taille={44} couleur={b.couleur}>
                          {b.bas}
                        </Txt>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Les deux prises de graisse, dans un rapport de un à dix. */}
          {barres > 0 &&
            (
              [
                { x: POSTES.barres.gauche, h: 55, couleur: ACCENT, label: "BEAUCOUP" },
                { x: POSTES.barres.droite, h: 550, couleur: M.corail, label: "PEU" },
              ] as const
            ).map((b, i) => {
              const e = rd(barres, i * 0.18, i * 0.18 + 0.8);
              if (e <= 0) return null;
              return (
                <g key={i} opacity={barres}>
                  <rect
                    x={b.x - POSTES.barres.largeur / 2}
                    y={POSTES.barres.bas - b.h * e}
                    width={POSTES.barres.largeur}
                    height={b.h * e}
                    rx={14}
                    fill={b.couleur}
                    opacity={0.9}
                  />
                  <Txt x={b.x} y={POSTES.barres.bas + 46} taille={28} couleur={APPUI} espace={2}>
                    {b.label}
                  </Txt>
                  <Txt x={b.x} y={POSTES.barres.bas + 84} taille={24} couleur={APPUI} espace={2}>
                    DE NEAT
                  </Txt>
                </g>
              );
            })}

          {dixFois > 0 && (
            <Txt
              x={CX}
              y={melange(880, 860, dixFois)}
              taille={melange(80, 96, dixFois)}
              couleur={M.texte}
              opacity={dixFois}
            >
              ×10
            </Txt>
          )}

          {/* ══ EN-TÊTE ═══════════════════════════════════════════════════ */}
          {/* Le camembert occupe vingt-cinq secondes ; sans titre, le tiers
              haut de l'image restait vide tout du long. Le texte reprend
              exactement ce que dit la voix — « ce que ton corps dépense chaque
              jour » — et n'ajoute donc aucune affirmation. */}
          {cercle > 0 && (
            <Txt
              x={CX}
              y={BANDES.enTete.haut + melange(150, 140, cercle)}
              taille={56}
              couleur={M.texte}
              espace={4}
              opacity={cercle * (1 - contraction)}
            >
              TA DÉPENSE QUOTIDIENNE
            </Txt>
          )}

          {neat > 0 && (
            <g opacity={neat} transform={`translate(0 ${melange(-22, 0, neat)})`}>
              <Txt x={CX} y={BANDES.enTete.haut + 96} taille={116} couleur={ACCENT} espace={6}>
                NEAT
              </Txt>
              <Txt x={CX} y={BANDES.enTete.haut + 186} taille={27} couleur={APPUI} espace={3}>
                NON-EXERCISE ACTIVITY THERMOGENESIS
              </Txt>
            </g>
          )}

          {(grille > 0 || branches > 0 || barres > 0) && (
            <g opacity={Math.max(fleche, branches, barres)}>
              <Txt x={CX} y={BANDES.enTete.haut + 100} taille={76} couleur={DIGESTION} espace={1}>
                +1000 KCAL/JOUR
              </Txt>
            </g>
          )}

          {/* ══ SOCLE ═════════════════════════════════════════════════════ */}
          {centKcal > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + melange(78, 68, centKcal)}
              taille={melange(44, 50, centKcal)}
              couleur={SPORT}
              espace={2}
              opacity={centKcal}
            >
              MOINS DE 100 KCAL/JOUR
            </Txt>
          )}

          {dixFois > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + melange(78, 68, dixFois)}
              taille={44}
              couleur={APPUI}
              espace={2}
              opacity={dixFois}
            >
              PRISE DE GRAISSE
            </Txt>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
