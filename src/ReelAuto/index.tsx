import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { FPS, s } from "./charte";
import { Fond, Progression } from "./Fond";
import { SceneVue } from "./scenes";
import { reelSchema, type Reel, type Scene } from "./schema";
import { SousTitres } from "./SousTitres";

export { reelSchema };

/** Un bruitage court à chaque apparition (règle de forme n° 4). */
const BRUIT: Record<Scene["type"], { f: string; v: number }> = {
  accroche: { f: "whoosh-in.wav", v: 0.9 },
  titre: { f: "whoosh-in.wav", v: 0.6 },
  point: { f: "apparition.wav", v: 0.8 },
  chiffre: { f: "carillon.wav", v: 0.7 },
  etude: { f: "clic.wav", v: 0.9 },
  barres: { f: "pop.wav", v: 0.8 },
  classement: { f: "pop.wav", v: 0.8 },
  cta: { f: "carillon.wav", v: 0.9 },
};

/** La vidéo dure le temps de la voix, plus une demi-seconde de fin. */
export const finVoix = (r: Reel) => (r.mots.length ? r.mots[r.mots.length - 1].end : 10) + 0.5;

export const calculerDuree: CalculateMetadataFunction<Reel> = ({ props }) => ({
  durationInFrames: s(finVoix(props)),
  fps: FPS,
});

export const ReelAuto: React.FC<Reel> = (reel) => {
  const fin = finVoix(reel);
  return (
    <AbsoluteFill>
      <Fond video={reel.fond} />

      {reel.scenes.map((scene, i) => {
        const debut = s(scene.debut);
        const suivante = reel.scenes[i + 1]?.debut ?? fin;
        return (
          <Sequence key={i} from={debut} durationInFrames={Math.max(1, s(suivante) - debut)}>
            <SceneVue scene={scene} />
          </Sequence>
        );
      })}

      {reel.scenes.map((scene, i) => (
        <Sequence key={`b${i}`} from={s(scene.debut)} durationInFrames={s(1.5)}>
          <Audio src={staticFile(`sfx/${BRUIT[scene.type].f}`)} volume={() => BRUIT[scene.type].v * 0.5} />
        </Sequence>
      ))}

      <SousTitres mots={reel.mots} motsCles={reel.motsCles} />
      <Audio src={staticFile(reel.voix)} />
      <Progression />
    </AbsoluteFill>
  );
};
