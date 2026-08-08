import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { COUPE_1 } from "./reperes";

/**
 * Les 36,6 s de motion design, en UN SEUL composant continu.
 *
 * Le brief interdit les coupures nettes entre graphiques : un élément doit se
 * transformer en l'élément suivant. Découper en cinq scènes indépendantes
 * rendait cela impossible ; ici tout partage la même horloge, si bien que la
 * frise peut rétrécir pendant que le chiffre grossit à la place de son
 * curseur, et que le curseur devient l'origine du graphique.
 *
 * `t` est le temps ABSOLU du montage, pour que les repères de `reperes.ts`
 * s'appliquent sans conversion.
 */

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], C);

// ── Géométrie de la frise ────────────────────────────────────────────────
const FX0 = 150;
const FX1 = 930;
const G_MAX = 120;
const gx = (g: number) => FX0 + (g / G_MAX) * (FX1 - FX0);

// ── Géométrie du graphique de synthèse protéique ─────────────────────────
const AX0 = 170;
const AX1 = 930;
const AY0 = 700; // haut
const AY1 = 1060; // ligne de base
const hx = (h: number) => AX0 + (h / 24) * (AX1 - AX0);

/**
 * Synthèse protéique sur 24 h.
 *
 * Les deux courbes partagent la MÊME enveloppe journalière et ne diffèrent que
 * par l'amplitude de leurs ondulations : c'est ce que dit la voix off — « elles
 * se ressemblent quasiment trait pour trait ». Une modélisation qui creusait
 * franchement l'écart entre 3 et 6 repas contredisait le propos à l'image.
 */
const enveloppe = (h: number) =>
  0.2 + 0.6 * Math.exp(-Math.pow((h - 13.5) / 7.8, 2));

const courbe = (repas: number[], ampl: number, h: number) => {
  let v = enveloppe(h);
  for (const r of repas) v += ampl * Math.exp(-Math.pow((h - r) / 1.15, 2));
  return Math.min(1, v);
};

const tracer = (repas: number[], ampl: number, hMax: number) => {
  const pts: string[] = [];
  for (let h = 0; h <= hMax + 0.001; h += 0.06) {
    const y = AY1 - courbe(repas, ampl, h) * (AY1 - AY0);
    pts.push(`${pts.length === 0 ? "M" : "L"} ${hx(h)} ${y}`);
  }
  return pts.join(" ");
};

const AMP3 = 0.16;
const AMP6 = 0.095;

const TROIS = [7.5, 12.5, 19];
const SIX = [7, 9.5, 12.5, 15, 17.5, 20.5];

const Texte: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  ancre?: "start" | "middle" | "end";
  gras?: boolean;
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, ancre = "middle", gras = true }) => (
  <text
    x={x}
    y={y}
    textAnchor={ancre}
    fontFamily={TITRE_FONT}
    fontSize={taille}
    fontWeight={gras ? 700 : 400}
    fill={couleur}
    opacity={opacity}
  >
    {children}
  </text>
);

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = COUPE_1 + frame / fps;

  // ── Frise du mythe (6,7 → 16,3) ───────────────────────────────────────
  const friseIn = ramp(t, 6.6, 7.3);
  const curseurG = interpolate(t, [7.4, 9.6], [0, 27], C);
  const croix = spring({ frame: frame - (9.9 - COUPE_1) * fps, fps, config: { damping: 11, mass: 0.5 } });
  const mythe = spring({ frame: frame - (12.4 - COUPE_1) * fps, fps, config: { damping: 12, mass: 0.6 } });
  // La frise se retire en glissant vers le curseur : c'est lui qui devient le chiffre.
  const friseOut = ramp(t, 16.0, 16.9);
  const friseVisible = friseIn * (1 - friseOut);

  // ── Révélation du total (17,0 → 22,5) ─────────────────────────────────
  const chiffre = spring({ frame: frame - (16.7 - COUPE_1) * fps, fps, config: { damping: 13, mass: 0.8 } });
  const sousTexte = ramp(t, 18.9, 19.5);
  const assiettes = interpolate(t, [20.1, 21.0], [0, 3], C);
  const assiettes6 = interpolate(t, [21.2, 22.2], [0, 6], C);
  // Le chiffre remonte et rétrécit pour laisser place à la comparaison.
  const chiffreHaut = ramp(t, 23.2, 24.2);
  const chiffreY = interpolate(chiffreHaut, [0, 1], [820, 360]);
  const chiffreEch = interpolate(chiffreHaut, [0, 1], [1, 0.34]);
  const chiffreOut = ramp(t, 37.9, 38.7);

  // ── Comparaison (23,9 → 33,8) ─────────────────────────────────────────
  const perso = spring({ frame: frame - (23.9 - COUPE_1) * fps, fps, config: { damping: 13, mass: 0.7 } });
  const memeEntrainement = ramp(t, 24.4, 25.0);
  const barre = ramp(t, 25.8, 26.4);
  const labels = ramp(t, 26.9, 27.6);
  // Les silhouettes s'effacent quand le graphique prend la place.
  const persoOut = ramp(t, 29.2, 30.0);

  // ── Graphique (28,5 → 37,2) ───────────────────────────────────────────
  const axeIn = ramp(t, 28.5, 29.4);
  const c1 = interpolate(t, [30.6, 33.6], [0, 24], C);
  const c2 = interpolate(t, [34.5, 36.4], [0, 24], C);
  const identique = spring({ frame: frame - (36.0 - COUPE_1) * fps, fps, config: { damping: 13, mass: 0.7 } });
  const grapheOut = ramp(t, 38.0, 38.8);
  const grapheVis = axeIn * (1 - grapheOut);

  // ── Retour de la frise, dédoublée (38,4 → 42,7) ───────────────────────
  const retour = ramp(t, 38.3, 39.2);
  const entoure = spring({ frame: frame - (40.6 - COUPE_1) * fps, fps, config: { damping: 12, mass: 0.7 } });
  const effacer = ramp(t, 40.8, 41.8);

  const COULEURS = [M.vert, M.ambre];

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(58% 44% at 50% 42%, rgba(47,191,113,0.13) 0%, transparent 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${M.grille} 1px, transparent 1px), linear-gradient(90deg, ${M.grille} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          maskImage: "radial-gradient(52% 40% at 50% 44%, black 10%, transparent 78%)",
        }}
      />

      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* ── 1. Frise du seuil ── */}
        {friseVisible > 0.01 ? (
          <g
            opacity={friseVisible}
            transform={`translate(${gx(curseurG) * friseOut * 0.0} 0) scale(${1 - friseOut * 0.12})`}
          >
            <line x1={FX0} y1={820} x2={FX1} y2={820} stroke={M.gris} strokeWidth={5} />
            {[0, 30, 60, 90, 120].map((g) => (
              <g key={g}>
                <line x1={gx(g)} y1={820} x2={gx(g)} y2={846} stroke={M.gris} strokeWidth={4} />
                <Texte x={gx(g)} y={900} taille={30} couleur={M.gris}>{`${g}g`}</Texte>
              </g>
            ))}
            <Texte x={540} y={640} taille={30} couleur={M.gris}>
              PROTÉINES PAR PRISE
            </Texte>

            {/* Curseur */}
            <g transform={`translate(${gx(curseurG)} 820)`}>
              <line y1={-58} y2={16} stroke={M.vert} strokeWidth={6} strokeLinecap="round" />
              <circle cy={0} r={13} fill={M.vert} />
              <Texte x={0} y={-76} taille={34} couleur={M.vert}>
                {`${Math.round(curseurG)} g`}
              </Texte>
            </g>

            {/* Croix rouge qui tombe sur le seuil */}
            {croix > 0.01 ? (
              <g transform={`translate(${gx(27)} ${interpolate(croix, [0, 1], [640, 760])}) scale(${croix})`}>
                <circle r={46} fill={M.corail} fillOpacity={0.16} stroke={M.corail} strokeWidth={5} />
                <g stroke={M.corail} strokeWidth={8} strokeLinecap="round">
                  <line x1={-20} y1={-20} x2={20} y2={20} />
                  <line x1={20} y1={-20} x2={-20} y2={20} />
                </g>
              </g>
            ) : null}

            {mythe > 0.01 ? (
              <g transform={`translate(${gx(27)} 560) scale(${mythe})`}>
                <Texte x={0} y={0} taille={92} couleur={M.corail}>
                  MYTHE
                </Texte>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* ── 2. Le total quotidien — naît là où s'arrêtait le curseur ── */}
        {chiffre > 0.01 && chiffreOut < 1 ? (
          <g
            opacity={Math.min(1, chiffre) * (1 - chiffreOut)}
            transform={`translate(540 ${chiffreY}) scale(${Math.min(chiffre, 1.08) * chiffreEch})`}
          >
            <Texte x={0} y={40} taille={200} couleur={M.vert}>
              160 g
            </Texte>
            <g opacity={sousTexte * (1 - chiffreHaut)}>
              <Texte x={0} y={130} taille={38} couleur={M.gris}>
                OBJECTIF QUOTIDIEN
              </Texte>
            </g>
          </g>
        ) : null}

        {/* Assiettes : 3 puis 6, même total */}
        {assiettes > 0 && chiffreHaut < 1 ? (
          <g opacity={1 - chiffreHaut}>
            {new Array(6).fill(0).map((_, i) => {
              const v = i < 3 ? Math.min(1, assiettes - i) : Math.min(1, assiettes6 - i);
              if (v <= 0) return null;
              const n = i < 3 ? 3 : 6;
              const x = 540 + (i - (n - 1) / 2) * 150;
              return (
                <g key={i} transform={`translate(${x} 1120) scale(${v})`}>
                  <circle r={44} fill="none" stroke={M.ambre} strokeWidth={5} />
                  <circle r={24} fill={M.ambre} fillOpacity={0.22} />
                </g>
              );
            })}
            <Texte x={540} y={1240} taille={32} couleur={M.gris} opacity={Math.min(1, assiettes / 3)}>
              {assiettes6 > 3 ? "6 PRISES — MÊME TOTAL" : "3 PRISES"}
            </Texte>
          </g>
        ) : null}

        {/* ── 3. Deux clients ── */}
        {perso > 0.01 && persoOut < 1 ? (
          <g opacity={Math.min(1, perso) * (1 - persoOut)}>
            <g opacity={memeEntrainement}>
              <Texte x={540} y={600} taille={40} couleur={M.gris}>
                MÊME ENTRAÎNEMENT
              </Texte>
              <line
                x1={540 - 210}
                y1={588}
                x2={540 - 210 + 420 * barre}
                y2={588}
                stroke={M.corail}
                strokeWidth={6}
                strokeLinecap="round"
              />
            </g>
            {[0, 1].map((i) => {
              const x = i === 0 ? 340 : 740;
              return (
                <g key={i} transform={`translate(${x} 800)`}>
                  <circle cy={-64} r={34} fill="none" stroke={COULEURS[i]} strokeWidth={6} />
                  <path
                    d="M -52 90 q 0 -70 52 -70 q 52 0 52 70 Z"
                    fill={COULEURS[i]}
                    fillOpacity={0.16}
                    stroke={COULEURS[i]}
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />
                  <g opacity={labels}>
                    <Texte x={0} y={186} taille={54} couleur={COULEURS[i]}>
                      160 g
                    </Texte>
                    <Texte x={0} y={240} taille={34} couleur={M.gris}>
                      {i === 0 ? "3 REPAS" : "6 REPAS"}
                    </Texte>
                  </g>
                </g>
              );
            })}
          </g>
        ) : null}

        {/* ── 4. Synthèse protéique sur 24 h ── */}
        {grapheVis > 0.01 ? (
          <g opacity={grapheVis}>
            <line x1={AX0} y1={AY1} x2={AX1} y2={AY1} stroke={M.gris} strokeWidth={5} />
            <line x1={AX0} y1={AY1} x2={AX0} y2={AY0 - 40} stroke={M.gris} strokeWidth={5} />
            {[0, 6, 12, 18, 24].map((h) => (
              <g key={h}>
                <line x1={hx(h)} y1={AY1} x2={hx(h)} y2={AY1 + 20} stroke={M.gris} strokeWidth={4} />
                <Texte x={hx(h)} y={AY1 + 62} taille={28} couleur={M.gris}>{`${h}h`}</Texte>
              </g>
            ))}
            <Texte x={(AX0 + AX1) / 2} y={AY1 + 120} taille={30} couleur={M.gris}>
              HEURES
            </Texte>
            <Texte x={AX0} y={AY0 - 46} taille={28} couleur={M.gris} ancre="start">
              SYNTHÈSE PROTÉIQUE
            </Texte>

            {c1 > 0 ? (
              <path d={tracer(TROIS, AMP3, c1)} fill="none" stroke={M.vert} strokeWidth={7} strokeLinecap="round" />
            ) : null}
            {c2 > 0 ? (
              <path
                d={tracer(SIX, AMP6, c2)}
                fill="none"
                stroke={M.ambre}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray="16 12"
              />
            ) : null}

            {/* Légende : sans elle, on ne sait pas quelle courbe est laquelle. */}
            {c1 > 0 ? (
              <g opacity={ramp(t, 31.0, 31.6)}>
                <line x1={210} y1={706} x2={274} y2={706} stroke={M.vert} strokeWidth={7} strokeLinecap="round" />
                <Texte x={290} y={718} taille={30} couleur={M.vert} ancre="start">
                  3 REPAS
                </Texte>
              </g>
            ) : null}
            {c2 > 0 ? (
              <g opacity={ramp(t, 34.8, 35.4)}>
                <line
                  x1={210}
                  y1={758}
                  x2={274}
                  y2={758}
                  stroke={M.ambre}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray="16 12"
                />
                <Texte x={290} y={770} taille={30} couleur={M.ambre} ancre="start">
                  6 REPAS
                </Texte>
              </g>
            ) : null}

            {identique > 0.01 ? (
              <g opacity={Math.min(1, identique)}>
                <Texte x={540} y={AY1 + 200} taille={44} couleur={M.vert}>
                  QUASI IDENTIQUE SUR 24 H
                </Texte>
                <Texte x={540} y={AY1 + 252} taille={32} couleur={M.gris}>
                  MÊME TOTAL, MÊME RÉSULTAT
                </Texte>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* ── 5. Retour de la frise, dédoublée ── */}
        {retour > 0.01 ? (
          <g opacity={retour}>
            {[0, 1].map((i) => {
              const y = 700 + i * 260;
              const repas = i === 0 ? TROIS : SIX;
              return (
                <g key={i}>
                  {/* Le trait s'arrête avant la pastille : sinon il traverse
                      le chiffre, qui devient illisible. */}
                  <line x1={FX0} y1={y} x2={FX1 - 168} y2={y} stroke={M.gris} strokeWidth={5} />
                  <Texte x={FX0} y={y - 34} taille={30} couleur={COULEURS[i]} ancre="start">
                    {i === 0 ? "3 REPAS" : "6 REPAS"}
                  </Texte>
                  {/* Repères intermédiaires, qui s'effacent */}
                  <g opacity={1 - effacer}>
                    {repas.map((r) => (
                      <circle
                        key={r}
                        cx={FX0 + (r / 24) * (FX1 - FX0 - 230)}
                        cy={y}
                        r={13}
                        fill={COULEURS[i]}
                      />
                    ))}
                  </g>
                  {/* Total de fin de journée, entouré */}
                  <g transform={`translate(${FX1 - 78} ${y})`}>
                    <circle r={76} fill={M.fond} />
                    <circle
                      r={76 * Math.min(1, entoure)}
                      fill="none"
                      stroke={M.vert}
                      strokeWidth={7}
                      opacity={entoure}
                    />
                    <Texte x={0} y={-6} taille={52} couleur={M.vert}>
                      160
                    </Texte>
                    <Texte x={0} y={36} taille={24} couleur={M.gris}>
                      TOTAL
                    </Texte>
                  </g>
                </g>
              );
            })}
            <g opacity={entoure}>
              <Texte x={540} y={1180} taille={44} couleur={M.vert}>
                SEUL LE TOTAL COMPTE
              </Texte>
            </g>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
