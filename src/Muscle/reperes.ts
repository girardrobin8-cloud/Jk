/**
 * Repères de montage — « La mémoire musculaire ».
 *
 * ⚠️ Relevés sur l'enregistrement voix fourni (65,04 s). Cette prise-ci est
 * compressée — son plancher de bruit est à 9,5 % du pic contre 1,2 % pour la
 * précédente — donc le seuil de détection est calé sur sa propre distribution.
 * Les blocs sont ensuite répartis au prorata de leur poids en syllabes sur le
 * temps de parole effectif, puis chaque frontière est calée sur la pause la
 * plus proche.
 *
 * L'appariement bloc ↔ parole est déduit des durées et des pauses, pas d'une
 * transcription : les frontières tombent sur les grandes respirations, mais
 * il faut les confirmer à l'oreille. Tout se règle ici et nulle part ailleurs.
 */

export const FPS = 30;
export const VOIX_DUREE = 65.04;

export type Bloc = {
  id: string;
  /** "visage" = plan à filmer ; "md" = motion design à générer. */
  type: "visage" | "md";
  debut: number;
  fin: number;
  /** Texte dit, pour retrouver le passage à l'oreille. */
  dit: string;
};

export const BLOCS: Bloc[] = [
  { id: "B1", type: "visage", debut: 0.34, fin: 7.34, dit: "Quand tu perds du muscle… / Je t'explique." },
  { id: "B2", type: "md", debut: 8.66, fin: 12.2, dit: "…il se passe deux choses." },
  { id: "B3", type: "md", debut: 12.66, fin: 14.02, dit: "…connexion cerveau-muscle plus forte." },
  { id: "B4", type: "md", debut: 14.9, fin: 17.5, dit: "…de nouveaux myonoyaux." },
  { id: "B5", type: "md", debut: 17.5, fin: 20.92, dit: "…les centres de contrôle." },
  { id: "B6", type: "md", debut: 21.2, fin: 24.16, dit: "…une quantité limitée de croissance." },
  { id: "B7", type: "md", debut: 24.4, fin: 27.6, dit: "…séance après séance." },
  { id: "B8", type: "visage", debut: 28.02, fin: 32.54, dit: "Et si tu t'arrêtes… qu'est-ce qui se passe ?" },
  { id: "B9", type: "md", debut: 33.5, fin: 34.77, dit: "Ton muscle perd en volume, oui." },
  { id: "B10", type: "md", debut: 34.77, fin: 36.84, dit: "…tes myonoyaux ne disparaissent pas." },
  { id: "B11", type: "md", debut: 37.48, fin: 39.63, dit: "…ton cerveau garde en mémoire." },
  { id: "B12", type: "md", debut: 39.63, fin: 42.44, dit: "…rien à voir avec la première fois." },
  { id: "B13", type: "md", debut: 43.0, fin: 44.14, dit: "C'est beaucoup plus efficace." },
  { id: "B14", type: "md", debut: 44.42, fin: 45.3, dit: "Et beaucoup plus rapide." },
  { id: "B15", type: "visage", debut: 45.3, fin: 47.74, dit: "Mais à quel point ton corps se souvient plus vite ?" },
  { id: "B16", type: "md", debut: 48.02, fin: 49.8, dit: "Une étude s'est penchée sur la question." },
  { id: "B17", type: "md", debut: 49.8, fin: 57.02, dit: "…20 semaines… puis ils arrêtent." },
  { id: "B18", type: "md", debut: 57.84, fin: 62.02, dit: "…plus que 6 semaines." },
  { id: "B19", type: "md", debut: 62.02, fin: 64.82, dit: "Trois fois plus vite." },
];

/**
 * Points de coupe entre plan filmé et motion design, posés au milieu des
 * respirations. Coupes franches, comme demandé au brief.
 */
/**
 * Quatre des cinq coupes tombent au milieu d'une pause mesurée. La quatrième
 * (45,30 s) est déduite : « Et beaucoup plus rapide » et la question suivante
 * s'enchaînent sans respiration. C'est le repère le moins sûr du lot.
 */
export const COUPES = [8.0, 27.81, 33.02, 45.3, 47.88];

/** Fenêtres continues : ce que voit le spectateur, bout à bout. */
export const FENETRES: { type: "visage" | "md"; debut: number; fin: number }[] = [
  { type: "visage", debut: 0, fin: COUPES[0] },
  { type: "md", debut: COUPES[0], fin: COUPES[1] },
  { type: "visage", debut: COUPES[1], fin: COUPES[2] },
  { type: "md", debut: COUPES[2], fin: COUPES[3] },
  { type: "visage", debut: COUPES[3], fin: COUPES[4] },
  { type: "md", debut: COUPES[4], fin: VOIX_DUREE },
];

export const bloc = (id: string): Bloc => {
  const b = BLOCS.find((x) => x.id === id);
  if (!b) throw new Error(`bloc inconnu : ${id}`);
  return b;
};

export const s = (secondes: number) => Math.round(secondes * FPS);
