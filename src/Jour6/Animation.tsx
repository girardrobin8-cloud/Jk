import { useCurrentFrame, useVideoConfig } from "remotion";
import { M } from "../Muscle/Plan";
import {
  AMBRE,
  Case,
  corps,
  CX,
  CYAN,
  EnTete,
  faireTransition,
  melange,
  NEON,
  Panneau,
  Perso,
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 6, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Particularité, et elle est structurelle : ce composant ne dessine QUE sur B2
 * et B4. La règle permanente n°1 du brief fait des trois blocs « tête parlante »
 * des espaces réservés — rien ne doit s'y afficher, pas même un texte. Il n'y a
 * donc aucun panneau pour B1, B3 et B5, et c'est volontaire : le montage laisse
 * passer le rush sur ces fenêtres. La règle n°2 est tenue par la même absence,
 * le CTA n'ayant ni animation ni texte à l'écran.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);

// ── Repères internes, en secondes de l'export d'origine ──────────────────
const RUSH = {
  // ── B2 — 17,30 → 25,75 : jamais courbaturé contre toujours courbaturé
  avances: 17.6, // « certains pratiquants très avancés » 17,6 → 18,7
  jamais: 19.6, // « presque jamais courbaturés »         19,1 → 20,3
  toujours: 21.2, // « d'autres le sont systématiquement » 21,2 → 22,2
  meme: 23.2, // « les 2 atteignent une hypertrophie marquée » 23,2 → 25,1

  // ── B4 — 35,95 → 45,90 : comment juger sa séance
  comment: 36.2, // « alors comment juger vraiment ta séance » 36,2 → 37,4
  regarde: 37.7, // « regarde si »                        37,9 → 38,2
  charge: 38.4, // « ta charge ou tes répétitions progressent » 38,6 → 40,7
  echec: 41.0, // « proche de l'échec sur toutes tes séries » 41,1 → 42,9
  volume: 43.7, // « un volume cohérent sur la semaine »  43,8 → 45,6
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b2 = transition(t, "B2");
  const b4 = transition(t, "B4");
  if (Math.max(b2.e, b4.e) <= 0) return null;

  const ouverture = (id: string) => {
    const d = BEATS.find((x) => x.id === id)!.debut;
    return rd(t, d - FONDU * 0.35, d + 0.3);
  };

  // ── B2 ────────────────────────────────────────────────────────────────
  const arriveA = rd(t, T.avances, T.avances + 0.8);
  const arriveB = rd(t, T.toujours - 0.6, T.toujours + 0.3);
  const jamais = rd(t, T.jamais, T.jamais + 0.7);
  const toujours = rd(t, T.toujours, T.toujours + 0.7);
  /** Les deux silhouettes grossissent ENSEMBLE et de la même quantité : c'est
      tout l'argument du beat, et une échelle le dit mieux qu'une barre. */
  const pousse = rd(t, T.meme, T.meme + 1.5);
  const meme = rd(t, T.meme + 0.5, T.meme + 1.2);

  // ── B4 ────────────────────────────────────────────────────────────────
  const slots = rd(t, T.comment + 0.4, T.comment + 1.2);
  const criteres = [
    { l: "CHARGE OU REPS EN HAUSSE", t0: T.charge, y: 800, c: NEON, i: "courbe" },
    { l: "PROCHE DE L'ÉCHEC", t0: T.echec, y: 1010, c: CYAN, i: "cible" },
    { l: "VOLUME HEBDO COHÉRENT", t0: T.volume, y: 1220, c: AMBRE, i: "flamme" },
  ].map((c) => ({
    ...c,
    e: rd(t, c.t0, c.t0 + 0.7),
    /** Le lavis qui traverse le cadre pendant que Robin développe le critère. */
    lavis: rd(t, c.t0 + 0.7, c.t0 + 2.1),
  }));
  /** Un seul corps pour les trois lignes : celui qui convient à la plus longue. */
  const corpsCritere = Math.min(...criteres.map((c) => corps(c.l, 36, 3, 600)));

  /** Les trois pictogrammes du beat 4, dessinés à la main dans 72 px. */
  const picto = (nom: string, x: number, y: number, c: string) =>
    nom === "courbe" ? (
      <path
        d={`M ${x - 34} ${y + 26} L ${x - 10} ${y - 2} L ${x + 8} ${y + 12} L ${x + 34} ${y - 26}`}
        fill="none"
        stroke={c}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : nom === "cible" ? (
      <g>
        <circle cx={x} cy={y} r={30} fill="none" stroke={c} strokeWidth={6} />
        <circle cx={x} cy={y} r={14} fill="none" stroke={c} strokeWidth={6} />
        <circle cx={x} cy={y} r={4} fill={c} />
      </g>
    ) : (
      <path
        d={`M ${x} ${y - 32} C ${x + 26} ${y - 6} ${x + 22} ${y + 8} ${x + 12} ${y + 20}
            C ${x + 4} ${y + 30} ${x - 4} ${y + 30} ${x - 12} ${y + 20}
            C ${x - 22} ${y + 8} ${x - 26} ${y - 6} ${x} ${y - 32} Z`}
        fill="none"
        stroke={c}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    );

  return (
    <>
      {/* ══ B2 — deux profils, un seul résultat ════════════════════════ */}
      {/* Le brief demande deux silhouettes côte à côte, l'une jamais
          courbaturée, l'autre toujours, et le même résultat de croissance pour
          les deux. Les deux grossissent donc exactement de la même quantité,
          en même temps : l'égalité se voit, elle n'a pas à être écrite. */}
      <Panneau {...b2} t={t}>
        <EnTete opacity={ouverture("B2")}>DEUX PRATIQUANTS AVANCÉS</EnTete>

        {[
          { x: 300, e: jamais, a: arriveA, c: NEON, l1: "JAMAIS", l2: "COURBATURÉ" },
          { x: 780, e: toujours, a: arriveB, c: M.corail, l1: "TOUJOURS", l2: "COURBATURÉ" },
        ].map((g) => (
          <g key={g.l1}>
            <Perso
              x={melange(g.x + (g.x < CX ? -70 : 70), g.x, g.a)}
              y={780}
              k={melange(1.7, 2.3, pousse)}
              couleur={g.c}
              opacity={g.a}
            />
            <Txt x={g.x} y={1060} taille={34} couleur={g.c} espace={3} opacity={g.e}>
              {g.l1}
            </Txt>
            <Txt x={g.x} y={1108} taille={34} couleur={g.c} espace={3} opacity={g.e}>
              {g.l2}
            </Txt>
          </g>
        ))}

        {meme > 0 && (
          <Txt x={CX} y={780} taille={melange(60, 76, meme)} couleur={M.texte} espace={5} opacity={meme}>
            =
          </Txt>
        )}
        {meme > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, meme)}
            taille={corps("MÊME HYPERTROPHIE MARQUÉE", 52, 3)}
            couleur={M.texte}
            espace={3}
            opacity={meme}
          >
            MÊME HYPERTROPHIE MARQUÉE
          </Txt>
        )}
      </Panneau>

      {/* ══ B4 — les trois vrais critères ══════════════════════════════ */}
      {/* Trois lignes qui s'allument l'une après l'autre, avec leur pictogramme
          à gauche du cadre et leur texte aligné à sa droite. Les trois
          emplacements se posent vides d'abord : le spectateur sait qu'il y en a
          trois avant que Robin ne les ait énoncés. */}
      <Panneau {...b4} t={t}>
        <EnTete opacity={ouverture("B4")}>COMMENT JUGER TA SÉANCE</EnTete>

        {criteres.map((c) => (
          <Case key={`${c.l}-vide`} x={CX} y={c.y} l={840} h={156} couleur={M.noir} opacity={slots * (1 - c.e)} />
        ))}
        {criteres.map((c) =>
          c.e <= 0 ? null : (
            <g key={c.l} opacity={c.e} transform={`translate(0 ${melange(32, 0, c.e)})`}>
              <Case x={CX} y={c.y} l={840} h={156} couleur={c.c} />
              <rect x={122} y={c.y - 76} width={836 * c.lavis} height={152} fill={c.c} opacity={0.12} />
              {picto(c.i, 240, c.y, c.c)}
              <Txt x={330} y={c.y} taille={corpsCritere} couleur={c.c} espace={3} ancre="start">
                {c.l}
              </Txt>
            </g>
          ),
        )}
      </Panneau>
    </>
  );
};
