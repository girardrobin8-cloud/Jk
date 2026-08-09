import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { M } from "../Muscle/Plan";
import { BLOCS, COUPES, s, SCENES, VOIX_DUREE } from "./index";

/**
 * Montage complet — « Bonjour, je m'appelle Robin ».
 *
 * ⚠️ La piste voix est la TÉMOIN synthétisée hors ligne
 * (`scripts/voix_hors_ligne.py`), pas une prise réelle. Elle tient la place et
 * la durée le temps que l'enregistrement ElevenLabs arrive ; la substitution
 * se fait en changeant la seule constante VOIX ci-dessous, puis en reprenant
 * les repères sur la nouvelle prise.
 *
 * Un plan par phrase, coupé au milieu du silence qui la précède : l'image
 * change pendant la respiration, jamais sur une syllabe.
 */

/** Fichier voix. Passer à "voix/presentation.mp3" une fois la vraie prise là. */
const VOIX = "voix/presentation.wav";

export const MONTAGE_FRAMES = s(VOIX_DUREE);

/**
 * Bruitages, en secondes absolues (banque de `scripts/bruitages.py`).
 *
 * Volumes bas : la voix reste prioritaire. Ils sont calés sur la témoin, dont
 * le niveau est très régulier — une vraie prise respire davantage, il faudra
 * sans doute les remonter de quelques dixièmes après substitution.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  // Un souffle à chaque changement de plan, posé sur la coupe.
  ...COUPES.slice(1).map((t) => ({ f: "whoosh-in.wav", t, v: 0.55 })),

  { f: "apparition.wav", t: 0.45, v: 0.7 }, // l'initiale s'installe
  { f: "pop.wav", t: 1.25, v: 0.5 }, // le compteur d'âge démarre

  { f: "carillon.wav", t: 3.3, v: 0.5 }, // le soleil passe l'horizon
  { f: "apparition.wav", t: 4.35, v: 0.6 }, // le repère se pose sur l'île

  // Les trois proches, en grappe serrée
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 8.0 + i * 0.14, v: 0.55 })),

  // Une marche par palier, sur le tempo d'apparition des rectangles
  ...[0, 1, 2, 3].map((i) => ({ f: "marche.wav", t: 10.74 + i * 0.35, v: 0.6 })),

  { f: "carillon.wav", t: 14.2, v: 0.75 }, // ouverture du plan final
];

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile(VOIX)} />

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    {SCENES.map((Scene, i) => {
      const debut = s(COUPES[i]);
      const fin = i + 1 < COUPES.length ? s(COUPES[i + 1]) : MONTAGE_FRAMES;
      const duree = fin - debut;
      return (
        <Sequence
          key={BLOCS[i].id}
          from={debut}
          durationInFrames={duree}
          name={`${BLOCS[i].id} — ${BLOCS[i].dit}`}
        >
          <Scene duree={duree} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
