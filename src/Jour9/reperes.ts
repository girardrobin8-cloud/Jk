/**
 * Repères de montage — Reel Jour 9, « immobile, c'est peut-être ta pire option ».
 *
 * ── La structure de rythme du brief, et où elle est tenue ───────────────
 *
 * 1. Hook de 3 à 5 s maximum : il fait 2,8 s dans la prise réelle, mot choc en
 *    premier — « rester immobile ». Rien à recadrer.
 * 2. Un bloc animé peut durer plus de dix secondes s'il est rythmé : B4 en fait
 *    quinze et se joue en trois écrans successifs.
 * 3. Un seul retour caméra coupe le motion design, B3, plus la fin. Dans la
 *    limite des deux autorisés.
 * 4. Les zones caméra ne sont jamais animées : l'animation ne produit que deux
 *    panneaux, B2 et B4.
 * 5. Le CTA reste en caméra, sans texte ni animation.
 * 6. Tout silence coupé : resserrement à 0,24 s de seuil pour 0,16 s gardées,
 *    treize coupes, 2,63 s retirées, sur l'image comme sur le son.
 * 7. Aucun chevauchement, tout dans le cadre, tailles cohérentes : `TAILLE`
 *    dans Animation.tsx est une échelle fermée, et chaque bascule laisse un
 *    battement entre le texte qui part et celui qui arrive.
 *
 * ── Ce que la prise change par rapport au brief ─────────────────────────
 *
 * Elle fait 36,63 s et non 45 : Robin va plus vite que prévu partout. Les cinq
 * bornes sont donc toutes avancées, la dernière de près de sept secondes. Les
 * 128 vues de sous-titres relevées les replacent une à une dans un silence
 * mesuré.
 *
 * Deux formulations diffèrent. Le brief écrivait « pas tout à fait » ; Robin dit
 * « ah bah c'est pas tout à fait le cas », plus parlé. Et la nuance finale est
 * « ne jamais lever le pied de l'entraînement finit toujours par se payer », là
 * où le brief disait « ne jamais lever le pied ».
 *
 * ── Le fichier livré, et l'audio ────────────────────────────────────────
 *
 * Sixième export audio de suite sur fond noir : pas de tournage. Les quatre
 * fenêtres réservées montrent donc le fichier source tel quel.
 *
 * La prise arrivait à -8,9 LUFS avec un vrai crête à +1,1 dBFS : elle écrête,
 * comme celle du Jour 6. Elle est ramenée à -14 LUFS, plafond -1 dBTP.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx).
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 36.63;

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
  /** Transcription relevée sur les sous-titres, mot pour mot. */
  dit: string;
};

const BEATS_RUSH: Beat[] = [
  { id: "B1", type: "cam", debut: 0, fin: 3.2, dit: "Rester immobile, c'est sûrement ta pire option pour un jour de repos." },
  {
    id: "B2",
    type: "anim",
    debut: 3.2,
    fin: 11.0,
    dit: "On pense souvent qu'un jour de repos, c'est un jour où on ne bouge pas du tout, le corps resterait au calme pour mieux récupérer. Ah bah c'est pas tout à fait le cas.",
  },
  {
    id: "B3",
    type: "cam",
    debut: 11.0,
    fin: 15.7,
    dit: "Une méta-analyse a comparé plusieurs techniques de récupération entre elles, activités légères comprises.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 15.7,
    fin: 31.0,
    dit: "On ressort que l'activité légère réduit la sensation de courbature et de fatigue en comparaison à l'immobilité totale. Mais attention, ça répare pas le muscle plus vite, le dommage musculaire suit son cours. Ce qui change, c'est ta perception de la douleur, pas la vitesse de guérison.",
  },
  {
    id: "B5",
    type: "cam",
    debut: 31.0,
    fin: 34.2,
    dit: "Par contre, ne jamais lever le pied de l'entraînement finit toujours par se payer.",
  },
  {
    id: "B6",
    type: "cam",
    debut: 34.2,
    fin: DUREE_RUSH,
    dit: "Envoie-moi un REPOS en DM si tu veux qu'on voit ça ensemble.",
  },
];

/** Les mêmes beats, exprimés dans le temps du montage resserré. */
export const BEATS: Beat[] = BEATS_RUSH.map((b) => ({
  ...b,
  debut: mappe(b.debut),
  fin: mappe(b.fin),
}));

/** Durée des fondus caméra ↔ animation. Le brief interdit le cut sec. */
export const FONDU = 0.3;

export const s = (secondes: number) => Math.round(secondes * FPS);
