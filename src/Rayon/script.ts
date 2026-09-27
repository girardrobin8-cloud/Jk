/**
 * Le script du format « rayon », et les bornes PROVISOIRES qui vont avec.
 *
 * ── Pourquoi ce fichier existe avant la prise ──────────────────────────
 *
 * Les Jours 1 à 10 fonctionnaient dans l'autre sens : Robin enregistrait, je
 * relevais ses sous-titres, je calais l'animation dessus. Ici le format est
 * neuf et il n'y a pas encore de voix, donc c'est le script qui vient d'abord
 * et l'animation est construite sur des bornes estimées.
 *
 * Elles sont estimées, pas inventées : chaque bloc est chronométré au débit
 * mesuré de Robin sur les sept prises déjà montées, soit 6,3 syllabes de
 * parole par seconde. La maquette qu'on en tire est donc juste au rythme près,
 * ce qui suffit pour valider le look — pas pour publier.
 *
 * ── Ce qu'il faut faire quand la prise arrive ──────────────────────────
 *
 *     python3 scripts/caler.py <prise.wav> rayon
 *
 * Le script y est déjà déclaré sous la clé « rayon ». La sortie donne les
 * bornes réelles, mesurées sur les silences de la prise, à recopier dans
 * BORNES ci-dessous. Rien d'autre ne bouge : l'animation lit ces dix nombres
 * et rien qu'eux.
 */

export type Bloc = {
  id: string;
  /** L'identifiant du produit dans SPRITES, ou null pour les blocs de cadre. */
  produit: string | null;
  /** Le texte dit, tel qu'il doit être lu. */
  dit: string;
  /** La phrase qui s'affiche en socle — une reformulation courte, pas la
   *  transcription : à l'écran on lit trois fois moins vite qu'on n'entend. */
  socle: string;
};

export const BLOCS: Bloc[] = [
  {
    id: "B1",
    produit: null,
    dit: "Huit compléments, un seul rayon, et la moitié ne sert à rien. On les passe en revue, un par un.",
    socle: "",
  },
  {
    id: "B2",
    produit: "creatine",
    dit: "On commence par la créatine. C'est le seul complément qui a plus de mille études derrière lui. Trois à cinq grammes par jour, tous les jours, peu importe l'heure.",
    socle: "3 À 5 G PAR JOUR, TOUS LES JOURS",
  },
  {
    id: "B3",
    produit: "whey",
    dit: "La whey. Ce n'est pas un produit magique, c'est de la protéine en poudre. Si tu atteins déjà ton total sur la journée, elle ne t'apporte rien de plus.",
    socle: "TON TOTAL EST ATTEINT ? ELLE N'AJOUTE RIEN",
  },
  {
    id: "B4",
    produit: "omega",
    dit: "Les oméga 3. Utiles si tu ne manges jamais de poisson gras. Deux portions de sardines ou de maquereau par semaine, et tu peux garder ton argent.",
    socle: "2 PORTIONS DE POISSON GRAS PAR SEMAINE",
  },
  {
    id: "B5",
    produit: "vitamineD",
    dit: "La vitamine D. Là c'est différent : d'octobre à avril, sous nos latitudes, ton corps n'en fabrique quasiment plus. C'est la seule carence vraiment répandue de cette liste.",
    socle: "D'OCTOBRE À AVRIL, TA PEAU N'EN FAIT PLUS",
  },
  {
    id: "B6",
    produit: "magnesium",
    dit: "Le magnésium. Beaucoup de promesses, peu de preuves si tu n'es pas carencé. Regarde d'abord ton assiette : amandes, chocolat noir, légumes verts.",
    socle: "AMANDES, CHOCOLAT NOIR, LÉGUMES VERTS",
  },
  {
    id: "B7",
    produit: "multi",
    dit: "Les multivitamines. Une assurance, pas un progrès. Si ton alimentation est correcte, tu paies pour des vitamines que tu urines.",
    socle: "UNE ASSURANCE, PAS UN PROGRÈS",
  },
  {
    id: "B8",
    produit: "bcaa",
    dit: "Les BCAA. Si tu prends déjà assez de protéines, ils ne servent à rien. Le complément le plus vendu pour le moins d'effet.",
    socle: "LE PLUS VENDU POUR LE MOINS D'EFFET",
  },
  {
    id: "B9",
    produit: "bruleurs",
    dit: "Les brûleurs de graisse. Peu d'effets négatifs, et surtout peu d'effets tout court. Aucun ne fait perdre du gras à ta place.",
    socle: "AUCUN NE PERD LE GRAS À TA PLACE",
  },
  {
    id: "B10",
    produit: null,
    dit: "Donc sur huit produits : deux valent ton argent, deux dépendent de ton assiette, quatre peuvent rester en rayon.",
    socle: "",
  },
  {
    id: "B11",
    produit: null,
    dit: "Envoie-moi RAYON en DM et je te dis ce qu'il te faut vraiment.",
    socle: "",
  },
];

/**
 * Les bornes, en secondes. PROVISOIRES — voir l'en-tête.
 *
 * Onze bornes pour onze blocs : `BORNES[i]` ouvre le bloc i, et la dernière
 * valeur ferme la vidéo.
 */
export const BORNES = [0, 5.5, 14.5, 22.5, 29.5, 37.5, 44.5, 50.5, 57.0, 63.5, 69.0, 72.5];

export const DUREE = BORNES[BORNES.length - 1];
export const FPS = 30;
export const s = (secondes: number) => Math.round(secondes * FPS);

export type Borne = { id: string; debut: number; fin: number };
export const BEATS: Borne[] = BLOCS.map((b, i) => ({ id: b.id, debut: BORNES[i], fin: BORNES[i + 1] }));
export const BEAT = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, Borne>;
export const BLOC = Object.fromEntries(BLOCS.map((b) => [b.id, b])) as Record<string, Bloc>;

/** Les huit blocs produit, dans l'ordre du rayon. */
export const PRODUITS = BLOCS.filter((b) => b.produit !== null);
