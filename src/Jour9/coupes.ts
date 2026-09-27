/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.24 s ont été ramenés à 0.16 s, soit 2.63 s retirées, 36.63 s → 34.00 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 76],
  [3.541667, 77],
  [6.958333, 63],
  [9.750000, 29],
  [11.250000, 106],
  [15.875000, 106],
  [20.458333, 49],
  [22.750000, 63],
  [25.541667, 40],
  [27.458333, 51],
  [29.791667, 30],
  [31.125000, 75],
  [34.500000, 51],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 34.0000;
