/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * 0.36 s ont été ramenés à 0.24 s, soit 3.09 s retirées, 54.63 s → 51.54 s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = 24.0;

export const SEGMENTS: [number, number][] = [
  [0.000000, 109],
  [4.958333, 156],
  [12.000000, 74],
  [15.458333, 138],
  [21.458333, 132],
  [27.208333, 125],
  [32.708333, 96],
  [37.000000, 60],
  [39.666667, 69],
  [42.833333, 57],
  [45.416667, 221],
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = 51.5417;
