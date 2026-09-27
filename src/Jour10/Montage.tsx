import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { DUREE, s } from "./reperes";

/**
 * Montage complet — Reel Jour 10, « 3, c'est le seul nombre de compléments qui
 * comptent vraiment », 54,42 s.
 *
 * Le rush est monté d'un bout à l'autre et porte le son ; l'animation ne le
 * recouvre que sur B2 et B4. Les trois fenêtres « tête parlante » — dont le CTA
 * final — passent donc telles quelles, ce qu'exigent les consignes 3 et 5 du
 * brief : aucun motion design, aucun texte à l'écran, le visage seul.
 *
 * ── Ce que montrent ces trois fenêtres aujourd'hui ──────────────────────
 *
 * Le fichier livré n'est pas le tournage mais un export audio sur fond noir
 * avec les sous-titres incrustés, le septième de suite. Ces quinze secondes
 * réservées affichent donc ce fond noir et ces sous-titres. C'est laid, et
 * c'est voulu : la consigne interdit d'y mettre quoi que ce soit, et laisser le
 * rush tel quel est la seule lecture fidèle. Le jour où Robin livre son
 * tournage, il le repasse dans scripts/resserrer.py, remplace le fichier
 * ci-dessous, et la vidéo est finie — aucun repère, aucune borne, aucune
 * animation ne bouge.
 *
 * ── La piste ────────────────────────────────────────────────────────────
 *
 * Blancs resserrés (2,29 s retirées sur onze coupes) et niveau NORMALISÉ. La
 * prise arrivait à -17,1 LUFS pour un vrai crête à -3,7 dBFS : pas d'écrêtage
 * cette fois, mais trois décibels sous le reste de la série, ce qui s'entendrait
 * dans un fil. Elle est remontée à -14 LUFS, plafond -1 dBTP.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Rush aux blancs resserrés et au niveau corrigé — voir l'en-tête. */
const RUSH = "rushes/jour10_resserre.mp4";

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* Monté sur toute la durée : il porte l'image ET le son. */}
    <OffthreadVideo src={staticFile(RUSH)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

    {/* Ne recouvre QUE B2 et B4 : les trois blocs caméra sont des espaces
        réservés, l'animation n'y dessine rien. */}
    <Animation />
  </AbsoluteFill>
);
