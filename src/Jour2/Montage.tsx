import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 2, « combien de séries par semaine », 90,17 s.
 *
 * Le rush est la BASE du montage : il tourne d'un bout à l'autre, il porte le
 * son, et l'animation vient le recouvrir sur les fenêtres B2 à B12. Le hook
 * reste donc en caméra brute sans qu'aucune règle ne soit à écrire — il suffit
 * que l'animation ne s'y affiche pas.
 *
 * La piste est le rush D'ORIGINE, non retouché. Contrairement au Jour 1 il n'y
 * avait rien à corriger : la prise est mesurée à -13,9 LUFS pour 4,4 LU
 * d'amplitude, soit le niveau du Jour 1 livré, et les six respirations d'environ
 * une seconde sont les articulations du discours, pas des silences à raboter.
 * Réencoder l'audio pour ne rien gagner d'audible aurait été une perte sèche.
 *
 * Le fichier est volontairement hors dépôt (public/rushes/ est ignoré par git) :
 * c'est un média source de 28 Mo, que Robin a fourni tel quel.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Rush d'origine, copié sans réencodage. */
const RUSH = "rushes/jour2.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Monté sur toute la durée : il porte l'image ET le son. */}
    <OffthreadVideo src={staticFile(RUSH)} />

    {/* Recouvre le rush sur B2..B12, en fondu de part et d'autre des bornes. */}
    <Animation />
  </AbsoluteFill>
);
