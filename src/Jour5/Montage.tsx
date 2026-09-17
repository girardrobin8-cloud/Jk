import { AbsoluteFill, Audio, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 5, « stagner, c'est ce qui attend ton programme », 49,96 s.
 *
 * Différence avec les deux vidéos précédentes : il n'y a PAS de rush. Robin a
 * livré un export audio sur fond noir avec ses sous-titres incrustés, pas son
 * tournage. Le montage ne monte donc que le SON, et l'animation couvre la
 * durée entière, hook et CTA compris.
 *
 * La piste est cet export aux blancs resserrés (scripts/resserrer.py) : quatre
 * tranches conservées, 0,67 s retirées, 50,63 s → 49,96 s. Le niveau n'est pas
 * retouché — -14,6 LUFS pour 2,8 LU d'amplitude, dans la ligne des quatre vidéos précédentes.
 *
 * ── Quand le tournage arrivera ──────────────────────────────────────────
 *
 * Si c'est la MÊME voix que cet export, trois gestes suffisent :
 *   1. repasser le tournage dans scripts/resserrer.py pour régénérer coupes.ts ;
 *   2. ajouter "B1" et "B3" à CAMERA dans reperes.ts ;
 *   3. remplacer l'<Audio> ci-dessous par un <OffthreadVideo> sur le même
 *      fichier — il portera alors l'image ET le son.
 * Si c'est un enregistrement DIFFÉRENT, il faut relire ses sous-titres et
 * refaire les repères : c'est une relecture, pas un réglage.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Export audio aux blancs resserrés — voir l'en-tête. */
const PISTE = "rushes/jour5_resserre.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Seul le son est monté : l'image de ce fichier est un fond noir avec les
        sous-titres de Robin, qu'on ne veut pas voir apparaître sous l'animation. */}
    <Audio src={staticFile(PISTE)} />

    {/* Couvre toute la durée, faute de tournage à recouvrir. */}
    <Animation />
  </AbsoluteFill>
);
