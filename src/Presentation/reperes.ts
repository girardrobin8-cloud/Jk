/**
 * Repères de montage — « Bonjour, je m'appelle Robin ».
 *
 * ⚠️ Relevés sur la voix TÉMOIN produite par `scripts/voix_hors_ligne.py`
 * (16,64 s), pas sur une prise réelle. Cette piste sert à caler l'animation en
 * attendant l'enregistrement ElevenLabs ; ses pauses sont synthétiques et
 * toutes identiques (0,32 s), ce qu'aucune voix humaine ne fait. À la
 * substitution, il faudra relever à nouveau les frontières sur la vraie prise
 * et corriger les valeurs ci-dessous — la structure, elle, ne bougera pas.
 *
 * Méthode identique aux autres montages : enveloppe sur fenêtres de 20 ms,
 * seuil à 5 % du pic, pause retenue à partir de 180 ms. Les cinq frontières
 * tombent exactement sur les cinq phrases.
 */

export const FPS = 30;
export const VOIX_DUREE = 16.64;

export const BLOCS = [
  { id: "B1", debut: 0.0, fin: 2.46, dit: "Bonjour, je m'appelle Robin, j'ai vingt-trois ans." },
  { id: "B2", debut: 2.78, fin: 6.68, dit: "J'habite à Saint-Barthélemy, une petite île des Caraïbes." },
  { id: "B3", debut: 7.0, fin: 10.28, dit: "J'aime la mer, les journées simples, mes proches." },
  { id: "B4", debut: 10.6, fin: 13.7, dit: "Je travaille, j'apprends, j'avance un peu chaque jour." },
  { id: "B5", debut: 14.02, fin: 16.64, dit: "Je suis heureux dans la vie." },
] as const;

/**
 * Coupes posées au milieu de chaque pause plutôt qu'à la fin d'un bloc : le
 * plan change pendant le silence, jamais sur une syllabe.
 */
export const COUPES = BLOCS.map((b, i) =>
  i === 0 ? 0 : (BLOCS[i - 1].fin + b.debut) / 2,
);

export const s = (secondes: number) => Math.round(secondes * FPS);
