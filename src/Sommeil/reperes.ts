/**
 * Repères de montage — « Le sommeil décide si tu perds du gras ou du muscle ».
 *
 * Bornes RELEVÉES sur la prise réelle (51,80 s) : enveloppe sonore par fenêtres
 * de 20 ms, seuil à 6 % du pic, pause retenue à partir de 300 ms. Onze segments
 * de parole en ressortent, appariés aux huit répliques.
 *
 * ⚠️ Deux frontières seulement tombent sur un silence — celle du hook et celle
 * qui suit « exactement les mêmes calories ». Les cinq autres tombent au milieu
 * de plages dites d'un seul souffle, dont une de onze secondes ; elles sont
 * placées au prorata des mots. Elles peuvent demander un ou deux dixièmes
 * d'ajustement à l'oreille, ce que ce fichier permet sans toucher au reste.
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
export const DUREE = 51.8;

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
    fin: 9.36,
    dit: "Deux personnes peuvent perdre exactement le même poids… et pourtant, l'une perd surtout du gras, l'autre perd surtout du muscle. La différence tient en une seule variable.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 9.36,
    fin: 16.0,
    dit: "Pendant 14 jours, des chercheurs ont mis les mêmes personnes en déficit calorique modéré, avec deux conditions de sommeil différentes.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 16.0,
    fin: 21.77,
    dit: "8h30 de sommeil pour le premier groupe. 5h30 pour le second. Même déficit calorique, exactement les mêmes calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 21.77,
    fin: 26.06,
    dit: "Le poids total perdu ? Quasi identique dans les deux groupes : environ 3 kilos.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 26.06,
    fin: 31.77,
    dit: "Mais regarde ce qui compose cette perte : avec 8h30 de sommeil, 1,4 kilo de gras perdu. Avec seulement 5h30, à peine 0,6 kilo.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 31.77,
    fin: 39.3,
    dit: "Et à l'inverse, le groupe qui dort peu perd 60 % de muscle en plus que l'autre, pour la même perte de poids totale.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 39.3,
    fin: 45.29,
    dit: "Le sommeil, c'est pas un détail annexe. C'est une variable qui décide si ton déficit tape dans ton gras… ou dans ton muscle.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 45.29,
    fin: 51.8,
    dit: "Avant d'optimiser ta diète au gramme près, regarde d'abord combien tu dors.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
