import { AbsoluteFill, interpolate } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * La boîte à outils commune des reels en motion design.
 *
 * Elle est née du Jour 1 : après le passage d'aération demandé par Robin, les
 * règles qui garantissaient la lisibilité — bandes horizontales réservées,
 * corps de texte MESURÉ plutôt que posé en dur, panneau opaque à respiration
 * lente — n'étaient plus des conventions à retenir mais du code. Les recopier
 * d'une vidéo à l'autre aurait été le meilleur moyen de les voir diverger, donc
 * elles vivent ici et les deux montages les importent.
 *
 * Ce fichier ne contient AUCUN contenu : ni texte, ni repère temporel, ni
 * couleur propre à une vidéo. Uniquement la charpente.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Rampe linéaire 0→1 entre `a` et `b`, bornée. */
export const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
/** Lissage en S — départs et arrivées sans à-coup. */
export const doux = (p: number) => p * p * (3 - 2 * p);
/** La rampe qu'on utilise partout : lissée. */
export const rd = (t: number, a: number, b: number) => doux(r(t, a, b));
export const melange = (a: number, b: number, p: number) => a + (b - a) * p;

export const CX = 540;
/** Secondaire demandé par les briefs, absent de la charte du dépôt. */
export const CYAN = "#5BD6E0";
export const NEON = M.bleuClair;
export const AMBRE = M.ambre;

/**
 * Les bandes horizontales réservées. Rien ne les enjambe : un bloc appartient à
 * une bande et une seule, ce qui rend le non-chevauchement structurel plutôt
 * que vérifié à l'œil.
 */
export const BANDES = {
  enTete: { haut: 250, bas: 430 },
  scene: { haut: 560, bas: 1270 },
  socle: { haut: 1360, bas: 1620 },
};
/** Ligne unique de l'en-tête, et ligne unique du socle. */
export const EN_TETE = BANDES.enTete.haut + 50;
export const SOCLE = BANDES.socle.haut + 140;

/**
 * Largeur utile, marges comprises. Tout texte qui la dépasse est coupé à
 * l'écran — c'est ce qui était arrivé au Jour 1 à « LE VRAI FACTEUR », posé à
 * 118 px pour quinze caractères, soit près de 1150 px dans un cadre de 1080.
 */
export const UTILE = 940;

/**
 * Le plus grand corps auquel `texte` tient dans `large`, plafonné à `vise`.
 *
 * L'approximation — 0,62 em par capitale dans cette graisse — est volontairement
 * pessimiste : mieux vaut deux points de trop petit qu'une lettre mangée.
 */
export const corps = (texte: string, vise: number, espace = 0, large = UTILE) => {
  const dispo = large - texte.length * espace;
  return Math.min(vise, Math.floor(dispo / (texte.length * 0.62)));
};

export const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  espace?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, espace = 0, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    fill={couleur}
    fontSize={taille}
    fontWeight={800}
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
 * L'en-tête d'un écran : une seule ligne, toujours à la même hauteur, toujours
 * mesurée. C'est elle qui dit au spectateur DE QUOI parle l'écran ; deux
 * en-têtes ne coexistent jamais, ils se croisent en fondu.
 */
export const EnTete: React.FC<{ children: string; opacity: number; couleur?: string }> = ({
  children,
  opacity,
  couleur = M.gris,
}) =>
  opacity <= 0.01 ? null : (
    <Txt x={CX} y={EN_TETE} taille={corps(children, 40, 5, 880)} couleur={couleur} espace={5} opacity={opacity}>
      {children}
    </Txt>
  );

/**
 * Le personnage pixel-art, repère central des séquences animées.
 *
 * Dessiné sur une grille de 11 × 15, un rectangle par pixel allumé. Le tracé
 * vectoriel serait plus lisse, mais c'est justement ce qu'on ne veut pas : la
 * marche d'escalier fait partie du style établi sur le carrousel.
 */
const CORPS = [
  "....###....",
  "...#####...",
  "...#o#o#...",
  "...#####...",
  "....###....",
  "..#######..",
  "###########",
  "###########",
  "..#######..",
  "...#####...",
  "...##.##...",
  "...##.##...",
  "...##.##...",
  "..###.###..",
  "..###.###..",
];

export const Perso: React.FC<{ x: number; y: number; k?: number; opacity?: number; couleur?: string }> = ({
  x,
  y,
  k = 1,
  opacity = 1,
  couleur = NEON,
}) => {
  const px = 11 * k;
  return (
    <g transform={`translate(${x - (11 * px) / 2} ${y - (15 * px) / 2})`} opacity={opacity}>
      {CORPS.flatMap((ligne, j) =>
        ligne.split("").map((c, i) =>
          c === "." ? null : (
            <rect
              key={`${i}-${j}`}
              x={i * px}
              y={j * px}
              width={px + 0.5}
              height={px + 0.5}
              fill={c === "o" ? M.fond : couleur}
            />
          ),
        ),
      )}
    </g>
  );
};

/** Encadré à coins nets, brique de base des icônes et des cartes. */
export const Case: React.FC<{
  x: number;
  y: number;
  l: number;
  h: number;
  couleur: string;
  plein?: boolean;
  opacity?: number;
}> = ({ x, y, l, h, couleur, plein = false, opacity = 1 }) => (
  <rect
    x={x - l / 2}
    y={y - h / 2}
    width={l}
    height={h}
    fill={plein ? couleur : M.fondCase}
    stroke={couleur}
    strokeWidth={4}
    opacity={opacity}
  />
);

/**
 * Une étiquette encadrée : le cadre, puis le mot dedans, au corps le plus grand
 * qui tient à l'intérieur avec une gouttière de 40 px. Passer par ce composant
 * plutôt que par un `Case` + un `Txt` posés à la main supprime la classe entière
 * des débordements de badge.
 */
export const Etiquette: React.FC<{
  x: number;
  y: number;
  l: number;
  h: number;
  couleur: string;
  vise?: number;
  espace?: number;
  opacity?: number;
  children: string;
}> = ({ x, y, l, h, couleur, vise = 40, espace = 2, opacity = 1, children }) => (
  <g opacity={opacity}>
    <Case x={x} y={y} l={l} h={h} couleur={couleur} />
    <Txt x={x} y={y} taille={corps(children, vise, espace, l - 40)} couleur={couleur} espace={espace}>
      {children}
    </Txt>
  </g>
);

/** Pointe de flèche verticale, dessinée à part pour ne pas la répéter. */
export const Pointe: React.FC<{ x: number; y: number; couleur: string; opacity?: number }> = ({
  x,
  y,
  couleur,
  opacity = 1,
}) => (
  <path
    d={`M ${x - 20} ${y - 34} L ${x} ${y} L ${x + 20} ${y - 34}`}
    fill="none"
    stroke={couleur}
    strokeWidth={7}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
  />
);

type Borne = { id: string; debut: number; fin: number };

/**
 * Fabrique la fonction « ce beat est-il visible, et à quelle opacité ».
 *
 * Le fondu est SYMÉTRIQUE autour de la borne : un beat est déjà opaque quand le
 * précédent commence à s'effacer, et comme les panneaux sont empilés dans
 * l'ordre, le nouveau recouvre l'ancien. C'est ce qui interdit le cut sec sans
 * jamais laisser voir les deux images superposées en plein.
 */
export const faireFenetre =
  (beats: Borne[], fondu: number) =>
  (t: number, id: string) => {
    const b = beats.find((x) => x.id === id)!;
    return Math.min(rd(t, b.debut - fondu, b.debut), 1 - rd(t, b.fin, b.fin + fondu));
  };

/**
 * Un écran d'animation : fond opaque de la charte, et une respiration très lente
 * (±0,5 % sur sept secondes) pour qu'aucun plan ne soit jamais parfaitement figé.
 */
export const Panneau: React.FC<{ e: number; t: number; children: React.ReactNode }> = ({ e, t, children }) => {
  if (e <= 0) return null;
  const souffle = 1 + 0.005 * Math.sin((2 * Math.PI * t) / 7);
  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: e }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};
