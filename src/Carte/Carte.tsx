import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TITRE_FONT } from "../Muscle/Plan";
import donnees from "./donnees.json";

/**
 * Explication cartographique : trois définitions emboîtées, révélées l'une
 * après l'autre sur une carte réelle.
 *
 * La géographie est authentique — Natural Earth, domaine public — mais elle est
 * dessinée, pas photographiée. Une image satellite viendrait d'un serveur de
 * tuiles sous licence : ni joignable depuis cet environnement, ni redistribuable
 * dans un dépôt. Les côtes, elles, sont exactes.
 *
 * Les trois strates sont emboîtées : chacune contient la précédente. Elles se
 * dessinent donc dans l'ordre, la suivante recouvrant simplement la précédente,
 * ce qui évite d'avoir à gérer des différences de polygones.
 *
 * Le cadrage et la projection sont figés par scripts/carte.mjs ; ici, seul un
 * lent rapproché anime l'ensemble.
 */

export const CARTE_FRAMES = 360; // 12 s à 30 fps

/** Seconde d'apparition de chaque strate. */
const TEMPS = [1.6, 4.6, 7.6];

const C = {
  ciel: "#050B12",
  merLoin: "#0A2333",
  merPres: "#123448",
  terreFond: "#2A3327",
  terreVive: "#3E7A46",
  terreClaire: "#5FA867",
  contour: "#FFFFFF",
  ambre: "#F2B01E",
  etiquetteFond: "#12100C",
};

const ETIQUETTES = [
  { couleur: C.ambre, angle: -1.6 },
  { couleur: "#FFFFFF", angle: 1.1 },
  { couleur: C.ambre, angle: -0.9 },
];

export const Carte: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Rapproché lent et continu : la carte n'est jamais tout à fait immobile.
  const zoom = interpolate(frame, [0, CARTE_FRAMES], [1, 1.09]);
  const derive = interpolate(frame, [0, CARTE_FRAMES], [0, -26]);

  const apparition = (i: number) =>
    spring({
      frame: frame - TEMPS[i] * fps,
      fps,
      config: { damping: 200, mass: 0.8 },
    });

  return (
    <AbsoluteFill style={{ backgroundColor: C.ciel }}>
      <svg viewBox={`0 0 ${donnees.largeur} ${donnees.hauteur}`} width="100%" height="100%">
        <defs>
          <linearGradient id="mer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.merLoin} />
            <stop offset="100%" stopColor={C.merPres} />
          </linearGradient>
          {/* Le halo est un flou du même tracé, empilé sous le trait net :
              c'est ce qui donne la côte lumineuse plutôt qu'un simple liseré. */}
          <filter id="halo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" result="flou" />
            <feMerge>
              <feMergeNode in="flou" />
              <feMergeNode in="flou" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="vignette">
            <stop offset="58%" stopColor="#000000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={donnees.largeur} height={donnees.hauteur} fill="url(#mer)" />

        <g
          transform={`translate(${donnees.largeur / 2} ${donnees.hauteur / 2}) scale(${zoom}) translate(${-donnees.largeur / 2} ${-donnees.hauteur / 2 + derive})`}
        >
          {/* Terres alentour : présentes pour situer, jamais mises en avant. */}
          <path d={donnees.fond} fill={C.terreFond} opacity={0.85} />

          {donnees.strates.map((s, i) => {
            const a = apparition(i);
            if (a <= 0.001) {
              return null;
            }
            const actif = i === donnees.strates.length - 1 || t < TEMPS[i + 1];
            return (
              <g key={s.id}>
                <path
                  d={s.d}
                  fill={actif ? C.terreClaire : C.terreVive}
                  opacity={a}
                />
                <path
                  d={s.d}
                  fill="none"
                  stroke={C.contour}
                  strokeWidth={actif ? 3.4 : 2}
                  strokeLinejoin="round"
                  filter="url(#halo)"
                  opacity={a * (actif ? 0.95 : 0.4)}
                />
              </g>
            );
          })}
        </g>

        <rect
          x="0"
          y="0"
          width={donnees.largeur}
          height={donnees.hauteur}
          fill="url(#vignette)"
        />
      </svg>

      {/* Étiquettes empilées, dans l'ordre d'apparition. */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 380,
          gap: 18,
        }}
      >
        {donnees.strates.map((s, i) => {
          const a = apparition(i);
          const style = ETIQUETTES[i];
          return (
            <div
              key={s.id}
              style={{
                opacity: a,
                transform: `rotate(${style.angle}deg) translateY(${(1 - a) * 26}px) scale(${0.94 + a * 0.06})`,
                backgroundColor: C.etiquetteFond,
                color: style.couleur,
                fontFamily: TITRE_FONT,
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: -1,
                padding: "12px 34px 18px",
                borderRadius: 10,
                whiteSpace: "nowrap",
              }}
            >
              {s.titre}
            </div>
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            fontFamily: TITRE_FONT,
            fontSize: 24,
            color: "#7C8A93",
            letterSpacing: 1,
          }}
        >
          {donnees.source}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
