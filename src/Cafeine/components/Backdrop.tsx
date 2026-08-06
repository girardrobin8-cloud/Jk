import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FADE, FONT } from "../theme";

/**
 * Fond commun à toutes les scènes + fondu au noir en entrée et en sortie,
 * ce qui fait office de transition entre les <Series.Sequence>.
 */
export const Backdrop: React.FC<{
  children: React.ReactNode;
  tint?: string;
  chapter?: string;
}> = ({ children, tint = COLORS.cafeine, chapter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill style={{ opacity }}>
        {/* Halo coloré très diffus, teinté selon le propos de la scène */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(1100px 720px at 50% 42%, ${tint}1F 0%, transparent 68%)`,
          }}
        />
        {/* Grille discrète, pour donner une profondeur de « planche scientifique » */}
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${COLORS.stroke} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.stroke} 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
            opacity: 0.35,
            maskImage:
              "radial-gradient(900px 600px at 50% 50%, black 10%, transparent 75%)",
          }}
        />

        {children}

        {chapter ? (
          <div
            style={{
              position: "absolute",
              left: 84,
              top: 66,
              fontFamily: FONT,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.muted,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                width: 34,
                height: 3,
                background: tint,
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            {chapter}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
