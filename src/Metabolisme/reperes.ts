/**
 * Repères de montage — « Pourquoi ta perte de poids stagne ».
 *
 * ⚠️ Les timecodes ci-dessous ne sont PAS ceux du brief : ils ont été relevés
 * sur les rushes eux-mêmes, par analyse de l'enveloppe sonore (détection des
 * plages de parole et des pauses). Le débit réel est environ 25 % plus rapide
 * que l'estimation du brief — la prise fait 32,9 s et non 40 s.
 *
 * Pour réajuster après un nouveau montage son : ne toucher qu'à ce fichier.
 */

export const FPS = 30;

/** Durées exactes des deux fichiers sources. */
export const RUSH_A_DUREE = 6.477;
export const RUSH_B_DUREE = 26.423;

/**
 * Repères relevés dans le rush B, en secondes depuis son début.
 *
 * Correspondance avec le texte dit :
 *   0.33  « Ton corps réduit sa dépense énergétique… »
 *   4.73  « Il bouge moins spontanément, »
 *   6.00  « ta thyroïde tourne un peu au ralenti… »
 *   8.40  (pause de 0,45 s — les « … » du script)
 *   8.85  « C'est un mécanisme de survie, pas un échec de ta part. »
 *  12.40  fin du bloc 2
 *  12.83  « La solution : recalcule tes besoins… »
 *  19.95  fin du bloc 3
 *  20.58  « Si ta perte stagne… »
 *  26.30  fin de la prise
 */
export const B = {
  parole: 0.33,
  neat: 4.73,
  thyroide: 6.0,
  terme: 7.2, // incrustation « Thermogenèse adaptative »
  survie: 8.85,
  finBloc2: 12.4,
  debutBloc3: 12.83,
  finBloc3: 19.95,
  debutBloc4: 20.58,
  fin: 26.3,
};

/** L'animation se retire juste avant que le bloc 3 ne commence. */
export const ANIM_FIN = 12.62;

/** Incrustation discrète pendant le bloc 3, resserrée à l'intérieur de la phrase. */
export const BANDEAU_BLOC3 = { debut: 13.4, fin: 19.6 };

export const s = (secondes: number) => Math.round(secondes * FPS);
