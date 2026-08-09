import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TITRE_FONT } from "../Muscle/Plan";
import donnees from "./donnees.json";

/**
 * Explication cartographique : trois définitions emboîtées, révélées l'une
 * après l'autre sur une carte réelle, avec mouvements de caméra.
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
 * La caméra ne se règle pas à la main : chaque plan vise l'emprise projetée
 * d'une strate, calculée par scripts/carte.mjs. Changer de sujet dans ce script
 * recadre donc tous les mouvements sans toucher ici.
 */

export const CARTE_FRAMES = 360; // 12 s à 30 fps

/** Fenêtre réservée à la carte : le tiers bas revient aux cartouches. */
const VUE = { cx: 540, cy: 580, largeur: 1080, hauteur: 1000 };

/** Durée d'un mouvement de caméra. Au-delà, ça traîne ; en deçà, ça saute. */
const MOUVEMENT = 1.1;

/**
 * Plans successifs : instant, strate visée, et marge autour d'elle.
 *
 * Le premier plan cadre large sur l'ensemble — on situe avant de détailler —
 * puis chaque révélation resserre ou élargit selon la strate nommée.
 */
const PLANS = [
  { t: 0, cible: 2, marge: 1.62 },
  { t: 1.6, cible: 0, marge: 1.3 },
  { t: 4.6, cible: 1, marge: 1.22 },
  { t: 7.6, cible: 2, marge: 1.14 },
];

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

/** Bruitages, en secondes absolues (banque de `scripts/bruitages.py`). */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "whoosh-out.wav", t: 0.1, v: 0.4 }, // la carte s'installe
  // Le souffle précède le mouvement de 0,15 s : un son posé pile sur le départ
  // s'entend en retard, l'oreille anticipant le geste.
  ...PLANS.slice(1).flatMap((p) => [
    { f: "whoosh-in.wav", t: p.t - 0.15, v: 0.55 },
    { f: "impact.wav", t: p.t + 0.22, v: 0.7 }, // le cartouche se pose
  ]),
  { f: "carillon.wav", t: 10.4, v: 0.45 },
];

type Camera = { cx: number; cy: number; k: number };

/** Cadrage qui fait tenir l'emprise visée dans la fenêtre, marge comprise. */
const cadrer = (plan: (typeof PLANS)[number]): Camera => {
  const e = donnees.strates[plan.cible].emprise;
  const largeur = (e.x1 - e.x0) * plan.marge;
  const hauteur = (e.y1 - e.y0) * plan.marge;
  return {
    cx: (e.x0 + e.x1) / 2,
    cy: (e.y0 + e.y1) / 2,
    k: Math.min(VUE.largeur / largeur, VUE.hauteur / hauteur),
  };
};

const CADRAGES = PLANS.map(cadrer);

/**
 * Caméra à l'instant t.
 *
 * L'échelle s'interpole en logarithme, pas linéairement : un zoom perçu comme
 * régulier est une progression géométrique. Interpolé droit, le mouvement
 * paraît freiner en fin de course.
 */
const camera = (t: number): Camera => {
  let i = 0;
  while (i + 1 < PLANS.length && PLANS[i + 1].t <= t) {
    i++;
  }
  if (i === 0) {
    return CADRAGES[0];
  }
  const depart = CADRAGES[i - 1];
  const arrivee = CADRAGES[i];
  const p = interpolate(t, [PLANS[i].t, PLANS[i].t + MOUVEMENT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return {
    cx: depart.cx + (arrivee.cx - depart.cx) * p,
    cy: depart.cy + (arrivee.cy - depart.cy) * p,
    k: Math.exp(Math.log(depart.k) + (Math.log(arrivee.k) - Math.log(depart.k)) * p),
  };
};

export const Carte: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const vue = camera(t);
  // Dérive lente permanente : même à l'arrêt, la caméra n'est jamais figée.
  const cx = vue.cx + Math.sin(t * 0.31) * 9;
  const cy = vue.cy + Math.cos(t * 0.24) * 7;
  const k = vue.k * (1 + 0.018 * (t / (CARTE_FRAMES / fps)));

  const apparition = (i: number) =>
    spring({
      frame: frame - PLANS[i + 1].t * fps,
      fps,
      config: { damping: 200, mass: 0.8 },
    });

  return (
    <AbsoluteFill style={{ backgroundColor: C.ciel }}>
      {BRUITAGES.map((b, i) => (
        <Sequence key={`${b.f}-${i}`} from={Math.round(b.t * fps)} name={`SFX ${b.f}`}>
          {/* eslint-disable-next-line @remotion/volume-callback */}
          <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
        </Sequence>
      ))}

      <svg viewBox={`0 0 ${donnees.largeur} ${donnees.hauteur}`} width="100%" height="100%">
        <defs>
          <linearGradient id="mer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.merLoin} />
            <stop offset="100%" stopColor={C.merPres} />
          </linearGradient>
          {/* Le halo est un flou du même tracé, empilé sous le trait net : c'est
              ce qui donne la côte lumineuse plutôt qu'un simple liseré. Son
              rayon est divisé par l'échelle, sinon il épaissit avec le zoom. */}
          <filter id="halo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation={9 / k} result="flou" />
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

        <g transform={`translate(${VUE.cx} ${VUE.cy}) scale(${k}) translate(${-cx} ${-cy})`}>
          {/* Terres alentour : présentes pour situer, jamais mises en avant. */}
          <path d={donnees.fond} fill={C.terreFond} opacity={0.85} />

          {donnees.strates.map((s, i) => {
            const a = apparition(i);
            if (a <= 0.001) {
              return null;
            }
            const actif = i === donnees.strates.length - 1 || t < PLANS[i + 2].t;
            return (
              <g key={s.id}>
                <path d={s.d} fill={actif ? C.terreClaire : C.terreVive} opacity={a} />
                <path
                  d={s.d}
                  fill="none"
                  stroke={C.contour}
                  // Épaisseur divisée par l'échelle : le trait garde la même
                  // finesse à l'écran quel que soit le rapproché.
                  strokeWidth={(actif ? 3.4 : 2) / k}
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

      {/* Cartouches empilés, dans l'ordre d'apparition. */}
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
        style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}
      >
        <div
          style={{ fontFamily: TITRE_FONT, fontSize: 24, color: "#7C8A93", letterSpacing: 1 }}
        >
          {donnees.source}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
