/**
 * Repères de montage — Reel Jour 3, « si tu dors 5h, ça ne sert à rien ».
 *
 * ── Ce que Robin a livré, et ce que ça change ───────────────────────────
 *
 * Le fichier fourni n'est PAS la prise filmée : c'est un export audio de 54,63 s
 * sur fond noir, avec les sous-titres incrustés mot à mot. Il n'y a donc aucune
 * image à montrer — ni tête parlante pour le hook, ni pour le CTA.
 *
 * Le montage est construit sur cette voix, qui est la vraie. Les deux fenêtres
 * que le brief réserve à la caméra sont animées en attendant, et `CAMERA`
 * ci-dessous dit comment les rendre à la caméra en une ligne le jour où le
 * tournage arrive. Si ce tournage est un ENREGISTREMENT DIFFÉRENT — pas la même
 * voix posée sur l'image — alors tous les repères sont à relever de nouveau sur
 * ses sous-titres : c'est une relecture, pas un réglage.
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * Même méthode qu'aux Jours 1 et 2 : la bande de sous-titres est extraite à 12
 * images par seconde et dédupliquée, et les 252 vues restantes relues une à
 * une. Ici le fond est noir, donc le masque est trivial — tout ce qui n'est pas
 * noir est du texte.
 *
 * ── Ce que ça règle dans le brief ───────────────────────────────────────
 *
 *  · la fourchette générale est bien « environ 7h30 à 9h » (34,9 → 35,7) ;
 *  · pour les sportifs de haut niveau, Robin ne dit pas « jusqu'à dix heures »
 *    mais « une fourchette de 9 à dix heures » (43,8 → 44,2) — c'est plus
 *    précis que le brief, et c'est ce qui est à l'écran ;
 *  · l'étude est « environ dix heures par nuit pendant 5 à 7 semaines » ;
 *  · le gain cité est « 9 % » sur les tirs, sans distinguer 3 points et lancers
 *    francs. L'écran ne montre donc que 9 %.
 *
 * ── Les blancs sont resserrés ───────────────────────────────────────────
 *
 * Onze tranches conservées, 3,09 s retirées : 54,63 s → 51,54 s. La coupe est
 * faite par scripts/resserrer.py et appliquée à l'image et au son par le même
 * filtre. Le niveau n'est pas retouché : la prise est à -13,3 LUFS pour 2,7 LU
 * d'amplitude, dans la ligne des deux vidéos précédentes.
 *
 * Les repères restent écrits en temps RUSH et passent par `mappe()` — recouper
 * ne demande qu'une régénération de coupes.ts, jamais une réécriture à la main.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), cyan et ambre en
 * secondaire, et le corail de la charte pour ce qui se dégrade.
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s, elle ne sert qu'au son. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 54.63;

/**
 * Convertit une seconde de l'export d'origine en seconde du montage resserré.
 *
 * Un instant tombé DANS un blanc coupé est ramené à la fin de la tranche qui le
 * précède, c'est-à-dire à l'instant où la parole reprend — ce qu'on veut pour
 * une borne de beat.
 */
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
  /** `cam` = rush conservé tel quel ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  /** Transcription relevée sur les sous-titres, mot pour mot. */
  dit: string;
};

/**
 * Les beats rendus en CAMÉRA.
 *
 * Vide, et c'est volontaire : l'export livré n'a pas d'image. Le jour où Robin
 * fournit son tournage, ajouter "B1" et "B10" ici suffit — l'animation cesse de
 * couvrir ces deux fenêtres et le rush apparaît, sans qu'une seule seconde de
 * calage ne bouge.
 */
export const CAMERA: string[] = [];

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 4.6,
    dit: "Tu peux avoir le meilleur programme du monde, mais si tu dors 5h par nuit, ça ne sert strictement à rien.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 4.6,
    fin: 11.6,
    dit: "C'est pendant le sommeil profond que ton corps sécrète la majorité de tes hormones de croissance, essentielles à la réparation musculaire.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 11.6,
    fin: 15.15,
    dit: "Moins tu dors profondément, moins cette fenêtre est exploitée.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 15.15,
    fin: 21.25,
    dit: "Le manque de sommeil fait grimper ton cortisol, tout en faisant baisser ta testostérone et ton IGF-1.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 21.25,
    fin: 28.55,
    dit: "Cette étude a suivi des basketteurs universitaires qui ont étendu leur sommeil d'environ dix heures par nuit pendant 5 à 7 semaines.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 28.55,
    fin: 32.4,
    dit: "Résultats : sprint plus rapide, tir réussi en hausse de 9 %.",
  },
  {
    id: "B7",
    type: "anim",
    debut: 32.4,
    fin: 36.75,
    dit: "Si la fourchette générale recommandée c'est d'environ 7h30 à 9h de sommeil,",
  },
  {
    id: "B8",
    type: "anim",
    debut: 36.75,
    fin: 45.2,
    dit: "on pourrait recommander à des sportifs de haut niveau, avec un volume ou un entraînement d'intensité élevée, une fourchette de 9 à dix heures de sommeil.",
  },
  {
    id: "B9",
    type: "anim",
    debut: 45.2,
    fin: 51.65,
    dit: "Manquer de sommeil chroniquement, c'est plus de risque de blessure, une performance qui baisse dès le lendemain, et une récupération qui ralentit.",
  },
  {
    id: "B10",
    type: "cam",
    debut: 51.65,
    fin: DUREE_RUSH,
    dit: "Envoie-moi SOMMEIL en DM si tu veux qu'on voit ensemble ta récupération.",
  },
];

/** Les mêmes beats, exprimés dans le temps du montage resserré. */
export const BEATS: Beat[] = BEATS_RUSH.map((b) => ({
  ...b,
  debut: mappe(b.debut),
  fin: mappe(b.fin),
}));

/** Durée des fondus caméra ↔ animation. Le brief interdit le cut sec. */
export const FONDU = 0.34;

export const s = (secondes: number) => Math.round(secondes * FPS);
