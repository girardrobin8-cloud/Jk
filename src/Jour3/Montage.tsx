import { AbsoluteFill, Audio, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 3, « si tu dors 5h, ça ne sert à rien », 51,54 s.
 *
 * Différence avec les deux vidéos précédentes : il n'y a PAS de rush. Robin a
 * livré un export audio sur fond noir avec ses sous-titres incrustés, pas son
 * tournage. Le montage ne monte donc que le SON, et l'animation couvre la
 * durée entière, hook et CTA compris.
 *
 * La piste est cet export aux blancs resserrés (scripts/resserrer.py) : onze
 * tranches conservées, 3,09 s retirées, 54,63 s → 51,54 s. Le niveau n'est pas
 * retouché — -13,3 LUFS pour 2,7 LU d'amplitude, dans la ligne des Jours 1 et 2.
 *
 * ── Quand le tournage arrivera ──────────────────────────────────────────
 *
 * Si c'est la MÊME voix que cet export, trois gestes suffisent :
 *   1. repasser le tournage dans scripts/resserrer.py pour régénérer coupes.ts ;
 *   2. ajouter "B1" et "B10" à CAMERA dans reperes.ts ;
 *   3. remplacer l'<Audio> ci-dessous par un <OffthreadVideo> sur le même
 *      fichier — il portera alors l'image ET le son.
 * Si c'est un enregistrement DIFFÉRENT, il faut relire ses sous-titres et
 * refaire les repères : c'est une relecture, pas un réglage.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Export audio aux blancs resserrés — voir l'en-tête. */
const PISTE = "rushes/jour3_resserre.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Seul le son est monté : l'image de ce fichier est un fond noir avec les
        sous-titres de Robin, qu'on ne veut pas voir apparaître sous l'animation. */}
    <Audio src={staticFile(PISTE)} />

    {/* Couvre toute la durée, faute de tournage à recouvrir. */}
    <Animation />
  </AbsoluteFill>
);
