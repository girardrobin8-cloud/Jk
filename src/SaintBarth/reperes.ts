/**
 * Repères de montage — « L'île la plus riche du monde » (Saint-Barthélemy).
 *
 * ⚠️ Ces bornes sont celles du brief, pas d'une prise réelle. Elles y sont
 * données comme estimations, à recaler sur l'enregistrement avant montage
 * final : c'est la seule chose à reprendre ici quand la voix arrivera. Les
 * autres montages du dépôt relèvent leurs frontières sur l'enveloppe sonore,
 * et celui-ci fera de même.
 *
 * Règle du brief, qui vaut contrainte de conception : la voix est enregistrée
 * d'un seul tenant et n'est jamais recoupée ni resynchronisée. Tout ce qui est
 * construit ici se pose PAR-DESSUS une piste continue. C'est pourquoi les
 * plans ne sont pas des coupes franches mais des calques qui s'enchaînent :
 * décaler une borne ne décale jamais le son.
 */

export const FPS = 30;
export const DUREE = 32;

export type Beat = {
  id: string;
  type: "visage" | "anim";
  debut: number;
  fin: number;
  dit: string;
};

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "visage",
    debut: 0,
    fin: 4,
    dit: "Il existe une île où même certains millionnaires se sentent pauvres.",
  },
  {
    id: "B2",
    type: "anim",
    debut: 4,
    fin: 9,
    dit: "25 kilomètres carrés, 10 000 habitants… et le mètre carré le plus cher des Caraïbes.",
  },
  {
    id: "B3",
    type: "anim",
    debut: 9,
    fin: 14,
    dit: "Jusqu'à 50 000 euros le mètre carré. Une villa se négocie facilement entre 12 et 30 millions.",
  },
  {
    id: "B4",
    type: "anim",
    debut: 14,
    fin: 19,
    dit: "Et si tu t'y installes plus de 5 ans, plus aucun impôt sur le revenu, ni sur la fortune, ni sur l'héritage.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 19,
    fin: 24,
    dit: "Une exception héritée de son passé… suédois, avant d'être vendue à la France en 1878.",
  },
  {
    id: "B6",
    type: "visage",
    debut: 24,
    fin: 28,
    dit: "C'est Saint-Barthélemy. La preuve qu'un territoire grand comme un village peut devenir un des plus riches du globe.",
  },
  {
    id: "B7",
    type: "visage",
    debut: 28,
    fin: 32,
    dit: "Et toi, tu la mettrais où sur ta bucket list ?",
  },
];

export const beat = (id: string): Beat => {
  const b = BEATS.find((x) => x.id === id);
  if (!b) {
    throw new Error(`Beat ${id} inconnu`);
  }
  return b;
};

export const s = (secondes: number) => Math.round(secondes * FPS);

/** Palette commune aux plans animés. */
export const P = {
  fond: "#05090E",
  mer: "#0A2030",
  merPres: "#10344A",
  terre: "#2B3A2E",
  or: "#F2B01E",
  orClair: "#FFD97A",
  texte: "#F3F6F4",
  gris: "#8A9AA3",
  vert: "#3FCF7F",
  rouge: "#E0655A",
  cartouche: "#12100C",
  sepia: "#C9A66B",
};

export const FONT =
  '"Liberation Sans", "DejaVu Sans", Helvetica, Arial, sans-serif';
