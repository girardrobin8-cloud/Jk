import { z } from "zod";

/**
 * Un Reel = un fichier JSON qui suit ce schéma. Rien d'autre à coder :
 * le texte, les scènes et leur moment d'apparition suffisent.
 *
 * Chaque scène dure jusqu'au début de la suivante ; la dernière jusqu'à la
 * fin de la voix.
 */

const base = { debut: z.number().describe("Seconde où la scène apparaît") };

export const sceneSchema = z.discriminatedUnion("type", [
  // Les 3 premières secondes : la phrase choc, en gros.
  z.object({
    ...base,
    type: z.literal("accroche"),
    texte: z.string(),
    motsCles: z.array(z.string()).default([]),
    /** Plan filmé (dans public/) à mettre derrière, par exemple ton visage. */
    video: z.string().optional(),
  }),
  // Un titre plein écran, éventuellement avec une ligne en dessous.
  z.object({
    ...base,
    type: z.literal("titre"),
    texte: z.string(),
    sousTexte: z.string().optional(),
    motsCles: z.array(z.string()).default([]),
  }),
  // Point numéroté (1, 2, 3) : la personne sait où elle en est.
  z.object({
    ...base,
    type: z.literal("point"),
    numero: z.number(),
    texte: z.string(),
    sousTexte: z.string().optional(),
  }),
  // Un chiffre qui compte jusqu'à sa valeur.
  z.object({
    ...base,
    type: z.literal("chiffre"),
    valeur: z.union([z.number(), z.string()]),
    prefixe: z.string().default(""),
    unite: z.string().default(""),
    legende: z.string(),
  }),
  // Carte « Étude », à la Jeff Nippard : la source à l'écran.
  z.object({
    ...base,
    type: z.literal("etude"),
    resultat: z.string(),
    source: z.string(),
    detail: z.string().optional(),
  }),
  // Comparaison en barres horizontales.
  z.object({
    ...base,
    type: z.literal("barres"),
    titre: z.string(),
    barres: z.array(
      z.object({
        label: z.string(),
        valeur: z.number(),
        affichage: z.string().optional(),
        ton: z.enum(["vert", "rouge", "gris"]).default("vert"),
      }),
    ),
  }),
  // Classement du pire au meilleur, en paliers.
  z.object({
    ...base,
    type: z.literal("classement"),
    titre: z.string(),
    lignes: z.array(
      z.object({ palier: z.string(), texte: z.string() }),
    ),
  }),
  // Écran de fin, toujours le même.
  z.object({
    ...base,
    type: z.literal("cta"),
    mot: z.string().default("PROGRAMME"),
    texte: z.string().default("Écris"),
    sousTexte: z.string().default("en message privé"),
  }),
]);

export const motSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
});

export const reelSchema = z.object({
  titre: z.string(),
  /** Fichier audio de la voix off, relatif à public/. */
  voix: z.string(),
  /** Horodatage mot à mot de la voix (transcription ElevenLabs). */
  mots: z.array(motSchema),
  scenes: z.array(sceneSchema),
  /** Vidéo de fond optionnelle (relative à public/), assombrie. */
  fond: z.string().optional(),
  /** Mots à surligner en vert dans les sous-titres. */
  motsCles: z.array(z.string()).default([]),
});

export type Reel = z.infer<typeof reelSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Mot = z.infer<typeof motSchema>;
