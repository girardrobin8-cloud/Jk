/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.24 s ont été ramenés à 0.16 s, soit 2.75 s retirées, 49.33 s → 46.58 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 7],
  [0.500000, 38],
  [2.541667, 45],
  [4.500000, 77],
  [8.125000, 90],
  [12.083333, 66],
  [14.916667, 91],
  [18.958333, 77],
  [22.416667, 59],
  [25.000000, 89],
  [28.791667, 131],
  [34.458333, 176],
  [41.875000, 47],
  [43.958333, 54],
  [46.333333, 71],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 46.5833;
