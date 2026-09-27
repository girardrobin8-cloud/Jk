/**
 * Repères de montage — Reel Jour 5, « stagner, c'est ce qui attend ton programme ».
 *
 * ── Ce que Robin a livré ────────────────────────────────────────────────
 *
 * Troisième fois de suite : le fichier fourni est un export audio de 50,63 s
 * sur fond noir avec les sous-titres incrustés, pas le tournage. Le brief
 * réclame pourtant DEUX blocs caméra précis — B1 en entier et B3 — et interdit
 * tout autre retour visuel. Il n'y a rien à montrer, donc les quatre blocs sont
 * animés, et `CAMERA` ci-dessous rend B1 et B3 à la caméra en une ligne le jour
 * où le tournage arrive. Le découpage, lui, est déjà celui du brief à la
 * lettre : deux blocs caméra, pas un de plus.
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * Bande de sous-titres extraite à 12 images par seconde, dédupliquée, 175 vues
 * relues une à une. Le découpage du brief tombe presque exactement sur la
 * parole réelle : ses quatre bornes (21 s, 29,5 s, 35,5 s) sont à moins de
 * quatre dixièmes des silences mesurés, ce qui est rare et mérite d'être dit.
 * Les bornes retenues ci-dessous sont les silences eux-mêmes.
 *
 * ── Ce que la relecture précise ─────────────────────────────────────────
 *
 *  · Robin dit « les 2 fonctionnent aussi bien l'un que l'autre » — le brief
 *    parlait d'« un résultat similaire », c'est plus catégorique que ça ;
 *  · l'étude est « 1 minute contre 3, à l'entraînement identique ailleurs, sur
 *    8 semaines », et le gain est « plus de force ET de muscle » ;
 *  · le CTA complet est « envoie-moi PROGRESSION en DM et on regardera ton
 *    profil ensemble ».
 *
 * ── Blancs resserrés, niveau laissé tel quel ────────────────────────────
 *
 * Quatre tranches conservées, 0,67 s retirées seulement : 50,63 s → 49,96 s.
 * Cette prise est déjà serrée, il n'y avait presque rien à enlever.
 *
 * Le niveau n'est PAS ramené à -16 LUFS comme le brief le demande : la prise
 * est à -14,6 LUFS pour 2,8 LU d'amplitude — exactement le niveau du Jour 1
 * livré, et dans la ligne des trois autres. Le réglage tient en une ligne si
 * Robin préfère la cible du brief.
 *
 * Les repères restent écrits en temps RUSH et passent par `mappe()`.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), cyan et ambre en
 * secondaire, corail pour la stagnation et les fausses pistes.
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s, elle ne sert qu'au son. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 50.63;

/** Convertit une seconde de l'export d'origine en seconde du montage resserré. */
export const mappe = (t: number) => {
  let cumul = 0;
  for (const [debut, images] of SEGMENTS) {
    const fin = debut + images / FPS_COUPE;
    if (t < debut) return cumul / FPS_COUPE;
    if (t < fin) return (cumul + (t - debut) * FPS_COUPE) / FPS_COUPE;
    cumul += images;
  }
  return cumul / FPS_COUPE;
};

export type Beat = {
  id: string;
  /** `cam` = rush conservé tel quel ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  /** Transcription relevée sur les sous-titres, mot pour mot. */
  dit: string;
};

/**
 * Les beats rendus en CAMÉRA.
 *
 * Vide : l'export livré n'a pas d'image. Le brief veut B1 et B3 en tête
 * parlante et rien d'autre — les ajouter ici le jour du tournage suffit, et le
 * découpage sera exactement celui qu'il décrit.
 */
export const CAMERA: string[] = [];

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 20.95,
    dit: "Stagner, c'est ce qui attend ton programme parce que tu ne pousses pas plus loin. Même si tu as le meilleur programme du monde, tu finiras par stagner. Mais alors comment on fait pour progresser sur le long terme ? Beaucoup de personnes diront qu'il faut augmenter le volume, en réalité ton muscle grossit surtout grâce à la tension mécanique. Sans augmenter cette tension, le signal reste le même et ton corps n'a plus de raison de construire encore plus de muscles.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 20.95,
    fin: 29.0,
    dit: "Pour progresser, tu peux simplement augmenter le poids sur ta barre, ou faire plus de répétitions à charge égale. Les 2 fonctionnent aussi bien l'un que l'autre.",
  },
  {
    id: "B3",
    type: "cam",
    debut: 29.0,
    fin: 34.75,
    dit: "Mais augmenter ton nombre de séries, ou par exemple réduire son temps de repos, n'est pas une solution idéale.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 34.75,
    fin: DUREE_RUSH,
    dit: "Une étude a comparé 1 minute de temps de repos contre 3, à l'entraînement identique ailleurs, sur 8 semaines. Le groupe qui se reposait le plus longtemps a gagné plus de force et de muscle. Si toi aussi tu veux continuer à progresser, envoie-moi PROGRESSION en DM et on regardera ton profil ensemble.",
  },
];

/** Les mêmes beats, exprimés dans le temps du montage resserré. */
export const BEATS: Beat[] = BEATS_RUSH.map((b) => ({
  ...b,
  debut: mappe(b.debut),
  fin: mappe(b.fin),
}));

/** Durée des fondus caméra ↔ animation. Le brief interdit le cut sec. */
export const FONDU = 0.34;

export const s = (secondes: number) => Math.round(secondes * FPS);
