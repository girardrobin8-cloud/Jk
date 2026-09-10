import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { BEATS, FONDU } from "./reperes";

/**
 * Le motion design du reel Jour 1, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Différence avec les montages précédents : ici le rush existe. L'animation ne
 * remplit donc pas un trou, elle RECOUVRE la vidéo sur les fenêtres B2 à B6, et
 * s'efface sur le hook et le CTA. Chaque panneau est opaque et monte en fondu
 * de part et d'autre de sa borne — le brief interdit le cut sec entre caméra et
 * animation.
 *
 * Règles tenues par la structure :
 *  · aucun chevauchement — chaque bloc a sa bande horizontale réservée ;
 *  · aucune apparition brutale — tout entre en fondu doublé d'un déplacement
 *    ou d'un changement d'échelle ;
 *  · jamais figé plus de deux ou trois secondes — le beat le plus long (B4,
 *    douze secondes) est découpé en cinq micro-événements ;
 *  · aucun bruitage — rien à faire ici, le montage ne porte que la voix.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));
const melange = (a: number, b: number, p: number) => a + (b - a) * p;

const CX = 540;
const CYAN = "#5BD6E0"; // secondaire demandé par le brief, absent de la charte
const NEON = M.bleuClair;
const AMBRE = M.ambre;

const BANDES = {
  enTete: { haut: 250, bas: 470 },
  scene: { haut: 560, bas: 1240 },
  socle: { haut: 1330, bas: 1600 },
};

/** Fenêtre d'un beat, fondus compris. */
const fenetre = (t: number, id: string) => {
  const b = BEATS.find((x) => x.id === id)!;
  return Math.min(rd(t, b.debut - FONDU, b.debut), 1 - rd(t, b.fin, b.fin + FONDU));
};

// ── Repères internes, en secondes absolues ───────────────────────────────
const T = {
  // B2 — 6,59 → 12,96
  perso: 6.35,
  riz: 6.8, // « Manger des glucides… »              [6,59 → 8,55]
  courbe: 7.7, // « …fait grimper ta glycémie »
  insuline: 8.5, // « ton corps sécrète de l'insuline »[8,55 → 11,39]
  descente: 9.5, // « …pour la faire redescendre »
  stockage: 11.2, // « en stockant cette énergie »    [11,39 → 12,96]

  // B3 — 13,16 → 20,51
  dedouble: 13.3, // « stocke aussi bien du glycogène que du gras » [13,16 → 16,42]
  vraiFacteur: 16.2, // « Le vrai facteur »           [16,42 → 18,75]
  balance: 18.6, // « peu importe la source »         [18,75 → 20,51]

  // B4 — 20,84 → 32,92
  jauge: 20.9, // « remplissent d'abord ton glycogène »[20,84 → 22,81]
  remplit: 21.3,
  dose: 23.0, // « ton carburant à l'entraînement »
  debordement: 24.5, // « une fois ces réserves pleines »[24,68 → 30,18]
  graisse: 26.6, // « se transformer en graisse »
  marginal: 30.0, // « un processus marginal »        [30,18 → 32,92]

  // B5 — 33,06 → 45,56
  groupes: 33.0, // « une méta-analyse a réuni dix-neuf essais »
  essais: 33.5,
  personnes: 34.9, // « plus de trois mille deux cents »[34,99 → 36,66]
  etiquettes: 36.5, // « pauvre en glucides / équilibré »[36,66 → 40,02]
  barres: 39.9, // « à calories strictement égales »  [40,02 → 41,85]
  carte: 41.7, // « Résultat quasi identique »        [41,85 → 43,41]
  carteDeux: 43.4, // « six mois ou deux ans »        [43,41 → 45,56]

  // B6 — 45,88 → 53,41
  haltere: 45.7,
  intensite: 46.4,
  chute: 47.4, // la jauge redescend, l'haltère se ternit
  duree: 50.8, // « donc tes résultats sur la durée » [50,90 → 53,41]
};

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  espace?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, espace = 0, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    fill={couleur}
    fontSize={taille}
    fontWeight={800}
    letterSpacing={espace}
    opacity={opacity}
    textAnchor={ancre}
    dominantBaseline="middle"
    fontFamily={TITRE_FONT}
  >
    {children}
  </text>
);

/**
 * Le personnage pixel-art, repère central des séquences animées.
 *
 * Dessiné sur une grille de 11 × 15, un rectangle par pixel allumé. Le tracé
 * vectoriel serait plus lisse, mais c'est justement ce qu'on ne veut pas : la
 * marche d'escalier fait partie du style établi sur le carrousel.
 */
const CORPS = [
  "....###....",
  "...#####...",
  "...#o#o#...",
  "...#####...",
  "....###....",
  "..#######..",
  "###########",
  "###########",
  "..#######..",
  "...#####...",
  "...##.##...",
  "...##.##...",
  "...##.##...",
  "..###.###..",
  "..###.###..",
];

const Perso: React.FC<{ x: number; y: number; k?: number; opacity?: number; couleur?: string }> = ({
  x,
  y,
  k = 1,
  opacity = 1,
  couleur = NEON,
}) => {
  const px = 11 * k;
  return (
    <g transform={`translate(${x - (11 * px) / 2} ${y - (15 * px) / 2})`} opacity={opacity}>
      {CORPS.flatMap((ligne, j) =>
        ligne.split("").map((c, i) =>
          c === "." ? null : (
            <rect
              key={`${i}-${j}`}
              x={i * px}
              y={j * px}
              width={px + 0.5}
              height={px + 0.5}
              fill={c === "o" ? M.fond : couleur}
            />
          ),
        ),
      )}
    </g>
  );
};

/** Encadré à coins nets, brique de base des icônes et des cartes. */
const Case: React.FC<{
  x: number;
  y: number;
  l: number;
  h: number;
  couleur: string;
  plein?: boolean;
  opacity?: number;
}> = ({ x, y, l, h, couleur, plein = false, opacity = 1 }) => (
  <rect
    x={x - l / 2}
    y={y - h / 2}
    width={l}
    height={h}
    fill={plein ? couleur : M.fondCase}
    stroke={couleur}
    strokeWidth={4}
    opacity={opacity}
  />
);

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b2 = fenetre(t, "B2");
  const b3 = fenetre(t, "B3");
  const b4 = fenetre(t, "B4");
  const b5 = fenetre(t, "B5");
  const b6 = fenetre(t, "B6");
  if (Math.max(b2, b3, b4, b5, b6) <= 0) return null;

  const souffle = 1 + 0.005 * Math.sin(2 * Math.PI * t / 7);

  // ── B2 ────────────────────────────────────────────────────────────────
  const riz = rd(t, T.riz, T.riz + 0.5);
  const courbe = rd(t, T.courbe, T.courbe + 1.1);
  const insuline = rd(t, T.insuline, T.insuline + 0.5);
  const descente = rd(t, T.descente, T.descente + 1.2);
  const stockage = rd(t, T.stockage, T.stockage + 0.6);

  // Courbe de glycémie : monte, puis redescend quand l'insuline agit.
  const chemin = (() => {
    const x0 = 660;
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const p = i / 40;
      const monte = Math.min(1, p / 0.45) * courbe;
      const baisse = Math.max(0, (p - 0.5) / 0.5) * 0.82 * descente;
      const v = Math.max(0, monte - baisse);
      pts.push(`${x0 + p * 300},${1010 - v * 300}`);
    }
    return `M ${pts.join(" L ")}`;
  })();

  // ── B3 ────────────────────────────────────────────────────────────────
  const dedouble = rd(t, T.dedouble, T.dedouble + 0.9);
  const vraiFacteur = rd(t, T.vraiFacteur, T.vraiFacteur + 0.5) * (1 - rd(t, T.balance - 0.45, T.balance));
  const balance = rd(t, T.balance, T.balance + 0.8);

  // ── B4 ────────────────────────────────────────────────────────────────
  const jauge = rd(t, T.jauge, T.jauge + 0.5);
  const remplit = rd(t, T.remplit, T.remplit + 3.0);
  const dose = rd(t, T.dose, T.dose + 0.5) * (1 - rd(t, T.debordement, T.debordement + 0.5));
  const debordement = rd(t, T.debordement, T.debordement + 0.9);
  const graisse = rd(t, T.graisse, T.graisse + 0.7);
  const marginal = rd(t, T.marginal, T.marginal + 0.6);
  /**
   * Abscisse de la jauge. Elle occupe d'abord le centre — sans quoi la moitié
   * droite du cadre resterait vide quatre secondes durant — puis se décale à
   * gauche pour laisser entrer le trop-plein et l'icône graisse. Le déplacement
   * tient aussi lieu de transition : rien n'apparaît sur un écran figé.
   */
  const gx = melange(CX, 410, debordement);

  // ── B5 ────────────────────────────────────────────────────────────────
  const groupes = rd(t, T.groupes, T.groupes + 0.7);
  const essais = rd(t, T.essais, T.essais + 0.5);
  const personnes = rd(t, T.personnes, T.personnes + 0.5);
  const etiquettes = rd(t, T.etiquettes, T.etiquettes + 0.6);
  const barres = rd(t, T.barres, T.barres + 1.0);
  const carte = rd(t, T.carte, T.carte + 0.5);
  const carteDeux = rd(t, T.carteDeux, T.carteDeux + 0.6);

  // ── B6 ────────────────────────────────────────────────────────────────
  const haltere = rd(t, T.haltere, T.haltere + 0.5);
  const intensite = rd(t, T.intensite, T.intensite + 0.6);
  const chute = rd(t, T.chute, T.chute + 2.2);
  const duree = rd(t, T.duree, T.duree + 0.6);

  const Panneau: React.FC<{ e: number; children: React.ReactNode }> = ({ e, children }) =>
    e <= 0 ? null : (
      <AbsoluteFill style={{ backgroundColor: M.fond, opacity: e }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>{children}</g>
        </svg>
      </AbsoluteFill>
    );

  return (
    <AbsoluteFill>
      {/* ══ B2 — d'où vient le mythe ═══════════════════════════════════ */}
      <Panneau e={b2}>
        {/* Bonhomme : 11 x 15 pixels à 24 px, soit 264 x 360, centré en 1040 —
            il occupe donc y 860..1220 et laisse la bande haute libre pour son
            étiquette. Une première version à 3,2 le faisait monter jusqu'à 746
            et la boîte GLUCIDES lui tombait sur la tête. */}
        <Perso x={320} y={1040} k={2.4} opacity={rd(t, T.perso, T.perso + 0.5)} />
        {riz > 0 && (
          <g opacity={riz} transform={`translate(0 ${melange(26, 0, riz)})`}>
            <Case x={320} y={700} l={236} h={92} couleur={AMBRE} />
            <Txt x={320} y={700} taille={30} couleur={AMBRE} espace={2}>
              GLUCIDES
            </Txt>
          </g>
        )}
        {courbe > 0 && (
          <>
            <line x1={640} y1={1010} x2={990} y2={1010} stroke={M.noir} strokeWidth={4} />
            <path d={chemin} fill="none" stroke={courbe > 0 ? NEON : NEON} strokeWidth={9} strokeLinecap="round" opacity={courbe} />
            <Txt x={810} y={1082} taille={28} couleur={M.gris} espace={3} opacity={courbe}>
              GLYCÉMIE
            </Txt>
          </>
        )}
        {insuline > 0 && (
          <g opacity={insuline} transform={`translate(0 ${melange(-24, 0, insuline)})`}>
            <Case x={810} y={640} l={186} h={86} couleur={CYAN} />
            <Txt x={810} y={640} taille={30} couleur={CYAN} espace={2}>
              INSULINE
            </Txt>
          </g>
        )}
        {stockage > 0 && (
          <g opacity={stockage}>
            <Case x={CX} y={1380} l={330} h={96} couleur={M.texte} />
            <Txt x={CX} y={1380} taille={34} couleur={M.texte} espace={3}>
              STOCKAGE
            </Txt>
          </g>
        )}
        <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={riz}>
          CE QU'ON T'A RACONTÉ
        </Txt>
      </Panneau>

      {/* ══ B3 — la bascule ════════════════════════════════════════════ */}
      <Panneau e={b3}>
        {vraiFacteur > 0.02 ? (
          <Txt x={CX} y={960} taille={melange(96, 118, vraiFacteur)} couleur={NEON} espace={4} opacity={vraiFacteur}>
            LE VRAI FACTEUR
          </Txt>
        ) : balance > 0.02 ? (
          <>
            <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={balance}>
              PEU IMPORTE LA SOURCE
            </Txt>
            {[
              { x: 250, l: "GLUCIDES", c: AMBRE },
              { x: CX, l: "LIPIDES", c: CYAN },
              { x: 830, l: "PROTÉINES", c: NEON },
            ].map((p, i) => {
              const e = rd(balance, i * 0.16, i * 0.16 + 0.45);
              return (
                <g key={p.l} opacity={e} transform={`translate(0 ${melange(-160, 0, e)})`}>
                  <Case x={p.x} y={760} l={220} h={92} couleur={p.c} />
                  <Txt x={p.x} y={760} taille={28} couleur={p.c} espace={2}>
                    {p.l}
                  </Txt>
                </g>
              );
            })}
            <g opacity={rd(balance, 0.5, 0.9)}>
              <Case x={CX} y={1080} l={720} h={120} couleur={M.texte} />
              <Txt x={CX} y={1080} taille={40} couleur={M.texte} espace={3}>
                BILAN CALORIQUE TOTAL
              </Txt>
            </g>
          </>
        ) : (
          <>
            <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={dedouble}>
              L'INSULINE STOCKE LES DEUX
            </Txt>
            {[
              { x: melange(CX, 300, dedouble), l: "GLYCOGÈNE", c: NEON },
              { x: melange(CX, 780, dedouble), l: "GRAISSE", c: AMBRE },
            ].map((p) => (
              <g key={p.l} opacity={dedouble}>
                <Case x={p.x} y={960} l={380} h={190} couleur={p.c} />
                <Txt x={p.x} y={960} taille={36} couleur={p.c} espace={2}>
                  {p.l}
                </Txt>
              </g>
            ))}
            <Txt x={CX} y={1220} taille={34} couleur={M.gris} espace={4} opacity={rd(dedouble, 0.6, 1)}>
              À PARTS ÉGALES
            </Txt>
          </>
        )}
      </Panneau>

      {/* ══ B4 — où vont tes glucides ══════════════════════════════════ */}
      <Panneau e={b4}>
        <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={jauge}>
          D'ABORD LE RÉSERVOIR
        </Txt>
        {jauge > 0 && (
          <g opacity={jauge}>
            <rect x={gx - 110} y={640} width={220} height={600} fill="none" stroke={M.noir} strokeWidth={5} />
            <rect x={gx - 110} y={1240 - 600 * remplit} width={220} height={600 * remplit} fill={NEON} opacity={0.9} />
            <Txt x={gx} y={1300} taille={32} couleur={NEON} espace={3}>
              GLYCOGÈNE
            </Txt>
          </g>
        )}
        {dose > 0 && (
          <Txt x={gx} y={melange(1372, 1362, dose)} taille={30} couleur={M.gris} espace={2} opacity={dose}>
            8–12 G/KG/JOUR
          </Txt>
        )}
        {debordement > 0 && (
          <g opacity={debordement}>
            <path
              d={`M ${gx + 110} ${melange(700, 660, debordement)} L ${melange(gx + 110, 700, debordement)} 660 L ${melange(gx + 110, 700, debordement)} 900`}
              fill="none"
              stroke={AMBRE}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M 680 872 L 700 908 L 720 872" fill="none" stroke={AMBRE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={rd(debordement, 0.7, 1)} />
          </g>
        )}
        {graisse > 0 && (
          <g opacity={graisse}>
            <Case x={790} y={980} l={melange(80, 128, graisse)} h={melange(56, 84, graisse)} couleur={AMBRE} />
            <Txt x={790} y={1074} taille={26} couleur={AMBRE} espace={2}>
              GRAISSE
            </Txt>
          </g>
        )}
        {marginal > 0 && (
          <Txt x={CX} y={BANDES.socle.haut + melange(70, 60, marginal)} taille={44} couleur={M.texte} espace={2} opacity={marginal}>
            MARGINAL EN PRATIQUE
          </Txt>
        )}
      </Panneau>

      {/* ══ B5 — la preuve ═════════════════════════════════════════════ */}
      <Panneau e={b5}>
        <Txt x={CX} y={BANDES.enTete.haut + 34} taille={melange(66, 76, essais)} couleur={M.texte} espace={2} opacity={essais}>
          19 ESSAIS
        </Txt>
        <Txt x={CX} y={BANDES.enTete.haut + 122} taille={44} couleur={M.gris} espace={3} opacity={personnes}>
          3200+ PERSONNES
        </Txt>
        {[
          { x: 300, c: NEON, l: "PAUVRE EN", l2: "GLUCIDES", h: 300 },
          { x: 780, c: CYAN, l: "RÉGIME", l2: "ÉQUILIBRÉ", h: 288 },
        ].map((g, gi) => (
          <g key={g.l2}>
            {groupes > 0 &&
              [0, 1, 2, 3, 4, 5].map((i) => {
                const e = rd(groupes, (gi * 6 + i) * 0.05, (gi * 6 + i) * 0.05 + 0.3);
                return e <= 0 ? null : (
                  <g key={i} opacity={e * 0.8}>
                    {/* Le même bonhomme, en miniature : c'est lui le repère
                        central de la série, pas un rectangle anonyme. */}
                    <Perso
                      x={g.x - 82 + (i % 3) * 82}
                      y={664 + Math.floor(i / 3) * 104}
                      k={0.62}
                      couleur={g.c}
                    />
                  </g>
                );
              })}
            {etiquettes > 0 && (
              <g opacity={etiquettes}>
                <Txt x={g.x} y={840} taille={28} couleur={g.c} espace={2}>
                  {g.l}
                </Txt>
                <Txt x={g.x} y={876} taille={28} couleur={g.c} espace={2}>
                  {g.l2}
                </Txt>
              </g>
            )}
            {barres > 0 && (
              <rect
                x={g.x - 70}
                y={1240 - g.h * barres}
                width={140}
                height={g.h * barres}
                fill={g.c}
                opacity={0.9}
              />
            )}
          </g>
        ))}
        {carte > 0 && (
          <g opacity={carte}>
            <Case x={CX} y={BANDES.socle.haut + 70} l={640} h={116} couleur={M.texte} />
            <Txt x={CX} y={BANDES.socle.haut + 70} taille={42} couleur={M.texte} espace={3}>
              {carteDeux > 0.5 ? "IDENTIQUE — 2 ANS" : "IDENTIQUE — 6 MOIS"}
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B6 — la conséquence ════════════════════════════════════════ */}
      <Panneau e={b6}>
        <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={haltere}>
          MAIS LES COUPER TROP
        </Txt>
        {haltere > 0 && (
          <g opacity={haltere}>
            <g transform={`translate(360 960) scale(${melange(1, 0.86, chute)})`} opacity={melange(1, 0.4, chute)}>
              <rect x={-70} y={-14} width={140} height={28} fill={NEON} />
              <rect x={-118} y={-56} width={40} height={112} fill={NEON} />
              <rect x={78} y={-56} width={40} height={112} fill={NEON} />
            </g>
          </g>
        )}
        {intensite > 0 && (
          <g opacity={intensite}>
            <rect x={720} y={640} width={150} height={620} fill="none" stroke={M.noir} strokeWidth={5} />
            {(() => {
              const h = melange(560, 190, chute);
              return <rect x={720} y={1260 - h} width={150} height={h} fill={melange(0, 1, chute) > 0.5 ? AMBRE : NEON} opacity={0.9} />;
            })()}
            <Txt x={795} y={1320} taille={30} couleur={M.gris} espace={3}>
              INTENSITÉ
            </Txt>
          </g>
        )}
        {duree > 0 && (
          <Txt x={CX} y={BANDES.socle.haut + melange(80, 70, duree)} taille={46} couleur={AMBRE} espace={2} opacity={duree}>
            ET TES RÉSULTATS AVEC
          </Txt>
        )}
      </Panneau>
    </AbsoluteFill>
  );
};
