/**
 * Bruitages du bloc 2 — les sons qui ponctuent l'animation.
 *
 * Une seule table, lue à deux endroits : le montage complet, où la voix passe
 * devant et où les volumes restent bas, et la composition « animation seule »,
 * qui n'a pas de voix et relève donc tout d'un cran (voir GAIN_SEUL).
 *
 * Les instants sont en secondes depuis le début du bloc 2, ce qui est aussi le
 * temps propre de l'animation : la même table sert des deux côtés sans décalage
 * à calculer. Les repères viennent de `reperes.ts` plutôt que d'être recopiés en
 * clair, pour qu'un recalage de la voix déplace les sons avec l'image.
 *
 * Les fichiers sont synthétisés par `scripts/bruitages.py`.
 */

import { MARCHES } from "./Adaptation";
import { ANIM_FIN, B, BANDEAU_BLOC3 } from "./reperes";

/** Durée du souffle de sortie, telle que `scripts/bruitages.py` la synthétise. */
const WHOOSH_OUT_DUREE = 0.45;

export type Bruitage = {
  fichier: string;
  t: number;
  volume: number;
  /**
   * Instant retenu quand l'animation est jouée seule, si le calage du montage
   * ne tient pas. Le cas ne concerne que la sortie : dans le montage le whoosh
   * déborde sur le retour au visage, alors que l'animation seule s'arrête à
   * ANIM_FIN et le coupe avant qu'il ne monte.
   */
  tSeul?: number;
};

/** Ce qui ponctue l'animation elle-même. */
export const BRUITAGES_ANIMATION: Bruitage[] = [
  { fichier: "whoosh-in.wav", t: 0.0, volume: 0.3 }, // bascule vers l'animation
  { fichier: "apparition.wav", t: 0.36, volume: 0.26 }, // le graphique se pose
  { fichier: "pop.wav", t: B.neat, volume: 0.2 }, // silhouette
  { fichier: "pop.wav", t: B.thyroide, volume: 0.2 }, // thermomètre
  ...MARCHES.map((t) => ({ fichier: "marche.wav", t, volume: 0.34 })),
  { fichier: "clic.wav", t: B.terme, volume: 0.75 }, // « Thermogenèse adaptative »
  { fichier: "carillon.wav", t: B.survie, volume: 0.28 }, // bandeau final
  {
    fichier: "whoosh-out.wav",
    t: 12.45, // retour au visage, dans le montage
    tSeul: ANIM_FIN - WHOOSH_OUT_DUREE, // retombe sur la dernière image
    volume: 0.26,
  },
];

/** Ponctuation propre au montage : l'incrustation du bloc 3, après l'animation. */
export const BRUITAGES_BLOC3: Bruitage[] = [
  { fichier: "clic.wav", t: BANDEAU_BLOC3.debut, volume: 0.6 },
];

/**
 * Sans voix par-dessus, les mêmes volumes deviennent inaudibles : ils avaient
 * été réglés pour passer sous la parole. Ce facteur les remonte pour l'écoute
 * seule, en gardant les proportions entre les sons — le rapport entre un pop et
 * une marche reste celui qui a été réglé au montage.
 */
export const GAIN_SEUL = 1.8;
