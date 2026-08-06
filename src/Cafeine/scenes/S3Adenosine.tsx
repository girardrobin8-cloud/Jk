import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Molecule } from "../components/Molecule";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT_MONO } from "../theme";
import { Pt, ramp, sousTexte, toPath } from "../utils";

export const RECEPTEURS = [540, 820, 1100, 1380];
export const MEMBRANE_Y = 780;
/** Centre d'une molécule correctement logée dans son alvéole. */
export const DOCK_Y = MEMBRANE_Y + 28;

const X0 = 200;
const X1 = 1660;
const R = 62; // rayon de l'alvéole
const H = 170; // épaisseur de la membrane

/**
 * Bord supérieur de la membrane : plat, puis creusé d'un demi-cercle à chaque
 * récepteur. On échantillonne l'arc plutôt que d'utiliser la commande `A`,
 * dont les drapeaux de sens sont une source d'erreurs.
 */
const bordSuperieur = (): Pt[] => {
  const pts: Pt[] = [{ x: X0, y: MEMBRANE_Y }];
  for (let i = 0; i < RECEPTEURS.length; i++) {
    const cx = RECEPTEURS[i];
    pts.push({ x: cx - R, y: MEMBRANE_Y });
    for (let a = 180; a >= 0; a -= 10) {
      const rad = (a * Math.PI) / 180;
      pts.push({ x: cx + R * Math.cos(rad), y: MEMBRANE_Y + R * Math.sin(rad) });
    }
  }
  pts.push({ x: X1, y: MEMBRANE_Y });
  return pts;
};

const BORD = bordSuperieur();
const CONTOUR = toPath(BORD);
const PLEIN = `${CONTOUR} L ${X1} ${MEMBRANE_Y + H} L ${X0} ${MEMBRANE_Y + H} Z`;

/** Membrane neuronale et ses quatre récepteurs, dessinés en creux. */
export const Membrane: React.FC<{ couleur?: string }> = ({
  couleur = "rgba(246, 243, 236, 0.26)",
}) => (
  <g>
    <path d={PLEIN} fill={COLORS.bgLift} />
    <path
      d={CONTOUR}
      fill="none"
      stroke={couleur}
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </g>
);

/** Impulsions parcourant la membrane quand le signal est effectivement transmis. */
export const Impulsions: React.FC<{ frame: number; intensite: number }> = ({
  frame,
  intensite,
}) => {
  if (intensite <= 0.02) return null;
  const y = MEMBRANE_Y + 118;
  return (
    <g opacity={intensite}>
      <line x1={X0} y1={y} x2={X1} y2={y} stroke={COLORS.stroke} strokeWidth={2} />
      {new Array(3).fill(0).map((_, i) => {
        const t = (frame * 0.011 + i * 0.34) % 1;
        return (
          <circle
            key={i}
            cx={X0 + t * (X1 - X0)}
            cy={y}
            r={8}
            fill={COLORS.adenosine}
            opacity={1 - Math.abs(t - 0.5) * 1.4}
          />
        );
      })}
    </g>
  );
};

/** Jauge verticale, à droite de la membrane. Libellé posé à la verticale. */
export const Jauge: React.FC<{ niveau: number; couleur: string; label: string }> = ({
  niveau,
  couleur,
  label,
}) => {
  const h = 330;
  return (
    <g transform="translate(1758 430)">
      <rect x={0} y={0} width={26} height={h} rx={13} fill={COLORS.stroke} />
      <rect
        x={0}
        y={h - h * niveau}
        width={26}
        height={h * niveau}
        rx={13}
        fill={couleur}
      />
      <text
        transform={`translate(-26 ${h / 2}) rotate(-90)`}
        textAnchor="middle"
        fill={COLORS.muted}
        fontFamily={FONT_MONO}
        fontSize={20}
        letterSpacing={3}
      >
        {label}
      </text>
    </g>
  );
};

export const S3Adenosine: React.FC = () => {
  const frame = useCurrentFrame();

  const arrimages = RECEPTEURS.map((_, i) => ramp(frame, 46 + i * 20, 76 + i * 20));
  const pression = arrimages.reduce((a, b) => a + b, 0) / RECEPTEURS.length;

  return (
    <Backdrop tint={COLORS.adenosine} chapter="Le signal de fatigue">
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <Membrane />
          <Impulsions frame={frame} intensite={Math.max(0, pression - 0.45) * 1.8} />
          <Jauge
            niveau={pression}
            couleur={COLORS.adenosine}
            label="PRESSION DE SOMMEIL"
          />

          {RECEPTEURS.map((x, i) => {
            const p = arrimages[i];
            if (p <= 0) return null;
            const y = interpolate(p, [0, 1], [-160, DOCK_Y]);
            const derive = Math.sin(frame * 0.06 + i * 2) * (1 - p) * 34;
            return (
              <g key={x} transform={`translate(${x + derive} ${y})`}>
                <Molecule kind="adenosine" size={20} glow={p} opacity={sousTexte(y)} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ paddingLeft: 160, paddingTop: 190 }}>
        <Rise at={4}>
          <Titre size={64}>
            L’adénosine, c’est la trace
            <br />
            de vos heures éveillées
          </Titre>
        </Rise>
        <Rise at={44} style={{ marginTop: 30 }}>
          <Texte size={30} maxWidth={880}>
            Chaque heure passée éveillé, vos neurones consomment de l’énergie et
            libèrent de l’adénosine. Elle s’accumule et se fixe sur ses récepteurs.
          </Texte>
        </Rise>
        <Rise at={124} style={{ marginTop: 26 }}>
          <Texte size={30} maxWidth={880} color={COLORS.adenosineSoft}>
            Chaque récepteur occupé est un message envoyé au cerveau : ralentis,
            il est temps de dormir.
          </Texte>
        </Rise>
        <Rise at={172} style={{ marginTop: 34 }}>
          <Etiquette color={COLORS.muted}>
            Récepteurs A1 et A2A · pression de sommeil
          </Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
