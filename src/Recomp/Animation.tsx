import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { ANIM_DEBUT, ANIM_FIN } from "./reperes";

/**
 * Les 37 s de motion design de « recomposition corporelle », en UN SEUL
 * composant continu.
 *
 * Le brief pose quatre règles dures, et c'est la structure du composant qui les
 * tient, pas une relecture au montage :
 *
 * 1. AUCUN CHEVAUCHEMENT, avec un espacement visible. Chaque élément a sa bande
 *    horizontale réservée — rail, en-tête, scène, socle — séparées par une
 *    gouttière. À l'intérieur de la scène, les positions sont déclarées une
 *    fois dans POSTES et commentées avec l'emprise qu'elles occupent : c'est le
 *    seul endroit à relire pour vérifier qu'un ajout ne recouvre rien.
 * 2. AUCUNE COUPE SÈCHE. Rien n'apparaît sans venir d'ailleurs. Les trois
 *    cartes numérotées de l'ouverture sont les mêmes objets d'un bout à
 *    l'autre : elles se rangent dans le rail, en ressortent à leur tour, se
 *    changent en icône, puis y retournent. L'haltère devient la pile de barres,
 *    la flamme devient les deux barres calorique, la croix rouge devient le
 *    check vert.
 * 3. AUCUN BRUITAGE. Rien à faire ici — c'est le montage qui porte la bande
 *    son, et il ne monte que la voix. La conséquence pour l'animation est
 *    qu'aucune transition ne peut compter sur un son pour se faire remarquer :
 *    chacune doit se suffire visuellement, d'où des fondus lents doublés d'un
 *    déplacement ou d'un changement d'échelle.
 * 4. JAMAIS D'ÉCRAN FIGÉ PLUS DE DEUX OU TROIS SECONDES. Le beat le plus long
 *    (B4, huit secondes) est subdivisé en quatre micro-événements décalés, et
 *    une respiration lente porte l'ensemble.
 *
 * `t` est le temps ABSOLU du montage, pour que les bornes de reperes.ts
 * s'appliquent sans conversion.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));
const melange = (a: number, b: number, p: number) => a + (b - a) * p;

// ── Repères de temps, en secondes absolues ───────────────────────────────
/**
 * Chaque valeur tombe sur le groupe de parole que la voix prononce à cet
 * instant. Les fenêtres citées en commentaire sont celles que rend
 * `scripts/caler.py` : elles permettent de vérifier un calage sans relancer
 * l'analyse.
 *
 * Règle tenue partout : un élément qui illustre un mot COMMENCE à monter avant
 * ce mot pour être en place quand il est dit. Un fondu de six dixièmes lancé
 * sur la syllabe arrive une demi-seconde trop tard.
 */
const T = {
  debut: ANIM_DEBUT, // le hook est fini ; l'animation peut entrer

  // B2 — 7,78 → 11,31 « Voici les trois choses dont tu as besoin… »
  titre: 7.78,
  sousTitre: 8.45,
  cartes: 9.15, // « …pour vraiment réussir ta recomposition »   [9,33 → 11,31]

  // B3 — 11,87 → 13,23 « En un, c'est comment tu t'entraines »
  item1: 11.87,
  morphe1: 12.25,
  label1: 12.5,

  // B4 — 13,38 → 21,21
  haltere: 13.38, // « Soulever lourd »                          [13,38 → 14,95]
  echec: 14.95, // « ça ne suffit pas… proche de l'échec »       [14,95 → 17,45]
  pile: 15.45, // la pile se construit pendant la phrase
  badge1: 17.25, // « une bonne technique d'exécution »          [17,45 → 19,54]
  badge2: 19.34, // « avec un maximum de tension mécanique »     [19,54 → 21,21]

  // B5 — 21,80 → 23,19 « Tu en as besoin pour construire du muscle »
  repli1: 21.45, // haltère, pile et badges se retirent
  muscle: 22.45, // « …du muscle » tombe à 22,9

  // B6 — 23,81 → 25,14 « En deux, ton apport calorique »
  item2: 23.60,
  morphe2: 24.05,
  label2: 24.35,

  // B7 — 25,67 → 31,65
  calendrier: 26.35, // « …et des années d'expérience »          [26,6 → 27,76]
  barres: 27.75, // « tu devras ajuster… »                       [27,76 → 31,65]
  deficit: 28.85, // « …un léger déficit calorique » tombe à 28,9

  // B8 — 32,02 → 33,25 « En trois, tes protéines »
  item3: 31.84,
  morphe3: 32.25,
  label3: 32.5,

  // B9 — 33,76 → 40,08
  graphes: 33.60, // « Sans protéines, tu peux perdre du gras »  [33,76 → 34,98]
  checkA: 34.30, // le premier graphique est validé d'emblée
  croixB: 35.75, // « …beaucoup de mal » tombe à 36,0
  morpheCheck: 38.20, // « Avec assez de protéines… les deux en même temps »

  // B10 — 40,52 → 44,93
  repli3: 40.10,
  valeur1: 40.45, // « un virgule six »                          [40,52 → 41,39]
  valeur2: 41.55, // « à deux virgule deux grammes »             [41,39 → 42,69]
  parKilo: 43.60, // « par kilo de poids de corps »              [43,78 → 44,93]

  fin: ANIM_FIN, // la parole revient au plan filmé
};

// ── Bandes horizontales réservées ────────────────────────────────────────
/**
 * Le découpage vertical qui garantit l'absence de chevauchement.
 *
 * Les bandes ne se touchent pas : GOUTTIERE les sépare. Le brief ne demande pas
 * seulement l'absence de recouvrement mais « un vrai espacement entre chaque
 * bloc » — des bandes jointives satisfaisaient la lettre de la règle et pas son
 * intention, les éléments se retrouvant collés bord à bord.
 */
const GOUTTIERE = 72;

const BANDES = (() => {
  const rail = { haut: 132, bas: 196 }; // les trois pastilles 1/2/3
  const enTete = { haut: rail.bas + GOUTTIERE, bas: rail.bas + GOUTTIERE + 234 };
  const scene = { haut: enTete.bas + GOUTTIERE, bas: enTete.bas + GOUTTIERE + 664 };
  const socle = { haut: scene.bas + GOUTTIERE, bas: scene.bas + GOUTTIERE + 282 };
  return { rail, enTete, scene, socle };
})();

const CX = 540;

/**
 * Les postes de la bande scène, avec leur emprise réelle.
 *
 * Deux postes ne sont jamais occupés en même temps s'ils se recouvrent ; les
 * emprises sont notées pour que la vérification soit une lecture, pas un rendu.
 * Le cas limite est le couple pile de barres / badge droit, qui ne laisse que
 * 26 px : c'est voulu, et c'est le minimum de la mise en page.
 */
const POSTES = {
  /** Cartes de l'ouverture, côte à côte.       x 130..950   y 700..1000 */
  carteY: 850,
  carteEcart: 286,
  carteL: 248,
  carteH: 300,
  /** Silhouette à la barre.                     x 440..640   y 985..1215 */
  silhouette: { x: CX, y: 1100 },
  /** Haltère barrée, en haut à gauche.          x 218..418   y 703..793 */
  haltere: { x: 318, y: 748 },
  /** Pile de barres, en haut à droite.          x 607..837   y 612..900 */
  pile: { x: 722, bas: 900, haut: 606 },
  /**
   * Badges en arc, de part et d'autre.          x 142..938   y 944..1136
   *
   * C'est le couple le plus serré de la mise en page : le badge droit passe à
   * 44 px sous la pile de barres, et à 100 px de la silhouette en x. Descendre
   * les badges plus bas les ferait mordre sur le socle.
   */
  badges: [
    { x: 238, y: 1040 },
    { x: 842, y: 1040 },
  ],
  /** Flamme KCAL, puis barres caloriques.       x 275..805   y 770..1150 */
  flamme: { x: CX, y: 900 },
  barres: { bas: 1150, gauche: 360, droite: 720, largeur: 170 },
  /** Calendrier : d'abord à côté de la flamme, puis rangé au-dessus. */
  calendrierPres: { x: 830, y: 800, taille: 150 },
  calendrierHaut: { x: CX, y: 668, taille: 118 },
  /** Icône protéine : au centre, puis miniaturisée en tête de scène. */
  poissonPres: { x: CX, y: 900, taille: 210 },
  poissonHaut: { x: CX, y: 664, taille: 112 },
  /** Mini-graphiques.                           x 90..990    y 750..1050 */
  graphes: [
    { x: 300, y: 900 },
    { x: 780, y: 900 },
  ],
  grapheL: 420,
  grapheH: 300,
  /** Verdicts sous les graphiques.              y 1110..1170 */
  verdictY: 1140,
  /**
   * Plage protéines.                            x 148..932   y 834..966
   *
   * Les deux valeurs sont séparées par le « à » que la voix prononce, et non
   * par un trait : un trait entre deux nombres se lit comme un signe, et le
   * brief interdit explicitement de suggérer une équivalence.
   */
  valeurY: 900,
  valeurs: [296, 784],
};

const RAIL_X = [420, CX, 660];

const ACCENT = M.bleuClair; // mot-clé de la phrase
const CHECK = M.vert; // réservé aux validations
const CROIX = M.rouge; // réservé aux rejets
const NUMERO = M.ambre; // numérotation des trois items

/** Les trois items, dans l'ordre où la voix les énonce. */
const ITEMS = [
  { n: "1", tete: "COMMENT TU", cle: "T'ENTRAÎNES", entre: T.item1, sort: T.item2, morphe: T.morphe1, label: T.label1 },
  { n: "2", tete: "TON APPORT", cle: "CALORIQUE", entre: T.item2, sort: T.item3, morphe: T.morphe2, label: T.label2 },
  { n: "3", tete: "TES", cle: "PROTÉINES", entre: T.item3, sort: T.fin + 1, morphe: T.morphe3, label: T.label3 },
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
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, poids = 700, espace = 0, ancre = "middle" }) => (
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

/** Silhouette de face, barre sur les épaules. */
const Silhouette: React.FC<{ x: number; y: number; e: number; halo?: number }> = ({ x, y, e, halo = 0 }) => {
  if (e <= 0) return null;
  const c = melange(0, 1, e);
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.86, 1, c)})`} opacity={c}>
      {halo > 0 && <circle cx={0} cy={-6} r={132} fill={ACCENT} opacity={0.13 * halo} />}
      {/* barre sur les épaules */}
      <line x1={-116} y1={-78} x2={116} y2={-78} stroke={M.texte} strokeWidth={9} strokeLinecap="round" />
      <rect x={-124} y={-96} width={16} height={36} rx={5} fill={ACCENT} />
      <rect x={108} y={-96} width={16} height={36} rx={5} fill={ACCENT} />
      {/* tête, tronc, membres */}
      <circle cx={0} cy={-108} r={26} fill={M.texte} />
      <path d="M0 -78 L0 12" stroke={M.texte} strokeWidth={16} strokeLinecap="round" />
      <path d="M0 -70 L-44 -78 M0 -70 L44 -78" stroke={M.texte} strokeWidth={13} strokeLinecap="round" />
      <path d="M0 12 L-38 96 M0 12 L38 96" stroke={M.texte} strokeWidth={15} strokeLinecap="round" />
    </g>
  );
};

/** Haltère, barrée d'une croix quand `barre` monte. */
const Haltere: React.FC<{ x: number; y: number; e: number; barre: number }> = ({ x, y, e, barre }) => {
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.8, 1, e)})`} opacity={e}>
      <rect x={-46} y={-8} width={92} height={16} rx={6} fill={M.gris} />
      <rect x={-92} y={-34} width={26} height={68} rx={9} fill={M.gris} />
      <rect x={-66} y={-24} width={18} height={48} rx={7} fill={M.gris} />
      <rect x={66} y={-34} width={26} height={68} rx={9} fill={M.gris} />
      <rect x={48} y={-24} width={18} height={48} rx={7} fill={M.gris} />
      {barre > 0 && (
        <g opacity={barre}>
          <line
            x1={-58}
            y1={-42}
            x2={melange(-58, 58, barre)}
            y2={melange(-42, 42, barre)}
            stroke={CROIX}
            strokeWidth={11}
            strokeLinecap="round"
          />
          <line
            x1={58}
            y1={-42}
            x2={melange(58, -58, barre)}
            y2={melange(-42, 42, barre)}
            stroke={CROIX}
            strokeWidth={11}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

/**
 * Croix rouge qui devient check vert, `p` de 0 à 1.
 *
 * Les deux signes sont décrits par les mêmes DEUX segments, et le morphe
 * n'interpole que leurs quatre extrémités : la croix ne disparaît pas pour
 * laisser place au check, elle se replie dessus. La couleur suit le même
 * paramètre, de sorte qu'il n'existe aucune image où le signe est ambigu plus
 * de quelques dixièmes.
 */
const Verdict: React.FC<{ x: number; y: number; taille: number; p: number; e: number }> = ({ x, y, taille, p, e }) => {
  if (e <= 0) return null;
  const a = taille / 2;
  // croix : deux diagonales ; check : une brève descente puis une longue montée
  const s1 = [melange(-a, -a, p), melange(-a, 0.02 * a, p), melange(a, -0.18 * a, p), melange(a, 0.66 * a, p)];
  const s2 = [melange(a, -0.18 * a, p), melange(-a, 0.66 * a, p), melange(-a, a, p), melange(a, -0.72 * a, p)];
  const couleur = p < 0.5 ? CROIX : CHECK;
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.7, 1, e)})`} opacity={e}>
      <line x1={s1[0]} y1={s1[1]} x2={s1[2]} y2={s1[3]} stroke={couleur} strokeWidth={taille * 0.16} strokeLinecap="round" />
      <line x1={s2[0]} y1={s2[1]} x2={s2[2]} y2={s2[3]} stroke={couleur} strokeWidth={taille * 0.16} strokeLinecap="round" />
    </g>
  );
};

/** Flamme « KCAL ». */
const Flamme: React.FC<{ x: number; y: number; e: number; taille?: number }> = ({ x, y, e, taille = 1 }) => {
  if (e <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.8, 1, e) * taille})`} opacity={e}>
      <path
        d="M0 -132 C58 -66 92 -34 92 26 C92 92 44 130 0 130 C-44 130 -92 92 -92 26 C-92 -30 -58 -58 -32 -104 C-24 -60 -4 -52 8 -70 C16 -84 12 -108 0 -132 Z"
        fill={NUMERO}
        opacity={0.9}
      />
      {/* « KCAL » se lit en négatif dans la flamme : le fond du dépôt sur
          l'ambre donne le seul contraste franc disponible ici. Une première
          version posait le mot sur une goutte sombre translucide — le texte y
          était illisible. */}
      <Txt x={0} y={40} taille={40} couleur={M.fond} espace={3} poids={800}>
        KCAL
      </Txt>
    </g>
  );
};

/** Calendrier, pour « des années d'expérience ». */
const Calendrier: React.FC<{ x: number; y: number; taille: number; e: number }> = ({ x, y, taille, e }) => {
  if (e <= 0) return null;
  const k = taille / 150;
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.78, 1, e) * k})`} opacity={e}>
      <rect x={-75} y={-66} width={150} height={140} rx={16} fill="none" stroke={M.gris} strokeWidth={8} />
      <rect x={-75} y={-66} width={150} height={38} rx={16} fill={M.gris} />
      <rect x={-75} y={-46} width={150} height={18} fill={M.gris} />
      <line x1={-40} y1={-84} x2={-40} y2={-58} stroke={M.gris} strokeWidth={10} strokeLinecap="round" />
      <line x1={40} y1={-84} x2={40} y2={-58} stroke={M.gris} strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2].map((ligne) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${ligne}-${col}`}
            cx={-40 + col * 40}
            cy={-6 + ligne * 33}
            r={8}
            fill={ligne * 3 + col < 6 ? ACCENT : M.gris}
            opacity={ligne * 3 + col < 6 ? 0.9 : 0.35}
          />
        )),
      )}
    </g>
  );
};

/** Poisson, pour les protéines. */
const Poisson: React.FC<{ x: number; y: number; taille: number; e: number; opacity?: number }> = ({
  x,
  y,
  taille,
  e,
  opacity = 1,
}) => {
  if (e <= 0) return null;
  const k = taille / 210;
  return (
    <g transform={`translate(${x} ${y}) scale(${melange(0.78, 1, e) * k})`} opacity={e * opacity}>
      <path d="M-30 0 C-30 -58 40 -78 96 0 C40 78 -30 58 -30 0 Z" fill={ACCENT} />
      <path d="M-30 0 L-96 -50 L-72 0 L-96 50 Z" fill={ACCENT} opacity={0.72} />
      <circle cx={58} cy={-12} r={9} fill={M.fond} />
      <path d="M6 -34 C26 -14 26 14 6 34" stroke={M.fond} strokeWidth={7} fill="none" opacity={0.5} />
    </g>
  );
};

// ── L'animation ──────────────────────────────────────────────────────────

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  /**
   * Entrée et sortie de l'animation entière.
   *
   * Elle ne monte qu'APRÈS la fin de la dernière phrase du hook (7,35 s) et
   * s'efface avant la reprise du plan filmé. Une version précédente d'un autre
   * montage faisait démarrer ce fondu une demi-seconde avant sa propre borne :
   * l'animation apparaissait alors que la phrase n'était pas finie. La règle
   * tenue ici est que rien, pas même un fondu, ne commence avant `T.debut`.
   */
  const vie = Math.min(rd(t, T.debut, T.debut + 0.42), 1 - rd(t, T.fin - 0.24, T.fin));
  if (vie <= 0) return null;

  // Respiration lente : jamais tout à fait immobile, jamais assez pour distraire.
  const souffle = 1 + 0.006 * Math.sin(2 * Math.PI * (t - T.debut) / 7.5);

  // ── Bande en-tête : le titre d'ouverture, puis le label de l'item courant
  const titreVivant = rd(t, T.titre, T.titre + 0.5) * (1 - rd(t, T.item1 - 0.05, T.item1 + 0.45));
  const sousTitre = rd(t, T.sousTitre, T.sousTitre + 0.5) * (1 - rd(t, T.item1 - 0.05, T.item1 + 0.45));

  // ── Les trois cartes numérotées ────────────────────────────────────────
  /**
   * Une carte a trois places possibles, et se déplace de l'une à l'autre sans
   * jamais disparaître : la grille d'ouverture, le rail, et le centre de scène
   * quand vient son tour. Les trois places sont mélangées par deux paramètres,
   * `range` (grille → rail) et `avance` (rail → centre).
   */
  const cartes = ITEMS.map((item, i) => {
    const nait = rd(t, T.cartes + i * 0.24, T.cartes + i * 0.24 + 0.55);
    const range = rd(t, T.item1 - 0.15, T.item1 + 0.55);
    const avance =
      rd(t, item.entre, item.entre + 0.5) * (1 - rd(t, item.sort - 0.42, item.sort - 0.02));
    const morphe =
      rd(t, item.morphe, item.morphe + 0.55) * (1 - rd(t, item.sort - 0.42, item.sort - 0.02));

    const grilleX = CX + (i - 1) * POSTES.carteEcart;
    const railY = (BANDES.rail.haut + BANDES.rail.bas) / 2;
    const x = melange(melange(grilleX, RAIL_X[i], range), CX, avance);
    const y = melange(melange(POSTES.carteY, railY, range), POSTES.carteY, avance);
    const k = melange(melange(1, 0.3, range), 0.92, avance);
    /**
     * `garee` vaut 1 quand la carte est immobile dans le rail. La pastille et
     * la carte occupent alors la même place, et ne doivent pas être dessinées
     * ensemble : leurs deux contours se superposaient en un double liseré. Les
     * deux se croisent donc en fondu, ce qui se lit comme un changement de
     * forme et non comme une substitution.
     */
    const garee = range * (1 - avance);
    return { item, i, nait, avance, morphe, garee, x, y, k };
  });

  // ── Item 1 : la silhouette et son entourage ────────────────────────────
  const silhouette = cartes[0].morphe;
  const halo = rd(t, T.muscle - 0.3, T.muscle + 0.6) * (1 - rd(t, T.item2 - 0.4, T.item2));
  const repli1 = 1 - rd(t, T.repli1, T.repli1 + 0.55);
  const haltere = rd(t, T.haltere, T.haltere + 0.55) * repli1;
  const barreHaltere = rd(t, T.haltere + 0.35, T.haltere + 1.0);
  const grisee = rd(t, T.echec, T.echec + 0.6);
  const pile = rd(t, T.pile, T.pile + 1.5) * repli1;
  const badges = [
    rd(t, T.badge1, T.badge1 + 0.6) * repli1,
    rd(t, T.badge2, T.badge2 + 0.6) * repli1,
  ];
  const motMuscle = rd(t, T.muscle, T.muscle + 0.7) * (1 - rd(t, T.item2 - 0.35, T.item2 + 0.05));

  // ── Item 2 : la flamme, le calendrier, les deux barres ─────────────────
  const flamme = cartes[1].morphe * (1 - rd(t, T.barres, T.barres + 0.6));
  const calendrier = rd(t, T.calendrier, T.calendrier + 0.55) * (1 - rd(t, T.item3 - 0.45, T.item3 - 0.05));
  const rangeCal = rd(t, T.barres, T.barres + 0.7); // glisse en tête de scène
  const barres = rd(t, T.barres, T.barres + 0.7) * (1 - rd(t, T.item3 - 0.45, T.item3 - 0.05));
  const deficit = rd(t, T.deficit, T.deficit + 0.8) * (1 - rd(t, T.item3 - 0.45, T.item3 - 0.05));

  // ── Item 3 : le poisson, les deux graphiques, la plage ─────────────────
  const poisson = cartes[2].morphe;
  const reculPoisson = rd(t, T.graphes, T.graphes + 0.7); // se range en tête de scène
  const graphes = rd(t, T.graphes, T.graphes + 0.7) * (1 - rd(t, T.repli3, T.repli3 + 0.5));
  const checkA = rd(t, T.checkA, T.checkA + 0.5) * (1 - rd(t, T.repli3, T.repli3 + 0.5));
  const verdictB = rd(t, T.croixB, T.croixB + 0.5) * (1 - rd(t, T.repli3, T.repli3 + 0.5));
  const morpheCheck = rd(t, T.morpheCheck, T.morpheCheck + 1.05);
  const valeur1 = rd(t, T.valeur1, T.valeur1 + 0.6);
  const valeur2 = rd(t, T.valeur2, T.valeur2 + 0.6);
  const parKilo = rd(t, T.parKilo, T.parKilo + 0.6);

  const railY = (BANDES.rail.haut + BANDES.rail.bas) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: vie }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <defs>
          <clipPath id="recomp-pile">
            <rect
              x={POSTES.pile.x - 115}
              y={POSTES.pile.haut}
              width={230}
              height={POSTES.pile.bas - POSTES.pile.haut}
            />
          </clipPath>
        </defs>

        <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>
          {/* ── RAIL : les trois pastilles, une fois les cartes rangées ── */}
          {cartes.map(({ item, i, nait, garee }) => {
            if (garee <= 0.02 || nait <= 0) return null;
            const passe = t > item.sort - 0.3 ? 1 : 0;
            return (
              <g key={`rail-${i}`} opacity={garee * nait * 0.95}>
                <rect
                  x={RAIL_X[i] - 44}
                  y={railY - 28}
                  width={88}
                  height={56}
                  rx={18}
                  fill={passe ? M.fondCase : M.fondCase}
                  stroke={passe ? CHECK : M.noir}
                  strokeWidth={3}
                />
                <Txt x={RAIL_X[i]} y={railY + 1} taille={30} couleur={passe ? CHECK : M.gris}>
                  {item.n}
                </Txt>
              </g>
            );
          })}

          {/* ── EN-TÊTE : titre d'ouverture ─────────────────────────────── */}
          {titreVivant > 0 && (
            <g opacity={titreVivant}>
              <Txt
                x={CX}
                y={BANDES.enTete.haut + melange(78, 68, titreVivant)}
                taille={104}
                couleur={M.texte}
                espace={-2}
              >
                recomp :
              </Txt>
            </g>
          )}
          {sousTitre > 0 && (
            <Txt
              x={CX}
              y={BANDES.enTete.haut + melange(182, 172, sousTitre)}
              taille={46}
              couleur={ACCENT}
              espace={2}
              opacity={sousTitre}
            >
              les 3 choses dont tu as besoin
            </Txt>
          )}

          {/* ── EN-TÊTE : label de l'item courant ───────────────────────── */}
          {ITEMS.map((item, i) => {
            const e =
              rd(t, item.label, item.label + 0.55) *
              (1 - rd(t, item.sort - 0.5, item.sort - 0.1)) *
              // Pendant « MUSCLE », le label s'efface : la demande est qu'il n'y
              // ait alors qu'un seul mot à l'écran.
              (i === 0 ? 1 - rd(t, T.repli1, T.repli1 + 0.5) : 1);
            if (e <= 0) return null;
            return (
              <g key={`label-${i}`} opacity={e}>
                <Txt x={CX} y={BANDES.enTete.haut + melange(70, 60, e)} taille={54} couleur={M.gris} espace={3}>
                  {item.tete}
                </Txt>
                <Txt x={CX} y={BANDES.enTete.haut + melange(162, 152, e)} taille={82} couleur={ACCENT} espace={1}>
                  {item.cle}
                </Txt>
              </g>
            );
          })}

          {/* ── SCÈNE : les cartes numérotées ───────────────────────────── */}
          {cartes.map(({ item, i, nait, morphe, garee, x, y, k }) => {
            const e = nait * (1 - morphe) * (1 - garee);
            if (e <= 0.01) return null;
            const l = POSTES.carteL * k;
            const h = POSTES.carteH * k;
            return (
              <g key={`carte-${i}`} opacity={e} transform={`translate(${x} ${y})`}>
                <rect
                  x={-l / 2}
                  y={-h / 2}
                  width={l}
                  height={h}
                  rx={melange(26, 34, morphe) * k}
                  fill={M.fondCase}
                  stroke={M.noir}
                  strokeWidth={4}
                />
                <Txt x={0} y={0} taille={150 * k} couleur={NUMERO}>
                  {item.n}
                </Txt>
              </g>
            );
          })}

          {/* ── SCÈNE, item 1 ───────────────────────────────────────────── */}
          <Silhouette x={POSTES.silhouette.x} y={POSTES.silhouette.y} e={silhouette} halo={halo} />
          <Haltere x={POSTES.haltere.x} y={POSTES.haltere.y} e={haltere} barre={barreHaltere} />

          {/* Pile de barres : la gradation vers l'échec, cinq crans. */}
          {pile > 0 && (
            <g clipPath="url(#recomp-pile)">
              {[0, 1, 2, 3, 4].map((n) => {
                const e = rd(pile, n * 0.17, n * 0.17 + 0.4);
                if (e <= 0) return null;
                const hauteur = 44;
                const yBas = POSTES.pile.bas - n * (hauteur + 16);
                const l = melange(120, 230, n / 4);
                // Gradation par l'opacité d'une seule teinte, et non par un
                // saut de couleur : les deux crans du bas, tracés en vert
                // profond sur fond sombre, étaient invisibles.
                return (
                  <rect
                    key={n}
                    x={POSTES.pile.x - l / 2}
                    y={yBas - hauteur}
                    width={l * e}
                    height={hauteur}
                    rx={10}
                    fill={ACCENT}
                    opacity={melange(0.3, 1, n / 4) * e}
                    transform={`translate(${(l * (1 - e)) / 2} 0)`}
                  />
                );
              })}
            </g>
          )}

          {/* Badges « mécanisme », en arc de part et d'autre de la silhouette. */}
          {[
            { texte: ["TECHNIQUE", "D'EXÉCUTION"], poste: POSTES.badges[0], e: badges[0] },
            { texte: ["TENSION", "MÉCANIQUE"], poste: POSTES.badges[1], e: badges[1] },
          ].map(({ texte, poste, e }, i) =>
            e <= 0 ? null : (
              <g key={`badge-${i}`} opacity={e} transform={`translate(${poste.x} ${poste.y}) scale(${melange(0.72, 1, e)})`}>
                <circle cx={0} cy={0} r={96} fill={M.fondCase} stroke={ACCENT} strokeWidth={3} opacity={0.95} />
                {/* 23 px : « D'EXÉCUTION » est le mot le plus long et tient
                    alors dans le disque. À 24 px il en débordait. */}
                <Txt x={0} y={-14} taille={23} couleur={M.texte} espace={1}>
                  {texte[0]}
                </Txt>
                <Txt x={0} y={17} taille={23} couleur={M.texte} espace={1}>
                  {texte[1]}
                </Txt>
              </g>
            ),
          )}

          {/* « MUSCLE » : le seul mot à l'écran pendant sa fenêtre. */}
          {motMuscle > 0 && (
            <Txt
              x={CX}
              y={800}
              taille={melange(112, 132, motMuscle)}
              couleur={ACCENT}
              espace={4}
              opacity={motMuscle}
            >
              MUSCLE
            </Txt>
          )}

          {/* ── SCÈNE, item 2 ───────────────────────────────────────────── */}
          <Flamme x={POSTES.flamme.x} y={POSTES.flamme.y} e={flamme} />
          <Calendrier
            x={melange(POSTES.calendrierPres.x, POSTES.calendrierHaut.x, rangeCal)}
            y={melange(POSTES.calendrierPres.y, POSTES.calendrierHaut.y, rangeCal)}
            taille={melange(POSTES.calendrierPres.taille, POSTES.calendrierHaut.taille, rangeCal)}
            e={calendrier}
          />

          {/* Les deux barres caloriques. Le brief interdit tout chiffre ici :
              le script n'en donne pas, la lecture reste comparative. */}
          {[
            { x: POSTES.barres.gauche, part: 1, label: "MAINTENANCE", couleur: M.gris, e: barres },
            { x: POSTES.barres.droite, part: 0.82, label: "LÉGER DÉFICIT", couleur: ACCENT, e: deficit },
          ].map(({ x, part, label, couleur, e }, i) => {
            if (e <= 0) return null;
            const pleine = 380 * part;
            const h = pleine * e;
            return (
              <g key={`cal-${i}`} opacity={e}>
                <rect
                  x={x - POSTES.barres.largeur / 2}
                  y={POSTES.barres.bas - h}
                  width={POSTES.barres.largeur}
                  height={h}
                  rx={14}
                  fill={couleur}
                  opacity={0.9}
                />
                {/* Les deux légendes se télescopaient quand les barres étaient
                    plus rapprochées : « MAINTENANCE » et « LÉGER DÉFICIT »
                    font ensemble près de 400 px. L'écartement des barres est
                    dicté par elles, pas l'inverse. */}
                <Txt x={x} y={POSTES.barres.bas + 48} taille={26} couleur={couleur} espace={2}>
                  {label}
                </Txt>
              </g>
            );
          })}

          {/* ── SCÈNE, item 3 ───────────────────────────────────────────── */}
          <Poisson
            x={melange(POSTES.poissonPres.x, POSTES.poissonHaut.x, reculPoisson)}
            y={melange(POSTES.poissonPres.y, POSTES.poissonHaut.y, reculPoisson)}
            taille={melange(POSTES.poissonPres.taille, POSTES.poissonHaut.taille, reculPoisson)}
            e={poisson * (1 - rd(t, T.repli3, T.repli3 + 0.5) * 0.55)}
          />

          {/* Deux mini-graphiques : le gras descend, le muscle hésite. */}
          {[
            {
              titre: "PERTE DE GRAS",
              courbe: "M -170 -84 C -90 -50 -20 34 170 92",
              poste: POSTES.graphes[0],
              e: graphes,
              verdict: checkA,
              p: 1,
            },
            {
              titre: "PRISE DE MUSCLE",
              courbe: "M -170 26 C -90 8 -20 40 170 18",
              poste: POSTES.graphes[1],
              e: graphes,
              verdict: verdictB,
              p: morpheCheck,
            },
          ].map(({ titre, courbe, poste, e, verdict, p }, i) => {
            if (e <= 0) return null;
            return (
              <g key={`graphe-${i}`}>
                <g opacity={e} transform={`translate(${poste.x} ${poste.y}) scale(${melange(0.86, 1, e)})`}>
                  <rect
                    x={-POSTES.grapheL / 2}
                    y={-POSTES.grapheH / 2}
                    width={POSTES.grapheL}
                    height={POSTES.grapheH}
                    rx={26}
                    fill={M.fondCase}
                    stroke={M.noir}
                    strokeWidth={3}
                  />
                  <Txt x={0} y={-POSTES.grapheH / 2 + 42} taille={26} couleur={M.gris} espace={2}>
                    {titre}
                  </Txt>
                  <path
                    d={courbe}
                    fill="none"
                    stroke={i === 0 ? CHECK : melange(0, 1, p) > 0.5 ? CHECK : M.gris}
                    strokeWidth={9}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - e}
                  />
                </g>
                <Verdict x={poste.x} y={POSTES.verdictY} taille={62} p={p} e={verdict} />
              </g>
            );
          })}

          {/* ── SCÈNE, plage protéines ──────────────────────────────────── */}
          {/* Icônes de fond, discrètes : elles occupent la ligne haute de la
              scène, bien au-dessus de la ligne des valeurs. */}
          {valeur1 > 0 &&
            [
              { x: 176, y: 706 },
              { x: 904, y: 706 },
            ].map((p, i) => (
              <Poisson key={`fond-${i}`} x={p.x} y={p.y} taille={104} e={valeur1} opacity={0.17} />
            ))}

          {/* « 1,6 g » s'incruste seule au centre, puis glisse à gauche pour
              faire place à « 2,2 g » : la plage se construit sous les yeux au
              lieu d'apparaître d'un bloc. */}
          {valeur1 > 0 && (
            <Txt
              x={melange(CX, POSTES.valeurs[0], valeur2)}
              y={POSTES.valeurY}
              taille={melange(110, 132, valeur1)}
              couleur={M.texte}
              opacity={valeur1}
            >
              1,6 g
            </Txt>
          )}
          {valeur2 > 0 && (
            <>
              <Txt x={CX} y={POSTES.valeurY} taille={62} couleur={M.gris} opacity={valeur2 * 0.85}>
                à
              </Txt>
              <Txt
                x={POSTES.valeurs[1]}
                y={POSTES.valeurY}
                taille={melange(110, 132, valeur2)}
                couleur={ACCENT}
                opacity={valeur2}
              >
                2,2 g
              </Txt>
            </>
          )}

          {/* ── SOCLE ───────────────────────────────────────────────────── */}
          {haltere > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + 58}
              taille={44}
              couleur={melange(1, 0, grisee) > 0.5 ? M.texte : M.gris}
              espace={3}
              opacity={haltere * melange(1, 0.55, grisee)}
            >
              SOULEVER LOURD
            </Txt>
          )}
          {grisee > 0 && repli1 > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + melange(152, 142, grisee)}
              taille={58}
              couleur={ACCENT}
              espace={2}
              opacity={grisee * repli1}
            >
              PROCHE DE L'ÉCHEC
            </Txt>
          )}
          {parKilo > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + melange(70, 60, parKilo)}
              taille={46}
              couleur={M.gris}
              espace={2}
              opacity={parKilo}
            >
              PAR KILO DE POIDS DE CORPS
            </Txt>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
