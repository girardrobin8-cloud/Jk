import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 7, « aucune diète ne marche sans ça », 46,58 s.
 *
 * Le rush est monté d'un bout à l'autre et porte le son ; l'animation ne le
 * recouvre que sur B2 et B4. Les trois fenêtres « tête parlante » — dont le CTA
 * — passent donc telles quelles, ce qu'exigent les règles permanentes 1 et 2 du
 * brief : aucun motion design, aucun texte à l'écran, le visage seul.
 *
 * ── Ce que montrent ces trois fenêtres aujourd'hui ──────────────────────
 *
 * Le fichier livré n'est pas le tournage mais un export audio sur fond noir
 * avec les sous-titres incrustés. Ces trente secondes réservées affichent donc
 * ce fond noir et ces sous-titres. C'est laid, et c'est voulu : la règle
 * interdit d'y mettre quoi que ce soit, et laisser le rush tel quel est la
 * seule lecture fidèle. Le jour où Robin livre son tournage, il le repasse dans
 * scripts/resserrer.py, remplace le fichier ci-dessous, et la vidéo est finie —
 * aucun repère, aucune borne, aucune animation ne bouge.
 *
 * ── La piste ────────────────────────────────────────────────────────────
 *
 * Blancs resserrés (2,75 s) et niveau NORMALISÉ, contrairement aux cinq vidéos
 * précédentes : la prise arrivait à -12,9 LUFS avec un vrai crête à -0,3 dBFS,
 * c'est-à-dire écrêtée. Elle est ramenée à -14 LUFS, plafond -1 dBTP, ce qui la
 * remet au niveau du reste de la série et supprime la saturation.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Rush aux blancs resserrés et au niveau corrigé — voir l'en-tête. */
const RUSH = "rushes/jour7_resserre.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Monté sur toute la durée : il porte l'image ET le son. */}
    <OffthreadVideo src={staticFile(RUSH)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

    {/* Ne recouvre QUE B2 et B4 : les trois blocs caméra sont des espaces
        réservés, l'animation n'y dessine rien. */}
    <Animation />
  </AbsoluteFill>
);
