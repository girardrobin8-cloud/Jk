import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TITRE_FONT } from "./Plan";

/**
 * Personnage qui pointe du doigt le groupe musculaire travaillé.
 *
 * Tout est dessiné en SVG : aucun média externe, donc la composition se rend
 * sur un dépôt fraîchement cloné, et chaque muscle est une forme qu'on peut
 * colorer, isoler ou animer indépendamment — c'est ce qui permet au dos de
 * s'allumer tout seul dans l'insert.
 *
 * L'anatomie est volontairement schématique : des masses lisibles à 1080 px de
 * large sur un écran de téléphone, pas une planche de myologie.
 */

const FPS = 30;
export const POINTEUR_FRAMES = 5 * FPS;

/** Palette propre au personnage — plus claire que le thème sombre des scènes. */
const P = {
  fond: "#CFEBC8",
  fondHaut: "#E2F4DC",
  trait: "#26331F",
  peau: "#7FA35B",
  peauOmbre: "#6B8C4B",
  peauClair: "#96B972",
  tissu: "#8D9A93",
  tissuOmbre: "#76837C",
  cible: "#E0655A", // le muscle mis en avant
  cibleClair: "#EE8B7F",
  insert: "#FFFFFF",
  texte: "#26331F",
};

const T = 6; // épaisseur de trait commune

/** Insert : le dos vu de dos, avec le grand dorsal qui s'allume. */
const Dos: React.FC<{ allumage: number }> = ({ allumage }) => {
  const couleur = allumage > 0 ? P.cible : P.peauOmbre;

  return (
    <g stroke={P.trait} strokeWidth={T} strokeLinejoin="round">
      {/* Tête, de dos */}
      <ellipse cx={0} cy={-196} rx={60} ry={70} fill={P.peau} />

      {/* Nuque */}
      <path d="M -26 -134 L 26 -134 L 30 -96 L -30 -96 Z" fill={P.peauOmbre} />

      {/* Torse vu de dos : le V du dossard */}
      <path
        d="M -148 -80 Q -172 -18 -140 66 L -96 208 Q 0 244 96 208 L 140 66
           Q 172 -18 148 -80 Q 0 -124 -148 -80 Z"
        fill={P.peau}
      />

      {/* Trapèzes : un losange bas et discret, pas un col */}
      <path
        d="M -26 -120 Q 0 -138 26 -120 L 104 -70 Q 0 -42 -104 -70 Z"
        fill={P.peauOmbre}
        fillOpacity={0.85}
      />

      {/* Grands dorsaux — les deux ailes qui s'allument. Elles s'affinent vers
          le bas et laissent le sillon vertébral respirer au centre. */}
      <path
        d="M -128 -34 Q -148 54 -110 148 Q -66 174 -34 126 L -20 -6
           Q -78 -34 -128 -34 Z"
        fill={couleur}
        fillOpacity={0.35 + 0.65 * allumage}
      />
      <path
        d="M 128 -34 Q 148 54 110 148 Q 66 174 34 126 L 20 -6
           Q 78 -34 128 -34 Z"
        fill={couleur}
        fillOpacity={0.35 + 0.65 * allumage}
      />

      {/* Sillon vertébral */}
      <path d="M 0 -84 L 0 200" stroke={P.trait} strokeOpacity={0.4} fill="none" />

      {/* Deltoïdes postérieurs */}
      <ellipse cx={-156} cy={-50} rx={46} ry={54} fill={P.peauClair} />
      <ellipse cx={156} cy={-50} rx={46} ry={54} fill={P.peauClair} />

      {/* Bras : deux segments et un poing à la hanche, comme la pose de dos */}
      <path
        d="M -172 -34 L -208 78"
        fill="none"
        strokeWidth={T + 32}
        strokeLinecap="round"
        stroke={P.peau}
      />
      <path
        d="M -208 78 L -146 172"
        fill="none"
        strokeWidth={T + 24}
        strokeLinecap="round"
        stroke={P.peauOmbre}
      />
      <circle cx={-136} cy={182} r={24} fill={P.peau} />
      <path
        d="M 172 -34 L 208 78"
        fill="none"
        strokeWidth={T + 32}
        strokeLinecap="round"
        stroke={P.peau}
      />
      <path
        d="M 208 78 L 146 172"
        fill="none"
        strokeWidth={T + 24}
        strokeLinecap="round"
        stroke={P.peauOmbre}
      />
      <circle cx={136} cy={182} r={24} fill={P.peau} />

      {/* Short */}
      <path
        d="M -104 196 Q 0 232 104 196 L 112 300 L -112 300 Z"
        fill={P.tissu}
      />
    </g>
  );
};

/** Le personnage, de face, bras droit tendu vers l'insert. */
const Personnage: React.FC<{ leve: number; souffle: number }> = ({
  leve,
  souffle,
}) => {
  /**
   * Le bras pointeur pivote autour de l'épaule : écarté du corps au repos,
   * relevé vers l'insert une fois le geste fait. L'angle est positif vers le
   * haut parce que le bras part dans les x négatifs.
   */
  const angle = interpolate(leve, [0, 1], [-40, 18]);

  return (
    <g stroke={P.trait} strokeWidth={T} strokeLinejoin="round">
      {/* ── Bras gauche du personnage (à droite de l'image), le long du corps.
             Même construction que le bras pointeur : bras, avant-bras, poing. ── */}
      <path
        d="M 168 -6 L 214 122"
        fill="none"
        strokeWidth={T + 46}
        strokeLinecap="round"
        stroke={P.peau}
      />
      <path
        d="M 214 122 L 198 254"
        fill="none"
        strokeWidth={T + 34}
        strokeLinecap="round"
        stroke={P.peauOmbre}
      />
      <circle cx={196} cy={272} r={30} fill={P.peau} />

      {/* ── Torse ── */}
      <path
        d="M -158 -70 Q -184 -4 -150 84 L -104 252 Q 0 292 104 252 L 150 84
           Q 184 -4 158 -70 Q 0 -114 -158 -70 Z"
        fill={P.peau}
      />

      {/* Pectoraux */}
      <path
        d="M -142 -40 Q -74 -70 -10 -34 Q -16 46 -78 58 Q -140 54 -142 -40 Z"
        fill={P.peauClair}
      />
      <path
        d="M 142 -40 Q 74 -70 10 -34 Q 16 46 78 58 Q 140 54 142 -40 Z"
        fill={P.peauClair}
      />

      {/* Abdominaux : trois étages */}
      {[0, 1, 2].map((rang) => (
        <g key={rang}>
          <rect
            x={-62}
            y={82 + rang * 54}
            width={54}
            height={44}
            rx={14}
            fill={P.peauOmbre}
          />
          <rect
            x={8}
            y={82 + rang * 54}
            width={54}
            height={44}
            rx={14}
            fill={P.peauOmbre}
          />
        </g>
      ))}

      {/* Cou et tête */}
      <path d="M -30 -122 L 30 -122 L 34 -74 L -34 -74 Z" fill={P.peauOmbre} />
      <ellipse cx={0} cy={-186} rx={66} ry={78} fill={P.peau} />
      {/* Visage : un regard net, deux sourcils froncés. Rien d'autre —
          le personnage doit rester lisible en vignette. */}
      <ellipse cx={-27} cy={-190} rx={17} ry={11} fill="#FFFFFF" strokeWidth={T - 1} />
      <ellipse cx={27} cy={-190} rx={17} ry={11} fill="#FFFFFF" strokeWidth={T - 1} />
      <path
        d="M -44 -214 L -14 -206 M 44 -214 L 14 -206"
        strokeWidth={T + 2}
        strokeLinecap="round"
        fill="none"
      />

      {/* Deltoïde droit (côté du bras qui pointe) */}
      <ellipse cx={-168} cy={-14} rx={50} ry={60} fill={P.peauClair} />
      {/* Deltoïde gauche */}
      <ellipse cx={168} cy={-14} rx={50} ry={60} fill={P.peauClair} />

      {/* Short */}
      <path
        d="M -104 244 Q 0 286 104 244 L 116 366 L -116 366 Z"
        fill={P.tissu}
      />
      <path d="M 0 268 L 0 366" stroke={P.tissuOmbre} fill="none" />

      {/* ── Bras qui pointe : pivote autour de l'épaule ──
             Le coude casse volontairement l'alignement bras / avant-bras :
             deux segments colinéaires se lisent comme un tube, pas comme un
             bras. ── */}
      <g transform={`rotate(${angle} -168 -14)`}>
        {/* Biceps */}
        <path
          d="M -168 -14 L -282 -26"
          fill="none"
          strokeWidth={T + 46}
          strokeLinecap="round"
          stroke={P.peau}
        />
        {/* Avant-bras, relevé par rapport au bras */}
        <path
          d="M -282 -26 L -386 -86"
          fill="none"
          strokeWidth={T + 34}
          strokeLinecap="round"
          stroke={P.peauOmbre}
        />
        {/* Poing */}
        <circle cx={-398} cy={-94} r={38} fill={P.peau} />
        {/* Index tendu, franchement plus long que le poing n'est large */}
        <path
          d="M -424 -108 L -506 -134"
          fill="none"
          strokeWidth={T + 16}
          strokeLinecap="round"
          stroke={P.peauClair}
        />
        {/* Pouce replié, pour que la main ne soit pas une simple boule */}
        <path
          d="M -392 -124 L -414 -138"
          fill="none"
          strokeWidth={T + 10}
          strokeLinecap="round"
          stroke={P.peauClair}
        />
      </g>

      {/* Respiration : la cage se soulève très légèrement */}
      <path
        d="M -150 -46 Q 0 -86 150 -46"
        fill="none"
        stroke={P.trait}
        strokeOpacity={0.25 + souffle * 0.15}
      />
    </g>
  );
};

export const Pointeur: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /** 1 — le personnage arrive. */
  const arrivee = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });

  /** 2 — le bras se lève et pointe. */
  const leve = spring({
    frame: frame - 0.5 * fps,
    fps,
    config: { damping: 13, mass: 0.7 },
  });

  /** 3 — l'insert apparaît au bout du doigt. */
  const insert = spring({
    frame: frame - 1.15 * fps,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  /** 4 — le dos s'allume, puis pulse une fois. */
  const allumage = interpolate(frame, [1.7 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse =
    frame > 2.2 * fps
      ? Math.max(0, Math.sin((frame - 2.2 * fps) / (0.5 * fps) * Math.PI)) * 0.12
      : 0;

  /** 5 — l'étiquette, une fois le muscle identifié. */
  const etiquette = spring({
    frame: frame - 2.5 * fps,
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  /** Respiration continue, très légère. */
  const souffle = (Math.sin((frame / fps) * 1.6) + 1) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: P.fond }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* Fond : dégradé doux et bandes horizontales de vitesse */}
        <defs>
          <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={P.fondHaut} />
            <stop offset="100%" stopColor={P.fond} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#ciel)" />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={0}
            y={470 + i * 54}
            width={1080}
            height={10}
            fill="#FFFFFF"
            opacity={0.35 * interpolate(arrivee, [0, 1], [0, 1])}
          />
        ))}

        {/* ── Insert : le dos ── */}
        <g
          transform={`translate(300 540) scale(${insert * 0.78})`}
          opacity={insert}
        >
          <circle
            cx={0}
            cy={0}
            r={300}
            fill={P.insert}
            stroke={P.trait}
            strokeWidth={T + 4}
          />
          {/* Halo qui pulse quand le muscle est identifié */}
          <circle
            cx={0}
            cy={0}
            r={300}
            fill="none"
            stroke={P.cible}
            strokeWidth={14}
            opacity={Math.min(1, pulse * 6)}
          />
          <g transform="translate(0 20) scale(0.92)">
            <Dos allumage={allumage} />
          </g>
        </g>

        {/* ── Étiquette du muscle ── */}
        <g
          transform={`translate(300 1180) scale(${etiquette})`}
          opacity={etiquette}
        >
          <rect
            x={-215}
            y={-38}
            width={430}
            height={76}
            rx={38}
            fill={P.cible}
            stroke={P.trait}
            strokeWidth={T}
          />
          <text
            x={0}
            y={12}
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily={TITRE_FONT}
            fontSize={38}
            fontWeight={700}
            letterSpacing={2}
          >
            GRAND DORSAL
          </text>
        </g>

        {/* ── Le personnage ── */}
        <g
          transform={`translate(760 ${1130 + (1 - arrivee) * 90}) scale(${
            1.22 * (0.98 + 0.02 * souffle)
          })`}
          opacity={arrivee}
        >
          <Personnage leve={leve} souffle={souffle} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
