/**
 * Repères de montage — Reel Jour 10, « 3, c'est le seul nombre de compléments
 * qui comptent vraiment ».
 *
 * ── Les consignes du brief, et où elles sont tenues ─────────────────────
 *
 * 1. Timecodes à la frame près : les 201 vues de sous-titres relevées sur
 *    l'export donnent chaque mot à la dixième ; les bornes ci-dessous sont
 *    posées dessus, puis transposées par `mappe()` dans le montage resserré.
 * 2. Micro-silences coupés, image comprise : resserrement à 0,24 s de seuil
 *    pour 0,16 s gardées, onze coupes, 2,29 s retirées, 56,71 s → 54,42 s.
 * 3. Zones « tête parlante » jamais animées : B1, B3 et B5 sont des espaces
 *    réservés, l'animation n'y dessine rien.
 * 4. Aucune superposition, tailles cohérentes, tout dans le cadre : `TAILLE`
 *    dans Animation.tsx est une échelle fermée, et chaque écran s'efface
 *    entièrement avant que le suivant n'entre.
 * 5. CTA en tête parlante : B5 porte la transition ET le CTA, sans un pixel
 *    d'animation par-dessus.
 *
 * ── Ce que la prise change par rapport au brief ─────────────────────────
 *
 * Elle fait 56,71 s, soit exactement la durée annoncée, et les cinq blocs
 * tombent à une demi-seconde près là où le brief les plaçait. Trois écarts de
 * formulation, et c'est la vidéo qui prime :
 *
 * • Le hook dit « c'est le SEUL nombre de compléments qui comptent », le brief
 *   avait laissé tomber « seul ».
 * • La caféine est donnée « de 3 à 6 mg par kilo de poids de corps », pas
 *   « 6 mg/kg » sec — c'est d'ailleurs la fourchette de la source (Guest 2021).
 *   L'écran affiche donc « 3 À 6 MG/KG ».
 * • La phrase de bascule de B3 est prononcée avant l'heure : « il y en a
 *   vraiment que 3 avec un vrai niveau de preuve scientifique derrière » tombe
 *   à 8,3 s, donc DANS le bloc animé. Elle y est traitée en révélation plein
 *   écran, et B3 ne garde que « pour les pratiquants en musculation. En n°1, on
 *   a la créatine. »
 *
 * ── Le fichier livré, et l'audio ────────────────────────────────────────
 *
 * Septième export audio de suite sur fond noir avec sous-titres incrustés : pas
 * de tournage. Les trois fenêtres réservées montrent donc le fichier source tel
 * quel — voir l'en-tête de Montage.tsx.
 *
 * La prise arrive cette fois à -17,1 LUFS pour un vrai crête à -3,7 dBFS :
 * l'inverse du défaut des Jours 6 et 9, aucun écrêtage mais nettement plus bas
 * que le reste de la série. Elle est remontée à -14 LUFS, plafond -1 dBTP.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx).
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 56.71;

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
  /** `cam` = espace réservé, rush intact ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  /** Transcription relevée sur les sous-titres incrustés, mot pour mot. */
  dit: string;
};

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 2.95,
    dit: "3, c'est le seul nombre de compléments qui comptent vraiment.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 2.95,
    fin: 11.15,
    dit: "Des rayons entiers de produits, tous vendus comme indispensables. La réalité est bien plus simple que ça : il y en a vraiment que 3, avec un vrai niveau de preuve scientifique derrière.",
  },
  {
    id: "B3",
    type: "cam",
    debut: 11.15,
    fin: 14.55,
    dit: "Pour les pratiquants en musculation. En n°1, on a la créatine.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 14.55,
    fin: 48.05,
    dit: "C'est le complément le plus efficace disponible pour les athlètes. C'est aussi le complément le plus étudié, avec quasiment 1000 études sur le sujet. En n°2, on a la caféine, prise de 3 à 6 mg par kilo poids corps avant l'entraînement : elle améliore mesurément la performance. Et pour finir la 3e, la whey — pratique, pas magique, juste une source de protéines, rien de plus si ton total est déjà atteint. Mais elle reste quand même très intéressante du fait de son aspect économique, mais de forte concentration en leucine, qui active la voie mTOR, celle qui est responsable de la construction musculaire. Le reste, brûleur de graisse compris : peu d'effets négatifs, ou carrément pas d'effets démontrés.",
  },
  {
    id: "B5",
    type: "cam",
    debut: 48.05,
    fin: DUREE_RUSH,
    dit: "Alors le reste de ton budget, arrête de perdre ton argent avec des compléments : concentre-toi sur une alimentation brute et équilibrée. Envoie-moi COMPLÉMENT en DM et on fait le tri sur tes compléments.",
  },
];

/** Les mêmes beats, exprimés dans le temps du montage resserré. */
export const BEATS: Beat[] = BEATS_RUSH.map((b) => ({
  ...b,
  debut: mappe(b.debut),
  fin: mappe(b.fin),
}));

/**
 * Les beats à repasser en caméra le jour où Robin livre son tournage : aucun.
 * Les deux blocs animés le restent, les trois autres sont déjà du rush brut.
 * La liste existe pour que la bascule reste une ligne à écrire ici.
 */
export const CAMERA: string[] = [];

/** Durée des fondus caméra ↔ animation. Le brief interdit le cut sec. */
export const FONDU = 0.3;

export const s = (secondes: number) => Math.round(secondes * FPS);
