import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { ramp } from "../utils";

const EFFETS = [
  { at: 40, label: "Vigilance", valeur: 0.86, note: "nette", couleur: COLORS.cafeine },
  { at: 62, label: "Adrénaline", valeur: 0.64, note: "marquée", couleur: COLORS.cafeine },
  {
    at: 84,
    label: "Signalisation dopaminergique",
    valeur: 0.52,
    note: "indirecte",
    couleur: COLORS.cafeineSoft,
  },
  {
    at: 106,
    label: "Tension artérielle",
    valeur: 0.26,
    note: "légère",
    couleur: COLORS.alerte,
  },
];

const COEUR =
  "M 0 26 C -34 2 -46 -22 -30 -36 C -16 -48 -2 -40 0 -28 C 2 -40 16 -48 30 -36 C 46 -22 34 2 0 26 Z";

export const S5Effets: React.FC = () => {
  const frame = useCurrentFrame();

  // Le rythme s'accélère doucement : 68 → 76 bpm.
  const bpm = interpolate(frame, [30, 150], [68, 76], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const battement = Math.pow(
    Math.max(0, Math.sin((frame / 30) * (bpm / 60) * Math.PI * 2)),
    7,
  );
  const echelle = 1 + battement * 0.13;

  return (
    <Backdrop tint={COLORS.cafeine} chapter="Effets en cascade">
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <g transform="translate(470 560)">
            {[0, 1].map((i) => {
              const onde = (battement + i * 0.4) % 1;
              return (
                <circle
                  key={i}
                  r={130 + onde * 90}
                  fill="none"
                  stroke={COLORS.alerte}
                  strokeWidth={3}
                  opacity={(1 - onde) * 0.25 * battement}
                />
              );
            })}
            <g transform={`scale(${2.5 * echelle})`}>
              <path d={COEUR} fill={COLORS.alerte} fillOpacity={0.22} />
              <path
                d={COEUR}
                fill="none"
                stroke={COLORS.alerte}
                strokeWidth={2.4}
                strokeLinejoin="round"
              />
            </g>
            <text
              x={0}
              y={210}
              textAnchor="middle"
              fill={COLORS.text}
              fontFamily={FONT_MONO}
              fontSize={62}
            >
              {`${Math.round(bpm)}`}
            </text>
            <text
              x={0}
              y={252}
              textAnchor="middle"
              fill={COLORS.muted}
              fontFamily={FONT_MONO}
              fontSize={22}
              letterSpacing={4}
            >
              BPM
            </text>
          </g>

          {/* Barres d'effet */}
          {EFFETS.map((e, i) => {
            const y = 396 + i * 106;
            const p = ramp(frame, e.at, e.at + 34);
            return (
              <g key={e.label} opacity={ramp(frame, e.at - 8, e.at + 6)}>
                <text
                  x={900}
                  y={y - 16}
                  fill={COLORS.text}
                  fontFamily={FONT}
                  fontSize={28}
                >
                  {e.label}
                </text>
                <text
                  x={1740}
                  y={y - 16}
                  textAnchor="end"
                  fill={COLORS.muted}
                  fontFamily={FONT_MONO}
                  fontSize={22}
                >
                  {`↑ ${e.note}`}
                </text>
                <rect x={900} y={y} width={840} height={12} rx={6} fill={COLORS.stroke} />
                <rect
                  x={900}
                  y={y}
                  width={840 * e.valeur * p}
                  height={12}
                  rx={6}
                  fill={e.couleur}
                />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ paddingLeft: 160, paddingTop: 172 }}>
        <Rise at={4}>
          <Titre size={60}>Le corps passe en alerte</Titre>
        </Rise>
        <Rise at={28} style={{ marginTop: 18 }}>
          <Texte size={28} maxWidth={640}>
            Sans le frein de l’adénosine, les circuits de l’éveil s’emballent.
          </Texte>
        </Rise>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 92,
          textAlign: "center",
        }}
      >
        <Rise at={158}>
          <Etiquette color={COLORS.cafeineSoft}>
            Aucune énergie n’est créée — un frein est levé
          </Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
