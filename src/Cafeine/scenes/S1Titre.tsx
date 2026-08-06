import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Molecule } from "../components/Molecule";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS } from "../theme";
import { rand, ramp, toPath } from "../utils";

/** Volute de vapeur : sinusoïde qui ondule et monte avec le temps. */
const Vapeur: React.FC<{ x: number; frame: number; seed: number }> = ({
  x,
  frame,
  seed,
}) => {
  const drift = (frame * 0.9 + seed * 40) % 220;
  const pts = [];
  const len = 210;
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    pts.push({
      x: x + Math.sin(t * 4.2 + frame * 0.07 + seed) * (10 + t * 26),
      y: 405 - t * len - drift * 0.35,
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

export const S1Titre: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ramp(frame, 0, 30);

  return (
    <Backdrop tint={COLORS.cafeine}>
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          {/* Molécules qui dérivent en arrière-plan */}
          {new Array(9).fill(0).map((_, i) => {
            const px = 180 + rand(i + 1) * 1560;
            const py = 140 + rand(i + 21) * 800;
            const drift = Math.sin(frame * 0.02 + i) * 22;
            return (
              <g key={i} transform={`translate(${px} ${py + drift})`}>
                <Molecule
                  kind={i % 3 === 0 ? "adenosine" : "cafeine"}
                  size={9 + rand(i + 41) * 7}
                  opacity={0.14}
                />
              </g>
            );
          })}

          <g opacity={grow}>
            {new Array(3).fill(0).map((_, i) => (
              <Vapeur key={i} x={905 + i * 55} frame={frame} seed={i} />
            ))}

            {/* Tasse */}
            <ellipse
              cx={960}
              cy={600}
              rx={172}
              ry={26}
              fill={COLORS.cafeine}
              fillOpacity={0.1}
            />
            <path
              d="M 862 428 L 884 556 Q 890 578 912 578 L 1008 578 Q 1030 578 1036 556 L 1058 428 Z"
              fill={COLORS.bgLift}
              stroke={COLORS.cafeineSoft}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <path
              d="M 1060 452 Q 1132 456 1128 502 Q 1124 546 1046 540"
              fill="none"
              stroke={COLORS.cafeineSoft}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <ellipse
              cx={960}
              cy={428}
              rx={99}
              ry={21}
              fill={COLORS.cafeine}
              fillOpacity={0.85}
              stroke={COLORS.cafeineSoft}
              strokeWidth={4}
            />
          </g>
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 118,
          textAlign: "center",
        }}
      >
        <Rise at={22} style={{ marginBottom: 20 }}>
          <Etiquette color={COLORS.cafeine}>Physiologie · en une minute</Etiquette>
        </Rise>
        <Rise at={32}>
          <Titre size={104}>La caféine dans le corps</Titre>
        </Rise>
        <Rise at={48} style={{ marginTop: 22 }}>
          <Texte size={34} maxWidth={1080}>
            Ce qu’il se passe vraiment, minute après minute, après une tasse.
          </Texte>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
