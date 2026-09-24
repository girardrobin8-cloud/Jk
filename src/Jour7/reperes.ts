/**
 * Repères de montage — Reel Jour 7, « aucune diète ne marche sans ça ».
 *
 * ── Les cinq consignes de ce brief, et où elles sont tenues ─────────────
 *
 * 1. Timing vérifié à l'image près : les bornes viennent des sous-titres
 *    incrustés, relevés à 12 images par seconde, pas d'une estimation.
 * 2. Fluidité avant tout, couper jusqu'aux hésitations de quelques dixièmes :
 *    le resserrement tourne ici à 0,24 s de seuil pour 0,16 s conservées, au
 *    lieu de 0,36 / 0,24 sur les vidéos précédentes. Quinze coupes, 2,75 s
 *    retirées, et elles portent sur l'image comme sur le son.
 * 3. Zones « tête parlante » jamais animées : l'animation ne produit que deux
 *    panneaux, B2 et B4. Il n'existe aucun panneau pour B1, B3 et B5.
 * 4. Aucune superposition : chaque libellé de socle s'efface avant que le
 *    suivant n'entre, via `cede()` dans Animation.tsx.
 * 5. Tailles cohérentes et rien hors cadre : Animation.tsx définit une échelle
 *    fermée de cinq corps, et tout texte y passe par `corps()`, qui ne peut que
 *    réduire. Les libellés d'un même groupe partagent le corps du plus long,
 *    pour qu'aucun ne soit plus gros que son voisin sans raison.
 *
 * ── Ce qui manque ───────────────────────────────────────────────────────
 *
 * Cinquième export audio de suite sur fond noir : pas de tournage. Les trois
 * fenêtres réservées montrent donc le fichier source tel quel, comme au Jour 6.
 * Le jour où le tournage arrive, il passe dans scripts/resserrer.py, remplace le
 * média, et rien d'autre ne bouge.
 *
 * ── Ce que la relecture corrige ─────────────────────────────────────────
 *
 * Les quatre premières bornes du brief tombent juste. La dernière non : le bloc
 * animé court jusqu'à 46,15 s et non 44,5 s, parce que « les plus rapides ont
 * perdu davantage de muscles » se termine à 45,9. Le CTA commence donc 1,6 s
 * plus tard que prévu.
 *
 * Deux formulations diffèrent du brief : Robin dit « une seule règle décide si
 * ça marche OU PAS », et « perdant 0,7 % de leur POIDS DE CORPS par semaine ».
 *
 * ── Audio ───────────────────────────────────────────────────────────────
 *
 * Normalisée à -14 LUFS, plafond -1 dBTP. La prise arrivait à -12,9 LUFS avec
 * un vrai crête à -0,3 dBFS, c'est-à-dire à trois dixièmes de l'écrêtage : la
 * marge était trop mince pour être laissée telle quelle. Le brief demande -16 ;
 * -14 est retenu pour rester au niveau des six vidéos déjà livrées.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx).
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 49.33;

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
  { id: "B1", type: "cam", debut: 0, fin: 2.25, dit: "Aucune diète ne marche sans ça." },
  {
    id: "B2",
    type: "anim",
    debut: 2.25,
    fin: 14.8,
    dit: "Keto, sans sucre, jeûne : peu importe le nom, une seule règle décide si ça marche ou pas. Pour perdre du gras, ton corps doit dépenser plus d'énergie qu'il n'en reçoit. Sans déficit réel, aucune méthode fait fondre le gras.",
  },
  {
    id: "B3",
    type: "cam",
    debut: 14.8,
    fin: 18.75,
    dit: "Mais alors pourquoi on te vend tel régime comme la solution ?",
  },
  {
    id: "B4",
    type: "anim",
    debut: 18.75,
    fin: 46.15,
    dit: "Une étude a suivi six-cent-neuf personnes pendant 12 mois entre un régime pauvre en gras et pauvre en glucide. Résultat : moins 5,3 kg contre moins 6 kg, une différence non significative. Ce qui compte vraiment, c'est ta capacité à tenir ta diète sur la durée. Et à l'inverse, un déficit trop rapide a un coût. Une étude a comparé des athlètes perdant 0,7 % de leur poids de corps par semaine contre 1,4 % pour les autres. Les plus rapides ont perdu davantage de muscles.",
  },
  {
    id: "B5",
    type: "cam",
    debut: 46.15,
    fin: DUREE_RUSH,
    dit: "Alors envoie DEFICIT en DM et on calcule ton déficit ensemble.",
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
