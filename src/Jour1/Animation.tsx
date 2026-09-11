import { useCurrentFrame, useVideoConfig } from "remotion";
import { M } from "../Muscle/Plan";
import {
  AMBRE,
  Case,
  CYAN,
  corps,
  EnTete,
  Etiquette,
  faireFenetre,
  melange,
  NEON,
  Panneau,
  Perso,
  Pointe,
  rd,
  SOCLE,
  Txt,
  CX,
} from "../commun/Motion";
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
 * Les règles de mise en page — bandes réservées, corps mesurés, respiration du
 * panneau — vivent dans src/commun/Motion.tsx, partagées avec le Jour 2 pour
 * qu'elles ne divergent pas d'une vidéo à l'autre. Ce qui reste ici est le
 * contenu : quoi montrer, et à quelle seconde.
 *
 * Règles tenues par la structure :
 *  · JAMAIS plus de trois blocs à l'écran. Un beat de dix secondes se joue en
 *    deux ou trois ÉCRANS successifs, pas en un empilement : les éléments du
 *    premier écran sortent pendant que ceux du second entrent, et la bascule
 *    dure six à huit dixièmes — assez pour se lire comme un mouvement ;
 *  · aucun chevauchement — chaque bloc a sa bande horizontale réservée, et les
 *    bandes sont séparées d'au moins 90 px ;
 *  · aucun texte coupé — tout libellé passe par `corps()`, qui rétrécit le
 *    corps jusqu'à ce que la ligne tienne dans la largeur utile ;
 *  · aucune apparition brutale — tout entre en fondu doublé d'un déplacement
 *    ou d'un changement d'échelle ;
 *  · aucun bruitage — rien à faire ici, le montage ne porte que la voix.
 */

const fenetre = faireFenetre(BEATS, FONDU);

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

  // ── B2 ────────────────────────────────────────────────────────────────
  const perso = rd(t, T.perso, T.perso + 0.5);
  const riz = rd(t, T.riz, T.riz + 0.5);
  const courbe = rd(t, T.courbe, T.courbe + 1.1);
  const insuline = rd(t, T.insuline, T.insuline + 0.5);
  const descente = rd(t, T.descente, T.descente + 1.2);
  const stockage = rd(t, T.stockage, T.stockage + 0.6);
  /**
   * La bascule de B2. Écran 1 : le personnage mange, la glycémie monte à sa
   * droite. Écran 2 : le personnage sort, la courbe prend toute la largeur, et
   * l'insuline entre au-dessus d'elle. Sans cette bascule, les cinq blocs du
   * beat cohabitaient dans une bande de 680 px.
   */
  const q2 = rd(t, T.insuline - 0.6, T.insuline + 0.1);
  const cx0 = melange(600, 190, q2);
  const cw = melange(400, 700, q2);
  const cbase = melange(1150, 1180, q2);
  const camp = melange(290, 400, q2);

  // Courbe de glycémie : monte, puis redescend quand l'insuline agit.
  const chemin = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const p = i / 48;
      const monte = Math.min(1, p / 0.45) * courbe;
      const baisse = Math.max(0, (p - 0.5) / 0.5) * 0.82 * descente;
      const v = Math.max(0, monte - baisse);
      pts.push(`${cx0 + p * cw},${cbase - v * camp}`);
    }
    return `M ${pts.join(" L ")}`;
  })();

  // ── B3 ────────────────────────────────────────────────────────────────
  const raccourci = rd(t, T.raccourci, T.raccourci + 0.5) * (1 - rd(t, T.dedouble - 0.5, T.dedouble));
  const plusInsuline = rd(t, T.plusInsuline, T.plusInsuline + 0.5);
  const plusGraisse = rd(t, T.plusGraisse, T.plusGraisse + 0.5);
  const dedouble = rd(t, T.dedouble, T.dedouble + 0.9) * (1 - rd(t, T.vraiFacteur - 0.5, T.vraiFacteur));
  const vraiFacteur = rd(t, T.vraiFacteur, T.vraiFacteur + 0.6) * (1 - rd(t, T.balance - 0.55, T.balance));
  const balance = rd(t, T.balance, T.balance + 0.8);

  // ── B4 ────────────────────────────────────────────────────────────────
  const jauge = rd(t, T.jauge, T.jauge + 0.5);
  const remplit = rd(t, T.remplit, T.remplit + 3.0);
  const dose = rd(t, T.dose, T.dose + 0.6) * (1 - rd(t, T.debordement - 0.4, T.debordement + 0.2));
  const debordement = rd(t, T.debordement, T.debordement + 0.9);
  const graisse = rd(t, T.graisse, T.graisse + 0.7);
  const marginal = rd(t, T.marginal, T.marginal + 0.6);
  /**
   * Abscisse de la jauge. Elle occupe d'abord le centre — sans quoi la moitié
   * droite du cadre resterait vide quatre secondes durant — puis se décale à
   * gauche pour laisser entrer le trop-plein et l'icône graisse. Le déplacement
   * tient aussi lieu de transition : rien n'apparaît sur un écran figé.
   */
  const gx = melange(CX, 340, debordement);

  // ── B5 ────────────────────────────────────────────────────────────────
  const meta = rd(t, T.meta, T.meta + 0.6);
  const groupes = rd(t, T.groupes, T.groupes + 0.7);
  const essais = rd(t, T.essais, T.essais + 0.5);
  const personnes = rd(t, T.personnes, T.personnes + 0.5);
  const etiquettes = rd(t, T.etiquettes, T.etiquettes + 0.6);
  const egales = rd(t, T.egales, T.egales + 0.6);
  const barres = rd(t, T.barres, T.barres + 1.2);
  const carte = rd(t, T.carte, T.carte + 0.6);
  /**
   * Les deux bascules du beat 5. `p2` fait monter les chiffres en en-tête pour
   * libérer la scène ; `p3` remplace les groupes par les barres. Elles durent
   * sept dixièmes — assez pour se lire comme un mouvement, pas comme un
   * changement d'écran.
   */
  const p2 = rd(t, T.groupes - 0.5, T.groupes + 0.2);
  const p3 = rd(t, T.barres - 0.5, T.barres + 0.2);

  // ── B6 ────────────────────────────────────────────────────────────────
  const haltere = rd(t, T.haltere, T.haltere + 0.5);
  const intensite = rd(t, T.intensite, T.intensite + 0.6);
  const chute = rd(t, T.chute, T.chute + 2.2);
  const duree = rd(t, T.duree, T.duree + 0.6);

  return (
    <>
      {/* ══ B2 — ce que font les glucides ══════════════════════════════ */}
      {/* Deux écrans. Le premier montre la cause — on mange, ça monte — avec le
          personnage à gauche et la courbe à droite. Le second sort le
          personnage, étale la courbe sur toute la largeur et fait entrer
          l'insuline au-dessus : trois blocs maximum à tout instant. */}
      <Panneau e={b2} t={t}>
        <EnTete opacity={riz * (1 - q2)}>TU MANGES DES GLUCIDES</EnTete>
        <EnTete opacity={q2}>TON CORPS RÉPOND</EnTete>

        {/* Écran 1 — le personnage et son assiette. Le bonhomme fait 11 × 15
            pixels à 25,3 px, soit 278 × 380 centrés en 1010 : il occupe
            y 820..1200 et laisse 130 px sous l'étiquette GLUCIDES. */}
        {perso > 0 && <Perso x={300} y={1010} k={2.3} opacity={perso * (1 - q2)} />}
        {riz > 0 && (
          <g transform={`translate(0 ${melange(30, 0, riz)})`}>
            <Etiquette x={300} y={640} l={290} h={108} couleur={AMBRE} vise={36} espace={3} opacity={riz * (1 - q2)}>
              GLUCIDES
            </Etiquette>
          </g>
        )}

        {/* La courbe traverse les deux écrans : c'est elle qui fait le lien. */}
        {courbe > 0 && (
          <>
            <line x1={cx0 - 24} y1={cbase} x2={cx0 + cw + 24} y2={cbase} stroke={M.noir} strokeWidth={4} />
            <path d={chemin} fill="none" stroke={NEON} strokeWidth={10} strokeLinecap="round" opacity={courbe} />
            <Txt x={cx0 + cw / 2} y={cbase + 74} taille={30} couleur={M.gris} espace={4} opacity={courbe}>
              GLYCÉMIE
            </Txt>
          </>
        )}

        {/* Écran 2 — l'insuline, et le trait qui la relie à la descente. */}
        {insuline > 0 && (
          <g transform={`translate(0 ${melange(-30, 0, insuline)})`}>
            <Etiquette x={CX} y={620} l={330} h={112} couleur={CYAN} vise={40} espace={3} opacity={insuline}>
              INSULINE
            </Etiquette>
          </g>
        )}
        {descente > 0 && (
          <g opacity={descente}>
            <line x1={CX} y1={686} x2={CX} y2={melange(686, 754, descente)} stroke={CYAN} strokeWidth={6} strokeLinecap="round" />
            <Pointe x={CX} y={766} couleur={CYAN} opacity={rd(descente, 0.6, 1)} />
          </g>
        )}
        {stockage > 0 && (
          <g transform={`translate(0 ${melange(26, 0, stockage)})`}>
            <Etiquette x={CX} y={SOCLE - 10} l={400} h={120} couleur={M.texte} vise={42} espace={3} opacity={stockage}>
              STOCKAGE
            </Etiquette>
          </g>
        )}
      </Panneau>

      {/* ══ B3 — le raccourci, puis sa réfutation ═════════════════════ */}
      {/* Quatre écrans, dans l'ordre où Robin les énonce. Le premier — « là est
          né le raccourci » — n'existait pas au brief : c'est une idée que Robin
          a ajoutée en tournant, et elle a besoin de sa propre image, sans quoi
          l'animation illustrerait une phrase qu'il ne dit pas. */}
      <Panneau e={b3} t={t}>
        {raccourci > 0.02 ? (
          <>
            <EnTete opacity={raccourci}>LÀ EST NÉ LE RACCOURCI</EnTete>
            {plusInsuline > 0 && (
              <g transform={`translate(0 ${melange(-36, 0, plusInsuline)})`}>
                <Etiquette
                  x={CX}
                  y={720}
                  l={600}
                  h={144}
                  couleur={CYAN}
                  vise={50}
                  espace={3}
                  opacity={plusInsuline * raccourci}
                >
                  + D'INSULINE
                </Etiquette>
              </g>
            )}
            {plusGraisse > 0 && (
              <g opacity={plusGraisse * raccourci}>
                <line
                  x1={CX}
                  y1={812}
                  x2={CX}
                  y2={melange(812, 1006, plusGraisse)}
                  stroke={M.gris}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <Pointe x={CX} y={1018} couleur={M.gris} opacity={rd(plusGraisse, 0.7, 1)} />
                <g transform={`translate(0 ${melange(36, 0, plusGraisse)})`}>
                  <Etiquette x={CX} y={1180} l={600} h={144} couleur={AMBRE} vise={50} espace={3}>
                    + DE GRAISSE
                  </Etiquette>
                </g>
              </g>
            )}
          </>
        ) : vraiFacteur > 0.02 ? (
          /* Un écran d'un seul mot : après trois écrans chargés, le blanc
             typographique fait le travail. Le corps est mesuré, plus jamais
             posé en dur — « LE VRAI FACTEUR » à 118 px demandait 1150 px de
             large dans un cadre de 1080, et la dernière lettre sortait. */
          <Txt
            x={CX}
            y={960}
            taille={melange(corps("LE VRAI FACTEUR", 96, 4) - 8, corps("LE VRAI FACTEUR", 96, 4), vraiFacteur)}
            couleur={NEON}
            espace={4}
            opacity={vraiFacteur}
          >
            LE VRAI FACTEUR
          </Txt>
        ) : balance > 0.02 ? (
          <>
            <EnTete opacity={balance}>PEU IMPORTE LA SOURCE</EnTete>
            {[
              { x: 245, l: "GLUCIDES", c: AMBRE },
              { x: CX, l: "LIPIDES", c: CYAN },
              { x: 835, l: "PROTÉINES", c: NEON },
            ].map((p, i) => {
              const e = rd(balance, i * 0.14, i * 0.14 + 0.45);
              return (
                <g key={p.l}>
                  <g transform={`translate(0 ${melange(-170, 0, e)})`}>
                    <Etiquette x={p.x} y={720} l={220} h={104} couleur={p.c} vise={30} espace={2} opacity={e}>
                      {p.l}
                    </Etiquette>
                  </g>
                  {/* Les trois sources convergent vers le même total : le trait
                      dit l'argument mieux qu'une ligne de texte de plus. */}
                  <line
                    x1={p.x}
                    y1={772}
                    x2={CX}
                    y2={1090}
                    stroke={M.noir}
                    strokeWidth={4}
                    opacity={rd(balance, 0.4, 0.85)}
                  />
                </g>
              );
            })}
            <g opacity={rd(balance, 0.5, 0.95)}>
              <Etiquette x={CX} y={1180} l={780} h={148} couleur={M.texte} vise={44} espace={3}>
                BILAN CALORIQUE TOTAL
              </Etiquette>
            </g>
          </>
        ) : (
          <>
            <EnTete opacity={dedouble}>ELLE STOCKE LES DEUX</EnTete>
            {[
              { x: melange(CX, 280, dedouble), l: "GLYCOGÈNE", c: NEON },
              { x: melange(CX, 800, dedouble), l: "GRAISSE", c: AMBRE },
            ].map((p) => (
              <Etiquette
                key={p.l}
                x={p.x}
                y={980}
                l={390}
                h={210}
                couleur={p.c}
                vise={38}
                espace={2}
                opacity={dedouble}
              >
                {p.l}
              </Etiquette>
            ))}
            <Txt x={CX} y={1330} taille={36} couleur={M.gris} espace={4} opacity={rd(dedouble, 0.6, 1)}>
              À PARTS ÉGALES
            </Txt>
          </>
        )}
      </Panneau>

      {/* ══ B4 — où vont tes glucides ══════════════════════════════════ */}
      {/* Deux écrans, articulés par le déplacement de la jauge. Tant qu'elle se
          remplit elle est seule et centrée ; quand elle déborde elle glisse à
          gauche et libère la moitié droite pour le trop-plein. */}
      <Panneau e={b4} t={t}>
        <EnTete opacity={jauge * (1 - debordement)}>D'ABORD LE RÉSERVOIR</EnTete>
        <EnTete opacity={debordement}>SEULEMENT ENSUITE L'EXCÈS</EnTete>

        {jauge > 0 && (
          <g opacity={jauge}>
            <rect x={gx - 115} y={620} width={230} height={620} fill="none" stroke={M.noir} strokeWidth={5} />
            <rect x={gx - 115} y={1240 - 620 * remplit} width={230} height={620 * remplit} fill={NEON} opacity={0.9} />
            <Txt x={gx} y={1320} taille={32} couleur={NEON} espace={3}>
              GLYCOGÈNE
            </Txt>
          </g>
        )}
        {dose > 0 && (
          <Txt
            x={gx}
            y={melange(1408, 1398, dose)}
            taille={corps("TON CARBURANT À L'ENTRAÎNEMENT", 32, 3, 820)}
            couleur={M.gris}
            espace={3}
            opacity={dose}
          >
            TON CARBURANT À L'ENTRAÎNEMENT
          </Txt>
        )}

        {/* Le trop-plein : il sort par le haut de la jauge, passe au-dessus et
            redescend vers l'icône graisse. Le tracé se dessine avec la
            transition, il n'apparaît pas d'un coup. */}
        {debordement > 0 && (
          <g opacity={debordement}>
            <path
              d={`M ${gx + 115} ${melange(680, 640, debordement)} L ${melange(gx + 115, 800, debordement)} 640 L ${melange(gx + 115, 800, debordement)} 880`}
              fill="none"
              stroke={AMBRE}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Pointe x={800} y={892} couleur={AMBRE} opacity={rd(debordement, 0.7, 1)} />
          </g>
        )}
        {graisse > 0 && (
          <g opacity={graisse}>
            <Case
              x={800}
              y={1000}
              l={melange(96, 156, graisse)}
              h={melange(64, 104, graisse)}
              couleur={AMBRE}
            />
            <Txt x={800} y={1110} taille={28} couleur={AMBRE} espace={2}>
              GRAISSE
            </Txt>
          </g>
        )}
        {marginal > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, marginal)}
            taille={corps("MARGINAL EN PRATIQUE", 46, 3)}
            couleur={M.texte}
            espace={3}
            opacity={marginal}
          >
            MARGINAL EN PRATIQUE
          </Txt>
        )}
      </Panneau>

      {/* ══ B5 — la preuve ═════════════════════════════════════════════ */}
      {/* Trois écrans qui se succèdent, et non un empilement. La version
          précédente montrait en même temps les deux chiffres, les deux groupes,
          leurs étiquettes, la mention « calories égales », les deux barres et
          la carte : sept blocs pour une bande de 680 px, avec des jours de
          quarante pixels entre eux. Ici les chiffres montent en en-tête pour
          libérer la scène, puis les groupes cèdent la place aux barres. */}
      <Panneau e={b5} t={t}>
        {/* Temps 1 — les chiffres, seuls et en grand. */}
        <Txt x={CX} y={700} taille={38} couleur={M.gris} espace={5} opacity={meta * (1 - p2)}>
          UNE MÉTA-ANALYSE
        </Txt>
        <Txt
          x={CX}
          y={melange(890, 262, p2)}
          taille={melange(96, 46, p2)}
          couleur={M.texte}
          espace={2}
          opacity={essais}
        >
          19 ESSAIS
        </Txt>
        <Txt
          x={CX}
          y={melange(1060, 336, p2)}
          taille={melange(52, 32, p2)}
          couleur={M.gris}
          espace={3}
          opacity={personnes}
        >
          3200+ PERSONNES
        </Txt>

        {/* Temps 2 — les deux groupes, chacun dans sa moitié. */}
        {[
          { x: 285, c: NEON, l: "PAUVRE EN", l2: "GLUCIDES", h: 300 },
          { x: 795, c: CYAN, l: "RÉGIME", l2: "ÉQUILIBRÉ", h: 288 },
        ].map((g, gi) => (
          <g key={g.l2}>
            {groupes > 0 &&
              [0, 1, 2, 3, 4, 5].map((i) => {
                const e = rd(groupes, (gi * 6 + i) * 0.05, (gi * 6 + i) * 0.05 + 0.32);
                return e <= 0 ? null : (
                  <Perso
                    key={i}
                    x={g.x - 96 + (i % 3) * 96}
                    y={630 + Math.floor(i / 3) * 150}
                    k={0.7}
                    couleur={g.c}
                    opacity={e * 0.85 * (1 - p3)}
                  />
                );
              })}
            {etiquettes > 0 && (
              <g opacity={etiquettes * (1 - p3)}>
                <Txt x={g.x} y={940} taille={30} couleur={g.c} espace={2}>
                  {g.l}
                </Txt>
                <Txt x={g.x} y={986} taille={30} couleur={g.c} espace={2}>
                  {g.l2}
                </Txt>
              </g>
            )}

            {/* Temps 3 — les barres, étiquetées au-dessus pour dégager le socle. */}
            {barres > 0 && (
              <g opacity={barres}>
                <Txt x={g.x} y={790} taille={30} couleur={g.c} espace={2}>
                  {g.l}
                </Txt>
                <Txt x={g.x} y={838} taille={30} couleur={g.c} espace={2}>
                  {g.l2}
                </Txt>
                <rect
                  x={g.x - 78}
                  y={1250 - g.h * barres}
                  width={156}
                  height={g.h * barres}
                  fill={g.c}
                  opacity={0.9}
                />
              </g>
            )}
          </g>
        ))}
        {barres > 0 && (
          <line x1={150} y1={1250} x2={930} y2={1250} stroke={M.noir} strokeWidth={4} opacity={barres} />
        )}

        {/* La mention qui porte tout l'argument de l'étude : elle sort avant que
            la carte n'entre, les deux ne se croisent jamais dans le socle. */}
        {egales > 0 && (
          <Txt
            x={CX}
            y={1200}
            taille={corps("À CALORIES STRICTEMENT ÉGALES", 36, 3, 880)}
            couleur={M.texte}
            espace={3}
            opacity={egales * (1 - p3)}
          >
            À CALORIES STRICTEMENT ÉGALES
          </Txt>
        )}

        {carte > 0 && (
          <g opacity={carte} transform={`translate(0 ${melange(24, 0, carte)})`}>
            <Case x={CX} y={1470} l={720} h={230} couleur={M.texte} />
            {/* Le libellé suit ce que Robin DIT — ses sous-titres sont
                incrustés, une carte qui les contredirait se verrait. Il dit
                « quasi identique… après 6 ou 2 ans » : ce sont bien SIX MOIS et
                DEUX ANS, et les deux jalons sont marqués séparément pour que le
                « six » ne se lise pas comme six ans. */}
            <Txt x={CX} y={1404} taille={corps("QUASI IDENTIQUE", 44, 3, 660)} couleur={M.texte} espace={3}>
              QUASI IDENTIQUE
            </Txt>
            <Etiquette x={410} y={1512} l={244} h={78} couleur={M.texte} vise={30} espace={2} opacity={rd(carte, 0.3, 0.8)}>
              6 MOIS
            </Etiquette>
            <Etiquette x={670} y={1512} l={244} h={78} couleur={M.texte} vise={30} espace={2} opacity={rd(carte, 0.5, 1)}>
              2 ANS
            </Etiquette>
          </g>
        )}
      </Panneau>

      {/* ══ B6 — la conséquence ════════════════════════════════════════ */}
      <Panneau e={b6} t={t}>
        <EnTete opacity={haltere}>MAIS LES COUPER TROP</EnTete>
        {haltere > 0 && (
          <g opacity={haltere}>
            <g transform={`translate(300 940) scale(${melange(1, 0.84, chute)})`} opacity={melange(1, 0.38, chute)}>
              <rect x={-76} y={-15} width={152} height={30} fill={NEON} />
              <rect x={-128} y={-60} width={44} height={120} fill={NEON} />
              <rect x={84} y={-60} width={44} height={120} fill={NEON} />
            </g>
            <Txt x={300} y={1090} taille={28} couleur={M.gris} espace={3} opacity={melange(1, 0.5, chute)}>
              À L'ENTRAÎNEMENT
            </Txt>
          </g>
        )}
        {intensite > 0 && (
          <g opacity={intensite}>
            <rect x={710} y={620} width={170} height={620} fill="none" stroke={M.noir} strokeWidth={5} />
            {(() => {
              const h = melange(560, 180, chute);
              return <rect x={710} y={1240 - h} width={170} height={h} fill={chute > 0.5 ? AMBRE : NEON} opacity={0.9} />;
            })()}
            <Txt x={795} y={1320} taille={30} couleur={M.gris} espace={3}>
              INTENSITÉ
            </Txt>
          </g>
        )}
        {duree > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, duree)}
            taille={corps("ET TES RÉSULTATS AVEC", 46, 3)}
            couleur={AMBRE}
            espace={3}
            opacity={duree}
          >
            ET TES RÉSULTATS AVEC
          </Txt>
        )}
      </Panneau>
    </>
  );
};
