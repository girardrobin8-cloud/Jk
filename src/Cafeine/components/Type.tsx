import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { fadeInOut } from "../utils";

/** Bloc qui apparaît en montant légèrement, puis se retire. */
export const Rise: React.FC<{
  at: number;
  until?: number;
  children: React.ReactNode;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ at, until = 100000, children, distance = 26, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - at,
    fps,
    config: { damping: 200, mass: 0.55 },
  });
  const opacity = fadeInOut(frame, at, until, 14);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - enter) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Titre: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
}> = ({ children, size = 62, color = COLORS.text }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.12,
      letterSpacing: -1.4,
      color,
    }}
  >
    {children}
  </div>
);

export const Texte: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  maxWidth?: number;
}> = ({ children, size = 30, color = COLORS.muted, maxWidth = 720 }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 400,
      lineHeight: 1.5,
      color,
      maxWidth,
    }}
  >
    {children}
  </div>
);

/** Petite étiquette technique, en capitales espacées. */
export const Etiquette: React.FC<{
  children: React.ReactNode;
  color?: string;
}> = ({ children, color = COLORS.muted }) => (
  <div
    style={{
      fontFamily: FONT_MONO,
      fontSize: 20,
      letterSpacing: 3,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);
