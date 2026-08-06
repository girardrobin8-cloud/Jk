import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { ramp, remaining, toPath } from "../utils";

const DOSE = 95; // mg — une tasse de café filtre
const DEMI_VIE = 5; // heures
const HEURES = 12;
const DEBUT = 14; // le café est bu à 14 h

const X0 = 330;
const X1 = 1740;
const Y0 = 300; // 100 mg
const Y1 = 820; // 0 mg

const xOf = (h: number) => X0 + (h / HEURES) * (X1 - X0);
// 0 mg en bas de l'axe, 100 mg en haut.
const y = (mg: number) => Y1 - (mg / 100) * (Y1 - Y0);

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const heureLabel = (h: number) => `${pad((DEBUT + h) % 24)} h`;

const courbe = (tMax: number) => {
  const pts = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const h = (i / steps) * tMax;
    pts.push({ x: xOf(h), y: y(remaining(DOSE, h, DEMI_VIE)) });
  }
  return pts;
};

export const S6DemiVie: React.FC = () => {
  const frame = useCurrentFrame();

  const trace = ramp(frame, 34, 208);
  const tNow = trace * HEURES;
  const mgNow = remaining(DOSE, tNow, DEMI_VIE);
  const pts = courbe(Math.max(0.001, tNow));

  return (
    <Backdrop tint={COLORS.cafeine} chapter="Élimination">
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <defs>
            <linearGradient id="sousCourbe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.cafeine} stopOpacity={0.32} />
              <stop offset="100%" stopColor={COLORS.cafeine} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grille horaire */}
          {[0, 2, 4, 6, 8, 10, 12].map((h) => (
            <g key={h}>
              <line
                x1={xOf(h)}
                y1={Y0 - 30}
                x2={xOf(h)}
                y2={Y1}
                stroke={COLORS.stroke}
                strokeWidth={2}
              />
              <text
                x={xOf(h)}
                y={Y1 + 44}
                textAnchor="middle"
                fill={COLORS.muted}
                fontFamily={FONT_MONO}
                fontSize={22}
              >
                {heureLabel(h)}
              </text>
            </g>
          ))}
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={COLORS.stroke} strokeWidth={3} />

          {/* Repère de la demi-dose */}
          <g opacity={ramp(frame, 120, 146)}>
            <line
              x1={X0}
              y1={y(DOSE / 2)}
              x2={xOf(DEMI_VIE)}
              y2={y(DOSE / 2)}
              stroke={COLORS.adenosine}
              strokeWidth={2.5}
              strokeDasharray="9 10"
            />
            <line
              x1={xOf(DEMI_VIE)}
              y1={y(DOSE / 2)}
              x2={xOf(DEMI_VIE)}
              y2={Y1}
              stroke={COLORS.adenosine}
              strokeWidth={2.5}
              strokeDasharray="9 10"
            />
            <text
              x={xOf(DEMI_VIE) + 22}
              y={y(DOSE / 2) - 22}
              fill={COLORS.adenosineSoft}
              fontFamily={FONT}
              fontSize={28}
            >
              {`${Math.round(DOSE / 2)} mg — la moitié est encore là`}
            </text>
          </g>

          {/* Aire + courbe */}
          <path
            d={`${toPath(pts)} L ${pts[pts.length - 1].x} ${Y1} L ${X0} ${Y1} Z`}
            fill="url(#sousCourbe)"
          />
          <path
            d={toPath(pts)}
            fill="none"
            stroke={COLORS.cafeine}
            strokeWidth={6}
            strokeLinecap="round"
          />

          {/* Curseur */}
          <g transform={`translate(${xOf(tNow)} ${y(mgNow)})`}>
            <circle r={26} fill={COLORS.cafeine} opacity={0.2} />
            <circle r={11} fill={COLORS.cafeine} />
            <text
              x={0}
              y={-42}
              textAnchor="middle"
              fill={COLORS.text}
              fontFamily={FONT_MONO}
              fontSize={32}
            >
              {`${Math.round(mgNow)} mg`}
            </text>
          </g>

          {/* Ce qu'il reste au coucher */}
          <g opacity={ramp(frame, 196, 220)}>
            <circle cx={xOf(10)} cy={y(remaining(DOSE, 10, DEMI_VIE))} r={9} fill={COLORS.alerte} />
            <text
              x={xOf(10) - 16}
              y={y(remaining(DOSE, 10, DEMI_VIE)) - 44}
              textAnchor="end"
              fill={COLORS.alerte}
              fontFamily={FONT}
              fontSize={26}
            >
              {`${Math.round(remaining(DOSE, 10, DEMI_VIE))} mg à minuit`}
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ paddingLeft: 160, paddingTop: 156 }}>
        <Rise at={4}>
          <Titre size={58}>Cinq heures pour en éliminer la moitié</Titre>
        </Rise>
        <Rise at={30} style={{ marginTop: 16 }}>
          <Texte size={27} maxWidth={1180}>
            Une tasse de café filtre ≈ 95 mg, bue à 14 h. Le foie l’élimine
            lentement, et toujours par moitiés.
          </Texte>
        </Rise>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 74,
          textAlign: "center",
        }}
      >
        <Rise at={226}>
          <Etiquette color={COLORS.muted}>
            Demi-vie de 3 à 7 h selon le foie · génétique CYP1A2, grossesse,
            tabac, médicaments
          </Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
