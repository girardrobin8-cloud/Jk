/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.36 s ont été ramenés à 0.24 s, soit 0.75 s retirées, 48.71 s → 47.96 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 552],
  [23.250000, 55],
  [25.916667, 239],
  [36.000000, 305],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 47.9583;
