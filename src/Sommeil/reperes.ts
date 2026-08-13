/**
 * Repères de montage — « Le sommeil décide si tu perds du gras ou du muscle ».
 *
 * Bornes RELEVÉES sur la prise réelle (48,87 s) par `scripts/caler.py`, qui
 * aligne le script sur l'enveloppe sonore : durée prédite par le nombre de
 * SYLLABES — le débit syllabique d'un locuteur étant très stable — puis calage
 * sur un creux mesuré quand il s'en trouve un à portée.
 *
 * Deux méthodes plus grossières ont été écartées en chemin. Le prorata des
 * MOTS confond « 8h30 », quatre syllabes, avec « de », une seule. Le forçage
 * de chaque frontière sur un creux échoue parce que toutes les frontières ne
 * sont pas audibles : le locuteur enchaîne, et forcer une frontière absente en
 * déplace une autre en cascade.
 *
 * La dispersion des débits obtenus est de 0,092 en logarithme — l'alignement
 * est donc très cohérent d'une phrase à l'autre. Trois bornes sur sept se
 * calent sur un silence mesuré ; les quatre autres sont prédites, le locuteur
 * n'ayant pas repris son souffle à cet endroit.
 *
 * Règle du brief, tenue par construction : la voix est enregistrée d'un seul
 * tenant et n'est jamais recoupée. Tout se pose PAR-DESSUS.
 *
 * Ni palette ni police ici : le montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx.
 *
 * Chiffres : Nedeltcheva et al., 2010, Ann Intern Med (PMID 20921542).
 */

export const FPS = 30;
/** Durée exacte de la prise. */
export const DUREE = 48.87;

export type Beat = {
  id: string;
  type: "visage" | "anim";
  debut: number;
  fin: number;
  dit: string;
};

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "visage",
    debut: 0,
    fin: 7.16,
    dit: "Deux personnes peuvent perdre exactement le même poids… et pourtant, l'une perd surtout du gras, l'autre perd surtout du muscle. La différence tient en une seule variable.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 7.16,
    fin: 13.69,
    dit: "Pendant 14 jours, des chercheurs ont mis les mêmes personnes en déficit calorique modéré, avec deux conditions de sommeil différentes.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 13.69,
    fin: 20.21,
    dit: "8h30 de sommeil pour le premier groupe. 5h30 pour le second. Même déficit calorique, exactement les mêmes calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 20.21,
    fin: 25.0,
    dit: "Le poids total perdu ? Quasi identique dans les deux groupes : environ 3 kilos.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 25.0,
    fin: 33.91,
    dit: "Mais regarde ce qui compose cette perte : avec 8h30 de sommeil, 1,4 kilo de gras perdu. Avec seulement 5h30, à peine 0,6 kilo.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 33.91,
    fin: 39.1,
    dit: "Et à l'inverse, le groupe qui dort peu perd 60 % de muscle en plus que l'autre, pour la même perte de poids totale.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 39.1,
    fin: 45.27,
    dit: "Le sommeil, c'est pas un détail annexe. C'est une variable qui décide si ton déficit tape dans ton gras… ou dans ton muscle.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 45.27,
    fin: 48.87,
    dit: "Avant d'optimiser ta diète au gramme près, regarde d'abord combien tu dors.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
