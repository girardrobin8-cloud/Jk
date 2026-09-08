import { AbsoluteFill } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * Miniature (cover 9:16) de la vidéo « NEAT ».
 *
 * Composition FIXE, pas une animation : elle se rend avec
 * `npx remotion still NeatMiniature <fichier.png>`.
 *
 * Le concept vient du guide de miniatures du dépôt et croise deux cadres :
 * représentation graphique et contraste d'échelle. Le sujet est le camembert
 * de la vidéo elle-même, la part « sport » réduite à un filet, désignée par une
 * accolade. L'écart de taille EST l'argument, et il est honnête : c'est
 * exactement ce que dit la voix off.
 *
 * Pourquoi ici plutôt qu'en génération d'image : un modèle interprète une
 * description, il ne respecte pas une charte. Les hex du dépôt sont posés au
 * pixel près, le format est exactement 1080×1920, les accents français sont
 * corrects, et une retouche coûte une recompilation au lieu d'un nouveau
 * tirage.
 *
 * Règle de lisibilité tenue ici : le visuel doit se lire en moins d'une seconde
 * à environ 120 px de large. D'où trois blocs de texte au maximum, un seul
 * héros graphique, et rien d'autre dans le cadre.
 */

const L = 1080;
const H = 1920;
const CX = L / 2;

/** Centre et rayons du camembert. Emprise : x 210..870, y 760..1420. */
const CY = 1090;
const R_EXT = 330;
const R_INT = 196;

/**
 * Les quatre parts, dans l'ordre horaire depuis midi.
 *
 * Les proportions sont celles citées dans la vidéo et ses sources : métabolisme
 * de base 60-70 %, digestion ~10 %, sport structuré souvent moins de 100 kcal
 * par jour — soit environ 3,5 % d'une journée à 2500 kcal. Le reste est le
 * NEAT. La part « sport » n'est donc pas rapetissée pour l'effet : elle est à
 * l'échelle, et c'est bien ce qui rend l'image frappante.
 *
 * L'ordre place le sport juste AVANT midi, pour que son accolade parte droit
 * vers le haut, dans la zone libre du cadre.
 */
const PARTS = [
  { cle: "base", part: 0.65, couleur: M.bleuClair },
  { cle: "neat", part: 0.215, couleur: M.vert },
  { cle: "digestion", part: 0.10, couleur: M.ambre },
  { cle: "sport", part: 0.035, couleur: M.texte },
];

/** Un secteur d'anneau, de `de` à `a` en fraction de tour depuis midi. */
const secteur = (de: number, a: number) => {
  const pt = (rayon: number, f: number) => {
    const ang = (f * 360 - 90) * (Math.PI / 180);
    return [CX + rayon * Math.cos(ang), CY + rayon * Math.sin(ang)];
  };
  const [xe1, ye1] = pt(R_EXT, de);
  const [xe2, ye2] = pt(R_EXT, a);
  const [xi2, yi2] = pt(R_INT, a);
  const [xi1, yi1] = pt(R_INT, de);
  const grand = a - de > 0.5 ? 1 : 0;
  return [
    `M ${xe1} ${ye1}`,
    `A ${R_EXT} ${R_EXT} 0 ${grand} 1 ${xe2} ${ye2}`,
    `L ${xi2} ${yi2}`,
    `A ${R_INT} ${R_INT} 0 ${grand} 0 ${xi1} ${yi1}`,
    "Z",
  ].join(" ");
};

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille: number;
  couleur: string;
  espace?: number;
  poids?: number;
}> = ({ x, y, children, taille, couleur, espace = 0, poids = 800 }) => (
  <text
    x={x}
    y={y}
    fill={couleur}
    fontSize={taille}
    fontWeight={poids}
    letterSpacing={espace}
    textAnchor="middle"
    dominantBaseline="middle"
    fontFamily={TITRE_FONT}
  >
    {children}
  </text>
);

export const Miniature: React.FC = () => {
  // Bornes cumulées des parts.
  let curseur = 0;
  const bornes = PARTS.map((p) => {
    const de = curseur;
    curseur += p.part;
    return { ...p, de, a: curseur };
  });

  const sport = bornes[bornes.length - 1];
  // Milieu angulaire de la part « sport », d'où part l'accolade.
  const angSport = ((sport.de + sport.a) / 2) * 360 - 90;
  const rad = (angSport * Math.PI) / 180;
  const xSport = CX + (R_EXT + 6) * Math.cos(rad);
  const ySport = CY + (R_EXT + 6) * Math.sin(rad);

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond }}>
      <svg width={L} height={H} viewBox={`0 0 ${L} ${H}`}>
        {/* Halo très discret derrière le camembert : il décolle le disque du
            fond sans introduire de couleur étrangère à la charte. */}
        <defs>
          <radialGradient id="halo">
            <stop offset="0%" stopColor={M.bleuClair} stopOpacity={0.12} />
            <stop offset="100%" stopColor={M.bleuClair} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={520} fill="url(#halo)" />

        {/* ── Accroche haute ─────────────────────────────────────────── */}
        <Txt x={CX} y={250} taille={40} couleur={M.gris} espace={7}>
          TES CALORIES BRÛLÉES
        </Txt>

        {/* ── L'appel : le mot et sa flèche vers le filet ────────────── */}
        <Txt x={CX} y={470} taille={124} couleur={M.texte} espace={2}>
          TON SPORT
        </Txt>
        <line
          x1={xSport}
          y1={560}
          x2={xSport}
          y2={ySport - 14}
          stroke={M.texte}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d={`M ${xSport - 20} ${ySport - 44} L ${xSport} ${ySport - 8} L ${xSport + 20} ${ySport - 44}`}
          fill="none"
          stroke={M.texte}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Le camembert ───────────────────────────────────────────── */}
        {bornes.map((p) => (
          <path key={p.cle} d={secteur(p.de, p.a)} fill={p.couleur} />
        ))}

        {/* ── Le sujet ───────────────────────────────────────────────── */}
        <Txt x={CX} y={1640} taille={190} couleur={M.bleuClair} espace={10}>
          NEAT
        </Txt>
        <Txt x={CX} y={1770} taille={38} couleur={M.gris} espace={5}>
          CE QUI VARIE LE PLUS
        </Txt>
      </svg>
    </AbsoluteFill>
  );
};
