import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 1, « arrêter le riz pour sécher », 56,84 s.
 *
 * Le rush est ici la BASE du montage, pas une réserve à venir : la vidéo tourne
 * d'un bout à l'autre, elle porte le son, et l'animation vient la recouvrir sur
 * les fenêtres B2 à B6. Le hook et le CTA restent donc en caméra brute sans
 * qu'aucune règle ne soit à écrire — il suffit que l'animation ne s'y affiche
 * pas.
 *
 * La piste montée est le rush NETTOYÉ (public/rushes/jour1.mp4) :
 *  · débruitage doux et normalisation à -16 LUFS (mesurée à -15,9) ;
 *  · treize silences de plus de 0,5 s ramenés à 0,22 s, soit 5,89 s retirées.
 * Ce sont les deux seuls traitements que le brief autorise. Le contenu et
 * l'ordre de la parole ne sont pas touchés, et l'audio n'est jamais désynchronisé
 * de l'image puisque la coupe est appliquée aux deux flux en même temps.
 *
 * Le fichier est volontairement hors dépôt (public/rushes/ est ignoré par git) :
 * c'est un média source de 40 Mo, régénérable depuis le rush d'origine par la
 * chaîne décrite dans reperes.ts.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Rush nettoyé : voir l'en-tête pour ce qui lui a été appliqué. */
const RUSH = "rushes/jour1.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Monté sur toute la durée : il porte l'image ET le son. */}
    <OffthreadVideo src={staticFile(RUSH)} />

    {/* Recouvre le rush sur B2..B6, en fondu de part et d'autre des bornes. */}
    <Animation />
  </AbsoluteFill>
);
