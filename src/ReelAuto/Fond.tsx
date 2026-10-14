import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./charte";

/**
 * Fond commun : noir, grille qui défile lentement et halo vert qui dérive.
 * Avec une vidéo de fond, elle passe dessous, assombrie, pour que le texte
 * reste lisible.
 */
export const Fond: React.FC<{ video?: string }> = ({ video }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const decalage = (frame * 0.6) % 90;

  return (
    <AbsoluteFill style={{ backgroundColor: C.fond }}>
      {video ? (
        <AbsoluteFill style={{ opacity: 0.35 }}>
          <OffthreadVideo src={staticFile(video)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grille} 2px, transparent 2px), linear-gradient(90deg, ${C.grille} 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${decalage}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${interpolate(p, [0, 1], [30, 70])}% ${interpolate(p, [0, 1], [25, 45])}%, rgba(47,191,113,0.22), transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(transparent 70%, rgba(0,0,0,0.6))" }} />
    </AbsoluteFill>
  );
};

/** Fine barre de progression en haut : elle pousse à regarder jusqu'au bout. */
export const Progression: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, backgroundColor: C.vert }} />
  );
};
