/**
 * Repères de montage — « Le grammage par repas ne compte pas ».
 *
 * Relevés sur l'enregistrement voix (48,92 s) par analyse de l'enveloppe
 * sonore. Cette prise est très propre (plancher à 0,2 % du pic) : le seuil est
 * donc fixé à 5 % du pic, un seuil calé sur le plancher aurait pris les
 * respirations pour de la parole.
 *
 * Contrairement aux montages précédents, les six frontières tombent toutes sur
 * une pause mesurée — l'appariement est ici sans zone d'ombre.
 */

export const FPS = 30;
export const VOIX_DUREE = 48.92;

export const BLOCS = [
  { id: "B1", type: "visage", debut: 1.42, fin: 6.2, dit: "Tu comptes 30 grammes… C'est faux." },
  { id: "B2", type: "md", debut: 6.72, fin: 16.34, dit: "…un seuil autour de 20 à 30 grammes…" },
  { id: "B3", type: "md", debut: 17.02, fin: 22.46, dit: "…ton total sur 24 heures." },
  { id: "B4", type: "md", debut: 23.88, fin: 33.78, dit: "Deux clients, même entraînement…" },
  { id: "B5", type: "md", debut: 34.56, fin: 37.22, dit: "…quasiment trait pour trait." },
  { id: "B6", type: "md", debut: 38.4, fin: 42.7, dit: "…celui de fin de journée." },
  { id: "B7", type: "visage", debut: 43.4, fin: 48.74, dit: "Arrête de stresser sur le grammage…" },
] as const;

/** Deux coupes seulement : l'animation tient d'un seul tenant au milieu. */
export const COUPE_1 = 6.46;
export const COUPE_2 = 43.05;

export const s = (secondes: number) => Math.round(secondes * FPS);
