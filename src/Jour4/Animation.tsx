import { useCurrentFrame, useVideoConfig } from "remotion";
import { M } from "../Muscle/Plan";
import {
  AMBRE,
  Case,
  corps,
  CX,
  CYAN,
  EnTete,
  Etiquette,
  faireTransition,
  Jauge,
  melange,
  NEON,
  Panneau,
  Perso,
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, CAMERA, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 4, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Comme au Jour 3, il n'y a pas de tournage : l'export livré est un fond noir
 * avec les sous-titres. Le hook et le CTA sont donc animés eux aussi, et
 * `CAMERA` dans reperes.ts les rend à la caméra en une ligne le jour venu.
 *
 * Deux fils tiennent la vidéo entière :
 *
 *  · LA BANDE HORAIRE. Posée au beat 2 sous la forme de la fenêtre étroite du
 *    mythe, barrée au beat 5, puis ÉTIRÉE jusqu'à 24 h au beat 6. C'est le même
 *    objet à la même place, et c'est lui qui raconte la démonstration ;
 *  · LES DEUX COURBES DE RÉPONSE du beat 8, qui restent à l'écran vingt et une
 *    secondes pendant que l'accent passe de la première séance au pratiquant
 *    expérimenté. Le brief demande que ce passage n'ait AUCUNE coupure franche
 *    puisqu'il est dit d'un seul tenant : il est donc fait d'un seul panneau et
 *    de quatre écrans qui se transforment l'un dans l'autre.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);
const aLaCamera = (id: string) => CAMERA.includes(id);

// ── Repères internes, en secondes de l'export d'origine ──────────────────
/**
 * Chaque valeur est LUE sur les sous-titres incrustés. Le commentaire cite le
 * mot visé et l'instant où il s'affiche. `mappe()` les transpose ensuite dans
 * le montage aux blancs resserrés, une fois pour toutes.
 */
const RUSH = {
  // ── B1 — 0 → 5,30 : le hook
  trente: 0.5, // « tu n'as pas 30 minutes chrono »      0,7 → 1,7
  proteines: 2.6, // « pour manger tes protéines »       2,7 → 3,2
  mythe: 3.4, // « c'est un mythe »                      3,5 → 3,8

  // ── B2 — 5,30 → 13,60 : d'où vient le mythe
  idee: 5.7, // « l'idée vient d'études »                5,7 → 6,2
  entrainement: 7.2, // « qu'après l'entraînement »      7,2 → 7,5
  sensible: 8.3, // « le muscle est plus sensible »      8,4 → 9,3
  limite: 9.8, // « pendant un temps limité »            9,9 → 10,6
  fenetre: 11.7, // « d'une fenêtre à ne pas rater »     11,8 → 13,1

  // ── B3 — 13,60 → 24,70 : le muscle full
  prise: 13.8, // « chaque prise de protéines »          13,8 → 14,7
  declenche: 15.1, // « déclenche la construction »      15,1 → 16,2
  duree: 18.1, // « environ 1h30 à 3h »                  18,2 → 19,5
  refractaire: 20.2, // « puis ton muscle devient réfractaire » 20,2 → 21,2
  acides: 22.2, // « encore des acides aminés disponibles » 22,2 → 24,3

  // ── B4 — 24,70 → 30,05 : plusieurs prises réparties
  explique: 24.8, // « c'est ce qui explique pourquoi »  24,8 → 25,8
  plusieurs: 26.0, // « plusieurs prises bien réparties » 26,1 → 27,1
  comptent: 27.7, // « comptent plus qu'une seule »      27,8 → 28,8

  // ── B5 — 30,05 → 36,40 : aucune preuve
  revue: 30.4, // « une revue complète de la littérature » 30,4 → 32,3
  aucune: 32.8, // « n'a trouvé aucune preuve solide »   32,9 → 34,2
  barre: 34.4, // « d'une fenêtre stricte de 30 minutes » 34,5 → 35,8

  // ── B6 — 36,40 → 42,25 : jusqu'à 24 h
  jusqua: 36.6, // « jusqu'à 24h »                       36,7 → 36,9
  etire: 37.6, // la bande s'étire                       37,7 → 37,9
  habitude: 40.6, // « plus sensible qu'd'habitude »     40,2 → 41,5

  // ── B7 — 42,25 → 54,10 : la méta-analyse
  meta: 42.6, // « une méta-analyse »                    42,6 → 42,8
  petit: 44.1, // « un petit effet du timing »           44,2 → 45,2
  mais: 46.8, // « mais cet effet s'explique »           46,9 → 47,6
  total: 48.8, // « un apport protéique total plus élevé » 48,9 → 50,7
  pasTiming: 52.7, // « pas le timing en lui-même »      52,8 → 53,7

  // ── B8 — 54,10 → 79,50 : ton niveau change la donne (un seul beat)
  autreEtude: 54.2, // « on peut citer une autre étude » 54,2 → 54,8
  pratiquants: 55.8, // « des pratiquants sur 10 semaines » 55,9 → 57,2
  reponse: 58.1, // « la réponse de synthèse musculaire » 58,2 → 59,4
  premiere: 62.6, // « lors de leur toute 1ère séance »  62,7 → 63,8
  plusTard: 64.2, // « que 3 ou 10 semaines plus tard »  64,3 → 65,7
  debutes: 66.2, // « si tu débutes »                    66,2 → 66,7
  large: 67.2, // « naturellement plus large »           67,3 → 69,8
  compteMoins: 70.2, // « le timing compte encore moins » 70,3 → 71,6
  experimente: 72.6, // « plus tu deviens expérimenté »  72,6 → 73,3
  raccourcit: 74.3, // « cette réponse se raccourcit »   74,4 → 75,2
  jamais: 76.1, // « sans jamais redevenir aussi stricte » 76,2 → 78,8

  // ── B9 — 79,50 → 88,30 : quand le timing garde un intérêt
  leger: 79.8, // « garde un léger intérêt »             79,8 → 81,3
  jeun: 81.6, // « si tu es à jeun depuis longtemps »    81,7 → 82,9
  seances: 83.1, // « plusieurs séances la journée »     83,2 → 84,8
  pointu: 85.3, // « ton objectif de performance pointu » 85,4 → 87,7

  // ── B10 — 88,30 → fin : le CTA
  envoie: 88.6, // « envoie-moi TIMING en DM »           88,6 → 89,6
  discute: 89.9, // « qu'on en discute »                 89,9 → 90,8
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

/**
 * L'axe du temps après la séance, partagé par les beats 2, 5 et 6.
 *
 * Même origine, même longueur, même hauteur aux trois endroits : c'est ce qui
 * fait que la fenêtre étroite du mythe, sa réfutation puis son étirement à 24 h
 * se lisent comme UN seul objet qui évolue, et non comme trois dessins voisins.
 */
const AXE = { x0: 210, x1: 930, y: 1060, h: 124 };
/** Largeur minimale lisible pour « 30 min » : à l'échelle, ce serait 15 px. */
const MYTHE_L = 74;

const Haltere: React.FC<{ x: number; y: number; k?: number; opacity?: number }> = ({ x, y, k = 1, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x - 84 * k} y={y - 17 * k} width={168 * k} height={34 * k} fill={NEON} />
    <rect x={x - 140 * k} y={y - 67 * k} width={48 * k} height={134 * k} fill={NEON} />
    <rect x={x + 92 * k} y={y - 67 * k} width={48 * k} height={134 * k} fill={NEON} />
  </g>
);

/**
 * Une courbe de réponse : elle monte vite après la séance puis redescend.
 *
 * `ampleur` en règle la hauteur et `etendue` la durée — les deux paramètres du
 * beat 8, où la réponse du débutant est à la fois plus forte et plus longue que
 * celle du pratiquant expérimenté.
 */
const reponse = (x0: number, largeur: number, base: number, ampleur: number, etendue: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const p = i / 64;
    const v = Math.exp(-((p / etendue) ** 1.7)) * (1 - Math.exp(-p * 26));
    pts.push(`${x0 + p * largeur},${base - v * ampleur}`);
  }
  return `M ${pts.join(" L ")}`;
};

/** La même courbe, refermée sur sa base : l'aire de la fenêtre de sensibilité. */
const aire = (x0: number, largeur: number, base: number, ampleur: number, etendue: number, avance: number) => {
  const n = Math.max(2, Math.round(64 * avance));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = i / 64;
    const v = Math.exp(-((p / etendue) ** 1.7)) * (1 - Math.exp(-p * 26));
    pts.push(`${x0 + p * largeur},${base - v * ampleur}`);
  }
  return `M ${x0},${base} L ${pts.join(" L ")} L ${x0 + (n / 64) * largeur},${base} Z`;
};

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b = Object.fromEntries(BEATS.map((x) => [x.id, transition(t, x.id)])) as Record<
    string,
    { e: number; dy: number; k: number }
  >;
  if (Math.max(...BEATS.map((x) => b[x.id].e)) <= 0) return null;

  /**
   * Un libellé de socle cède la place au suivant avant que celui-ci n'entre.
   *
   * Deux textes en fondu croisé au MÊME point ne se lisent pas comme un
   * remplacement mais comme une superposition. Le sortant part donc quatre
   * dixièmes avant l'arrivée du suivant, et l'écran est brièvement nu entre
   * les deux — ce qui ne se voit pas, alors que le chevauchement, si.
   */
  const cede = (quand: number) => 1 - rd(t, quand - 0.55, quand - 0.15);

  /** L'en-tête d'un beat monte AVEC son panneau, jamais après. */
  const ouverture = (id: string) => {
    const d = BEATS.find((x) => x.id === id)!.debut;
    return rd(t, d - FONDU, d + 0.25);
  };

  // ── B1 ────────────────────────────────────────────────────────────────
  const trente = rd(t, T.trente, T.trente + 0.6);
  const proteines = rd(t, T.proteines, T.proteines + 0.6);
  const barreMythe = rd(t, T.mythe, T.mythe + 0.7);
  const mythe = rd(t, T.mythe + 0.3, T.mythe + 0.9);

  // ── B2 ────────────────────────────────────────────────────────────────
  const idee = rd(t, T.idee, T.idee + 0.6);
  const entrainement = rd(t, T.entrainement, T.entrainement + 0.6);
  const sensible = rd(t, T.sensible, T.sensible + 1.2);
  const limite = rd(t, T.limite, T.limite + 0.6);
  const q2 = rd(t, T.fenetre - 0.5, T.fenetre + 0.2);
  const fenetre = rd(t, T.fenetre, T.fenetre + 0.8);

  // ── B3 ────────────────────────────────────────────────────────────────
  const prise = rd(t, T.prise, T.prise + 0.6);
  const construit = rd(t, T.declenche, T.declenche + 3.4) * 0.74;
  const duree = rd(t, T.duree, T.duree + 0.6);
  const refractaire = rd(t, T.refractaire, T.refractaire + 0.7);
  const acides = rd(t, T.acides, T.acides + 0.8);

  // ── B4 ────────────────────────────────────────────────────────────────
  const seule = rd(t, T.explique + 0.3, T.explique + 1.1);
  const plusieurs = rd(t, T.plusieurs, T.plusieurs + 1.0);
  const comptent = rd(t, T.comptent, T.comptent + 0.7);

  // ── B5 ────────────────────────────────────────────────────────────────
  const revue = rd(t, T.revue + 0.2, T.revue + 1.6);
  const aucune = rd(t, T.aucune, T.aucune + 0.7);
  const barre = rd(t, T.barre, T.barre + 0.8);

  // ── B6 ────────────────────────────────────────────────────────────────
  const jusqua = rd(t, T.jusqua, T.jusqua + 0.6);
  const etire = rd(t, T.etire, T.etire + 1.6);
  const habitude = rd(t, T.habitude, T.habitude + 0.7);

  // ── B7 ────────────────────────────────────────────────────────────────
  const petit = rd(t, T.petit, T.petit + 0.9);
  const q7 = rd(t, T.mais - 0.45, T.mais + 0.25);
  const cadres7 = rd(t, T.mais, T.mais + 0.7);
  const timing7 = rd(t, T.mais + 0.5, T.mais + 1.4) * 0.16;
  const total7 = rd(t, T.total, T.total + 1.3) * 0.88;
  const chronometraient = rd(t, T.total + 1.6, T.total + 2.4);
  const pasTiming = rd(t, T.pasTiming, T.pasTiming + 0.7);

  // ── B8 ────────────────────────────────────────────────────────────────
  const silhouettes = rd(t, T.autreEtude, T.autreEtude + 1.0);
  const pratiquants = rd(t, T.pratiquants, T.pratiquants + 1.0);
  /** Les trois bascules internes. Aucune ne change de panneau : les deux
      courbes restent en place, seul l'accent se déplace. */
  const s2 = rd(t, T.reponse - 0.5, T.reponse + 0.3);
  const s3 = rd(t, T.debutes - 0.5, T.debutes + 0.3);
  const s4 = rd(t, T.experimente - 0.5, T.experimente + 0.3);
  const courbe1 = rd(t, T.reponse, T.reponse + 1.2);
  const courbe2 = rd(t, T.premiere + 0.4, T.plusTard + 1.0);
  const forte = rd(t, T.reponse + 1.2, T.reponse + 1.9);
  const longue = rd(t, T.premiere - 0.9, T.premiere - 0.2);
  /** L'aire sous la courbe se remplit de gauche à droite : c'est la « fenêtre »
      dont parle Robin, et c'est elle qu'on compare d'un niveau à l'autre. */
  const aireLarge = rd(t, T.large + 0.45, T.large + 2.65);
  const aireCourte = rd(t, T.experimente - 1.2, T.experimente + 1.2);
  const large = rd(t, T.large, T.large + 0.8);
  const compteMoins = rd(t, T.compteMoins, T.compteMoins + 0.7);
  const raccourcit = rd(t, T.raccourcit, T.raccourcit + 0.7);
  const jamais = rd(t, T.jamais, T.jamais + 0.8);
  /** Le rappel des 30 minutes, à l'échelle des deux courbes. */
  const rappel30 = rd(t, T.jamais + 0.9, T.jamais + 2.1);

  // ── B9 ────────────────────────────────────────────────────────────────
  const slots = rd(t, T.leger + 0.4, T.leger + 1.2);
  const cas = [
    { l: "À JEUN DEPUIS LONGTEMPS", e: rd(t, T.jeun, T.jeun + 0.6), y: 820, c: CYAN },
    { l: "PLUSIEURS SÉANCES DANS LA JOURNÉE", e: rd(t, T.seances, T.seances + 0.6), y: 1030, c: NEON },
    { l: "OBJECTIF DE PERFORMANCE POINTU", e: rd(t, T.pointu, T.pointu + 0.6), y: 1240, c: AMBRE },
  ];
  const corpsCas = Math.min(...cas.map((c) => corps(c.l, 42, 3, 720)));

  // ── B10 ───────────────────────────────────────────────────────────────
  const envoie = rd(t, T.envoie, T.envoie + 0.6);
  const discute = rd(t, T.discute, T.discute + 0.6);

  /** L'axe nu, partagé par les beats 2, 5 et 6. */
  const rail = (opacity: number) => (
    <g opacity={opacity}>
      <line x1={150} y1={AXE.y} x2={AXE.x1} y2={AXE.y} stroke={M.gris} strokeWidth={4} />
      <line x1={AXE.x0} y1={AXE.y - AXE.h - 20} x2={AXE.x0} y2={AXE.y + 26} stroke={M.gris} strokeWidth={4} />
      <Txt x={AXE.x0} y={AXE.y + 74} taille={28} couleur={M.gris} espace={3}>
        TA SÉANCE
      </Txt>
    </g>
  );

  return (
    <>
      {/* ══ B1 — le hook ═══════════════════════════════════════════════ */}
      {/* Animé faute de tournage. Ajouter "B1" à CAMERA le fait disparaître. */}
      {!aLaCamera("B1") && (
        <Panneau {...b.B1} t={t}>
          <EnTete opacity={ouverture("B1")}>APRÈS TA SÉANCE</EnTete>
          {trente > 0 && (
            <g opacity={trente} transform={`translate(0 ${melange(26, 0, trente)})`}>
              <Txt x={CX} y={860} taille={corps("30 MINUTES", 152, 6)} couleur={M.texte} espace={6}>
                30 MINUTES
              </Txt>
              <Txt x={CX} y={1010} taille={corps("CHRONO", 152, 6)} couleur={M.corail} espace={6}>
                CHRONO
              </Txt>
            </g>
          )}
          {proteines > 0 && (
            <Txt x={CX} y={1190} taille={corps("POUR TES PROTÉINES", 46, 4)} couleur={M.gris} espace={4} opacity={proteines}>
              POUR TES PROTÉINES
            </Txt>
          )}
          {/* Le trait barre les deux lignes d'un coup : c'est le geste qui dit
              « mythe », le mot ne fait que le confirmer. */}
          {barreMythe > 0 &&
            [860, 1010].map((y, i) => (
              <line
                key={y}
                x1={170}
                y1={y}
                x2={melange(170, 910, rd(barreMythe, i * 0.22, i * 0.22 + 0.7))}
                y2={y}
                stroke={M.corail}
                strokeWidth={13}
                strokeLinecap="round"
              />
            ))}
          {mythe > 0 && (
            <Txt
              x={CX}
              y={melange(SOCLE + 10, SOCLE, mythe)}
              taille={corps("C'EST UN MYTHE", 62, 4)}
              couleur={M.corail}
              espace={4}
              opacity={mythe}
            >
              C'EST UN MYTHE
            </Txt>
          )}
        </Panneau>
      )}

      {/* ══ B2 — d'où vient le mythe ═══════════════════════════════════ */}
      <Panneau {...b.B2} t={t}>
        <EnTete opacity={ouverture("B2") * (1 - q2)}>CE QUE MONTRENT LES ÉTUDES</EnTete>
        <EnTete opacity={q2}>D'OÙ L'IDÉE D'UNE FENÊTRE</EnTete>

        {idee > 0 && (
          <g opacity={(1 - q2) * idee}>
            <Perso x={300} y={820} k={1.9} couleur={NEON} />
            <Haltere x={300} y={1080} k={0.62} opacity={entrainement} />
            <Txt x={300} y={1210} taille={30} couleur={M.gris} espace={3} opacity={entrainement}>
              L'ENTRAÎNEMENT
            </Txt>
          </g>
        )}
        {sensible > 0 && (
          <g opacity={1 - q2}>
            <Jauge x={790} l={240} haut={640} bas={1180} part={sensible} couleur={CYAN} libelle="SENSIBILITÉ AUX NUTRIMENTS" />
          </g>
        )}
        {limite > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, limite)}
            taille={corps("PENDANT UN TEMPS LIMITÉ", 50, 3)}
            couleur={M.texte}
            espace={3}
            opacity={limite * (1 - q2)}
          >
            PENDANT UN TEMPS LIMITÉ
          </Txt>
        )}

        {/* La fenêtre du mythe. Elle est posée ici, barrée au beat 5, étirée au
            beat 6 : un seul objet pour toute la démonstration. */}
        {q2 > 0 && (
          <g opacity={q2}>
            {rail(1)}
            <rect x={AXE.x0} y={AXE.y - AXE.h} width={MYTHE_L * fenetre} height={AXE.h} fill={AMBRE} opacity={0.9} />
            <Txt x={AXE.x0 + MYTHE_L + 40} y={AXE.y - AXE.h / 2} taille={40} couleur={AMBRE} espace={3} ancre="start" opacity={fenetre}>
              30 MIN
            </Txt>
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("À NE SURTOUT PAS RATER", 52, 3)}
              couleur={M.texte}
              espace={3}
              opacity={rd(fenetre, 0.4, 0.9)}
            >
              À NE SURTOUT PAS RATER
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B3 — le muscle full ════════════════════════════════════════ */}
      {/* La jauge de construction est le seul objet du beat : elle monte, elle
          plafonne, et les acides aminés continuent d'arriver à côté sans qu'elle
          reparte. Le plafond EST l'argument. */}
      <Panneau {...b.B3} t={t}>
        <EnTete opacity={ouverture("B3") * (1 - refractaire)}>CHAQUE PRISE DE PROTÉINES</EnTete>
        <EnTete opacity={refractaire}>PUIS LE MUSCLE DEVIENT</EnTete>

        {prise > 0 && (
          <g opacity={prise * (1 - refractaire)} transform={`translate(0 ${melange(-24, 0, prise)})`}>
            <Etiquette x={CX} y={620} l={560} h={124} couleur={AMBRE} vise={42} espace={3}>
              PRISE DE PROTÉINES
            </Etiquette>
          </g>
        )}
        {refractaire > 0 && (
          <g opacity={refractaire} transform={`translate(0 ${melange(-20, 0, refractaire)})`}>
            <Txt x={CX} y={600} taille={corps("RÉFRACTAIRE", 104, 5)} couleur={M.corail} espace={5}>
              RÉFRACTAIRE
            </Txt>
          </g>
        )}

        <Jauge x={360} l={250} haut={760} bas={1300} part={construit} couleur={NEON} libelle="CONSTRUCTION" opacity={prise} />
        {duree > 0 && (
          <g opacity={duree * (1 - refractaire)}>
            <line x1={500} y1={1300 - 540 * 0.74} x2={640} y2={1300 - 540 * 0.74} stroke={M.gris} strokeWidth={4} strokeDasharray="14 10" />
            <Txt x={660} y={1300 - 540 * 0.74} taille={44} couleur={M.texte} espace={3} ancre="start">
              1H30 À 3H
            </Txt>
          </g>
        )}

        {/* Les acides aminés continuent d'arriver, la jauge ne bouge plus. */}
        {acides > 0 && (
          <g opacity={acides}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const p = ((t * 0.42 + i / 6) % 1 + 1) % 1;
              return (
                <circle
                  key={i}
                  cx={760 + (i % 3) * 78}
                  cy={melange(800, 1260, p)}
                  r={13}
                  fill={CYAN}
                  opacity={Math.sin(Math.PI * p) * 0.85}
                />
              );
            })}
            <Txt x={838} y={1370} taille={28} couleur={CYAN} espace={3}>
              ACIDES AMINÉS
            </Txt>
          </g>
        )}
        {refractaire > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 100, SOCLE + 90, refractaire)}
            taille={corps("MUSCLE FULL", 58, 4)}
            couleur={M.corail}
            espace={4}
            opacity={acides}
          >
            MUSCLE FULL
          </Txt>
        )}
      </Panneau>

      {/* ══ B4 — plusieurs prises réparties ════════════════════════════ */}
      {/* Deux journées côte à côte sur la même échelle : une seule prise bien
          placée contre quatre réparties. La surface construite se compte à l'œil. */}
      <Panneau {...b.B4} t={t}>
        <EnTete opacity={ouverture("B4")}>SUR TA JOURNÉE</EnTete>

        {[
          { y: 760, n: 1, c: AMBRE, l: "1 SEULE PRISE", l2: "BIEN CHRONOMÉTRÉE", e: seule },
          { y: 1090, n: 4, c: NEON, l: "PLUSIEURS PRISES", l2: "BIEN RÉPARTIES", e: plusieurs },
        ].map((rang) => (
          <g key={rang.l} opacity={rang.e}>
            <line x1={150} y1={rang.y + 70} x2={930} y2={rang.y + 70} stroke={M.noir} strokeWidth={4} />
            {Array.from({ length: rang.n }, (_, i) => {
              const x = rang.n === 1 ? 200 : 200 + i * 200;
              const e = rd(rang.e, i * 0.14, i * 0.14 + 0.5);
              return (
                <g key={i} opacity={e}>
                  <rect x={x} y={rang.y - 4} width={112} height={74} fill={rang.c} opacity={0.9} />
                  <circle cx={x + 12} cy={rang.y - 26} r={14} fill={rang.c} />
                </g>
              );
            })}
            <Txt x={CX} y={rang.y + 146} taille={32} couleur={rang.c} espace={3}>
              {rang.l}
            </Txt>
            <Txt x={CX} y={rang.y + 190} taille={32} couleur={rang.c} espace={3}>
              {rang.l2}
            </Txt>
          </g>
        ))}

        {comptent > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 100, SOCLE + 90, comptent)}
            taille={corps("C'EST LE TOTAL QUI COMPTE", 50, 3)}
            couleur={M.texte}
            espace={3}
            opacity={comptent}
          >
            C'EST LE TOTAL QUI COMPTE
          </Txt>
        )}
      </Panneau>

      {/* ══ B5 — aucune preuve d'une fenêtre stricte ═══════════════════ */}
      <Panneau {...b.B5} t={t}>
        <EnTete opacity={ouverture("B5")}>UNE REVUE DE LA LITTÉRATURE</EnTete>

        {revue > 0 && (
          <Txt
            x={CX}
            y={melange(820, 800, revue)}
            taille={corps("AUCUNE PREUVE SOLIDE", 88, 5)}
            couleur={M.texte}
            espace={5}
            opacity={aucune}
          >
            AUCUNE PREUVE SOLIDE
          </Txt>
        )}

        {/* La fenêtre du beat 2 revient à sa place exacte, et se fait barrer. */}
        {rail(revue)}
        <rect x={AXE.x0} y={AXE.y - AXE.h} width={MYTHE_L * revue} height={AXE.h} fill={AMBRE} opacity={0.9} />
        <Txt x={AXE.x0 + MYTHE_L / 2} y={AXE.y - AXE.h - 56} taille={40} couleur={AMBRE} espace={3} opacity={revue}>
          30 MIN
        </Txt>
        {barre > 0 && (
          <>
            <line
              x1={AXE.x0 - 34}
              y1={AXE.y + 22}
              x2={melange(AXE.x0 - 34, AXE.x0 + MYTHE_L + 46, barre)}
              y2={melange(AXE.y + 22, AXE.y - AXE.h - 22, barre)}
              stroke={M.corail}
              strokeWidth={12}
              strokeLinecap="round"
            />
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("PAS DE FENÊTRE STRICTE", 52, 3)}
              couleur={M.corail}
              espace={3}
              opacity={rd(barre, 0.5, 1)}
            >
              PAS DE FENÊTRE STRICTE
            </Txt>
          </>
        )}
      </Panneau>

      {/* ══ B6 — jusqu'à 24 h ══════════════════════════════════════════ */}
      {/* La même bande, étirée. Le brief demandait « une jauge horaire qui
          s'étire de 30 MIN à 24H » : c'est littéralement ce qui se passe, et
          comme c'est le troisième emploi du même objet, l'écart se lit seul. */}
      <Panneau {...b.B6} t={t}>
        <EnTete opacity={ouverture("B6")}>TON MUSCLE RESTE SENSIBLE</EnTete>

        {jusqua > 0 && (
          <Txt
            x={CX}
            y={melange(840, 820, jusqua)}
            taille={corps("JUSQU'À 24H", 168, 6)}
            couleur={AMBRE}
            espace={6}
            opacity={jusqua}
          >
            JUSQU'À 24H
          </Txt>
        )}

        {rail(1)}
        <rect
          x={AXE.x0}
          y={AXE.y - AXE.h}
          width={melange(MYTHE_L, AXE.x1 - AXE.x0, etire)}
          height={AXE.h}
          fill={melange(0, 1, etire) > 0.5 ? NEON : AMBRE}
          opacity={0.9}
        />
        <Txt
          x={melange(AXE.x0 + MYTHE_L + 40, AXE.x1 - 20, etire)}
          y={AXE.y + 74}
          taille={34}
          couleur={etire > 0.5 ? NEON : AMBRE}
          espace={3}
          ancre={etire > 0.5 ? "end" : "start"}
        >
          {etire > 0.5 ? "+24 H" : "30 MIN"}
        </Txt>
        {habitude > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, habitude)}
            taille={corps("PLUS SENSIBLE QUE D'HABITUDE", 48, 3)}
            couleur={M.texte}
            espace={3}
            opacity={habitude}
          >
            PLUS SENSIBLE QUE D'HABITUDE
          </Txt>
        )}
      </Panneau>

      {/* ══ B7 — la méta-analyse ═══════════════════════════════════════ */}
      <Panneau {...b.B7} t={t}>
        <EnTete opacity={ouverture("B7") * (1 - q7)}>UNE MÉTA-ANALYSE</EnTete>
        <EnTete opacity={q7}>MAIS ÇA S'EXPLIQUE AUTREMENT</EnTete>

        {petit > 0 && (
          <g opacity={petit * (1 - q7)}>
            <Txt x={CX} y={840} taille={corps("UN PETIT EFFET", 96, 5)} couleur={M.texte} espace={5}>
              UN PETIT EFFET
            </Txt>
            <Txt x={CX} y={990} taille={corps("DU TIMING", 96, 5)} couleur={AMBRE} espace={5}>
              DU TIMING
            </Txt>
            <rect x={CX - 26} y={1160} width={52} height={92 * petit} fill={AMBRE} opacity={0.9} />
            <line x1={150} y1={1252} x2={930} y2={1252} stroke={M.noir} strokeWidth={4} />
          </g>
        )}

        {/* Deux jauges à la même échelle : l'écart entre elles EST l'explication. */}
        {cadres7 > 0 && (
          <g opacity={cadres7 * q7}>
            <Jauge x={320} l={240} haut={640} bas={1250} part={timing7} couleur={AMBRE} libelle="TIMING" />
            <Jauge x={760} l={240} haut={640} bas={1250} part={total7} couleur={NEON} libelle="APPORT TOTAL" />
          </g>
        )}
        {chronometraient > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("CHEZ CEUX QUI CHRONOMÉTRAIENT", 48, 3)}
            couleur={NEON}
            espace={3}
            opacity={chronometraient * cede(T.pasTiming)}
          >
            CHEZ CEUX QUI CHRONOMÉTRAIENT
          </Txt>
        )}
        {pasTiming > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, pasTiming)}
            taille={corps("PAS LE TIMING EN LUI-MÊME", 50, 3)}
            couleur={M.texte}
            espace={3}
            opacity={pasTiming}
          >
            PAS LE TIMING EN LUI-MÊME
          </Txt>
        )}
      </Panneau>

      {/* ══ B8 — ton niveau change la donne ════════════════════════════ */}
      {/* UN SEUL beat de 24 s, comme le brief l'exige : Robin le dit d'un seul
          tenant. Les deux courbes de réponse entrent au deuxième écran et ne
          quittent plus l'image ; seuls l'accent et les libellés se déplacent,
          donc il n'y a jamais de coupure franche entre « niveau » et
          « implication ». */}
      <Panneau {...b.B8} t={t}>
        <EnTete opacity={ouverture("B8") * (1 - s2)}>UNE AUTRE ÉTUDE</EnTete>
        <EnTete opacity={s2 * (1 - s3)}>LA RÉPONSE À L'ENTRAÎNEMENT</EnTete>
        <EnTete opacity={s3 * (1 - s4)}>SI TU DÉBUTES</EnTete>
        <EnTete opacity={s4}>PLUS TU ES EXPÉRIMENTÉ</EnTete>

        {silhouettes > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const e = rd(silhouettes, i * 0.09, i * 0.09 + 0.4);
            return e <= 0 ? null : (
              <Perso key={i} x={200 + i * 170} y={melange(840, 800, e)} k={1.0} couleur={CYAN} opacity={e * (1 - s2)} />
            );
          })}
        {pratiquants > 0 && (
          <Txt x={CX} y={1010} taille={corps("SUIVIS SUR 10 SEMAINES", 44, 4)} couleur={CYAN} espace={4} opacity={pratiquants * (1 - s2)}>
            SUIVIS SUR 10 SEMAINES
          </Txt>
        )}

        {/* Les deux courbes, sur le même axe et à la même échelle. */}
        {s2 > 0 && (
          <g opacity={s2}>
            <line x1={150} y1={1210} x2={930} y2={1210} stroke={M.gris} strokeWidth={4} />
            <Txt x={CX} y={1284} taille={28} couleur={M.gris} espace={4}>
              TEMPS APRÈS LA SÉANCE
            </Txt>
            {aireLarge > 0 && (
              <path d={aire(170, 740, 1210, 430, 0.62, aireLarge)} fill={NEON} opacity={0.2 * (1 - s4 * 0.7)} />
            )}
            {aireCourte > 0 && (
              <path d={aire(170, 740, 1210, 236, 0.3, aireCourte)} fill={CYAN} opacity={0.26} />
            )}
            <path
              d={reponse(170, 740 * courbe1, 1210, 430, 0.62)}
              fill="none"
              stroke={NEON}
              strokeWidth={melange(11, 14, s3) * (1 - s4 * 0.45)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={melange(1, 0.34, s4)}
            />
            <path
              d={reponse(170, 740 * courbe2, 1210, 236, 0.3)}
              fill="none"
              stroke={CYAN}
              strokeWidth={melange(11, 14, s4) * (1 - s3 * 0.35 * (1 - s4))}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={courbe2 * melange(1, 0.34, s3 * (1 - s4))}
            />
            {rappel30 > 0 && (
              <g opacity={rappel30}>
                <rect x={170} y={1210 - 44} width={22} height={44} fill={M.corail} />
                <line x1={192} y1={1188} x2={melange(192, 250, rappel30)} y2={1188} stroke={M.corail} strokeWidth={4} />
                <Txt x={266} y={1188} taille={30} couleur={M.corail} espace={3} ancre="start">
                  30 MIN
                </Txt>
              </g>
            )}
            <Txt x={620} y={790} taille={34} couleur={NEON} espace={3} ancre="start" opacity={courbe1 * melange(1, 0.4, s4)}>
              1ÈRE SÉANCE
            </Txt>
            <Txt x={620} y={862} taille={34} couleur={CYAN} espace={3} ancre="start" opacity={courbe2 * melange(1, 0.4, s3 * (1 - s4))}>
              3 À 10 SEMAINES
            </Txt>
          </g>
        )}

        {/* Les trois conclusions se relaient au socle, jamais deux à la fois. */}
        {forte > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("BIEN PLUS FORTE", 58, 3)}
            couleur={NEON}
            espace={3}
            opacity={forte * cede(T.premiere - 0.9)}
          >
            BIEN PLUS FORTE
          </Txt>
        )}
        {longue > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("ET BIEN PLUS LONGUE", 58, 3)}
            couleur={NEON}
            espace={3}
            opacity={longue * cede(T.large)}
          >
            ET BIEN PLUS LONGUE
          </Txt>
        )}
        {large > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("FENÊTRE PLUS LARGE", 56, 3)}
            couleur={NEON}
            espace={3}
            opacity={large * cede(T.compteMoins)}
          >
            FENÊTRE PLUS LARGE
          </Txt>
        )}
        {compteMoins > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("LE TIMING COMPTE ENCORE MOINS", 50, 3)}
            couleur={M.texte}
            espace={3}
            opacity={compteMoins * cede(T.raccourcit)}
          >
            LE TIMING COMPTE ENCORE MOINS
          </Txt>
        )}
        {raccourcit > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("LA RÉPONSE SE RACCOURCIT", 52, 3)}
            couleur={CYAN}
            espace={3}
            opacity={raccourcit * cede(T.jamais)}
          >
            LA RÉPONSE SE RACCOURCIT
          </Txt>
        )}
        {jamais > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("MAIS JAMAIS 30 MINUTES", 52, 3)}
            couleur={M.corail}
            espace={3}
            opacity={jamais}
          >
            MAIS JAMAIS 30 MINUTES
          </Txt>
        )}
      </Panneau>

      {/* ══ B9 — quand le timing garde un intérêt ══════════════════════ */}
      {/* Les trois emplacements se posent vides, puis s'allument un à un : le
          spectateur sait qu'il y en a trois avant que Robin ne les ait dits. */}
      <Panneau {...b.B9} t={t}>
        <EnTete opacity={ouverture("B9")}>IL GARDE UN LÉGER INTÉRÊT SI…</EnTete>

        {cas.map((c) => (
          <Case key={`${c.l}-vide`} x={CX} y={c.y} l={840} h={156} couleur={M.noir} opacity={slots * (1 - c.e)} />
        ))}
        {cas.map((c) =>
          c.e <= 0 ? null : (
            <g key={c.l} opacity={c.e} transform={`translate(0 ${melange(30, 0, c.e)})`}>
              <Case x={CX} y={c.y} l={840} h={156} couleur={c.c} />
              <Txt x={CX} y={c.y} taille={corpsCas} couleur={c.c} espace={3}>
                {c.l}
              </Txt>
            </g>
          ),
        )}
      </Panneau>

      {/* ══ B10 — le CTA ═══════════════════════════════════════════════ */}
      {!aLaCamera("B10") && (
        <Panneau {...b.B10} t={t}>
          <EnTete opacity={ouverture("B10")}>ENVOIE-MOI</EnTete>
          {envoie > 0 && (
            <g opacity={envoie} transform={`translate(0 ${melange(28, 0, envoie)})`}>
              <Etiquette x={CX} y={900} l={720} h={200} couleur={NEON} vise={116} espace={6}>
                TIMING
              </Etiquette>
              <Txt x={CX} y={1110} taille={44} couleur={M.gris} espace={6}>
                EN DM
              </Txt>
            </g>
          )}
          {discute > 0 && (
            <Txt
              x={CX}
              y={melange(SOCLE + 10, SOCLE, discute)}
              taille={corps("ON EN DISCUTE", 50, 3)}
              couleur={M.texte}
              espace={3}
              opacity={discute}
            >
              ON EN DISCUTE
            </Txt>
          )}
        </Panneau>
      )}
    </>
  );
};
