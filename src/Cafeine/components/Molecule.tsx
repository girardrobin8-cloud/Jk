import { COLORS } from "../theme";

/**
 * Caféine et adénosine sont toutes deux des purines : un cycle à 6 atomes
 * fusionné à un cycle à 5. C'est cette forme commune qui permet à la caféine
 * de se loger dans les récepteurs de l'adénosine. Les deux molécules sont donc
 * dessinées à partir du même squelette, et ne diffèrent que par leurs
 * groupements latéraux.
 */

// Hexagone (r = 1) tourné de 30° pour offrir une arête verticale à droite.
const HEXA = [
  [0.866, 0.5],
  [0, 1],
  [-0.866, 0.5],
  [-0.866, -0.5],
  [0, -1],
  [0.866, -0.5],
];

// Pentagone fusionné sur cette arête verticale.
const PENTA = [
  [0.866, 0.5],
  [1.817, 0.809],
  [2.405, 0],
  [1.817, -0.809],
  [0.866, -0.5],
];

// Recentre le squelette complet autour de l'origine.
const OFFSET_X = -0.77;

const poly = (pts: number[][]) =>
  pts.map((p) => `${p[0] + OFFSET_X},${p[1]}`).join(" ");

// Groupements méthyle de la caféine (triméthylxanthine) : trois branches.
const METHYLS = [
  [0, 1.75],
  [0, -1.75],
  [2.55, 1.35],
];

export const Molecule: React.FC<{
  kind: "cafeine" | "adenosine";
  size: number;
  opacity?: number;
  glow?: number;
}> = ({ kind, size, opacity = 1, glow = 0 }) => {
  const isCafeine = kind === "cafeine";
  const color = isCafeine ? COLORS.cafeine : COLORS.adenosine;
  const soft = isCafeine ? COLORS.cafeineSoft : COLORS.adenosineSoft;

  return (
    <g opacity={opacity} transform={`scale(${size})`}>
      {glow > 0 ? (
        <circle r={2.6} fill={color} opacity={glow * 0.1} />
      ) : null}

      {/* Squelette purine, identique pour les deux molécules */}
      <polygon
        points={poly(HEXA)}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={0.16}
        strokeLinejoin="round"
      />
      <polygon
        points={poly(PENTA)}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={0.16}
        strokeLinejoin="round"
      />

      {isCafeine
        ? METHYLS.map((m, i) => {
            const x = m[0] + OFFSET_X;
            const y = m[1];
            const nx = x * 0.72;
            const ny = y * 0.72;
            return (
              <g key={i}>
                <line
                  x1={nx}
                  y1={ny}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={0.14}
                  strokeLinecap="round"
                />
                <circle cx={x} cy={y} r={0.34} fill={soft} />
              </g>
            );
          })
        : null}

      {!isCafeine ? (
        <g>
          {/* Groupement amine caractéristique de l'adénine */}
          <line
            x1={-1.2}
            y1={-0.36}
            x2={-1.95}
            y2={-0.78}
            stroke={color}
            strokeWidth={0.14}
            strokeLinecap="round"
          />
          <circle cx={-2.1} cy={-0.86} r={0.34} fill={soft} />
          {/* Ribose : la queue sucre absente de la caféine */}
          <line
            x1={1.05}
            y1={0.809}
            x2={1.75}
            y2={1.35}
            stroke={color}
            strokeWidth={0.14}
            strokeLinecap="round"
          />
          <polygon
            points="1.75,1.35 2.6,1.2 2.85,2 2.15,2.5 1.5,2.05"
            fill={color}
            fillOpacity={0.16}
            stroke={color}
            strokeWidth={0.13}
            strokeLinejoin="round"
          />
        </g>
      ) : null}
    </g>
  );
};
