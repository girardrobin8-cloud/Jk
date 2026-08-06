import { COLORS } from "../theme";
import { toPath } from "../utils";

/**
 * Tasse et volutes de vapeur, dessinées autour de l'origine (centre du bord
 * supérieur de la tasse). On les place ensuite avec un `translate`/`scale`,
 * ce qui permet de réutiliser le même dessin en 16:9 comme en 9:16.
 */

export const Tasse: React.FC = () => (
  <g>
    <ellipse
      cx={0}
      cy={172}
      rx={172}
      ry={26}
      fill={COLORS.cafeine}
      fillOpacity={0.07}
    />
    <path
      d="M -98 0 L -76 128 Q -70 150 -48 150 L 48 150 Q 70 150 76 128 L 98 0 Z"
      fill={COLORS.bgLift}
      stroke={COLORS.cafeineSoft}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M 100 24 Q 172 28 168 74 Q 164 118 86 112"
      fill="none"
      stroke={COLORS.cafeineSoft}
      strokeWidth={4}
      strokeLinecap="round"
    />
    <ellipse
      cx={0}
      cy={0}
      rx={99}
      ry={21}
      fill={COLORS.cafeine}
      fillOpacity={0.85}
      stroke={COLORS.cafeineSoft}
      strokeWidth={4}
    />
  </g>
);

/** Volute de vapeur : sinusoïde qui ondule et monte avec le temps. */
export const Vapeur: React.FC<{ decalage: number; frame: number; seed: number }> = ({
  decalage,
  frame,
  seed,
}) => {
  const derive = (frame * 0.9 + seed * 40) % 220;
  const pts = [];
  const len = 210;
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    pts.push({
      x: decalage + Math.sin(t * 4.2 + frame * 0.07 + seed) * (10 + t * 26),
      y: -23 - t * len - derive * 0.35,
    });
  }
  return (
    <path
      d={toPath(pts)}
      fill="none"
      stroke={COLORS.text}
      strokeWidth={3}
      strokeLinecap="round"
      opacity={0.16 - seed * 0.02}
    />
  );
};
