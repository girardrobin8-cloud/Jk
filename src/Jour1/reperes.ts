/**
 * Repères de montage — Reel Jour 1, « arrêter les pâtes ou le riz pour sécher ».
 *
 * ── Ces bornes sont LUES, pas déduites ──────────────────────────────────
 *
 * Robin a livré une seconde version de la vidéo avec ses sous-titres incrustés,
 * mot à mot en karaoké. Ce sont eux la source : la bande de sous-titres a été
 * extraite à 10 images par seconde, les images dédupliquées sur un masque du
 * jaune du texte — le fond bouge derrière, une comparaison brute échouait — et
 * les 260 vues restantes relues une à une.
 *
 * C'est mieux qu'une reconnaissance vocale : ce sont les mots ET les timecodes
 * réels, tels qu'ils s'affichent à l'écran pour le spectateur.
 *
 * ── Ce que ça corrige ───────────────────────────────────────────────────
 *
 * Robin n'a pas suivi le script, et l'écart n'était pas anodin :
 *
 *  · le hook s'arrête à 4,4 s et non 6,1 — « chiffres à l'appui » a sauté ;
 *  · « en contrepartie » est ajouté dans le beat 2 ;
 *  · une idée ENTIÈRE est apparue au beat 3, absente du brief : « là est né le
 *    raccourci — plus d'insuline sécrétée, plus de graisse stockée ». Elle
 *    précède l'argument prévu et demande sa propre séquence ;
 *  · la conclusion de l'étude est « après 6 ou 2 ans d'expérience », et non
 *    « après 6 mois ou après 2 ans » ;
 *  · le CTA est « envoie-moi GLUCIDE en DM si jamais tu veux qu'on parle de ton
 *    profil ».
 *
 * Mon estimation précédente, fondée sur le script du brief, plaçait les bornes
 * jusqu'à deux secondes à côté. Elle ne pouvait pas faire mieux : l'arithmétique
 * des syllabes ne voit que le VOLUME de parole, pas les mots. Une tournure
 * remplacée par une autre de longueur voisine lui est invisible.
 *
 * ── Silences non resserrés, et pourquoi ─────────────────────────────────
 *
 * L'étape 2 du brief demande de raboter les silences de plus d'une demi-seconde.
 * Ce n'est PAS fait sur cette version, et c'est un choix : les sous-titres sont
 * incrustés dans l'image, calés à l'image près sur la voix. Couper dans la piste
 * les décalerait de leurs mots, et Robin a demandé que tout soit coordonné avant
 * tout. Le resserrement reste faisable, mais il faudrait alors relire les
 * sous-titres après coupe — c'est un second passage, pas un réglage.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), plus un cyan secondaire.
 */

export const FPS = 30;
/** Durée de la version sous-titrée livrée par Robin. */
export const DUREE = 64.83;

export type Beat = {
  id: string;
  /** `cam` = rush conservé tel quel ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  /** Transcription relevée sur les sous-titres, mot pour mot. */
  dit: string;
};

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 4.5,
    dit: "On m'a dit d'arrêter les pâtes ou riz pour sécher, c'est une grosse erreur et je vais te montrer pourquoi.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 4.5,
    fin: 12.8,
    dit: "Manger des glucides, ça fait grimper ta glycémie, et en contrepartie ton corps sécrète de l'insuline pour la faire redescendre, notamment par le fait de stocker cette énergie.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 12.8,
    fin: 26.2,
    dit: "Là est né le raccourci : plus d'insuline sécrétée, plus de graisse stockée. Sauf que l'insuline, elle stocke aussi bien du glycogène que du gras. Le vrai facteur que tu dois prendre en compte, c'est ton bilan calorique total, peu importe ta source de calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 26.2,
    fin: 37.7,
    dit: "Tes glucides remplissent d'abord ton glycogène, c'est ton carburant pour l'entraînement. Ce n'est qu'une fois ces réserves pleines que l'excès peut, en théorie, se transformer en graisse — un processus marginal chez la plupart des gens.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 37.7,
    fin: 54.85,
    dit: "On va prendre par exemple une méta-analyse qui a réuni 19 essais, plus de 3200 personnes : un régime pauvre en glucides contre un régime équilibré, et ceci à calories strictement égales. Et ben le résultat de cette analyse, c'est quasi identique, que ce soit après 6 ou 2 ans d'expérience.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 54.85,
    fin: 59.65,
    dit: "Par contre, les couper à l'excès baisse ton intensité à l'entraînement, donc tes résultats sur la durée.",
  },
  {
    id: "B7",
    type: "cam",
    debut: 59.65,
    fin: DUREE,
    dit: "Envoie-moi GLUCIDE en DM si jamais tu veux qu'on parle de ton profil.",
  },
];

/** Durée des fondus caméra ↔ animation. Le brief interdit le cut sec. */
export const FONDU = 0.34;

export const s = (secondes: number) => Math.round(secondes * FPS);
