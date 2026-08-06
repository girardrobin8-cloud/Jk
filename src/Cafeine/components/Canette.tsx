import { COLORS, FONT_MONO } from "../theme";

/**
 * Canette générique de boisson énergisante, dessinée autour de l'origine
 * (hauteur 400, largeur 150), puis placée par transformation.
 *
 * Volontairement sans marque : pas de logo ni de nom déposé, seulement la
 * silhouette d'une canette de 500 ml.
 */
export const Canette: React.FC = () => (
  <g>
    {/* Corps, avec le rétreint caractéristique en haut et en bas */}
    <path
      d="M -60 -200 C -72 -196 -75 -184 -75 -170 L -75 170 C -75 184 -72 196 -60 200
         L 60 200 C 72 196 75 184 75 170 L 75 -170 C 75 -184 72 -196 60 -200 Z"
      fill={COLORS.bgLift}
      stroke={COLORS.cafeineSoft}
      strokeWidth={4}
      strokeLinejoin="round"
    />

    {/* Bandeau central */}
    <rect x={-75} y={38} width={150} height={46} fill={COLORS.cafeine} opacity={0.13} />
    <text
      x={0}
      y={70}
      textAnchor="middle"
      fill={COLORS.cafeineSoft}
      fontFamily={FONT_MONO}
      fontSize={21}
      letterSpacing={4}
    >
      ÉNERGIE
    </text>

    {/* Éclair */}
    <path
      d="M 16 -104 L -20 -34 L 2 -34 L -14 30 L 24 -44 L 2 -44 Z"
      fill={COLORS.cafeine}
      opacity={0.9}
    />

    <text
      x={0}
      y={-148}
      textAnchor="middle"
      fill={COLORS.muted}
      fontFamily={FONT_MONO}
      fontSize={15}
      letterSpacing={3}
    >
      ZÉRO SUCRE
    </text>
    <text
      x={0}
      y={152}
      textAnchor="middle"
      fill={COLORS.muted}
      fontFamily={FONT_MONO}
      fontSize={17}
    >
      500 ml
    </text>

    {/* Opercule */}
    <ellipse
      cx={0}
      cy={-200}
      rx={60}
      ry={13}
      fill={COLORS.bg}
      stroke={COLORS.cafeineSoft}
      strokeWidth={4}
    />
    <ellipse cx={0} cy={-201} rx={22} ry={6} fill={COLORS.cafeineSoft} opacity={0.35} />
  </g>
);
