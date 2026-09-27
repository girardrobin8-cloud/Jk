import { M } from "../Muscle/Plan";

/**
 * La charte du format « rayon » — le seul endroit du dépôt où le fond est clair.
 *
 * Les reels Jour 1 à 10 sont sur fond vert très sombre. Ce format-ci s'inspire
 * d'un explainer YouTube sur fond blanc, et Robin a tranché : fond clair, mais
 * les accents restent les SIENS. On reconnaît donc la référence à la
 * composition, et on le reconnaît lui à la couleur — c'est tout l'intérêt du
 * compromis, un blanc pur avec des couleurs libres aurait produit une vidéo
 * qui ne ressemble à personne.
 *
 * Le fond n'est pas #FFFFFF mais un blanc cassé chaud : sur un écran de
 * téléphone à pleine luminosité, le blanc pur brûle et fait vibrer les contours
 * pixel, qui sont justement ce qu'on veut voir net.
 */
export const R = {
  fond: "#F4F1EA",
  /** Le fond d'une carte posée sur le fond — à peine plus clair. */
  carte: "#FFFFFF",
  /** L'encre : le contour de tous les pixels et le titre. C'est le « noir »
   *  de la référence, ramené vers le vert profond de la charte. */
  encre: "#17281F",
  /** Texte secondaire, légendes, noms de produits au repos. */
  gris: "#6F7C74",
  /** Trait de séparation, cadres inactifs. */
  trait: "#D9D4C7",

  // Les accents, repris tels quels de src/Muscle/Plan.tsx.
  vert: M.vert, // #2FBF71 — ça marche
  neon: M.bleuClair, // #7FE3AE — accent clair
  ambre: M.ambre, // #E8B62C — ça dépend
  corail: M.corail, // #E0655A — ça ne marche pas
  cyan: "#5BD6E0",
};

/**
 * Les trois verdicts du format. Un produit en reçoit un et un seul, et c'est
 * cette couleur qui le suit partout : dans la grille d'ouverture, sur sa carte,
 * et dans la frise du bas. Le spectateur apprend le code en dix secondes et
 * n'a plus besoin de lire les mots.
 */
export const VERDICT = {
  oui: { couleur: R.vert, mot: "ÇA MARCHE" },
  depend: { couleur: R.ambre, mot: "ÇA DÉPEND" },
  non: { couleur: R.corail, mot: "LAISSE EN RAYON" },
} as const;

export type Verdict = keyof typeof VERDICT;
