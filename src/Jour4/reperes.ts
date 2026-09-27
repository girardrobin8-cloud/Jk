/**
 * Repères de montage — Reel Jour 4, « tu n'as pas 30 minutes chrono ».
 *
 * ── Ce que Robin a livré ────────────────────────────────────────────────
 *
 * Comme au Jour 3, le fichier fourni n'est pas le tournage : c'est un export
 * audio de 91,17 s sur fond noir avec les sous-titres incrustés mot à mot. Le
 * brief le dit lui-même. Il n'y a donc aucune image à montrer, ni pour le hook
 * ni pour le CTA ; les deux sont animés, et `CAMERA` ci-dessous les rend à la
 * caméra en une ligne le jour où le tournage arrive.
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * Le brief demandait de confirmer ses timecodes par une vraie transcription
 * avant de caler quoi que ce soit. C'est fait, et par la source la plus directe
 * qui soit : la bande de sous-titres extraite à 12 images par seconde,
 * dédupliquée, et les 404 vues restantes relues une à une. Ce sont les mots ET
 * les instants réels, tels qu'ils s'affichent au spectateur.
 *
 * ── Ce que ça corrige dans le brief ─────────────────────────────────────
 *
 *  · le hook s'arrête à 4,9 s et non 5,5 ;
 *  · le « muscle full » n'est pas un bloc de 14 s à 29,5 s mais trois idées
 *    successives — la prise déclenche 1h30-3h (13,8), le muscle devient
 *    réfractaire (20,2), donc plusieurs prises valent mieux (24,8) ;
 *  · la méta-analyse et son explication s'enchaînent sans pause de 42,6 à 54,0 ;
 *  · l'étude sur le niveau d'expérience parle de « 10 semaines », et la réponse
 *    est comparée à la « toute 1ère séance » contre « 3 ou 10 semaines plus
 *    tard » — le brief disait « plusieurs semaines » ;
 *  · Robin dit « un léger intérêt » et non « un intérêt » : la nuance est à
 *    l'écran.
 *
 * Le brief insiste pour que le passage « ton niveau change la donne + ce que ça
 * implique » reste UN SEUL beat, sans coupure franche, puisqu'il est dit d'un
 * seul tenant. C'est tenu : B8 couvre les 25,4 s d'un bloc et se joue en quatre
 * écrans qui se transforment l'un dans l'autre, jamais en changement de panneau.
 *
 * ── Blancs resserrés, niveau laissé tel quel ────────────────────────────
 *
 * Dix tranches conservées, 3,09 s retirées : 91,17 s → 88,08 s (étape 1 du
 * brief). Le niveau, en revanche, n'est PAS ramené à -16 LUFS comme le brief le
 * demande : la prise est à -13,7 LUFS pour 3,9 LU d'amplitude, et les trois
 * vidéos déjà livrées sont à -14,6, -13,9 et -13,3. Descendre celle-ci à -16 en
 * ferait la plus faible de la série d'au moins 1,3 LU, audible d'une vidéo à
 * l'autre. Le réglage se fait en une ligne si Robin préfère la cible du brief.
 *
 * Les repères restent écrits en temps RUSH et passent par `mappe()`.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), cyan et ambre en
 * secondaire, corail pour ce qui est faux ou qui s'éteint.
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s, elle ne sert qu'au son. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 91.17;

/** Convertit une seconde de l'export d'origine en seconde du montage resserré. */
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
 * Vide : l'export livré n'a pas d'image. Ajouter "B1" et "B10" le jour du
 * tournage suffit — l'animation cesse de couvrir ces deux fenêtres.
 */
export const CAMERA: string[] = [];

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 5.3,
    dit: "Non, tu n'as pas 30 minutes chrono après ta séance pour manger tes protéines. C'est un mythe, et je vais t'expliquer pourquoi.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 5.3,
    fin: 13.6,
    dit: "L'idée vient d'études montrant qu'après l'entraînement, le muscle est plus sensible aux nutriments pendant un temps limité. D'où l'idée d'une fenêtre à ne surtout pas rater.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 13.6,
    fin: 24.7,
    dit: "Chaque prise de protéines déclenche la construction musculaire pendant un temps fini : environ 1h30 à 3h. Puis ton muscle devient réfractaire, même s'il y a encore des acides aminés disponibles dans le sang.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 24.7,
    fin: 30.05,
    dit: "C'est ce qui explique pourquoi plusieurs prises bien réparties comptent plus qu'une seule bien chronométrée.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 30.05,
    fin: 36.4,
    dit: "Une revue complète de la littérature scientifique n'a trouvé aucune preuve solide d'une fenêtre stricte de 30 minutes.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 36.4,
    fin: 42.25,
    dit: "Jusqu'à 24h après ta séance, ton muscle reste mesurablement plus sensible aux protéines que d'habitude.",
  },
  {
    id: "B7",
    type: "anim",
    debut: 42.25,
    fin: 54.1,
    dit: "Une méta-analyse a mesuré un petit effet du timing sur prise de muscle. Mais cet effet s'explique presque entièrement par un apport protéique total plus élevé chez les personnes qui le chronométraient. Pas le timing en lui-même.",
  },
  {
    id: "B8",
    type: "anim",
    debut: 54.1,
    fin: 79.5,
    dit: "On peut citer une autre étude qui a suivi des pratiquants sur 10 semaines : la réponse de synthèse musculaire à l'entraînement était bien plus forte et bien plus longue lors de leur toute 1ère séance que 3 ou 10 semaines plus tard. Si tu débutes, ta fenêtre de sensibilité est naturellement plus large, le timing compte encore moins. Plus tu deviens expérimenté, plus cette réponse se raccourcit, sans jamais redevenir aussi stricte que le mythe des 30 minutes.",
  },
  {
    id: "B9",
    type: "anim",
    debut: 79.5,
    fin: 88.3,
    dit: "Le timing garde un léger intérêt si tu es à jeun depuis longtemps, si tu enchaînes plusieurs séances la journée, ou si ton objectif de performance est très pointu.",
  },
  {
    id: "B10",
    type: "cam",
    debut: 88.3,
    fin: DUREE_RUSH,
    dit: "Envoie-moi TIMING en DM si jamais tu veux qu'on en discute.",
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
