/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.36 s ont été ramenés à 0.24 s, soit 5.24 s retirées, 90.17 s → 84.93 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 30;

export const SEGMENTS: [number, number][] = [
  [0.000000, 11],
  [0.533333, 78],
  [3.400000, 92],
  [7.166667, 139],
  [11.933333, 176],
  [17.933333, 165],
  [23.866667, 178],
  [30.433333, 144],
  [35.533333, 105],
  [39.433333, 291],
  [49.366667, 53],
  [51.400000, 81],
  [54.566667, 171],
  [60.733333, 242],
  [69.066667, 477],
  [85.333333, 145],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 84.9333;
