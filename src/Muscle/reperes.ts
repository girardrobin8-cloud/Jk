/**
 * Repères de montage — « La mémoire musculaire ».
 *
 * ⚠️ Relevés sur l'enregistrement voix fourni (80,64 s), par analyse de
 * l'enveloppe sonore, puis appariés aux 19 blocs du script. Les timecodes du
 * brief étaient indicatifs et calés sur la vidéo de référence : le débit réel
 * est plus lent (80,6 s au lieu de ~70 s).
 *
 * L'appariement bloc ↔ parole est déduit des durées et des pauses, pas d'une
 * transcription : les frontières tombent sur les grandes respirations, mais
 * il faut les confirmer à l'oreille. Tout se règle ici et nulle part ailleurs.
 */

export const FPS = 30;
export const VOIX_DUREE = 80.64;

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
  { id: "B1", type: "visage", debut: 0.64, fin: 7.68, dit: "Quand tu perds du muscle… / Je t'explique." },
  { id: "B2", type: "md", debut: 8.74, fin: 11.84, dit: "…il se passe deux choses." },
  { id: "B3", type: "md", debut: 12.56, fin: 14.92, dit: "…connexion cerveau-muscle plus forte." },
  { id: "B4", type: "md", debut: 16.12, fin: 19.6, dit: "…de nouveaux myonoyaux." },
  { id: "B5", type: "md", debut: 20.52, fin: 23.84, dit: "…les centres de contrôle." },
  { id: "B6", type: "md", debut: 24.84, fin: 28.78, dit: "…une quantité limitée de croissance." },
  { id: "B7", type: "md", debut: 29.4, fin: 32.66, dit: "…séance après séance." },
  { id: "B8", type: "visage", debut: 33.42, fin: 38.46, dit: "Et si tu t'arrêtes… qu'est-ce qui se passe ?" },
  { id: "B9", type: "md", debut: 39.02, fin: 40.76, dit: "Ton muscle perd en volume, oui." },
  { id: "B10", type: "md", debut: 41.28, fin: 43.58, dit: "…tes myonoyaux ne disparaissent pas." },
  { id: "B11", type: "md", debut: 44.52, fin: 46.32, dit: "…ton cerveau garde en mémoire." },
  { id: "B12", type: "md", debut: 46.98, fin: 52.4, dit: "…rien à voir avec la première fois." },
  { id: "B13", type: "md", debut: 53.2, fin: 54.76, dit: "C'est beaucoup plus efficace." },
  { id: "B14", type: "md", debut: 55.46, fin: 56.48, dit: "Et beaucoup plus rapide." },
  { id: "B15", type: "visage", debut: 57.88, fin: 59.98, dit: "Mais à quel point ton corps se souvient plus vite ?" },
  { id: "B16", type: "md", debut: 60.88, fin: 62.14, dit: "Une étude s'est penchée sur la question." },
  { id: "B17", type: "md", debut: 63.54, fin: 70.74, dit: "…20 semaines… puis ils arrêtent." },
  { id: "B18", type: "md", debut: 71.32, fin: 75.74, dit: "…plus que 6 semaines." },
  { id: "B19", type: "md", debut: 76.48, fin: 79.2, dit: "Trois fois plus vite." },
];

/**
 * Points de coupe entre plan filmé et motion design, posés au milieu des
 * respirations. Coupes franches, comme demandé au brief.
 */
export const COUPES = [8.2, 33.0, 38.75, 57.2, 60.4];

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
