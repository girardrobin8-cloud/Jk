import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Marcheur, pied } from "./Marcheur";

/**
 * Une personne marche au bord de l'eau, au crépuscule.
 *
 * Aucune séquence filmée : tout est calculé. La caméra reste fixe et c'est le
 * monde qui défile, ce qui garde la silhouette cadrée et permet aux empreintes
 * de rester à leur place dans le sable pendant que le marcheur s'éloigne.
 *
 * Deux masses d'eau, et non une seule : la mer, fixe, du côté de l'horizon ; et
 * la lame qui remonte sur le sable, translucide, dont le bord va et vient. Les
 * confondre — une seule surface dont la hauteur varie — noyait toute la plage
 * dès que la marée montait, et il ne restait plus d'image.
 *
 * Le va-et-vient efface les empreintes qu'il recouvre. C'est ce détail, plus
 * que la silhouette, qui fait lire la scène comme une plage.
 */

export const PLAGE_FRAMES = 360; // 12 s à 30 fps

const H = 430; // hauteur du marcheur
const SOL = 1455; // ligne où les pieds se posent
const HORIZON = 745;
const MER_BAS = 1215; // la mer s'arrête là, le sable commence
const CYCLE = 1.05; // secondes pour deux pas

// Le soleil et le marcheur sont écartés du centre, en sens opposés : la
// silhouette ne se découpe pas sur la traînée lumineuse, et elle marche vers
// elle plutôt que dedans.
const SOLEIL_X = 668;
const MARCHEUR_X = 412;

const C = {
  cielHaut: "#04070A",
  cielBas: "#1D2318",
  soleil: "#E8B62C",
  merLoin: "#0A1A17",
  merPres: "#16382F",
  lame: "#2B6B5B",
  ecume: "#9CEFC6",
  // Le sable prend la lumière rasante : il est plus clair et plus chaud que la
  // mer, sans quoi le bas du cadre se referme en un trou noir où les empreintes
  // ne se voient pas.
  sableSec: "#3E3B2C",
  sableMouille: "#1C2621",
  creux: "#20241B",
  silhouette: "#040605",
};

/**
 * Écart horizontal maximal entre le pied et la hanche, relevé sur le cycle.
 *
 * C'est lui qui fixe la vitesse : sur une demi-période, le pied d'appui passe
 * de +MAX à −MAX par rapport à la hanche, donc le corps avance de 2·MAX. Toute
 * autre vitesse ferait patiner les pieds sur le sable.
 */
const MAX_PIED = Math.max(
  ...Array.from({ length: 120 }, (_, i) =>
    Math.abs(pied((i / 120) * Math.PI * 2, H, 0).x),
  ),
);
const VITESSE = (4 * MAX_PIED) / CYCLE; // px par seconde

/**
 * Bord de la lame à l'instant t.
 *
 * Le produit de deux houles de périodes premières entre elles, porté à une
 * puissance : la lame reste basse la plupart du temps et ne monte jusqu'aux
 * pieds que lorsque les deux coïncident. Leur somme, elle, donnait une mer
 * haute en permanence — le marcheur avait les pieds dans l'eau du début à la
 * fin et il ne restait pas de plage à regarder.
 */
const lame = (t: number) => {
  const houle =
    (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 5.3)) *
    (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 11.7 + 1.2));
  return MER_BAS + 15 + 290 * houle ** 1.5;
};

/** Bord d'écume : trois sinusoïdes désaccordées, pour éviter la vague de dessin animé. */
const frange = (t: number, y: number) =>
  Array.from({ length: 41 }, (_, i) => {
    const x = -60 + (1200 * i) / 40;
    const d =
      Math.sin(x / 190 + t * 1.1) * 9 +
      Math.sin(x / 83 - t * 1.7) * 5 +
      Math.sin(x / 37 + t * 2.3) * 2.5;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${(y + d).toFixed(1)}`;
  }).join(" ");

type Empreinte = { x: number; y: number; t: number };

/**
 * Empreintes laissées depuis le début du plan, en coordonnées monde.
 *
 * Un pas se pose toutes les demi-périodes, le pied étant alors à +MAX_PIED
 * devant la hanche. Les deux pieds sont décalés de quelques pixels en
 * profondeur : une trace parfaitement rectiligne ne ressemble à rien.
 */
const empreintes = (t: number): Empreinte[] => {
  const pas = CYCLE / 2;
  return Array.from({ length: Math.floor(t / pas) + 1 }, (_, k) => ({
    x: VITESSE * k * pas + MAX_PIED,
    y: SOL + (k % 2 === 0 ? 7 : -7),
    t: k * pas,
  }));
};

/** Une empreinte disparaît dès qu'une lame l'a recouverte, et ne revient pas. */
const effacee = (e: Empreinte, t: number) => {
  for (let s = e.t; s <= t; s += 0.05) {
    if (lame(s) >= e.y) {
      return true;
    }
  }
  return false;
};

export const Plage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const phase = (2 * Math.PI * t) / CYCLE;
  const camera = VITESSE * t;
  const eau = lame(t);
  const hancheY = SOL - 0.47 * H; // une longueur de jambe au-dessus du sol

  const traces = empreintes(t).filter((e) => !effacee(e, t));

  return (
    <AbsoluteFill style={{ backgroundColor: C.cielHaut }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.cielHaut} />
            <stop offset="70%" stopColor={C.cielBas} />
            <stop offset="100%" stopColor="#4A3C18" />
          </linearGradient>
          <linearGradient id="mer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.merLoin} />
            <stop offset="100%" stopColor={C.merPres} />
          </linearGradient>
          <linearGradient id="sable" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.sableMouille} />
            <stop offset="42%" stopColor={C.sableSec} />
            <stop offset="100%" stopColor="#191A14" />
          </linearGradient>
          <radialGradient id="halo">
            <stop offset="0%" stopColor={C.soleil} stopOpacity={0.40} />
            <stop offset="100%" stopColor={C.soleil} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="reflet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <mask id="masqueReflet">
            <rect x="0" y={SOL} width="1080" height="300" fill="url(#reflet)" />
          </mask>
          <radialGradient id="vignette">
            <stop offset="62%" stopColor="#000000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.42} />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1080" height={HORIZON} fill="url(#ciel)" />
        <circle cx={SOLEIL_X} cy={HORIZON - 62} r="320" fill="url(#halo)" />
        <circle cx={SOLEIL_X} cy={HORIZON - 62} r="82" fill={C.soleil} opacity={0.94} />

        {/* Le sable ne commence qu'au rivage : plus haut, c'est la mer. */}
        <rect x="0" y={MER_BAS} width="1080" height={1920 - MER_BAS} fill="url(#sable)" />
        <rect x="0" y={HORIZON} width="1080" height={MER_BAS - HORIZON} fill="url(#mer)" />

        {/* Traînée du soleil : des éclats de plus en plus larges en approchant. */}
        {Array.from({ length: 14 }, (_, i) => {
          const y = HORIZON + 12 + i * ((MER_BAS - HORIZON) / 14);
          const largeur = 22 + i * 13 + Math.sin(t * 2.2 + i * 1.3) * 8;
          return (
            <rect
              key={i}
              x={SOLEIL_X - largeur / 2}
              y={y}
              width={largeur}
              height={4 + i * 0.6}
              rx={3}
              fill={C.soleil}
              opacity={0.34 - i * 0.017}
            />
          );
        })}

        {/* Lames du large, de plus en plus marquées vers le rivage. */}
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d={frange(t * (0.5 + i * 0.16) + i * 3, HORIZON + 55 + ((MER_BAS - HORIZON - 55) * (i + 1)) / 6)}
            fill="none"
            stroke={C.ecume}
            strokeWidth={1.6 + i * 0.7}
            opacity={0.06 + i * 0.04}
          />
        ))}

        {/* Empreintes : sur le sable, donc sous la lame qui va les recouvrir. */}
        {traces.map((e) => {
          const x = e.x - camera + MARCHEUR_X;
          if (x < -40 || x > 1120) {
            return null;
          }
          return (
            <ellipse
              key={e.t}
              cx={x}
              cy={e.y}
              rx={14}
              ry={6}
              fill={C.creux}
              opacity={Math.max(0, 0.72 - (t - e.t) * 0.018)}
            />
          );
        })}

        {/* Reflet : la même pose, retournée sous la ligne de sol et écrasée.
            Le décalage interne remet la hanche à sa hauteur une fois le miroir
            appliqué — sans lui, le reflet flotterait. */}
        <g mask="url(#masqueReflet)">
          <g transform={`translate(${MARCHEUR_X} ${SOL}) scale(1 -0.5)`}>
            <g transform={`translate(0 ${hancheY - SOL})`}>
              <Marcheur phase={phase} hauteur={H} couleur={C.ecume} opacite={0.42} />
            </g>
          </g>
        </g>

        {/* La lame : nappe translucide, le sable mouillé se lit au travers. */}
        <path
          d={`${frange(t, eau)} L 1140 ${MER_BAS} L -60 ${MER_BAS} Z`}
          fill={C.lame}
          opacity={0.46}
        />
        <path d={frange(t, eau)} fill="none" stroke={C.ecume} strokeWidth={6} opacity={0.62} />
        <path
          d={frange(t + 0.35, eau - 26)}
          fill="none"
          stroke={C.ecume}
          strokeWidth={2.5}
          opacity={0.3}
        />

        <g transform={`translate(${MARCHEUR_X} ${hancheY})`}>
          <Marcheur phase={phase} hauteur={H} couleur={C.silhouette} />
        </g>

        <rect x="0" y="0" width="1080" height="1920" fill="url(#vignette)" />
      </svg>
    </AbsoluteFill>
  );
};
