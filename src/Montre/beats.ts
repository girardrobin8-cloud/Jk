/**
 * Structure en « beats » — « Ta montre connectée surestime tes calories ».
 *
 * Le brief demande explicitement de raisonner en beats plutôt qu'en secondes
 * fixes : le texte n'est pas encore enregistré, et Robin calera sa prise
 * dessus. Les valeurs ci-dessous sont donc les estimations du brief, à
 * remplacer par les timecodes réels quand la voix arrivera — c'est le seul
 * fichier à retoucher à ce moment-là.
 */

export const FPS = 30;

export type Beat = {
  n: number;
  type: "visage" | "md";
  debut: number;
  fin: number;
  role: string;
};

export const BEATS: Beat[] = [
  { n: 1, type: "visage", debut: 0, fin: 5, role: "Accroche" },
  { n: 2, type: "md", debut: 5, fin: 10, role: "Pose du contexte + badge source" },
  { n: 3, type: "md", debut: 10, fin: 13, role: "Chiffre choc + 50 %" },
  { n: 4, type: "md", debut: 13, fin: 18, role: "Empilement 1 — les appareils" },
  { n: 5, type: "md", debut: 18, fin: 23, role: "Empilement 2 — les activités" },
  { n: 6, type: "md", debut: 23, fin: 30, role: "Comparaison chiffrée" },
  { n: 7, type: "visage", debut: 30, fin: 36, role: "Retour tête parlante" },
  { n: 8, type: "md", debut: 36, fin: 46, role: "Nuage de complexité" },
  { n: 9, type: "md", debut: 46, fin: 50, role: "Objet concret + prix" },
  { n: 10, type: "visage", debut: 50, fin: 58, role: "Conclusion" },
];

export const DUREE = 58;

/** Les deux fenêtres d'animation, entre les plans filmés. */
export const FENETRES = [
  { debut: 5, fin: 30 },
  { debut: 36, fin: 50 },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
