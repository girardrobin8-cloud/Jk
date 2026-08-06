import { AbsoluteFill, Series } from "remotion";
import { COLORS } from "./theme";
import { S1Titre } from "./scenes/S1Titre";
import { S2Absorption } from "./scenes/S2Absorption";
import { S3Adenosine } from "./scenes/S3Adenosine";
import { S4Blocage } from "./scenes/S4Blocage";
import { S5Effets } from "./scenes/S5Effets";
import { S6DemiVie } from "./scenes/S6DemiVie";
import { S7Contrecoup } from "./scenes/S7Contrecoup";

/**
 * Découpage de la vidéo. Chaque scène gère son propre fondu au noir
 * (voir <Backdrop>), ce qui enchaîne les séquences sans transition explicite.
 */
export const SCENES = [
  { id: "titre", duree: 110, composant: S1Titre },
  { id: "absorption", duree: 250, composant: S2Absorption },
  { id: "adenosine", duree: 215, composant: S3Adenosine },
  { id: "blocage", duree: 320, composant: S4Blocage },
  { id: "effets", duree: 235, composant: S5Effets },
  { id: "demi-vie", duree: 265, composant: S6DemiVie },
  { id: "contrecoup", duree: 300, composant: S7Contrecoup },
];

export const DUREE_TOTALE = SCENES.reduce((total, s) => total + s.duree, 0);

export const Cafeine: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <Series>
      {SCENES.map((scene) => (
        <Series.Sequence key={scene.id} durationInFrames={scene.duree}>
          <scene.composant />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
