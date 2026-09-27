/**
 * Repères de montage — Reel Jour 2, « combien de séries par semaine ».
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * Comme au Jour 1, Robin incruste ses sous-titres mot à mot. Ce sont eux la
 * source : la bande de sous-titres a été extraite à 10 images par seconde, les
 * images dédupliquées sur un masque de la couleur crème du texte (250, 248,
 * 215) — le fond bouge derrière, une comparaison brute changerait à chaque
 * image — et les 399 vues restantes relues une à une. Voir la méthode dans
 * l'en-tête de src/Jour1/reperes.ts : elle vaut les mots ET les timecodes
 * réels, tels qu'ils s'affichent au spectateur.
 *
 * ── Ce que ça règle dans le brief ───────────────────────────────────────
 *
 * Le brief posait trois questions ouvertes. Les sous-titres y répondent :
 *
 *  1. LE HOOK. Le brief craignait que la main de Robin ait masqué le texte.
 *     Elle ne l'a pas masqué : « tu fais sûrement 2 fois trop de séries dans
 *     tes entraînements, tu dois adapter ton volume d'entraînement à ton
 *     profil ». Il n'y a pas de « ou pas assez ».
 *  2. LA FOURCHETTE. Confirmée à la lettre : « entre 10 et 20 séries par
 *     muscle par semaine », énoncée à 46,7 s. Et Robin donne plus loin SON
 *     chiffre à lui, que le brief n'avait pas vu : « aux alentours de 10 à 12
 *     séries », à 78,7 s.
 *  3. LE CTA. Il n'y en a pas. Le dernier mot tombe à 90,0 s et la vidéo
 *     s'arrête à 90,17. Rien n'est ajouté : inventer un CTA muet à l'écran
 *     contredirait la voix.
 *
 * Le découpage du brief (des blocs ronds de dix secondes) ne correspond à rien
 * dans la prise réelle. Les bornes ci-dessous tombent toutes dans un SILENCE
 * entre deux mots, relevé sur les sous-titres, jamais au milieu d'une phrase.
 *
 * ── Les blancs sont resserrés ───────────────────────────────────────────
 *
 * Seize blancs de plus de 0,36 s sont ramenés à 0,24 s : 5,24 s retirées,
 * 90,17 s → 84,93 s. La coupe est faite par scripts/resserrer.py, appliquée à
 * l'image ET au son par le même filtre — les sous-titres incrustés de Robin
 * restent donc calés sur sa voix à l'image près.
 *
 * Le niveau, lui, n'est pas retouché : la prise est à -13,9 LUFS pour 4,4 LU
 * d'amplitude, soit le niveau du Jour 1 livré.
 *
 * ── Pourquoi les repères restent en temps RUSH ──────────────────────────
 *
 * Couper déplace tout ce qui suit. Les bornes et les repères d'animation ont
 * été relevés sur les sous-titres du rush d'ORIGINE ; les réécrire à la main
 * après chaque coupe serait le meilleur moyen de les désynchroniser sans s'en
 * apercevoir. Ils restent donc écrits en temps rush, et passent par `mappe()`,
 * qui lit la table produite par le script. Recouper ne demande qu'une
 * régénération.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), plus un cyan secondaire.
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

export const FPS = FPS_COUPE;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de la prise brute livrée par Robin, pour mémoire. */
export const DUREE_RUSH = 90.17;

/**
 * Convertit une seconde du rush d'origine en seconde du montage resserré.
 *
 * Un instant tombé DANS un blanc coupé est ramené à la fin de la tranche qui le
 * précède — c'est-à-dire à l'instant où la parole reprend. C'est ce qu'on veut
 * pour une borne de beat : elle se pose sur la première syllabe de la phrase
 * suivante, pas sur du vide.
 */
export const mappe = (t: number) => {
  let cumul = 0;
  for (const [debut, images] of SEGMENTS) {
    const fin = debut + images / FPS;
    if (t < debut) return cumul / FPS;
    if (t < fin) return (cumul + (t - debut) * FPS) / FPS;
    cumul += images;
  }
  return cumul / FPS;
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

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 7.15,
    dit: "Tu fais sûrement 2 fois trop de séries dans tes entraînements. Tu dois adapter ton volume d'entraînement à ton profil.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 7.15,
    fin: 17.7,
    dit: "Par exemple, une méthodologie récente et large a réanalysé 67 études, plus de 2000 participants, avec une méthode plus précise pour ne compter que les séries qui ciblent vraiment chaque muscle.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 17.7,
    fin: 23.65,
    dit: "Le résultat de l'étude : plus 0,24 % de gains par série, et les rendements diminuent vite.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 23.65,
    fin: 30.1,
    dit: "Sauf qu'au-delà d'un certain volume, c'est plus ta capacité à stimuler le muscle qui limite tes gains, c'est ta récupération.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 30.1,
    fin: 39.0,
    dit: "Le nombre de séries, c'est une moitié de l'équation. L'autre, c'est la proximité à l'échec : à quel point tu pousses chaque série au plus proche de l'échec.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 39.0,
    fin: 44.15,
    dit: "Parce que même une série à l'échec par exercice suffit à produire des gains mesurables.",
  },
  {
    id: "B7",
    type: "anim",
    debut: 44.15,
    fin: 54.2,
    dit: "La zone la plus étudiée qui marche, c'est entre 10 et 20 séries par muscle par semaine. Alors oui, ça peut sembler large, mais elle dépend énormément de facteurs individuels.",
  },
  {
    id: "B8",
    type: "anim",
    debut: 54.2,
    fin: 60.5,
    dit: "Mais une étude comparant volume modéré et volume élevé n'a trouvé aucune différence sur la plupart des muscles.",
  },
  {
    id: "B9",
    type: "anim",
    debut: 60.5,
    fin: 68.8,
    dit: "On pourrait conclure que la fourchette suffit amplement, mais tu devras prendre en compte ton niveau d'expérience, ta capacité de récupération et ta génétique.",
  },
  {
    id: "B10",
    type: "anim",
    debut: 68.8,
    fin: 76.75,
    dit: "Sur le même programme, une étude a mesuré des gains allant de 0 à 59 % de muscles selon les personnes : chacun réagit différemment.",
  },
  {
    id: "B11",
    type: "anim",
    debut: 76.75,
    fin: 85.2,
    dit: "Je serai plutôt d'avis d'avoir un volume aux alentours de 10 à 12 séries par muscle et par semaine, pour pallier au fait que les gens ne sont souvent pas à l'échec musculaire.",
  },
  {
    id: "B12",
    type: "anim",
    debut: 85.2,
    fin: DUREE_RUSH,
    dit: "Plus tu augmenteras cette intensité à l'entraînement, plus tu pourras diminuer le nombre de séries par semaine.",
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
