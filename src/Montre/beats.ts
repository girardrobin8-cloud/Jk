/**
 * Structure en « beats » — « Ta montre connectée surestime tes calories ».
 *
 * Timecodes relevés sur la prise fournie (57,68 s) par analyse de l'enveloppe
 * sonore, puis répartition des beats au prorata de leur poids en syllabes,
 * chaque frontière étant ramenée sur la pause la plus proche.
 *
 * Neuf frontières sur dix tombent sur une pause mesurée. Seule celle du beat 9
 * vers le beat 10 (50,00 s) est déduite : « …pas un chiffre exact » et « Et
 * c'est pas grave » s'enchaînent sans respiration. C'est le repère à vérifier
 * à l'oreille en priorité.
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
  { n: 1, type: "visage", debut: 0.26, fin: 4.02, role: "Accroche" },
  { n: 2, type: "md", debut: 4.26, fin: 9.56, role: "Pose du contexte + badge source" },
  { n: 3, type: "md", debut: 10.08, fin: 13.88, role: "Chiffre choc + 50 %" },
  { n: 4, type: "md", debut: 14.36, fin: 19.44, role: "Empilement 1 — les appareils" },
  { n: 5, type: "md", debut: 19.72, fin: 25.96, role: "Empilement 2 — les activités" },
  { n: 6, type: "md", debut: 26.38, fin: 32.32, role: "Comparaison chiffrée" },
  { n: 7, type: "visage", debut: 32.84, fin: 36.98, role: "Retour tête parlante" },
  { n: 8, type: "md", debut: 37.28, fin: 45.08, role: "Nuage de complexité" },
  { n: 9, type: "md", debut: 45.42, fin: 50.0, role: "Objet concret + prix" },
  { n: 10, type: "visage", debut: 50.0, fin: 57.5, role: "Conclusion" },
];

export const DUREE = 57.7;

/** Les deux fenêtres d'animation, entre les plans filmés. */
export const FENETRES = [
  { debut: 4.14, fin: 32.58 },
  { debut: 37.13, fin: 50.0 },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
