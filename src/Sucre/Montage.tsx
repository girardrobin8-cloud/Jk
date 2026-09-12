import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { Beat, BEATS, DUREE, s } from "./reperes";

/**
 * Montage complet — « Le sucre n'est pas (que) le problème », 50 s.
 *
 * Calé sur la prise réelle (45,56 s) : les bornes de reperes.ts sont relevées
 * sur l'enveloppe sonore, plus estimées d'après le brief.
 *
 * Contrainte du brief : la voix est continue et n'est jamais recoupée. Les
 * plans se posent par-dessus, et l'animation lit le temps ABSOLU du montage —
 * elle est donc montée sur toute la durée, les réserves tête caméra venant la
 * recouvrir sur leurs fenêtres. Décaler une borne ne peut pas décaler le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

/**
 * Piste voix, telle qu'enregistrée.
 *
 * Le flux d'origine est copié sans réencodage : le brief interdit de toucher à
 * l'audio, et un simple transcodage suffirait à en changer le rendu.
 */
const VOIX = "voix/sucre.mp4";

/**
 * Bruitages, en secondes absolues (banque de `scripts/bruitages.py`).
 *
 * Volumes bas : ils passeront sous une voix, pas devant elle. Les souffles
 * accompagnent les déplacements — mise en frise, contraction de la pile — et
 * non plus des apparitions, puisque plus rien n'apparaît sans venir d'ailleurs.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "apparition.wav", t: 6.4, v: 0.5 },
  { f: "clic.wav", t: 8.3, v: 0.6 },
  { f: "pop.wav", t: 9.9, v: 0.5 },
  { f: "pop.wav", t: 11.9, v: 0.5 },
  { f: "whoosh-out.wav", t: 12.85, v: 0.45 }, // les effets se rangent
  { f: "marche.wav", t: 13.5, v: 0.5 }, // le jeton se pose dans la pile
  { f: "marche.wav", t: 14.5, v: 0.5 },
  { f: "marche.wav", t: 15.4, v: 0.5 },
  { f: "marche.wav", t: 16.6, v: 0.55 },
  { f: "whoosh-in.wav", t: 17.9, v: 0.5 }, // la pile se referme
  { f: "impact.wav", t: 18.35, v: 0.75 },
  { f: "whoosh-out.wav", t: 21.4, v: 0.45 }, // la phrase se range
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 23.4 + i * 0.25, v: 0.32 })),
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 27.0 + i * 0.25, v: 0.32 })),
  { f: "carillon.wav", t: 30.0, v: 0.42 },
  { f: "whoosh-in.wav", t: 30.6, v: 0.5 },
  { f: "impact.wav", t: 30.9, v: 0.78 },
];

/**
 * Fenêtre tête caméra : rush brut à venir.
 *
 * Le brief demande explicitement « aucune animation » sur ces trois fenêtres.
 * La réserve tient la place et rappelle la réplique ; le plan filmé viendra la
 * recouvrir sans rien changer d'autre.
 */
const mmss = (t: number) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

const Reserve: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = Math.min(1, frame / (0.2 * fps));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0D120F",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        textAlign: "center",
        fontFamily: TITRE_FONT,
        opacity: a,
      }}
    >
      <div
        style={{
          border: `6px dashed ${M.gris}`,
          borderRadius: 24,
          padding: "70px 50px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: M.ambre, marginBottom: 24 }}>
          RUSH BRUT — AUCUNE ANIMATION
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: M.texte, marginBottom: 30 }}>
          {mmss(beat.debut)} → {mmss(beat.fin)}
        </div>
        <div style={{ fontSize: 32, lineHeight: 1.45, color: M.gris }}>« {beat.dit} »</div>
      </div>
    </AbsoluteFill>
  );
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile(VOIX)} />

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    {/* Montée sur toute la durée : c'est ce qui lui donne le temps absolu. */}
    <Animation />

    {BEATS.filter((b) => b.type === "visage").map((b) => (
      <Sequence
        key={b.id}
        from={s(b.debut)}
        durationInFrames={s(b.fin) - s(b.debut)}
        name={`${b.id} — tête caméra`}
      >
        <Reserve beat={b} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
