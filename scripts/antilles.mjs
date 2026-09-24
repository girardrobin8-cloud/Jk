/**
 * Prépare la géographie de la vidéo Saint-Barthélemy, dans src/SaintBarth/.
 *
 * Contrairement à scripts/carte.mjs, rien n'est projeté ici : le plan du beat 2
 * est un zoom depuis l'espace, donc la projection change à chaque frame et les
 * tracés ne peuvent pas être calculés d'avance. On exporte donc du GeoJSON brut,
 * et la composition projette elle-même.
 *
 * Deux jeux, choisis selon l'échelle : le monde en 110m tant qu'on voit le
 * globe, les Antilles en 50m dès qu'on s'en approche. Garder le 110m jusqu'au
 * bout donnerait des côtes en escalier ; passer au 50m dès le départ ferait
 * projeter un détail invisible sur 4000 frames.
 *
 * Données : Natural Earth (domaine public), via sane-topojson.
 *
 * Usage :  node scripts/antilles.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");
const SORTIE = join(RACINE, "src", "SaintBarth", "geo.json");

const lire = (f) =>
  JSON.parse(readFileSync(join(RACINE, "node_modules", "sane-topojson", "dist", f)));

const monde110 = lire("world_110m.json");
const ameriqueNord = lire("north-america_50m.json");

const polygones = (f) =>
  f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;

const cadre = (anneaux) => {
  if (!anneaux?.[0]?.length) {
    return null;
  }
  let x0 = 180;
  let y0 = 90;
  let x1 = -180;
  let y1 = -90;
  for (const [x, y] of anneaux[0]) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
};

const multi = (liste) => ({ type: "MultiPolygon", coordinates: liste });

/** Terres du monde entier, grossières : elles ne servent qu'au plan de globe. */
const monde = multi(
  feature(monde110, monde110.objects.land).features.flatMap(polygones),
);

/**
 * Fenêtre des Petites Antilles du Nord.
 *
 * Le zoom s'arrête là plutôt que sur l'île seule : Saint-Barthélemy ne compte
 * que onze points dans les données disponibles, et au ras du sol sa côte
 * découpée deviendrait un octogone. À cette distance, l'île garde sa taille
 * réelle — 25 km² — et le voisinage raconte mieux où elle se trouve.
 */
const FENETRE = { x0: -64.2, y0: 16.6, x1: -61.4, y1: 18.9 };

const paysNa = feature(ameriqueNord, ameriqueNord.objects.countries).features;
const dansFenetre = (p) => {
  const c = cadre(p);
  return (
    c && c.x1 > FENETRE.x0 && c.x0 < FENETRE.x1 && c.y1 > FENETRE.y0 && c.y0 < FENETRE.y1
  );
};

const antilles = multi(
  feature(ameriqueNord, ameriqueNord.objects.land)
    .features.flatMap(polygones)
    .filter(dansFenetre),
);

const blmFeature = paysNa.find((f) => f.id === "BLM");
if (!blmFeature) {
  throw new Error("Saint-Barthélemy (BLM) absente des données");
}
const blm = multi(polygones(blmFeature));
const c = cadre(polygones(blmFeature)[0]);
const centre = [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2];

/** Voisins nommés : ils situent l'île sans qu'on ait à la commenter. */
const VOISINS = [
  { id: "MAF", nom: "Saint-Martin" },
  { id: "SXM", nom: "Sint Maarten" },
  { id: "AIA", nom: "Anguilla" },
  { id: "KNA", nom: "Saint-Kitts" },
];
const voisins = VOISINS.flatMap(({ id, nom }) => {
  const f = paysNa.find((x) => x.id === id);
  if (!f) {
    return [];
  }
  const b = cadre(polygones(f)[0]);
  return [{ id, nom, centre: [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] }];
});

const donnees = {
  source: "Natural Earth (domaine public) via sane-topojson",
  centre,
  fenetre: FENETRE,
  monde,
  antilles,
  blm,
  voisins,
};

mkdirSync(dirname(SORTIE), { recursive: true });
writeFileSync(SORTIE, JSON.stringify(donnees));

const poids = (o) => `${(JSON.stringify(o).length / 1024).toFixed(0)} Ko`;
console.log(`Écrit ${SORTIE}`);
console.log(`  monde (110m)      ${poids(monde)}`);
console.log(`  antilles (50m)    ${poids(antilles)}`);
console.log(`  Saint-Barthélemy  ${poids(blm)} — centre ${centre.map((v) => v.toFixed(2))}`);
console.log(`  voisins           ${voisins.map((v) => v.nom).join(", ")}`);
