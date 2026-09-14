/**
 * Prépare les tracés de la carte des îles Britanniques, dans src/Carte/.
 *
 * Toute la géographie est traitée ici, à la construction, et non au rendu : la
 * projection est fixe, donc les chemins ne changent jamais d'une frame à
 * l'autre. Les recalculer 360 fois reviendrait à refaire le même travail. La
 * composition Remotion ne reçoit donc que des chaînes SVG, et ni d3-geo ni les
 * 4 Mo de topojson ne partent dans le bundle.
 *
 * Données : Natural Earth (domaine public), via sane-topojson. Aucune image
 * satellite — elles viennent de serveurs de tuiles sous licence, hors d'atteinte
 * ici et de toute façon pas redistribuables dans un dépôt.
 *
 * Usage :  node scripts/carte.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");
const SORTIE = join(RACINE, "src", "Carte", "donnees.json");

const LARGEUR = 1080;
const HAUTEUR = 1920;

const lire = (f) =>
  JSON.parse(readFileSync(join(RACINE, "node_modules", "sane-topojson", "dist", f)));

const monde50 = lire("world_50m.json");


const pays50 = feature(monde50, monde50.objects.countries).features;
const trouver = (id) => {
  const f = pays50.find((x) => x.id === id);
  if (!f) {
    throw new Error(`Entité ${id} absente des données`);
  }
  return f;
};

/** Découpe une entité en polygones simples, pour pouvoir les trier. */
const polygones = (f) =>
  f.geometry.type === "Polygon"
    ? [f.geometry.coordinates]
    : f.geometry.coordinates;

const cadre = (anneaux) => {
  // Le jeu 50m contient quelques polygones sans anneau : sans ce garde-fou,
  // l'un d'eux fait échouer tout le script.
  if (!anneaux || !anneaux[0] || !anneaux[0].length) {
    return { x0: 0, y0: 0, x1: 0, y1: 0, aire: 0 };
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
  return { x0, y0, x1, y1, aire: (x1 - x0) * (y1 - y0) };
};

const enFeature = (liste) => ({
  type: "Feature",
  geometry: { type: "MultiPolygon", coordinates: liste },
});

const gbr = trouver("GBR");
const irl = trouver("IRL");

const morceauxGbr = polygones(gbr).sort((a, b) => cadre(b).aire - cadre(a).aire);

// La Grande-Bretagne est, littéralement, la plus grande des îles du Royaume-Uni :
// on la reconnaît à son étendue, sans avoir à la nommer.
const grandeBretagne = [morceauxGbr[0]];

const strates = [
  { id: "gb", titre: "Grande-Bretagne", parts: grandeBretagne },
  { id: "ru", titre: "Royaume-Uni", parts: polygones(gbr) },
  { id: "ib", titre: "Îles Britanniques", parts: [...polygones(gbr), ...polygones(irl)] },
];

// La projection est calée sur la strate la plus large, avec une marge : le
// cadrage ne bouge donc pas quand les strates s'ajoutent.
const projection = geoMercator().fitExtent(
  [
    [120, 170],
    [LARGEUR - 120, 1000],
  ],
  enFeature(strates[2].parts),
);
const chemin = geoPath(projection);

/**
 * Terres alentour. En 50m comme les strates : la caméra se rapproche jusqu'à
 * doubler l'échelle, et un fond en 110m s'y réduit à des taches informes juste
 * à côté de côtes détaillées.
 */
const fenetre = { x0: -24, y0: 42, x1: 20, y1: 68 };
const terres = feature(monde50, monde50.objects.land).features;
const fond = terres
  .flatMap((f) => polygones(f))
  .filter((p) => {
    const c = cadre(p);
    return c.x1 > fenetre.x0 && c.x0 < fenetre.x1 && c.y1 > fenetre.y0 && c.y0 < fenetre.y1;
  });

const donnees = {
  largeur: LARGEUR,
  hauteur: HAUTEUR,
  source: "Natural Earth (domaine public) via sane-topojson",
  fond: chemin(enFeature(fond)),
  // L'emprise projetée de chaque strate : c'est elle que la caméra vise, donc
  // le cadrage de chaque plan se déduit de la géographie et non d'un réglage
  // à la main qui serait à refaire à chaque changement de sujet.
  strates: strates.map((s) => {
    const [[x0, y0], [x1, y1]] = chemin.bounds(enFeature(s.parts));
    return {
      id: s.id,
      titre: s.titre,
      d: chemin(enFeature(s.parts)),
      emprise: { x0, y0, x1, y1 },
    };
  }),
};

mkdirSync(dirname(SORTIE), { recursive: true });
writeFileSync(SORTIE, JSON.stringify(donnees));

console.log(`Écrit ${SORTIE}`);
for (const s of donnees.strates) {
  const e = s.emprise;
  console.log(
    `  ${s.titre.padEnd(22)} ${String(s.d.length).padStart(6)} car.  ` +
      `emprise ${Math.round(e.x1 - e.x0)}×${Math.round(e.y1 - e.y0)}`,
  );
}
console.log(`  ${"fond de carte".padEnd(22)} ${donnees.fond.length} caractères`);
