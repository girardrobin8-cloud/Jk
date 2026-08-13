import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { Beat, BEATS, DUREE, s } from "./reperes";

/**
 * Montage complet — « Le sommeil décide si tu perds du gras ou du muscle », 55 s.
 *
 * Calé sur la prise réelle (51,80 s) : les bornes de reperes.ts sont relevées
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
const VOIX = "voix/sommeil.mp4";

/**
 * AUCUN BRUITAGE sur ce montage — demande explicite : le sound design sera
 * ajouté à la main. La bande son ne porte donc que la voix, telle quelle.
 */


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
    <Audio src={staticFile(VOIX)} />


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
