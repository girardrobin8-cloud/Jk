import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { pointAt, Pt, ramp, toPath } from "../utils";

/**
 * Trajet de la molécule. La branche descendante (digestive) longe la droite du
 * tronc, la branche remontante (sanguine) longe la gauche : les deux restent
 * ainsi lisibles au lieu de se confondre en une boucle.
 */
const TRAJET: Pt[] = [
  { x: 430, y: 302 },
  { x: 444, y: 352 },
  { x: 470, y: 398 },
  { x: 494, y: 436 },
  { x: 486, y: 492 },
  { x: 452, y: 532 },
  { x: 412, y: 568 },
  { x: 372, y: 570 },
  { x: 338, y: 528 },
  { x: 322, y: 462 },
  { x: 326, y: 394 },
  { x: 348, y: 342 },
  { x: 382, y: 300 },
  { x: 412, y: 252 },
  { x: 430, y: 206 },
];

/** Trait de la silhouette : plus lisible que la grille de fond. */
const CORPS = "rgba(246, 243, 236, 0.22)";

// Fractions du trajet correspondant à chaque étape (mesurées sur la polyligne).
const STATIONS = [
  { num: "01", x: 430, y: 302, at: 16 },
  { num: "02", x: 412, y: 568, at: 62 },
  { num: "03", x: 322, y: 462, at: 112 },
  { num: "04", x: 430, y: 206, at: 158 },
];

const ETAPES = [
  {
    at: 16,
    num: "01",
    titre: "Ingestion",
    texte: "La caféine traverse l’estomac sans y être réellement absorbée.",
  },
  {
    at: 62,
    num: "02",
    titre: "Intestin grêle",
    texte:
      "C’est ici que tout se joue : près de 99 % de la dose passe dans le sang.",
  },
  {
    at: 112,
    num: "03",
    titre: "Circulation",
    texte: "Le sang la distribue à tous les tissus en quelques minutes.",
  },
  {
    at: 158,
    num: "04",
    titre: "Cerveau",
    texte:
      "Petite et liposoluble, elle franchit sans effort la barrière hémato-encéphalique.",
  },
];

/** La molécule progresse puis marque une pause à chaque étape. */
const avancement = (frame: number) =>
  interpolate(
    frame,
    [20, 56, 78, 108, 124, 156],
    [0, 0.412, 0.412, 0.625, 0.625, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const parcouru = (t: number) => {
  const pts: Pt[] = [];
  const steps = Math.max(1, Math.round(t * 80));
  for (let i = 0; i <= steps; i++) pts.push(pointAt(TRAJET, (i / 80) * 1));
  return toPath(pts);
};

export const S2Absorption: React.FC = () => {
  const frame = useCurrentFrame();
  const t = avancement(frame);
  const minutes = Math.round(
    interpolate(frame, [20, 156], [0, 45], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <Backdrop tint={COLORS.cafeine} chapter="Absorption">
      <AbsoluteFill>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <g fill="none" stroke={CORPS} strokeWidth={3} strokeLinejoin="round">
            <circle cx={430} cy={222} r={76} />
            <path d="M 408 292 L 408 332 M 452 292 L 452 332" />
            <path d="M 300 336 C 340 308 520 308 560 336 L 568 566 C 564 646 544 706 530 730 L 330 730 C 316 706 296 646 292 566 Z" />
          </g>

          {/* Cerveau */}
          <g fill="none" stroke={COLORS.adenosine} strokeWidth={2.6} opacity={0.6}>
            <path d="M 392 190 c 12 -18 30 -20 38 -4 c 12 -16 32 -12 36 6" />
            <path d="M 390 214 c 14 12 32 10 40 -2 c 12 12 30 12 36 0" />
          </g>

          {/* Estomac */}
          <path
            d="M 466 402 q 46 -12 52 26 q 6 42 -32 52 q -32 8 -38 -22 q -6 -32 18 -56"
            fill={COLORS.cafeine}
            fillOpacity={0.09}
            stroke={CORPS}
            strokeWidth={3}
          />

          {/* Intestin grêle : le véritable site d'absorption */}
          <g fill="none" stroke={CORPS} strokeWidth={3} strokeLinecap="round">
            <path d="M 356 550 q 32 -22 64 0 q 32 22 64 0" />
            <path d="M 352 584 q 32 -22 64 0 q 32 22 64 0" />
            <path d="M 356 618 q 32 -22 64 0 q 32 22 64 0" />
          </g>

          {/* Trajet complet en pointillés, puis la portion parcourue */}
          <path
            d={toPath(TRAJET)}
            fill="none"
            stroke={COLORS.stroke}
            strokeWidth={2.5}
            strokeDasharray="8 12"
          />
          <path
            d={parcouru(t)}
            fill="none"
            stroke={COLORS.cafeine}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Molécule de tête et sa traîne */}
          {new Array(4).fill(0).map((_, i) => {
            const local = t - i * 0.045;
            if (local <= 0) return null;
            const p = pointAt(TRAJET, local);
            return i === 0 ? (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={24} fill={COLORS.cafeine} opacity={0.16} />
                <circle cx={p.x} cy={p.y} r={12} fill={COLORS.cafeine} />
              </g>
            ) : (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={7}
                fill={COLORS.cafeine}
                opacity={0.4 - i * 0.09}
              />
            );
          })}

          {/* Repères numérotés, en écho à la liste de droite */}
          {STATIONS.map((s) => {
            const o = ramp(frame, s.at, s.at + 16);
            return (
              <g key={s.num} opacity={o}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={19}
                  fill={COLORS.bg}
                  stroke={COLORS.cafeine}
                  strokeWidth={2.5}
                />
                <text
                  x={s.x}
                  y={s.y + 7}
                  textAnchor="middle"
                  fill={COLORS.cafeineSoft}
                  fontFamily={FONT_MONO}
                  fontSize={19}
                >
                  {s.num}
                </text>
              </g>
            );
          })}

          {/* Temps écoulé */}
          <text
            x={430}
            y={856}
            textAnchor="middle"
            fill={COLORS.cafeine}
            fontFamily={FONT_MONO}
            fontSize={46}
          >
            {`T + ${minutes} min`}
          </text>
          <rect x={280} y={896} width={300} height={6} rx={3} fill={COLORS.stroke} />
          <rect
            x={280}
            y={896}
            width={300 * ramp(frame, 20, 156)}
            height={6}
            rx={3}
            fill={COLORS.cafeine}
          />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ paddingLeft: 820, paddingTop: 168 }}>
        <Rise at={4} style={{ marginBottom: 46 }}>
          <Titre size={58}>De la tasse au cerveau</Titre>
        </Rise>

        {ETAPES.map((e) => {
          const actif = interpolate(
            frame,
            [e.at, e.at + 14, e.at + 62, e.at + 76],
            [0, 1, 1, 0.42],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <Rise key={e.num} at={e.at} style={{ marginBottom: 34 }}>
              <div style={{ display: "flex", gap: 26, opacity: 0.55 + actif * 0.45 }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 24,
                    color: COLORS.cafeine,
                    paddingTop: 8,
                    minWidth: 44,
                  }}
                >
                  {e.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 34,
                      fontWeight: 700,
                      color: COLORS.text,
                      marginBottom: 6,
                    }}
                  >
                    {e.titre}
                  </div>
                  <Texte size={26} maxWidth={800}>
                    {e.texte}
                  </Texte>
                </div>
              </div>
            </Rise>
          );
        })}

        <Rise at={198} style={{ marginTop: 18 }}>
          <Etiquette color={COLORS.cafeineSoft}>
            Pic sanguin : 30 à 60 minutes
          </Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
