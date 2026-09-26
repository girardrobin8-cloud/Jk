import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Adaptation } from "./Adaptation";
import { BRUITAGES_ANIMATION, GAIN_SEUL } from "./bruitages";
import { s } from "./reperes";

/**
 * L'animation du bloc 2 avec ses bruitages, sans les rushes ni la voix.
 *
 * Les sons sont les mêmes que dans le montage complet et tombent aux mêmes
 * instants — seul le niveau change, puisqu'il n'y a plus de parole à laisser
 * passer devant. Pour régler l'image sans le son, il suffit de couper le son
 * du studio : la composition reste l'outil de calage qu'elle était.
 */
export const AnimationSonore: React.FC = () => (
  <AbsoluteFill>
    <Adaptation />

    {BRUITAGES_ANIMATION.map((b, i) => {
      const volume = Math.min(1, b.volume * GAIN_SEUL);

      return (
        <Sequence
          key={`${b.fichier}-${i}`}
          from={s(b.tSeul ?? b.t)}
          name={`SFX ${b.fichier}`}
        >
          {/* Volume constant pour chaque bruitage : rien à automatiser. */}
          <Audio src={staticFile(`sfx/${b.fichier}`)} volume={volume} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
