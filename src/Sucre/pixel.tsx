import { C } from "./reperes";

/**
 * Petit moteur de pixel-art : des bitmaps écrits en texte, rendus en carrés SVG.
 *
 * Les dessins sont saisis comme des lignes de caractères plutôt que comme des
 * tracés vectoriels. C'est lisible dans le fichier — on voit le personnage en
 * lisant le code — et surtout ça garantit la grille : un contour vectoriel
 * aurait des bords à mi-pixel dès qu'on change d'échelle, et l'aspect « jeu
 * ancien » tiendrait mal.
 */

export type Palette = Record<string, string>;

export const Pixels: React.FC<{
  bitmap: readonly string[];
  palette: Palette;
  /** Côté d'un pixel, en unités du viewBox. */
  taille: number;
  x?: number;
  y?: number;
  opacite?: number;
}> = ({ bitmap, palette, taille, x = 0, y = 0, opacite = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacite}>
    {bitmap.flatMap((ligne, j) =>
      [...ligne].map((car, i) => {
        const couleur = palette[car];
        if (!couleur) {
          return null;
        }
        return (
          <rect
            key={`${i}-${j}`}
            x={i * taille}
            y={j * taille}
            // Un demi-pixel de recouvrement : sans lui, l'antialiasing laisse
            // un liseré de fond entre les carrés voisins.
            width={taille + 0.5}
            height={taille + 0.5}
            fill={couleur}
          />
        );
      }),
    )}
  </g>
);

export const largeur = (bitmap: readonly string[]) => bitmap[0].length;
export const hauteur = (bitmap: readonly string[]) => bitmap.length;

/** Personnage-repère, présent d'un bout à l'autre des plans animés. */
export const PERSO = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "...hssssssh...",
  "...hsbssbsh...",
  "...hssssssh...",
  "...hssmmssh...",
  "....ssssss....",
  ".....ssss.....",
  "..tttttttttt..",
  ".stttttttttts.",
  ".stttttttttts.",
  "..tttttttttt..",
  "..tttttttttt..",
  "..pppp..pppp..",
  "..pppp..pppp..",
  "..pppp..pppp..",
  "..kkkk..kkkk..",
] as const;

/**
 * Même personnage, yeux fermés.
 *
 * Les pixels des yeux repassent en teint de peau plutôt qu'en noir étiré : à
 * 30 images par seconde, l'absence d'yeux pendant deux frames se lit comme un
 * clignement, alors qu'une barre sombre se lit comme un froncement.
 */
export const PERSO_CLIN = PERSO.map((l, j) =>
  j === 3 ? "...hssssssh..." : l,
) as readonly string[];

export const PALETTE_PERSO: Palette = {
  h: "#2B2118",
  s: "#E8B98C",
  b: C.encre,
  m: "#C4756B",
  t: C.bleu,
  p: "#3A4256",
  k: C.encre,
};

/** Morceau de sucre. */
export const SUCRE = [
  "..cccccc..",
  ".cwwwwwwc.",
  ".cwwwwwwc.",
  ".cwwwwwwc.",
  ".cwwwwwwc.",
  ".cwwwwwwc.",
  ".cwwwwwwc.",
  "..cccccc..",
] as const;

export const PALETTE_SUCRE: Palette = { c: C.sucre, w: "#FFFFFF" };

/** Foie, vu de face et très simplifié — il doit se lire à 60 pixels de haut. */
export const FOIE = [
  "..ffffffff..",
  ".ffffffffff.",
  "ffffffffffff",
  "ffffffffffff",
  "fffffffffff.",
  ".fffffffff..",
  "..fffffff...",
  "...fffff....",
  "....fff.....",
] as const;

export const PALETTE_FOIE: Palette = { f: "#B4574E" };

/** Vaisseau sanguin : un tube en coupe. */
export const VAISSEAU = [
  "vvvvvvvvvvvv",
  "vvvvvvvvvvvv",
  "rrrrrrrrrrrr",
  "rrrrrrrrrrrr",
  "rrrrrrrrrrrr",
  "vvvvvvvvvvvv",
  "vvvvvvvvvvvv",
] as const;

export const PALETTE_VAISSEAU: Palette = { v: "#C86A62", r: "#E0483C" };

/** Silhouette des grilles de groupes : une seule forme, deux teintes. */
export const SILHOUETTE = [
  "..ss..",
  "..ss..",
  "ssssss",
  "ssssss",
  "ssssss",
  ".ssss.",
  ".s..s.",
  ".s..s.",
  ".ss.ss",
] as const;

/** Croix rouge et coche verte, les deux verdicts du montage. */
export const CROIX = [
  "x......x",
  ".x....x.",
  "..x..x..",
  "...xx...",
  "...xx...",
  "..x..x..",
  ".x....x.",
  "x......x",
] as const;

export const COCHE = [
  "......oo",
  ".....oo.",
  "....oo..",
  "o..oo...",
  "oo.oo...",
  ".ooo....",
  "..oo....",
  "........",
] as const;

export const PALETTE_CROIX: Palette = { x: C.rouge };
export const PALETTE_COCHE: Palette = { o: C.vert };
