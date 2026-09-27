/**
 * Repères de montage — « Recomposition corporelle » (57,11 s).
 *
 * Bornes MESURÉES sur la prise, par `python3 scripts/caler.py <wav> recomp`.
 * Le brief fournit lui aussi des timecodes, lus sur les sous-titres
 * automatiques, et prévient qu'ils valent « à la seconde près pour le début de
 * chaque réplique », le sous-découpage restant à affiner sur la piste. C'est
 * exactement ce qui a été fait : neuf des onze bornes tombent à moins d'une
 * seconde de celles du brief, et les deux qui s'en écartent — B7 et B10 — sont
 * plus précoces d'environ une seconde et demie, le sous-titre s'attardant après
 * la fin de la réplique précédente.
 *
 * Ce qui rend ces valeurs sûres n'est pas leur accord avec le brief mais leur
 * régularité interne : les onze beats tiennent tous entre 5,7 et 7,4 syllabes
 * par seconde, soit une dispersion de 0,095 en écart-type des logarithmes. Un
 * découpage faux se trahit par des débits incohérents, pas par un désaccord
 * avec une estimation.
 *
 * Chaque borne tombe DANS UN SILENCE mesuré, par construction : un beat est
 * toujours une suite entière de groupes de parole. C'est la garantie que
 * l'image ne bascule jamais avant que la phrase ne soit finie — le défaut
 * relevé sur le montage précédent.
 *
 * La parole est quasi continue : 25 groupes séparés par des silences de 0,15 à
 * 0,73 s, aucun blanc franc. Les trous que laissent les timecodes du brief
 * (0:06→0:08, 0:39→0:42) n'existent pas dans le son ; ce sont des trous de
 * sous-titrage.
 *
 * Règle du brief, tenue par construction : la voix est enregistrée d'un seul
 * tenant et n'est JAMAIS recoupée ni resynchronisée. Tout se pose PAR-DESSUS.
 *
 * Ni palette ni police ici : le montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx.
 */

export const FPS = 30;
/** Durée exacte de la prise. */
export const DUREE = 57.11;

export type Beat = {
  id: string;
  type: "visage" | "anim";
  debut: number;
  fin: number;
  dit: string;
};

/**
 * Les deux bascules plan filmé ↔ animation.
 *
 * Elles sont posées au MILIEU du silence qui sépare les deux beats, et non à la
 * reprise de parole : l'animation a besoin de quelques images pour monter en
 * fondu, et doit être en place quand la voix repart. La phrase précédente est
 * entièrement dite — B1 se tait à 7,35 et B2 reprend à 7,78.
 */
export const ANIM_DEBUT = 7.56;
export const ANIM_FIN = 45.19;

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "visage",
    debut: 0,
    fin: ANIM_DEBUT,
    dit: "Perdre du gras et prendre du muscle en même temps, on t'a dit que c'était un mythe. Faux, et je vais t'expliquer comment faire une vraie recomposition corporelle.",
  },
  {
    id: "B2",
    type: "anim",
    debut: ANIM_DEBUT,
    fin: 11.59,
    dit: "Voici les 3 choses dont tu as besoin pour vraiment réussir ta recomposition corporelle.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 11.59,
    fin: 13.31,
    dit: "En un, c'est comment tu t'entraines.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 13.31,
    fin: 21.51,
    dit: "Soulever lourd, ça ne suffit pas, ce qui compte c'est vraiment d'aller toujours proche de l'échec. Pour cela tu dois garder une bonne technique d'exécution, avec un maximum de tension mécanique.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 21.51,
    fin: 23.50,
    dit: "Tu en as besoin pour construire du muscle.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 23.50,
    fin: 25.41,
    dit: "En deux, ton apport calorique.",
  },
  {
    id: "B7",
    type: "anim",
    debut: 25.41,
    fin: 31.84,
    dit: "En musculation et des années d'expérience, tu devras ajuster un léger déficit calorique dans la plupart des cas.",
  },
  {
    id: "B8",
    type: "anim",
    debut: 31.84,
    fin: 33.51,
    dit: "En trois, tes protéines.",
  },
  {
    id: "B9",
    type: "anim",
    debut: 33.51,
    fin: 40.30,
    dit: "Sans protéines, tu peux perdre du gras, mais tu auras sans doute beaucoup de mal à prendre du muscle. Avec assez de protéines, tu peux faire les deux en même temps.",
  },
  {
    id: "B10",
    type: "anim",
    debut: 40.30,
    fin: ANIM_FIN,
    dit: "1,6 à 2,2 g de protéines par kilo de poids de corps.",
  },
  {
    id: "B11",
    type: "visage",
    debut: ANIM_FIN,
    fin: DUREE,
    dit: "Bien sûr, une recomposition corporelle ça se fait sur le long terme, donc ne vise pas à aller trop vite. Étale ça sur le long terme, et ne sois pas trop restrictif avec toi. Niveau diète, assure-toi d'avoir vraiment un plan qui te permet de durer sur le long terme.",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
