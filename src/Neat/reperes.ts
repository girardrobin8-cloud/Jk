/**
 * Repères de montage — « NEAT / la dépense calorique cachée ».
 *
 * ATTENTION, ces bornes ne sont PAS mesurées : le script est original et la
 * prise n'existe pas encore. Le brief le dit lui-même — ses timecodes sont
 * estimés et à recaler. Quand la voix sera enregistrée, une commande suffit :
 *
 *     python3 scripts/caler.py <prise.wav> neat
 *
 * Le script « neat » est déjà écrit dans SCRIPTS, prêt à tourner.
 *
 * Ce qui a changé depuis « aspartame » : il y a maintenant TROIS prises
 * mesurées du même locuteur, et son débit en temps horloge — syllabes divisées
 * par durée totale, silences compris — est remarquablement stable :
 *
 *     sommeil      260 syll / 48,87 s = 5,32 syll/s
 *     recomposition 309 syll / 57,11 s = 5,41 syll/s
 *     aspartame    216 syll / 39,82 s = 5,42 syll/s
 *
 * Trois prises, trois sujets, trois longueurs, et un écart de 2 % entre les
 * extrêmes. C'est une base d'estimation autrement plus solide qu'un débit
 * supposé, et c'est elle qui est retenue ici : 5,385 syll/s.
 *
 * Le script fait 349 syllabes, nombres écrits en toutes lettres. À ce débit il
 * dure 64,8 s — là où le brief en annonce 81, ce qui supposerait 4,31 syll/s,
 * soit 20 % en dessous de tout ce que Robin a enregistré jusqu'ici. Les bornes
 * ci-dessous sont donc réparties sur 64,8 s au prorata des syllabes de chaque
 * beat, et non recopiées du brief.
 *
 * Cette prédiction reste une prédiction. Si la prise réelle s'écarte
 * sensiblement, tout se recale d'un coup — les repères de Animation.tsx sont
 * exprimés en secondes absolues et se déduisent des bornes ci-dessous.
 *
 * Règle du brief : la voix est enregistrée d'un seul tenant et n'est JAMAIS
 * recoupée ni resynchronisée. Tout se pose PAR-DESSUS.
 *
 * Ni palette ni police ici : le montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx.
 *
 * Sources cochées dans le brief :
 *   PMID 17697152 — Levine, 2007, J Intern Med. Le NEAT varie jusqu'à
 *     2000 kcal/jour entre deux personnes de taille comparable.
 *   PMID 9880251 — Levine, Eberhardt & Jensen, 1999, Science. Seize volontaires
 *     suralimentés de 1000 kcal/jour pendant 8 semaines : les deux tiers de la
 *     dépense supplémentaire venaient d'une hausse spontanée du NEAT, laquelle
 *     expliquait une différence de prise de gras allant jusqu'à dix fois.
 *   Répartition de la dépense quotidienne : métabolisme de base 60-70 %, effet
 *     thermique des aliments ~10 %, sport structuré souvent < 100 kcal/jour.
 */

export const FPS = 30;
/** Durée prédite. À remplacer par la durée exacte de la prise. */
export const DUREE = 64.81;

export type Beat = {
  id: string;
  type: "visage" | "anim";
  debut: number;
  fin: number;
  dit: string;
  /**
   * Le mot d'action à faire ressortir en couleur accent dans la légende, sur
   * les fenêtres tête caméra — principe relevé sur les prises de Robin.
   */
  motCle?: string;
};

/** Les deux bascules plan filmé ↔ animation. */
export const ANIM_DEBUT = 4.83;
export const ANIM_FIN = 56.82;

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "visage",
    debut: 0,
    fin: ANIM_DEBUT,
    dit: "Ton entraînement, c'est probablement la plus petite partie des calories que tu brûles dans ta journée.",
    motCle: "la plus petite partie",
  },
  {
    id: "B2",
    type: "anim",
    debut: ANIM_DEBUT,
    fin: 11.14,
    dit: "Ce que ton corps dépense chaque jour se divise en plusieurs parts : ton métabolisme de base, la digestion, et ton activité physique.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 11.14,
    fin: 19.68,
    dit: "Rien qu'en existant — respirer, faire circuler ton sang, réguler ta température — ça représente environ 60 à 70 % de tes calories brûlées.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 19.68,
    fin: 22.66,
    dit: "Digérer ce que tu manges, ça en prend encore 10 %.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 22.66,
    fin: 29.34,
    dit: "Et ta séance de sport ? Pour la plupart des gens qui s'entraînent quelques heures par semaine, ça représente en moyenne moins de 100 calories par jour.",
  },
  {
    id: "B6",
    type: "anim",
    debut: 29.34,
    fin: 41.78,
    dit: "Le vrai facteur qui varie le plus d'une personne à l'autre, c'est tout le reste : marcher, monter des escaliers, rester debout, gigoter. Ça s'appelle le NEAT — et ça peut représenter jusqu'à 2000 calories de différence par jour entre deux personnes de la même taille.",
  },
  {
    id: "B7",
    type: "anim",
    debut: 41.78,
    fin: ANIM_FIN,
    dit: "Dans une étude, des chercheurs ont suralimenté des volontaires de 1000 calories par jour pendant 8 semaines. Résultat : les deux tiers de l'énergie supplémentaire brûlée venaient de l'augmentation spontanée du NEAT — et ça expliquait une différence de prise de graisse allant jusqu'à 10 fois d'une personne à l'autre.",
  },
  {
    id: "B8",
    type: "visage",
    debut: ANIM_FIN,
    fin: DUREE,
    dit: "Donc avant de rajouter une séance de cardio, regarde d'abord combien tu bouges le reste de la journée. Parfois, 8000 pas de plus valent plus qu'une heure de sport en plus.",
    motCle: "combien tu bouges",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
