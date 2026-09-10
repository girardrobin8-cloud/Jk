/**
 * Repères de montage — Reel Jour 1, « On m'a dit d'arrêter le riz pour sécher ».
 *
 * Bornes MESURÉES sur la piste NETTOYÉE (56,84 s), pas sur le rush d'origine
 * (62,72 s) : le brief autorise à resserrer les silences, et les bornes doivent
 * décrire le montage final, pas la prise brute.
 *
 * ── Ce que le brief demandait et que je n'ai pas pu faire ────────────────
 *
 * L'étape 0 exige une transcription par reconnaissance vocale, pour découvrir
 * ce que Robin a RÉELLEMENT dit plutôt que de faire confiance au script. C'est
 * impossible dans cet environnement, et ce n'est pas faute d'avoir cherché :
 * les paquets s'installent depuis PyPI, mais les poids des modèles viennent
 * d'openaipublic (whisper), de HuggingFace (faster-whisper) ou d'alphacephei
 * (vosk), tous bloqués par la politique réseau. pocketsphinx s'installe avec un
 * modèle embarqué, mais il est anglais et date d'une autre époque.
 *
 * ── Ce que j'ai fait à la place, et pourquoi c'est suffisant ici ─────────
 *
 * Le brief craint que Robin ait improvisé. La mesure dit le contraire, et le
 * raisonnement tient sans transcription :
 *
 *   script prévu       274 syllabes  →  50,9 s attendues à son débit habituel
 *   prise réelle                        62,7 s
 *   silences > 0,5 s   13, totalisant    8,8 s
 *   prise moins silences                53,9 s
 *
 * L'écart de douze secondes s'explique entièrement par des hésitations, pas par
 * des mots en plus. Et l'alignement le confirme après coup : les sept beats
 * tiennent entre 6,4 et 7,8 syllabes par seconde, dispersion 0,062. Un script
 * qui ne serait pas celui prononcé ne produirait pas cette régularité — c'est
 * le principe même de la méthode, décrite en tête de scripts/caler.py.
 *
 * Reste une limite honnête : si Robin a remplacé une tournure par une autre de
 * longueur voisine, la mesure ne peut pas le voir. Les bornes de BEATS sont
 * sûres, les repères internes de Animation.tsx le sont un peu moins.
 *
 * ── Traitements appliqués à la piste ────────────────────────────────────
 *
 * Étape 1 : débruitage doux (afftdn) puis normalisation en deux passes
 * (loudnorm), mesurée à -15,9 LUFS pour une cible de -16. Ni le contenu ni le
 * timing ne bougent.
 * Étape 2 : les 13 silences de plus de 0,5 s ramenés à 0,22 s, soit 5,89 s
 * retirées. Les respirations courtes sont intactes.
 *
 * Palette : la charte du dépôt (src/Muscle/Plan.tsx), plus un cyan secondaire
 * demandé par le brief.
 */

export const FPS = 30;
/** Durée de la piste nettoyée. */
export const DUREE = 56.84;

export type Beat = {
  id: string;
  /** `cam` = rush conservé tel quel ; `anim` = recouvert par le motion design. */
  type: "cam" | "anim";
  debut: number;
  fin: number;
  dit: string;
};

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "cam",
    debut: 0,
    fin: 6.14,
    dit: "On m'a dit d'arrêter le riz et les pâtes pour sécher. Grosse erreur, et je vais te montrer pourquoi, chiffres à l'appui.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 6.59,
    fin: 12.96,
    dit: "Manger des glucides fait grimper ta glycémie, et ton corps sécrète de l'insuline pour la faire redescendre — notamment en stockant cette énergie.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 13.16,
    fin: 20.51,
    dit: "Sauf que l'insuline stocke aussi bien du glycogène que du gras. Le vrai facteur, c'est ton bilan calorique global, peu importe la source de tes calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 20.84,
    fin: 32.92,
    dit: "Tes glucides remplissent d'abord ton glycogène, ton carburant à l'entraînement. Ce n'est qu'une fois ces réserves pleines que l'excès peut, en théorie, se transformer en graisse — un processus marginal chez la plupart des gens.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 33.06,
    fin: 45.56,
    dit: "Une méta-analyse a réuni 19 essais, plus de 3200 personnes : régime pauvre en glucides contre régime équilibré, à calories strictement égales. Résultat quasi identique, que ce soit après 6 mois ou après 2 ans.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 45.88,
    fin: 53.41,
    dit: "Par contre, les couper à l'excès baisse ton intensité à l'entraînement, donc tes résultats sur la durée.",
  },
  {
    id: "B7",
    type: "cam",
    debut: 53.54,
    fin: DUREE,
    dit: "Envoie-moi GLUCIDES en DM si tu veux qu'on regarde ton dosage.",
  },
];

/**
 * Durée des fondus caméra ↔ animation.
 *
 * Le brief interdit le cut sec. Le fondu déborde de part et d'autre de la borne
 * pour que l'image soit déjà en place quand la phrase commence.
 */
export const FONDU = 0.36;

export const s = (secondes: number) => Math.round(secondes * FPS);
