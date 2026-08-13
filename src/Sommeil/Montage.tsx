import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { Beat, BEATS, DUREE, s } from "./reperes";

/**
 * Montage complet — « Le sommeil décide si tu perds du gras ou du muscle », 55 s.
 *
 * ⚠️ SANS VOIX : la prise n'existe pas encore. Les bornes de reperes.ts sont
 * celles du brief, données comme estimations. Quand la prise arrivera, elles
 * seront relevées sur l'enveloppe sonore comme pour le montage sucre — et rien
 * d'autre ne bougera, l'animation lisant le temps absolu.
 *
 * Contrainte du brief : la voix est continue et n'est jamais recoupée. Les
 * plans se posent par-dessus, et l'animation lit le temps ABSOLU du montage —
 * elle est donc montée sur toute la durée, les réserves tête caméra venant la
 * recouvrir sur leurs fenêtres. Décaler une borne ne peut pas décaler le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Piste voix, à poser ici une fois la prise enregistrée. */
// const VOIX = "voix/sommeil.mp4";

/**
 * Bruitages, en secondes absolues (banque de `scripts/bruitages.py`).
 *
 * Volumes bas : ils passeront sous une voix, pas devant elle. Les souffles
 * accompagnent les déplacements — mise en frise, contraction de la pile — et
 * non plus des apparitions, puisque plus rien n'apparaît sans venir d'ailleurs.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "apparition.wav", t: 5.1, v: 0.5 }, // le soleil
  { f: "whoosh-out.wav", t: 6.3, v: 0.4 }, // il se referme en lune
  { f: "whoosh-in.wav", t: 8.0, v: 0.42 }, // la lune monte en racine
  { f: "clic.wav", t: 9.05, v: 0.55 },
  { f: "clic.wav", t: 9.45, v: 0.55 },
  { f: "pop.wav", t: 10.5, v: 0.45 },
  { f: "marche.wav", t: 12.3, v: 0.45 }, // la colonne 8h30 se pose
  ...[0, 1, 2, 3, 4].map((i) => ({ f: "clic.wav", t: 13.1 + i * 0.14, v: 0.3 })),
  { f: "marche.wav", t: 15.3, v: 0.45 }, // la colonne 5h30
  ...[0, 1, 2, 3, 4].map((i) => ({ f: "clic.wav", t: 16.0 + i * 0.14, v: 0.3 })),
  { f: "whoosh-in.wav", t: 18.2, v: 0.45 }, // les barres poussent
  { f: "carillon.wav", t: 20.7, v: 0.4 }, // « ≈ 3 kg »
  { f: "whoosh-out.wav", t: 26.2, v: 0.45 }, // la barre se scinde
  { f: "impact.wav", t: 26.6, v: 0.6 },
  { f: "pop.wav", t: 29.1, v: 0.45 },
  { f: "pop.wav", t: 29.45, v: 0.45 },
  { f: "whoosh-in.wav", t: 37.3, v: 0.5 }, // le bandeau « +60 % »
  { f: "impact.wav", t: 37.7, v: 0.78 },
];

/**
 * Fenêtre tête caméra : rush brut à venir.
 *
 * Le brief demande explicitement « aucune animation » sur ces fenêtres.
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
    {/* <Audio src={staticFile(VOIX)} /> — à décommenter avec la prise */}

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
