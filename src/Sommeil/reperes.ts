/**
 * Repères de montage — « Le sommeil décide si tu perds du gras ou du muscle ».
 *
 * ⚠️ Bornes ESTIMÉES, reprises du brief : la prise voix n'existe pas encore.
 * Elles seront relevées sur l'enveloppe sonore comme pour le montage sucre —
 * seul ce fichier sera à reprendre, l'animation lisant le temps absolu.
 *
 * Règle du brief, tenue par construction : la voix est enregistrée d'un seul
 * tenant et n'est jamais recoupée. Tout se pose PAR-DESSUS.
 *
 * Ni palette ni police ici : le montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx. De la vidéo de référence on n'emprunte que la
 * fluidité des enchaînements, pas l'habillage.
 *
 * Chiffres : Nedeltcheva et al., 2010, Ann Intern Med (PMID 20921542) —
 * 10 adultes, 14 jours de déficit modéré, 8h30 contre 5h30 de sommeil ; perte
 * totale d'environ 3 kg dans les deux cas, mais 1,4 kg de gras contre 0,6 kg.
 */

export const FPS = 30;
export const DUREE = 55;

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
    fin: 5,
    dit: "Deux personnes peuvent perdre exactement le même poids… et pourtant, l'une perd surtout du gras, l'autre perd surtout du muscle. La différence tient en une seule variable.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 5,
    fin: 12,
    dit: "Pendant 14 jours, des chercheurs ont mis les mêmes personnes en déficit calorique modéré, avec deux conditions de sommeil différentes.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 12,
    fin: 18,
    dit: "8h30 de sommeil pour le premier groupe. 5h30 pour le second. Même déficit calorique, exactement les mêmes calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 18,
    fin: 26,
    dit: "Le poids total perdu ? Quasi identique dans les deux groupes : environ 3 kilos.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 26,
    fin: 36,
    dit: "Mais regarde ce qui compose cette perte : avec 8h30 de sommeil, 1,4 kilo de gras perdu. Avec seulement 5h30, à peine 0,6 kilo.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 36,
    fin: 44,
    dit: "Et à l'inverse, le groupe qui dort peu perd 60 % de muscle en plus que l'autre, pour la même perte de poids totale.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 44,
    fin: 50,
    dit: "Le sommeil, c'est pas un détail annexe. C'est une variable qui décide si ton déficit tape dans ton gras… ou dans ton muscle.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 50,
    fin: 55,
    dit: "Avant d'optimiser ta diète au gramme près, regarde d'abord combien tu dors.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
