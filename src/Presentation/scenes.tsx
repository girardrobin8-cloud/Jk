import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cle, M, Plan, TITRE_FONT } from "../Muscle/Plan";

/**
 * Un plan par phrase. Chaque scène reçoit sa durée en frames pour que le
 * gabarit `Plan` cale sa sortie, et démarre à la frame 0 grâce à la `Sequence`
 * qui l'enveloppe.
 *
 * Le vocabulaire graphique reste volontairement pauvre — cercle, horizon,
 * onde, marche — parce que la voix porte déjà tout le propos : l'image
 * l'accompagne au lieu de la redire.
 */

const CENTRE_X = 540;
const CENTRE_Y = 760;

type Scene = React.FC<{ duree: number }>;

/** Progression 0 → 1 amortie, pour une entrée qui ne claque pas. */
const arrivee = (frame: number, fps: number, retard = 0) =>
  spring({ frame: frame - retard, fps, config: { damping: 200, mass: 0.7 } });

const texte = (taille: number, couleur = M.texte) => ({
  fontFamily: TITRE_FONT,
  fontSize: taille,
  fill: couleur,
  textAnchor: "middle" as const,
});

/** B1 — le nom : un cercle se trace, l'initiale s'installe, l'âge se compte. */
export const S1Nom: Scene = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const RAYON = 190;
  const perimetre = 2 * Math.PI * RAYON;
  const trace = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const initiale = arrivee(frame, fps, 0.35 * fps);
  const age = Math.round(
    interpolate(frame, [1.2 * fps, 2.0 * fps], [0, 23], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <Plan duree={duree} titre={<><Cle>ROBIN</Cle>, 23 ans</>}>
      <circle
        cx={CENTRE_X}
        cy={CENTRE_Y}
        r={RAYON}
        fill="none"
        stroke={M.vert}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={perimetre}
        strokeDashoffset={perimetre * (1 - trace)}
        // Le tracé part du haut plutôt que de la droite : on lit le cercle
        // comme un compte à rebours qui se referme.
        transform={`rotate(-90 ${CENTRE_X} ${CENTRE_Y})`}
      />
      <text
        {...texte(210)}
        x={CENTRE_X}
        y={CENTRE_Y + 72}
        opacity={initiale}
        transform={`scale(${0.9 + initiale * 0.1})`}
        transform-origin={`${CENTRE_X} ${CENTRE_Y}`}
      >
        R
      </text>
      <text {...texte(58, M.gris)} x={CENTRE_X} y={CENTRE_Y + 300}>
        {age > 0 ? `${age} ans` : ""}
      </text>
    </Plan>
  );
};

/** B2 — l'île : le soleil se lève derrière une terre posée sur l'horizon. */
export const S2Ile: Scene = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const HORIZON = CENTRE_Y + 120;
  const lever = interpolate(frame, [0.2 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const terre = arrivee(frame, fps, 0.5 * fps);
  const repere = arrivee(frame, fps, 1.5 * fps);

  return (
    <Plan duree={duree} titre={<>Saint-<Cle>Barthélemy</Cle></>}>
      {/* Le soleil monte derrière l'horizon : on le masque par la bande basse. */}
      <circle
        cx={CENTRE_X}
        cy={HORIZON - 40 - lever * 150}
        r={110}
        fill={M.ambre}
        opacity={0.9}
      />
      <rect
        x={0}
        y={HORIZON}
        width={1080}
        height={1920 - HORIZON}
        fill={M.fond}
      />
      <line
        x1={140}
        y1={HORIZON}
        x2={940}
        y2={HORIZON}
        stroke={M.gris}
        strokeWidth={4}
        opacity={0.55}
      />
      {/* Île : une simple bosse, tracée en travers de l'horizon. */}
      <path
        d={`M ${CENTRE_X - 210} ${HORIZON} Q ${CENTRE_X - 90} ${HORIZON - 130} ${CENTRE_X + 30} ${HORIZON - 96} Q ${CENTRE_X + 150} ${HORIZON - 66} ${CENTRE_X + 230} ${HORIZON} Z`}
        fill={M.vert}
        opacity={terre * 0.85}
        transform={`translate(0 ${(1 - terre) * 26})`}
      />
      <g opacity={repere}>
        <circle cx={CENTRE_X + 20} cy={HORIZON - 150} r={13} fill={M.bleuClair} />
        <line
          x1={CENTRE_X + 20}
          y1={HORIZON - 137}
          x2={CENTRE_X + 20}
          y2={HORIZON - 96}
          stroke={M.bleuClair}
          strokeWidth={5}
        />
      </g>
    </Plan>
  );
};

/** B3 — la mer et les proches : trois ondes, trois présences au-dessus. */
export const S3Mer: Scene = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const onde = (decalage: number, amplitude: number) => {
    const phase = (frame / fps) * 1.6 + decalage;
    const points = Array.from({ length: 25 }, (_, i) => {
      const x = 130 + (820 * i) / 24;
      const y =
        CENTRE_Y + 150 + decalage * 70 +
        Math.sin(phase + i * 0.55) * amplitude;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return points.join(" ");
  };

  const proches = arrivee(frame, fps, 1.0 * fps);

  return (
    <Plan duree={duree} titre={<>La <Cle>mer</Cle>, les journées simples</>}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={onde(i, 22 - i * 5)}
          fill="none"
          stroke={i === 0 ? M.bleuClair : M.vert}
          strokeWidth={7 - i}
          strokeLinecap="round"
          opacity={0.85 - i * 0.22}
        />
      ))}
      {/* Trois cercles serrés : les proches, sans figuration. */}
      {[-1, 0, 1].map((i) => (
        <circle
          key={i}
          cx={CENTRE_X + i * 92}
          cy={CENTRE_Y - 140}
          r={34}
          fill={i === 0 ? M.vert : M.fondCase}
          stroke={M.vert}
          strokeWidth={5}
          opacity={interpolate(proches, [0, 1], [0, 1])}
          transform={`translate(0 ${(1 - proches) * 18})`}
        />
      ))}
    </Plan>
  );
};

/** B4 — l'avancée : quatre marches qui se posent, un point qui les gravit. */
export const S4Avancer: Scene = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const MARCHES = 4;
  const LARGEUR = 170;
  const HAUTEUR = 84;
  const baseX = CENTRE_X - (MARCHES * LARGEUR) / 2;
  const baseY = CENTRE_Y + 190;

  // Le point n'atteint la marche qu'une fois celle-ci posée : il monte donc
  // sur le même tempo que leur apparition, avec un temps de retard.
  const avance = interpolate(frame, [0.5 * fps, 2.6 * fps], [0, MARCHES], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const palier = Math.min(MARCHES - 1, Math.floor(avance));

  return (
    <Plan duree={duree} titre={<>J'<Cle>avance</Cle> chaque jour</>}>
      {Array.from({ length: MARCHES }, (_, i) => {
        const pose = arrivee(frame, fps, (0.3 + i * 0.35) * fps);
        return (
          <rect
            key={i}
            x={baseX + i * LARGEUR}
            y={baseY - (i + 1) * HAUTEUR}
            width={LARGEUR - 12}
            height={(i + 1) * HAUTEUR}
            rx={10}
            fill={M.fondCase}
            stroke={M.vert}
            strokeWidth={4}
            opacity={pose}
            transform={`translate(0 ${(1 - pose) * 24})`}
          />
        );
      })}
      <circle
        cx={baseX + palier * LARGEUR + (LARGEUR - 12) / 2}
        cy={baseY - (palier + 1) * HAUTEUR - 34}
        r={26}
        fill={M.ambre}
        opacity={avance > 0 ? 1 : 0}
      />
    </Plan>
  );
};

/** B5 — la clôture : un point qui rayonne, sans autre commentaire. */
export const S5Heureux: Scene = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ouverture = arrivee(frame, fps, 0.2 * fps);
  // Respiration lente : le disque ne fait que pulser, il ne « joue » rien.
  const souffle = 1 + Math.sin((frame / fps) * 1.9) * 0.035;

  return (
    <Plan duree={duree} titre={<>Je suis <Cle>heureux</Cle></>}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r1 = 210 + Math.sin((frame / fps) * 1.9 + i) * 8;
        const r2 = r1 + 74;
        return (
          <line
            key={i}
            x1={CENTRE_X + Math.cos(angle) * r1}
            y1={CENTRE_Y + Math.sin(angle) * r1}
            x2={CENTRE_X + Math.cos(angle) * r2}
            y2={CENTRE_Y + Math.sin(angle) * r2}
            stroke={M.vert}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={ouverture * 0.55}
          />
        );
      })}
      <circle
        cx={CENTRE_X}
        cy={CENTRE_Y}
        r={150 * ouverture * souffle}
        fill={M.vert}
        opacity={0.9}
      />
      <circle
        cx={CENTRE_X}
        cy={CENTRE_Y}
        r={150 * ouverture * souffle}
        fill="none"
        stroke={M.bleuClair}
        strokeWidth={5}
        opacity={0.5}
      />
    </Plan>
  );
};

export const SCENES: Scene[] = [S1Nom, S2Ile, S3Mer, S4Avancer, S5Heureux];
