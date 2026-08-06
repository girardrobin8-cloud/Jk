import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Adaptation } from "./Adaptation";
import {
  ANIM_FIN,
  BANDEAU_BLOC3,
  RUSH_A_DUREE,
  RUSH_B_DUREE,
  s,
} from "./reperes";
import { FONT, V } from "./theme";

/**
 * Montage final.
 *
 * Les deux rushes sont posés bout à bout et lus intégralement : leur son n'est
 * ni coupé ni retouché. L'animation vient uniquement se superposer par-dessus
 * l'image du rush B pendant le bloc 2, en laissant passer la voix.
 */

const A_FRAMES = s(RUSH_A_DUREE);
const B_FRAMES = s(RUSH_B_DUREE);
export const MONTAGE_FRAMES = A_FRAMES + B_FRAMES;

const FONDU = 5; // bascule visuelle rush ↔ animation

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** L'animation, fondue en entrée et en sortie pour éviter une bascule sèche. */
const Surimpression: React.FC = () => {
  const frame = useCurrentFrame();
  const duree = s(ANIM_FIN);
  const opacity = interpolate(
    frame,
    [0, FONDU, duree - FONDU, duree],
    [0, 1, 1, 0],
    CLAMP,
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <Adaptation />
    </AbsoluteFill>
  );
};

/** Incrustation basse discrète pendant le bloc « solution ». */
const Bandeau: React.FC<{ texte: string; duree: number }> = ({
  texte,
  duree,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duree - 10, duree], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        // Assez bas pour passer sous le menton : au-dessus, la pastille
        // recouvrait la bouche du narrateur.
        paddingBottom: 170,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 31,
          fontWeight: 700,
          color: V.texte,
          background: "rgba(9, 26, 18, 0.88)",
          border: `2px solid ${V.vert}`,
          borderRadius: 999,
          padding: "18px 40px",
        }}
      >
        {texte}
      </div>
    </AbsoluteFill>
  );
};

export const Montage: React.FC = () => {
  const bandeauDuree = s(BANDEAU_BLOC3.fin - BANDEAU_BLOC3.debut);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Bloc 1 — accroche, rush brut */}
      <Sequence durationInFrames={A_FRAMES} name="Rush A — accroche">
        <OffthreadVideo src={staticFile("rushes/rushA.mp4")} />
      </Sequence>

      {/* Blocs 2 à 4 — rush B lu d'un seul tenant */}
      <Sequence from={A_FRAMES} durationInFrames={B_FRAMES} name="Rush B">
        <AbsoluteFill>
          <OffthreadVideo src={staticFile("rushes/rushB.mp4")} />

          <Sequence durationInFrames={s(ANIM_FIN)} name="Animation — bloc 2">
            <Surimpression />
          </Sequence>

          <Sequence
            from={s(BANDEAU_BLOC3.debut)}
            durationInFrames={bandeauDuree}
            name="Incrustation — bloc 3"
          >
            <Bandeau
              texte="Recalcule tes besoins toutes les 3-4 semaines"
              duree={bandeauDuree}
            />
          </Sequence>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
