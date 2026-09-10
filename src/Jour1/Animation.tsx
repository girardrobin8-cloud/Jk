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
/**
 * Chaque valeur est LUE sur les sous-titres incrustés de Robin, pas estimée.
 * Le commentaire cite le mot visé et l'instant où il s'affiche à l'écran, ce
 * qui permet de vérifier un calage sans relancer l'extraction.
 *
 * Règle tenue partout : l'élément COMMENCE à monter deux à quatre dixièmes
 * avant son mot, pour être en place quand le spectateur le lit.
 */
const T = {
  // ── B2 — 4,5 → 12,8
  perso: 4.5,
  riz: 4.9, // « glucides »                          affiché 5,1
  courbe: 5.7, // « grimper ta glycémie »            5,9 → 6,3
  insuline: 8.3, // « l'insuline »                   8,7
  descente: 9.2, // « pour la faire redescendre »    9,4 → 9,6
  stockage: 11.2, // « stocker cette énergie »       11,5 → 12,1

  // ── B3 — 12,8 → 26,2 : le raccourci, puis sa réfutation
  raccourci: 12.9, // « là est né le raccourci »     13,0 → 13,7
  plusInsuline: 14.4, // « plus d'insuline sécrétée » 14,7 → 15,7
  plusGraisse: 16.1, // « plus de graisse stockée »  16,4 → 17,3
  dedouble: 17.6, // « elle stocke aussi bien… »     17,8 → 20,7
  vraiFacteur: 20.9, // « le vrai facteur »          21,2 → 21,6
  balance: 22.7, // « ton bilan calorique total »    23,1 → 24,0

  // ── B4 — 26,2 → 37,7
  jauge: 26.2, // « tes glucides »                   26,3
  remplit: 26.7, // « remplissent d'abord »          27,2 → 28,0
  dose: 28.4, // « ton carburant pour l'entraînement » 28,9 → 29,7
  debordement: 32.2, // « l'excès peut, en théorie »  32,5 → 33,5
  graisse: 33.9, // « se transformer en graisse »    34,2 → 34,7
  marginal: 35.0, // « un processus marginal »       35,4 → 36,0

  // ── B5 — 37,7 → 54,85
  meta: 37.7, // « on va prendre par exemple une méta-analyse » 37,9 → 39,2
  essais: 39.9, // « a réuni 19 essais »             40,5 → 41,0
  personnes: 41.3, // « plus de 3200 personnes »     41,9 → 42,7
  groupes: 43.0, // « un régime pauvre en glucides » 43,5 → 44,3
  etiquettes: 44.8, // « contre un régime équilibré » 45,3 → 45,7
  egales: 46.3, // « à calories strictement égales » 47,3 → 48,2
  barres: 48.8, // « le résultat… quasi identique »  49,4 → 51,0
  carte: 51.3, // « après 6 ou 2 ans d'expérience »  51,5 → 53,5

  // ── B6 — 54,85 → 59,65
  haltere: 54.85, // « par contre, les couper à l'excès » 54,9 → 55,9
  intensite: 55.6,
  chute: 56.2, // « baisse ton intensité »           56,5 → 56,9
  duree: 58.0, // « tes résultats sur la durée »     58,5 → 59,2
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
  const raccourci = rd(t, T.raccourci, T.raccourci + 0.5) * (1 - rd(t, T.dedouble - 0.4, T.dedouble));
  const plusInsuline = rd(t, T.plusInsuline, T.plusInsuline + 0.5);
  const plusGraisse = rd(t, T.plusGraisse, T.plusGraisse + 0.5);
  const dedouble = rd(t, T.dedouble, T.dedouble + 0.9) * (1 - rd(t, T.vraiFacteur - 0.4, T.vraiFacteur));
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
  const meta = rd(t, T.meta, T.meta + 0.6);
  const groupes = rd(t, T.groupes, T.groupes + 0.7);
  const essais = rd(t, T.essais, T.essais + 0.5);
  const personnes = rd(t, T.personnes, T.personnes + 0.5);
  const etiquettes = rd(t, T.etiquettes, T.etiquettes + 0.6);
  const egales = rd(t, T.egales, T.egales + 0.6);
  const barres = rd(t, T.barres, T.barres + 1.2);
  const carte = rd(t, T.carte, T.carte + 0.6);

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

      {/* ══ B3 — le raccourci, puis sa réfutation ═════════════════════ */}
      {/* Quatre temps, dans l'ordre où Robin les énonce. Le premier — « là est
          né le raccourci » — n'existait pas au brief : c'est une idée que Robin
          a ajoutée en tournant, et elle a besoin de sa propre image, sans quoi
          l'animation illustrerait une phrase qu'il ne dit pas. */}
      <Panneau e={b3}>
        {raccourci > 0.02 ? (
          <>
            <Txt x={CX} y={BANDES.enTete.haut + 60} taille={40} couleur={M.gris} espace={5} opacity={raccourci}>
              LÀ EST NÉ LE RACCOURCI
            </Txt>
            {plusInsuline > 0 && (
              <g opacity={plusInsuline * raccourci} transform={`translate(0 ${melange(-30, 0, plusInsuline)})`}>
                <Case x={CX} y={800} l={560} h={130} couleur={CYAN} />
                <Txt x={CX} y={800} taille={44} couleur={CYAN} espace={2}>
                  + D'INSULINE
                </Txt>
              </g>
            )}
            {plusGraisse > 0 && (
              <g opacity={plusGraisse * raccourci}>
                <path
                  d={`M ${CX} 880 L ${CX} ${melange(880, 1020, plusGraisse)}`}
                  stroke={M.gris}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${CX - 20} 992 L ${CX} 1026 L ${CX + 20} 992`}
                  fill="none"
                  stroke={M.gris}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={rd(plusGraisse, 0.7, 1)}
                />
                <g transform={`translate(0 ${melange(30, 0, plusGraisse)})`}>
                  <Case x={CX} y={1130} l={560} h={130} couleur={AMBRE} />
                  <Txt x={CX} y={1130} taille={44} couleur={AMBRE} espace={2}>
                    + DE GRAISSE
                  </Txt>
                </g>
              </g>
            )}
          </>
        ) : vraiFacteur > 0.02 ? (
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
              SAUF QU'ELLE STOCKE LES DEUX
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
        <Txt x={CX} y={BANDES.enTete.haut - 46} taille={36} couleur={M.gris} espace={5} opacity={meta}>
          UNE MÉTA-ANALYSE
        </Txt>
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
        {egales > 0 && (
          <Txt x={CX} y={1284} taille={34} couleur={M.gris} espace={3} opacity={egales * (1 - rd(t, T.carte - 0.3, T.carte))}>
            À CALORIES STRICTEMENT ÉGALES
          </Txt>
        )}
        {carte > 0 && (
          <g opacity={carte}>
            <Case x={CX} y={BANDES.socle.haut + 72} l={640} h={150} couleur={M.texte} />
            {/* Le libellé suit ce que Robin DIT — « après 6 ou 2 ans
                d'expérience » — et non ce que prévoyait le brief. Ses
                sous-titres sont à l'écran : une carte qui les contredirait se
                verrait immédiatement. */}
            <Txt x={CX} y={BANDES.socle.haut + 44} taille={40} couleur={M.texte} espace={3}>
              QUASI IDENTIQUE
            </Txt>
            <Txt x={CX} y={BANDES.socle.haut + 100} taille={34} couleur={M.gris} espace={3}>
              APRÈS 6 OU 2 ANS
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
