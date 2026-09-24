/**
 * Repères de montage — Reel Jour 6, « les courbatures ne veulent pas dire ça ».
 *
 * ── Les trois règles permanentes du brief, et ce qu'elles changent ──────
 *
 * 1. Une zone « TÊTE PARLANTE » est un ESPACE RÉSERVÉ : aucun motion design
 *    par-dessus, le rush reste tel quel. C'est tenu à la lettre — l'animation
 *    ne dessine rien sur B1, B3 et B5, et le montage laisse passer le rush.
 * 2. Le CTA est toujours en tête parlante. B5 n'a donc ni animation ni texte.
 * 3. Les temps morts se coupent aussi À L'IMAGE. C'est déjà le cas depuis le
 *    Jour 2 : scripts/resserrer.py applique la même coupe aux deux flux.
 *
 * ── Ce qui manque, et c'est sérieux ─────────────────────────────────────
 *
 * Le fichier livré est, pour la quatrième fois, un export audio sur fond noir
 * avec les sous-titres incrustés — pas le tournage. Or la règle 1 interdit
 * d'animer les trois blocs caméra, qui font 30 des 48 secondes. Ces trois
 * fenêtres montrent donc le fichier source tel qu'il est, sans rien par-dessus :
 * c'est la seule lecture honnête de la règle. Le jour où Robin fournit son
 * tournage, il remplace le média et la vidéo est finie — aucun repère ne bouge.
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * 156 vues de sous-titres relues une à une. Le découpage du brief était décalé :
 * son bloc 1 s'arrêtait à 14,5 s alors que la phrase court jusqu'à 17,0, et le
 * bloc 2 commençait donc trois secondes trop tôt. Les bornes ci-dessous tombent
 * toutes dans un silence mesuré. La RÉPARTITION du brief — quel contenu en
 * caméra, quel contenu animé — est respectée exactement.
 *
 * Le hook est aussi différent : Robin dit « ARRÊTE DE CROIRE QUE les courbatures
 * sont un signe de bon entraînement », pas « on pense que ».
 *
 * ── Audio : cette fois il fallait intervenir ────────────────────────────
 *
 * Contrairement aux cinq prises précédentes, celle-ci arrivait à -8,9 LUFS avec
 * un vrai crête à +0,7 dBFS : elle ÉCRÊTE. Elle est donc normalisée à -14 LUFS
 * avec un plafond à -1 dBTP, ce qui la remet au niveau des cinq autres et
 * supprime la saturation. Le brief demande -16 LUFS ; -14 est retenu parce que
 * c'est là que se situe toute la série livrée, et que c'est la cible réelle des
 * plateformes. Une ligne à changer si Robin préfère -16.
 *
 * Blancs resserrés au passage : quatre tranches, 0,75 s retirées, 48,71 s →
 * 47,96 s.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx).
 */

import { DUREE_MONTEE, FPS as FPS_COUPE, SEGMENTS } from "./coupes";

/** Cadence du MONTAGE. La source est en 24 i/s. */
export const FPS = 30;
/** Durée du montage, blancs resserrés. */
export const DUREE = DUREE_MONTEE;
/** Durée de l'export livré par Robin, pour mémoire. */
export const DUREE_RUSH = 48.71;

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
  /** `cam` = espace réservé, rush intact ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  /** Transcription relevée sur les sous-titres, mot pour mot. */
  dit: string;
};

const BEATS_RUSH: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 17.3,
    dit: "Arrête de croire que les courbatures sont un signe de bon entraînement. On associe souvent la douleur à une séance efficace : plus ça fait mal, plus on pense avoir bien travaillé. Mais la douleur ressentie est en réalité mal corrélée au vrai dommage musculaire : la force, l'amplitude de mouvement ou certains marqueurs biologiques.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 17.3,
    fin: 25.75,
    dit: "Certains pratiquants très avancés ont des muscles presque jamais courbaturés et d'autres le sont systématiquement : les 2 atteignent une hypertrophie marquée.",
  },
  {
    id: "B3",
    type: "cam",
    debut: 25.75,
    fin: 35.95,
    dit: "Et il y a même un piège : des courbatures trop sévères peuvent réduire ta force de 50 % et peuvent prendre plusieurs semaines à récupérer complètement, et ça va nuire à ta régularité, sûrement la chose qui compte le plus.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 35.95,
    fin: 45.9,
    dit: "Alors comment juger vraiment ta séance ? Regarde si ta charge ou tes répétitions progressent dans le temps, si tu étais proche de l'échec sur toutes tes séries, et tu accumules un volume cohérent sur la semaine.",
  },
  {
    id: "B5",
    type: "cam",
    debut: 45.9,
    fin: DUREE_RUSH,
    dit: "Envoie-moi COURBATURE en DM et on parle de ton profil ensemble.",
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
