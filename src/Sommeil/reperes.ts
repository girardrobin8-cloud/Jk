/**
 * Repères de montage — « Le sommeil décide si tu perds du gras ou du muscle ».
 *
 * Bornes relevées sur la prise réelle (48,87 s).
 *
 * Ce qui compte visuellement, ce sont les DEUX bascules entre plan filmé et
 * animation : B1→B2 et B6→B7. Les frontières internes à l'animation, elles, ne
 * produisent aucune coupe — l'animation est continue de bout en bout — et ne
 * servent qu'à situer les repères de Animation.tsx.
 *
 * Les deux bascules sont donc contraintes à tomber DANS UN SILENCE mesuré,
 * jamais au milieu d'un groupe de parole. Une version précédente plaçait
 * B1→B2 à 7,16 s, en plein dans le groupe 6,64–8,53 : l'image basculait alors
 * que la dernière phrase du hook n'était pas finie.
 *
 * La fin du hook est établie par le débit : les trois groupes de parole qui le
 * composent tiennent 5,1, 5,2 et 5,3 syllabes par seconde. Une régularité trop
 * nette pour être fortuite, et qui place sa dernière phrase — « La différence
 * tient en une seule variable » — dans le groupe 6,64 → 8,53. Le hook est
 * simplement dit plus lentement que le corps du texte, qui tourne à 6,5.
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
    fin: 8.6,
    dit: "Deux personnes peuvent perdre exactement le même poids… et pourtant, l'une perd surtout du gras, l'autre perd surtout du muscle. La différence tient en une seule variable.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 8.6,
    fin: 15.06,
    dit: "Pendant 14 jours, des chercheurs ont mis les mêmes personnes en déficit calorique modéré, avec deux conditions de sommeil différentes.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 15.06,
    fin: 21.57,
    dit: "8h30 de sommeil pour le premier groupe. 5h30 pour le second. Même déficit calorique, exactement les mêmes calories.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 21.57,
    fin: 24.97,
    dit: "Le poids total perdu ? Quasi identique dans les deux groupes : environ 3 kilos.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 24.97,
    fin: 30.32,
    dit: "Mais regarde ce qui compose cette perte : avec 8h30 de sommeil, 1,4 kilo de gras perdu. Avec seulement 5h30, à peine 0,6 kilo.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 30.32,
    fin: 37.6,
    dit: "Et à l'inverse, le groupe qui dort peu perd 60 % de muscle en plus que l'autre, pour la même perte de poids totale.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 37.6,
    fin: 42.28,
    dit: "Le sommeil, c'est pas un détail annexe. C'est une variable qui décide si ton déficit tape dans ton gras… ou dans ton muscle.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 42.28,
    fin: 48.87,
    dit: "Avant d'optimiser ta diète au gramme près, regarde d'abord combien tu dors.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
