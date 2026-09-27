/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.24 s ont été ramenés à 0.16 s, soit 2.29 s retirées, 56.71 s → 54.42 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 4],
  [0.291667, 62],
  [3.000000, 127],
  [8.416667, 97],
  [12.875000, 40],
  [14.666667, 67],
  [17.958333, 242],
  [28.250000, 226],
  [37.791667, 142],
  [43.916667, 99],
  [48.166667, 71],
  [51.333333, 129],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 54.4167;
