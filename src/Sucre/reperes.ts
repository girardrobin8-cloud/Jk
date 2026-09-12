/**
 * Repères de montage — « Le sucre n'est pas (que) le problème ».
 *
 * Bornes RELEVÉES sur la prise réelle (45,56 s), et non plus estimées : analyse
 * de l'enveloppe sonore par fenêtres de 20 ms, seuil à 6 % du pic, pause
 * retenue à partir de 300 ms. Dix segments de parole en ressortent, appariés
 * aux huit répliques du script.
 *
 * L'appariement est direct partout sauf entre B5 et B6 : « …aliments qu'on
 * appelle sains » et « Le poids pris ? » sont enchaînés sans reprise de
 * souffle. La frontière y est donc placée au prorata des mots à l'intérieur du
 * segment, seule méthode disponible faute de silence à viser.
 *
 * Le brief donnait 50 s ; la prise en fait 45,56. Les huit fenêtres ont donc
 * toutes bougé, certaines beaucoup — B3 passe de 6 s à 2,9 s.
 *
 * Règle du brief, tenue par construction : la voix est posée d'un seul tenant
 * et n'est jamais recoupée. Les plans se posent PAR-DESSUS.
 */

export const FPS = 30;
/** Durée exacte de la prise. */
export const DUREE = 45.56;

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
    fin: 6.16,
    dit: "Ce Ferrero contient 5 grammes de sucre. Et pourtant, ce n'est probablement pas ton pire problème.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 6.16,
    fin: 12.88,
    dit: "Trop de sucre, ça fait grimper ta glycémie en flèche, ça stresse ton foie, et à long terme ça abîme tes vaisseaux sanguins.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 12.88,
    fin: 15.82,
    dit: "Mais dans ton assiette, le sucre est rarement seul.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 15.82,
    fin: 22.67,
    dit: "Cette combinaison est littéralement conçue pour te faire manger plus que ce dont tu as besoin.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 22.67,
    fin: 29.6,
    dit: "Deux groupes, même surplus calorique sur la semaine. L'un le prend en sucreries, l'autre en aliments qu'on appelle « sains ».",
  },
  {
    id: "B6",
    type: "anim",
    debut: 29.6,
    fin: 34.98,
    dit: "Le poids pris ? Quasiment identique. Parce que ton corps répond d'abord à l'excédent total de calories.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 34.98,
    fin: 42.02,
    dit: "Donc oui, réduis le sucre. Mais si tu ignores le reste de ton assiette et ton total calorique, tu passes à côté de l'essentiel.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 42.02,
    fin: 45.56,
    dit: "Le sucre n'est qu'une pièce du puzzle. Pas tout le puzzle.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);

/**
 * Ni palette ni police ici : ce montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx. Une première version posait un pixel-art sur fond
 * blanc, d'après la référence ; mais on n'emprunte à celle-ci que la fluidité
 * de ses enchaînements, pas son habillage.
 */
