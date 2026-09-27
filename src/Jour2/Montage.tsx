import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 2, « combien de séries par semaine », 84,93 s.
 *
 * Le rush est la BASE du montage : il tourne d'un bout à l'autre, il porte le
 * son, et l'animation vient le recouvrir sur les fenêtres B2 à B12. Le hook
 * reste donc en caméra brute sans qu'aucune règle ne soit à écrire — il suffit
 * que l'animation ne s'y affiche pas.
 *
 * La piste est le rush aux blancs RESSERRÉS, produit par scripts/resserrer.py :
 * seize silences de plus de 0,36 s ramenés à 0,24 s, soit 5,24 s retirées et
 * 90,17 s → 84,93 s. La coupe est appliquée à l'image et au son par le même
 * filtre, donc les sous-titres incrustés de Robin restent calés sur sa voix.
 * Le niveau, lui, n'est pas retouché : -13,9 LUFS pour 4,4 LU d'amplitude.
 *
 * Les deux fichiers sont volontairement hors dépôt (public/rushes/ est ignoré
 * par git). Le resserré se régénère depuis l'original par une seule commande,
 * rappelée en tête de scripts/resserrer.py.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Rush aux blancs resserrés — voir l'en-tête. */
const RUSH = "rushes/jour2_resserre.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Monté sur toute la durée : il porte l'image ET le son. */}
    <OffthreadVideo src={staticFile(RUSH)} />

    {/* Recouvre le rush sur B2..B12, en fondu de part et d'autre des bornes. */}
    <Animation />
  </AbsoluteFill>
);
