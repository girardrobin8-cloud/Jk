import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { B } from "./reperes";
import { FONT, FONT_MONO, V } from "./theme";

/**
 * Animation du bloc 2 : la dépense énergétique qui décroche en escalier.
 *
 * Le temps est exprimé en secondes depuis le début du rush B, de sorte que les
 * repères de `reperes.ts` s'appliquent directement, sans conversion.
 */

// ── Géométrie du graphique ───────────────────────────────────────────────
const SEMAINES = 8;
const X0 = 190;
const X1 = 890;
const KCAL_HAUT = 2450;
const Y_HAUT = 700; // 1 px = 1 kcal, ce qui simplifie tout le reste

const xOf = (w: number) => X0 + (w / SEMAINES) * (X1 - X0);
const yOf = (kcal: number) => Y_HAUT + (KCAL_HAUT - kcal);

const AXE_BAS = yOf(2000);
const PALIERS = [2400, 2300, 2200, 2100, 2000];

/** Dépense selon la semaine de régime : deux paliers doux puis trois marches. */
const kcal = (w: number): number => {
  if (w < 2) return 2400;
  if (w < 3.4) return 2400 - ((w - 2) / 1.4) * 55;
  if (w < 4.4) return 2345;
  if (w < 4.5) return 2345 - ((w - 4.4) / 0.1) * 85;
  if (w < 5.4) return 2260;
  if (w < 5.5) return 2260 - ((w - 5.4) / 0.1) * 80;
  if (w < 6.4) return 2180;
  if (w < 6.5) return 2180 - ((w - 6.4) / 0.1) * 80;
  if (w < 7.0) return 2100;
  if (w < 7.1) return 2100 - ((w - 7.0) / 0.1) * 40;
  return 2060;
};

// Avancée du tracé, calée sur ce que dit le narrateur.
const SEUILS_T = [B.parole, 2.2, B.neat, B.thyroide, B.survie, 11.0];
const SEUILS_W = [0, 2.0, 2.0, 3.4, 7.0, SEMAINES];

const semaineAtteinte = (t: number) =>
  interpolate(t, SEUILS_T, SEUILS_W, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Réciproque : à quel instant la courbe atteint la semaine `w`. */
const instantDe = (w: number): number => {
  for (let i = 1; i < SEUILS_W.length; i++) {
    if (w <= SEUILS_W[i] && SEUILS_W[i] > SEUILS_W[i - 1]) {
      const u = (w - SEUILS_W[i - 1]) / (SEUILS_W[i] - SEUILS_W[i - 1]);
      return SEUILS_T[i - 1] + u * (SEUILS_T[i] - SEUILS_T[i - 1]);
    }
  }
  return SEUILS_T[SEUILS_T.length - 1];
};

/**
 * Instants des trois marches franchies par la courbe. Dérivés du tracé lui-même
 * pour que les bruitages suivent automatiquement si le calage change.
 * (La 4e marche, à w = 7.05, tombe sur le carillon du bandeau : on la laisse
 * muette pour ne pas empiler deux sons.)
 */
export const MARCHES = [4.45, 5.45, 6.45].map(instantDe);

const trace = (wMax: number) => {
  const pts: string[] = [];
  for (let w = 0; w <= wMax + 0.001; w += 0.02) {
    pts.push(`${pts.length === 0 ? "M" : "L"} ${xOf(w)} ${yOf(kcal(w))}`);
  }
  return pts.join(" ");
};

// ── Icônes ───────────────────────────────────────────────────────────────

/** Silhouette dont l'agitation retombe. */
const Silhouette: React.FC<{ agitation: number; t: number }> = ({
  agitation,
  t,
}) => {
  const tremble = Math.sin(t * 13) * 4 * agitation;
  return (
    <g>
      {[-1, 1].map((cote) => (
        <g key={cote} opacity={agitation}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${cote * (34 + i * 13)} ${-24 + i * 16} q ${cote * 9} 14 0 28`}
              fill="none"
              stroke={V.vertClair}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.75 - i * 0.2}
            />
          ))}
        </g>
      ))}
      <g
        transform={`translate(${tremble} 0)`}
        fill="none"
        stroke={V.vert}
        strokeWidth={5}
        strokeLinecap="round"
      >
        <circle cx={0} cy={-46} r={15} />
        <path d="M 0 -30 L 0 12" />
        <path d="M -21 -16 L 21 -16" />
        <path d="M 0 12 L -15 46 M 0 12 L 15 46" />
      </g>
    </g>
  );
};

/** Thermomètre dont le niveau descend d'un cran. */
const Thermometre: React.FC<{ niveau: number }> = ({ niveau }) => {
  const haut = interpolate(niveau, [0, 1], [-8, -46]);
  return (
    <g>
      <rect
        x={-9}
        y={-58}
        width={18}
        height={92}
        rx={9}
        fill="none"
        stroke={V.vert}
        strokeWidth={5}
      />
      <circle cx={0} cy={40} r={19} fill="none" stroke={V.vert} strokeWidth={5} />
      <circle cx={0} cy={40} r={12} fill={V.vert} />
      <rect x={-5} y={haut} width={10} height={40 - haut} fill={V.vert} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M 14 ${-42 + i * 22} L 24 ${-42 + i * 22}`}
          stroke={V.vertClair}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.5}
        />
      ))}
    </g>
  );
};

export const Adaptation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const w = semaineAtteinte(t);
  const cadre = interpolate(t, [0, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arriveeNeat = spring({
    frame: frame - B.neat * fps,
    fps,
    config: { damping: 14, mass: 0.5 },
  });
  const arriveeThyroide = spring({
    frame: frame - B.thyroide * fps,
    fps,
    config: { damping: 14, mass: 0.5 },
  });

  const agitation = interpolate(t, [B.neat, B.neat + 1.1], [1, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mercure = interpolate(t, [B.thyroide, B.thyroide + 1.1], [1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const terme = interpolate(t, [B.terme, B.terme + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const survie = spring({
    frame: frame - B.survie * fps,
    fps,
    config: { damping: 15, mass: 0.6 },
  });

  const kcalCourant = Math.round(kcal(w));

  return (
    <AbsoluteFill style={{ backgroundColor: V.fond }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 50% at 50% 46%, ${V.vertSombre}66 0%, transparent 70%)`,
        }}
      />

      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <text
          x={540}
          y={300}
          textAnchor="middle"
          fill={V.muted}
          fontFamily={FONT_MONO}
          fontSize={24}
          letterSpacing={4}
          opacity={cadre}
        >
          8 SEMAINES DE DÉFICIT
        </text>

        {/* ── Icônes ── */}
        {arriveeNeat > 0 ? (
          <g
            transform={`translate(330 450) scale(${arriveeNeat})`}
            opacity={Math.min(1, arriveeNeat)}
          >
            <Silhouette agitation={agitation} t={t} />
          </g>
        ) : null}
        {arriveeThyroide > 0 ? (
          <g
            transform={`translate(750 450) scale(${arriveeThyroide})`}
            opacity={Math.min(1, arriveeThyroide)}
          >
            <Thermometre niveau={mercure} />
          </g>
        ) : null}

        <text
          x={330}
          y={582}
          textAnchor="middle"
          fill={V.vertClair}
          fontFamily={FONT}
          fontSize={26}
          opacity={Math.min(1, arriveeNeat)}
        >
          Activité spontanée ↓
        </text>
        <text
          x={750}
          y={582}
          textAnchor="middle"
          fill={V.vertClair}
          fontFamily={FONT}
          fontSize={26}
          opacity={Math.min(1, arriveeThyroide)}
        >
          Thyroïde ↓
        </text>

        {/* ── Graphique ── */}
        <g opacity={cadre}>
          <text
            x={X0}
            y={660}
            fill={V.muted}
            fontFamily={FONT}
            fontSize={25}
            letterSpacing={1}
          >
            Calories brûlées / jour
          </text>

          {PALIERS.map((k) => (
            <g key={k}>
              <line
                x1={X0}
                y1={yOf(k)}
                x2={X1}
                y2={yOf(k)}
                stroke={V.grille}
                strokeWidth={2}
              />
              <text
                x={X0 - 16}
                y={yOf(k) + 8}
                textAnchor="end"
                fill={V.muted}
                fontFamily={FONT_MONO}
                fontSize={21}
              >
                {k}
              </text>
            </g>
          ))}

          <line
            x1={X0}
            y1={AXE_BAS}
            x2={X1}
            y2={AXE_BAS}
            stroke="rgba(237,243,239,0.3)"
            strokeWidth={3}
          />
          {[0, 2, 4, 6, 8].map((sem) => (
            <text
              key={sem}
              x={xOf(sem)}
              y={AXE_BAS + 40}
              textAnchor="middle"
              fill={V.muted}
              fontFamily={FONT_MONO}
              fontSize={21}
            >
              {sem}
            </text>
          ))}
          <text
            x={(X0 + X1) / 2}
            y={AXE_BAS + 84}
            textAnchor="middle"
            fill={V.muted}
            fontFamily={FONT}
            fontSize={25}
          >
            Semaines de régime
          </text>

          {/* Aire sous la courbe, puis le tracé */}
          <path
            d={`${trace(w)} L ${xOf(w)} ${AXE_BAS} L ${X0} ${AXE_BAS} Z`}
            fill={V.vert}
            opacity={0.1}
          />
          <path
            d={trace(w)}
            fill="none"
            stroke={V.vert}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Curseur et valeur courante */}
          <g transform={`translate(${xOf(w)} ${yOf(kcal(w))})`}>
            <circle r={22} fill={V.vert} opacity={0.22} />
            <circle r={10} fill={V.vert} />
            {/* L'étiquette bascule à gauche en fin de course, sinon elle
                sortirait du cadre et passerait sous les boutons de l'appli. */}
            <text
              x={xOf(w) > 600 ? -26 : 26}
              y={-24}
              textAnchor={xOf(w) > 600 ? "end" : "start"}
              fill={V.texte}
              fontFamily={FONT_MONO}
              fontSize={30}
            >
              {`${kcalCourant} kcal`}
            </text>
          </g>
        </g>

        {/* ── Terme technique ── */}
        <g opacity={terme}>
          <rect
            x={540 - 250}
            y={1252}
            width={500}
            height={62}
            rx={31}
            fill={V.vertSombre}
            stroke={V.vert}
            strokeWidth={2}
          />
          <text
            x={540}
            y={1293}
            textAnchor="middle"
            fill={V.vertClair}
            fontFamily={FONT}
            fontSize={31}
          >
            Thermogenèse adaptative
          </text>
        </g>
      </svg>

      {/* ── Bandeau final ── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 1330,
          opacity: Math.min(1, survie),
          transform: `translateY(${(1 - Math.min(1, survie)) * 18}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 42,
            fontWeight: 700,
            color: V.texte,
            textAlign: "center",
            lineHeight: 1.25,
            maxWidth: 860,
          }}
        >
          Mécanisme de survie
          <br />
          <span style={{ color: V.vert }}>pas un échec</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
