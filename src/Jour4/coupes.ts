/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.36 s ont été ramenés à 0.24 s, soit 3.09 s retirées, 91.17 s → 88.08 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 127],
  [5.625000, 101],
  [9.958333, 347],
  [24.791667, 412],
  [42.625000, 364],
  [58.208333, 186],
  [66.291667, 143],
  [72.500000, 79],
  [76.083333, 290],
  [88.458333, 65],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 88.0833;
