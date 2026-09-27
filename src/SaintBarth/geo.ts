import type { MultiPolygon } from "geojson";
import brut from "./geo.json";

/**
 * Accès typé aux géométries préparées par `node scripts/antilles.mjs`.
 *
 * Un JSON importé voit son champ `type` inféré comme `string`, jamais comme le
 * littéral `"MultiPolygon"` qu'attend d3-geo. La conversion est faite ici, une
 * fois, plutôt que répétée à chaque appel dans les plans.
 */
export const GEO = {
  source: brut.source,
  centre: brut.centre as [number, number],
  monde: brut.monde as unknown as MultiPolygon,
  antilles: brut.antilles as unknown as MultiPolygon,
  blm: brut.blm as unknown as MultiPolygon,
  voisins: brut.voisins as { id: string; nom: string; centre: [number, number] }[],
};
