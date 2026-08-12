/**
 * Repères de montage — « Le sucre n'est pas (que) le problème ».
 *
 * ⚠️ Bornes issues du brief, où elles sont données comme estimations sur un
 * débit de parole naturel, à recaler sur la vraie prise avant rendu final.
 * C'est le seul fichier à reprendre quand la voix arrivera.
 *
 * Règle du brief, qui vaut contrainte de conception : la voix est enregistrée
 * d'un seul tenant et n'est jamais recoupée ni resynchronisée. Tout ce qui est
 * ici se pose PAR-DESSUS une piste continue — chaque plan vit dans sa propre
 * fenêtre, si bien que déplacer une borne ne peut pas décaler le son.
 */

export const FPS = 30;
export const DUREE = 50;

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
    dit: "Ce Ferrero contient 5 grammes de sucre. Et pourtant, ce n'est probablement pas ton pire problème.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 5,
    fin: 12,
    dit: "Trop de sucre, ça fait grimper ta glycémie en flèche, ça stresse ton foie, et à long terme ça abîme tes vaisseaux sanguins.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 12,
    fin: 18,
    dit: "Mais dans ton assiette, le sucre est rarement seul.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 18,
    fin: 24,
    dit: "Cette combinaison est littéralement conçue pour te faire manger plus que ce dont tu as besoin.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 24,
    fin: 32,
    dit: "Deux groupes, même surplus calorique sur la semaine. L'un le prend en sucreries, l'autre en aliments qu'on appelle « sains ».",
  },
  {
    id: "B6",
    type: "anim",
    debut: 32,
    fin: 38,
    dit: "Le poids pris ? Quasiment identique. Parce que ton corps répond d'abord à l'excédent total de calories.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 38,
    fin: 44,
    dit: "Donc oui, réduis le sucre. Mais si tu ignores le reste de ton assiette et ton total calorique, tu passes à côté de l'essentiel.",
  },
  {
    id: "B8",
    type: "visage",
    debut: 44,
    fin: 50,
    dit: "Le sucre n'est qu'une pièce du puzzle. Pas tout le puzzle.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);

/**
 * Palette claire, à l'inverse des autres montages du dépôt.
 *
 * La référence pose son personnage sur fond blanc et fait vivre les icônes
 * autour : sur fond sombre, les mêmes aplats de couleur vireraient au néon et
 * le pixel-art perdrait son air de jeu ancien.
 */
export const C = {
  fond: "#F4F1E8",
  fondCreux: "#E7E2D4",
  encre: "#1E2430",
  gris: "#7C8493",
  rouge: "#E0483C",
  vert: "#2FA84F",
  rose: "#E86A9A",
  bleu: "#4E86D8",
  sucre: "#D9A441",
  ombre: "#D8D2C2",
};

export const FONT =
  '"Liberation Sans", "DejaVu Sans", Helvetica, Arial, sans-serif';
