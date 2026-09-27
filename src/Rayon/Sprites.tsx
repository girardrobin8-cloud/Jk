import { R, Verdict } from "./Plan";

/**
 * Les compléments en pixel art.
 *
 * Chaque produit est une grille de 16 × 16 caractères, un caractère par pixel,
 * exactement comme le personnage de src/commun/Motion.tsx. Le tracé vectoriel
 * serait plus lisse, et c'est précisément ce qu'on ne veut pas : la marche
 * d'escalier est le style, dans la vidéo de référence comme sur le carrousel
 * de Robin.
 *
 * Les caractères ne sont PAS des couleurs mais des rôles — `#` le contour,
 * `b` le contenant, `a` le contenu, `c` le bouchon. Une même grille se
 * recolore donc entièrement en changeant son jeu de rôles, et c'est ce qui
 * permet à la frise du bas de réafficher les huit produits en gris pâle sans
 * une seule grille en double.
 */

export type Sprite = {
  id: string;
  nom: string;
  /** Le mot qui tient sous la vignette de la frise, plus court que `nom`. */
  court: string;
  verdict: Verdict;
  roles: { a: string; b: string; c: string };
  grille: string[];
};

const ENCRE = R.encre;

/** Résout un caractère de grille en couleur, ou en `null` s'il est transparent. */
export const couleurDe = (c: string, roles: Sprite["roles"]): string | null => {
  if (c === ".") return null;
  if (c === "#") return ENCRE;
  return roles[c as "a" | "b" | "c"] ?? ENCRE;
};

export const SPRITES: Sprite[] = [
  {
    id: "creatine",
    nom: "CRÉATINE",
    court: "CRÉATINE",
    verdict: "oui",
    roles: { a: R.vert, b: R.carte, c: R.vert },
    grille: [
      "................",
      "................",
      "....########....",
      "....#cccccc#....",
      "....########....",
      "...##########...",
      "...#bbbbbbbb#...",
      "...#bbbbbbbb#...",
      "...#b######b#...",
      "...#b#aaaa#b#...",
      "...#b#aaaa#b#...",
      "...#b######b#...",
      "...#bbbbbbbb#...",
      "...#bbbbbbbb#...",
      "...##########...",
      "................",
    ],
  },
  {
    id: "whey",
    nom: "WHEY",
    court: "WHEY",
    verdict: "depend",
    roles: { a: R.ambre, b: R.carte, c: R.ambre },
    grille: [
      "................",
      "...##########...",
      "...#cccccccc#...",
      "...##########...",
      "..############..",
      "..#bbbbbbbbbb#..",
      "..#bbbbbbbbbb#..",
      "..#b########b#..",
      "..#b#aaaaaa#b#..",
      "..#b#aaaaaa#b#..",
      "..#b#aaaaaa#b#..",
      "..#b########b#..",
      "..#bbbbbbbbbb#..",
      "..#bbbbbbbbbb#..",
      "..#bbbbbbbbbb#..",
      "..############..",
    ],
  },
  {
    id: "omega",
    nom: "OMÉGA 3",
    court: "OMÉGA 3",
    verdict: "depend",
    roles: { a: R.ambre, b: R.carte, c: R.encre },
    grille: [
      "................",
      "......####......",
      "......#cc#......",
      "......#cc#......",
      ".....######.....",
      "....########....",
      "...##########...",
      "...#bbbbbbbb#...",
      "...#baabaabb#...",
      "...#bbaabaab#...",
      "...#baabaabb#...",
      "...#bbaabaab#...",
      "...#baabaabb#...",
      "...#bbbbbbbb#...",
      "...##########...",
      "................",
    ],
  },
  {
    id: "vitamineD",
    nom: "VITAMINE D",
    court: "VITAMINE D",
    verdict: "oui",
    roles: { a: R.cyan, b: R.carte, c: R.encre },
    grille: [
      "................",
      ".......##.......",
      ".......##.......",
      "......####......",
      "......#cc#......",
      "......####......",
      ".....######.....",
      ".....#bbbb#.....",
      ".....#aaaa#.....",
      ".....#aaaa#.....",
      ".....#aaaa#.....",
      ".....#aaaa#.....",
      ".....#bbbb#.....",
      ".....######.....",
      "................",
      "................",
    ],
  },
  {
    id: "magnesium",
    nom: "MAGNÉSIUM",
    court: "MAGNÉSIUM",
    verdict: "non",
    roles: { a: R.corail, b: R.carte, c: R.carte },
    grille: [
      "................",
      "................",
      "..############..",
      "..#bbbbbbbbbb#..",
      "..#b#aa##aa#b#..",
      "..#b#aa##aa#b#..",
      "..#b########b#..",
      "..#b#aa##aa#b#..",
      "..#b#aa##aa#b#..",
      "..#b########b#..",
      "..#b#aa##aa#b#..",
      "..#b#aa##aa#b#..",
      "..#bbbbbbbbbb#..",
      "..############..",
      "................",
      "................",
    ],
  },
  {
    id: "multi",
    nom: "MULTIVITAMINES",
    court: "MULTI",
    verdict: "non",
    roles: { a: R.corail, b: R.carte, c: R.encre },
    grille: [
      "................",
      "......####......",
      "......#cc#......",
      "......####......",
      "......#bb#......",
      ".....######.....",
      ".....#bbbb#.....",
      ".....######.....",
      ".....#a##a#.....",
      ".....######.....",
      ".....#a##a#.....",
      ".....######.....",
      ".....#bbbb#.....",
      ".....#bbbb#.....",
      ".....######.....",
      "................",
    ],
  },
  {
    id: "bcaa",
    nom: "BCAA",
    court: "BCAA",
    verdict: "non",
    roles: { a: R.corail, b: R.carte, c: R.encre },
    grille: [
      "................",
      ".......##.......",
      "......####......",
      ".....######.....",
      ".....#cccc#.....",
      ".....######.....",
      "....########....",
      "....#bbbbbb#....",
      "....#aaaaaa#....",
      "....##aaaaa#....",
      "....#aaaaaa#....",
      "....##aaaaa#....",
      "....#bbbbbb#....",
      "....########....",
      "................",
      "................",
    ],
  },
  {
    id: "bruleurs",
    nom: "BRÛLEURS",
    court: "BRÛLEURS",
    verdict: "non",
    roles: { a: R.corail, b: R.carte, c: R.encre },
    grille: [
      "......a.a.......",
      ".....aa.aa......",
      ".....aaaaa......",
      "....aaaaaaa.....",
      ".....aaaaa......",
      "......####......",
      "......#cc#......",
      "......####......",
      ".....######.....",
      ".....#bbbb#.....",
      ".....#bbbb#.....",
      ".....#bbbb#.....",
      ".....#bbbb#.....",
      ".....#bbbb#.....",
      ".....######.....",
      "................",
    ],
  },
];

export const SPRITE = Object.fromEntries(SPRITES.map((s) => [s.id, s])) as Record<string, Sprite>;

/** Interpole deux couleurs hexadécimales. Sert au dégrisement des produits. */
const entre = (a: string, b: string, p: number) => {
  const lis = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [ra, ga, ba] = lis(a);
  const [rb, gb, bb] = lis(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * p).toString(16).padStart(2, "0");
  return `#${c(ra, rb)}${c(ga, gb)}${c(ba, bb)}`;
};

/** Le jeu de rôles « pas encore passé en revue » : tout part dans le trait. */
const ETEINT = { a: R.trait, b: R.fond, c: R.trait, "#": R.trait };

/**
 * Un produit dessiné à l'échelle voulue, centré sur (x, y).
 *
 * `pale` va de 0 à 1 et décolore progressivement TOUTE la grille, contour
 * compris : c'est l'état « pas encore passé en revue » de la frise. Le dégradé
 * est calculé pixel par pixel plutôt que par deux calques superposés, parce
 * qu'à mi-chemin deux calques translucides laisseraient voir le fond à travers
 * le produit.
 */
export const Pixels: React.FC<{
  sprite: Sprite;
  x: number;
  y: number;
  /** Côté d'un pixel, en unités du viewBox. */
  k: number;
  opacity?: number;
  /** 0 = couleur du produit, 1 = entièrement décoloré. */
  pale?: number;
}> = ({ sprite, x, y, k, opacity = 1, pale = 0 }) => {
  const cote = 16 * k;
  return (
    <g transform={`translate(${x - cote / 2} ${y - cote / 2})`} opacity={opacity}>
      {sprite.grille.flatMap((ligne, j) =>
        ligne.split("").map((c, i) => {
          const vive = couleurDe(c, sprite.roles);
          if (vive === null) return null;
          const morte = (ETEINT as Record<string, string>)[c] ?? R.trait;
          return (
            <rect
              key={`${i}-${j}`}
              x={i * k}
              y={j * k}
              width={k + 0.5}
              height={k + 0.5}
              fill={pale <= 0 ? vive : entre(vive, morte, pale)}
            />
          );
        }),
      )}
    </g>
  );
};
