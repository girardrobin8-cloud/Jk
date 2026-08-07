import { M } from "./Plan";

/**
 * Icônes en trait, dans l'esprit des scènes caféine : contours fins, fonds
 * translucides, sur fond sombre. Chaque icône est centrée sur l'origine et
 * dimensionnée pour se placer directement dans les scènes ; `echelle` permet
 * de la réduire ponctuellement.
 */

type Ic = { echelle?: number; opacity?: number; couleur?: string };

const T = 5; // épaisseur de trait commune

/**
 * Bras fléchi : bras horizontal, avant-bras vertical, renflement du biceps,
 * poing.
 *
 * Les quatre formes se chevauchent, et tracer chacune donnerait un fouillis de
 * jonctions. On dessine donc le contour épais D'ABORD, puis on le recouvre par
 * l'intérieur rempli : seule la silhouette d'ensemble reste visible.
 */
const Formes: React.FC<Record<string, unknown>> = (props) => (
  <>
    <rect x={-140} y={22} width={172} height={76} rx={38} {...props} />
    <rect x={-14} y={-124} width={76} height={194} rx={38} {...props} />
    <ellipse cx={-42} cy={20} rx={86} ry={64} {...props} />
    <circle cx={24} cy={-124} r={42} {...props} />
  </>
);

export const Muscle: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.corail }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <Formes fill={couleur} stroke={couleur} strokeWidth={T * 2} strokeLinejoin="round" />
    <Formes fill={M.fond} />
    <g opacity={0.18}>
      <Formes fill={couleur} />
    </g>
  </g>
);

/** Cerveau : ovale et circonvolutions. */
export const Cerveau: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={132} ry={100} fill={couleur} fillOpacity={0.14} />
    <ellipse cx={0} cy={0} rx={132} ry={100} fill="none" stroke={couleur} strokeWidth={T} />
    <g fill="none" stroke={couleur} strokeWidth={T - 1} strokeLinecap="round" opacity={0.85}>
      <path d="M 0 -96 L 0 96" />
      <path d="M -96 -44 q 30 -26 54 2 q 24 26 -8 46" />
      <path d="M -92 46 q 34 20 60 -6" />
      <path d="M 96 -44 q -30 -26 -54 2 q -24 26 8 46" />
      <path d="M 92 46 q -34 20 -60 -6" />
    </g>
  </g>
);

/** Haltère. */
export const Haltere: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity} stroke={couleur} strokeWidth={T}>
    <line x1={-40} y1={0} x2={40} y2={0} />
    <line x1={-52} y1={-24} x2={-52} y2={24} strokeLinecap="round" />
    <line x1={52} y1={-24} x2={52} y2={24} strokeLinecap="round" />
    <line x1={-64} y1={-14} x2={-64} y2={14} strokeLinecap="round" />
    <line x1={64} y1={-14} x2={64} y2={14} strokeLinecap="round" />
  </g>
);

/** Silhouette debout. */
export const Silhouette: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g
    transform={`scale(${echelle})`}
    opacity={opacity}
    fill="none"
    stroke={couleur}
    strokeWidth={T}
    strokeLinecap="round"
  >
    <circle cx={0} cy={-66} r={26} />
    <path d="M 0 -40 L 0 26" />
    <path d="M -42 -16 L 42 -16" />
    <path d="M 0 26 L -32 84 M 0 26 L 32 84" />
  </g>
);

/** Bâtiment universitaire : fronton et colonnes. */
export const Batiment: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <path d="M -128 -40 L 0 -104 L 128 -40 Z" fill={couleur} fillOpacity={0.14} />
    <path
      d="M -128 -40 L 0 -104 L 128 -40 Z"
      fill="none"
      stroke={couleur}
      strokeWidth={T}
      strokeLinejoin="round"
    />
    <g stroke={couleur} strokeWidth={T} strokeLinecap="round">
      {[-88, -44, 0, 44, 88].map((x) => (
        <line key={x} x1={x} y1={-24} x2={x} y2={72} />
      ))}
      <line x1={-124} y1={-24} x2={124} y2={-24} />
      <line x1={-132} y1={90} x2={132} y2={90} />
    </g>
  </g>
);

/** Chercheur : blouse et fiole. */
export const Chercheur: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <g fill="none" stroke={couleur} strokeWidth={T} strokeLinecap="round">
      <circle cx={-14} cy={-70} r={26} />
      <path d="M -52 6 q 0 -46 38 -46 q 38 0 38 46 L 24 74 L -52 74 Z" />
      <path d="M -14 -40 L -14 74" opacity={0.5} />
    </g>
    {/* Fiole */}
    <g transform="translate(60 26)">
      <path
        d="M -14 -34 L -14 -8 L -26 26 q -4 12 10 12 L 30 30 q 14 0 10 -12 L 14 -8 L 14 -34 Z"
        fill={M.ambre}
        fillOpacity={0.28}
        stroke={couleur}
        strokeWidth={T - 1}
        strokeLinejoin="round"
      />
      <line
        x1={-20}
        y1={-34}
        x2={20}
        y2={-34}
        stroke={couleur}
        strokeWidth={T - 1}
        strokeLinecap="round"
      />
    </g>
  </g>
);

/** Groupe de trois personnes. */
export const Groupe: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    {[-62, 0, 62].map((x) => (
      <g
        key={x}
        transform={`translate(${x} 0)`}
        fill="none"
        stroke={couleur}
        strokeWidth={T - 1}
        strokeLinecap="round"
      >
        <circle cx={0} cy={-30} r={18} />
        <path d="M -24 44 q 0 -34 24 -34 q 24 0 24 34" />
      </g>
    ))}
  </g>
);

export const Coche: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.vert }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <circle cx={0} cy={0} r={62} fill={couleur} fillOpacity={0.16} />
    <circle cx={0} cy={0} r={62} fill="none" stroke={couleur} strokeWidth={T} />
    <path
      d="M -30 2 L -8 26 L 32 -22"
      fill="none"
      stroke={couleur}
      strokeWidth={T + 3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

export const Croix: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.corail }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <circle cx={0} cy={0} r={54} fill={couleur} fillOpacity={0.14} />
    <circle cx={0} cy={0} r={54} fill="none" stroke={couleur} strokeWidth={T} />
    <g stroke={couleur} strokeWidth={T + 2} strokeLinecap="round">
      <line x1={-24} y1={-24} x2={24} y2={24} />
      <line x1={24} y1={-24} x2={-24} y2={24} />
    </g>
  </g>
);

export const Etoile: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.ambre }) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 40 : 17;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${r * Math.cos(a)},${r * Math.sin(a)}`);
  }
  return (
    <g transform={`scale(${echelle})`} opacity={opacity}>
      <polygon
        points={pts.join(" ")}
        fill={couleur}
        fillOpacity={0.3}
        stroke={couleur}
        strokeWidth={T - 1}
        strokeLinejoin="round"
      />
    </g>
  );
};

export const Interro: React.FC<Ic> = ({ echelle = 1, opacity = 1, couleur = M.ambre }) => (
  <g transform={`scale(${echelle})`} opacity={opacity}>
    <g fill="none" stroke={couleur} strokeWidth={T + 2} strokeLinecap="round">
      <path d="M -28 -34 q 0 -32 30 -32 q 30 0 30 30 q 0 24 -30 34 L 2 16" />
    </g>
    <circle cx={2} cy={48} r={8} fill={couleur} />
  </g>
);
