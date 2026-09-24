import { useCurrentFrame, useVideoConfig } from "remotion";
import { M } from "../Muscle/Plan";
import {
  AMBRE,
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
import { BEATS, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 9, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Deux panneaux seulement, B2 et B4 : les quatre autres blocs sont des espaces
 * réservés à la tête parlante, CTA compris, et rien n'y est dessiné.
 *
 * Le beat 4 dure quinze secondes, ce que la structure de rythme autorise « tant
 * que c'est visuellement rythmé ». Il se joue donc en trois écrans : les deux
 * ressentis qui divergent, les deux réparations qui restent identiques, puis la
 * conclusion en plein écran. Les deux paires de jauges partagent la même
 * géométrie, si bien que la divergence puis l'égalité se lisent l'une contre
 * l'autre sans qu'un mot ait à l'expliquer.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);

/** L'échelle typographique de la vidéo. Rien d'autre n'est permis. */
const TAILLE = {
  titre: 92,
  etiquette: 44,
  legende: 32,
  socle: 48,
};

// ── Repères internes, en secondes de l'export d'origine ──────────────────
const RUSH = {
  // ── B2 — 3,20 → 11,00 : ce qu'on croit
  pense: 3.4, // « on pense souvent qu'un jour de repos » 3,4 → 4,7
  bougePas: 5.2, // « un jour où on ne bouge pas du tout » 5,2 → 6,4
  calme: 6.9, // « le corps resterait au calme »         6,9 → 9,0
  pasTout: 9.6, // « ah bah c'est pas tout à fait le cas » 9,6 → 10,7

  // ── B4 — 15,70 → 31,00 : la preuve, puis la nuance
  ressort: 16.2, // « on ressort que l'activité légère » 16,2 → 17,2
  reduit: 17.7, // « réduit la sensation de courbature » 17,7 → 19,8
  compare: 20.4, // « en comparaison à l'immobilité totale » 20,4 → 22,1
  attention: 22.9, // « mais attention »                 22,9 → 23,1
  repare: 23.4, // « ça répare pas le muscle plus vite » 23,4 → 25,0
  suitCours: 25.3, // « le dommage musculaire suit son cours » 25,3 → 27,0
  perception: 27.6, // « ce qui change, c'est ta perception » 27,6 → 29,1
  vitesse: 29.7, // « pas la vitesse de guérison »       29,7 → 30,4
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

/** Géométrie commune aux deux paires de jauges du beat 4. */
const J = { g: 300, d: 780, l: 240, haut: 700, bas: 1240 };

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
  /** Un élément s'efface AVANT que le suivant n'entre — consigne 7. */
  const cede = (quand: number) => 1 - rd(t, quand - 0.45, quand - 0.15);

  // ── B2 ────────────────────────────────────────────────────────────────
  const pense = rd(t, T.pense, T.pense + 0.6);
  /** Le tracé d'activité : il se déroule, et il reste PLAT. C'est l'image. */
  const plat = rd(t, T.bougePas, T.bougePas + 3.1);
  const calme = rd(t, T.calme, T.calme + 0.6);
  const q2 = rd(t, T.pasTout - 0.05, T.pasTout + 0.55);
  const pasTout = rd(t, T.pasTout, T.pasTout + 0.7);

  // ── B4 ────────────────────────────────────────────────────────────────
  const ressort = rd(t, T.ressort, T.ressort + 0.6);
  /** Les deux ressentis montent ensemble, puis celui de l'actif redescend. */
  const monte = rd(t, T.reduit, T.reduit + 1.5);
  const diverge = rd(t, T.compare, T.compare + 1.4);
  const p2 = rd(t, T.attention - 0.05, T.attention + 0.55);
  const repare = rd(t, T.repare, T.repare + 1.6);
  const suitCours = rd(t, T.suitCours, T.suitCours + 0.7);
  const p3 = rd(t, T.perception - 0.05, T.perception + 0.55);
  const perception = rd(t, T.perception, T.perception + 0.7);
  const vitesse = rd(t, T.vitesse, T.vitesse + 0.6);

  return (
    <>
      {/* ══ B2 — ce qu'on croit d'un jour de repos ═════════════════════ */}
      <Panneau {...b2} t={t}>
        <EnTete opacity={ouverture("B2") * cede(T.pasTout)}>UN JOUR DE REPOS</EnTete>

        {/* Le personnage ne bouge pas, et la courbe d'activité non plus : elle
            se déroule à plat d'un bord à l'autre. L'absence de relief EST
            l'information, aucune légende ne la dit à sa place. */}
        {pense > 0 && (
          <g opacity={cede(T.pasTout)}>
            <Perso x={CX} y={780} k={2.0} couleur={M.gris} opacity={pense} />
            {plat > 0 && (
              <>
                <line
                  x1={150}
                  y1={1120}
                  x2={melange(150, 930, plat)}
                  y2={1120}
                  stroke={CYAN}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
                {plat < 1 && <rect x={melange(150, 930, plat) - 8} y={1104} width={16} height={32} fill={CYAN} />}
                <line x1={150} y1={1190} x2={930} y2={1190} stroke={M.noir} strokeWidth={4} opacity={plat} />
              </>
            )}
            {calme > 0 && (
              <Txt
                x={CX}
                y={melange(1280, 1260, calme)}
                taille={TAILLE.legende}
                couleur={CYAN}
                espace={4}
                opacity={calme}
              >
                ACTIVITÉ : ZÉRO
              </Txt>
            )}
            {calme > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("LE CORPS AU CALME POUR RÉCUPÉRER", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={rd(calme, 0.4, 1)}
              >
                LE CORPS AU CALME POUR RÉCUPÉRER
              </Txt>
            )}
          </g>
        )}

        {/* La révélation demandée par le brief, seule dans le cadre. */}
        {pasTout > 0 && (
          <g opacity={q2 * pasTout} transform={`translate(0 ${melange(20, 0, pasTout)})`}>
            <Txt x={CX} y={880} taille={corps("PAS TOUT", TAILLE.titre, 6)} couleur={M.texte} espace={6}>
              PAS TOUT
            </Txt>
            <Txt x={CX} y={1030} taille={corps("À FAIT", TAILLE.titre, 6)} couleur={AMBRE} espace={6}>
              À FAIT
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B4 — la preuve, puis la nuance ═════════════════════════════ */}
      {/* Trois écrans. Les deux premiers réutilisent la MÊME géométrie de
          jauges : le ressenti diverge, la réparation ne bouge pas d'un côté à
          l'autre. C'est la reprise du dessin qui fait l'argument. */}
      <Panneau {...b4} t={t}>
        <EnTete opacity={ouverture("B4") * cede(T.attention)}>CE QUE TU RESSENS</EnTete>
        <EnTete opacity={p2 * cede(T.perception)}>MAIS LA RÉPARATION</EnTete>
        <EnTete opacity={p3}>CE QUI CHANGE VRAIMENT</EnTete>

        {/* Écran 1 — les deux ressentis, qui partent ensemble et divergent. */}
        {ressort > 0 && (
          <g opacity={cede(T.attention)}>
            <Jauge
              x={J.g}
              l={J.l}
              haut={J.haut}
              bas={J.bas}
              part={0.82 * monte}
              couleur={M.corail}
              libelle="IMMOBILE"
            />
            <Jauge
              x={J.d}
              l={J.l}
              haut={J.haut}
              bas={J.bas}
              part={melange(0.82, 0.42, diverge) * monte}
              couleur={NEON}
              libelle="ACTIVITÉ LÉGÈRE"
            />
            <Txt x={CX} y={640} taille={TAILLE.legende} couleur={M.gris} espace={4} opacity={monte}>
              COURBATURES ET FATIGUE
            </Txt>
            {diverge > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("BOUGER UN PEU, C'EST MOINS DUR", TAILLE.socle, 3)}
                couleur={NEON}
                espace={3}
                opacity={rd(diverge, 0.4, 1)}
              >
                BOUGER UN PEU, C'EST MOINS DUR
              </Txt>
            )}
          </g>
        )}

        {/* Écran 2 — la même paire, mais rigoureusement à égalité. */}
        {p2 > 0 && (
          <g opacity={p2 * cede(T.perception)}>
            <Jauge x={J.g} l={J.l} haut={J.haut} bas={J.bas} part={0.6 * repare} couleur={M.corail} libelle="IMMOBILE" />
            <Jauge x={J.d} l={J.l} haut={J.haut} bas={J.bas} part={0.6 * repare} couleur={NEON} libelle="ACTIVITÉ LÉGÈRE" />
            <Txt x={CX} y={640} taille={TAILLE.legende} couleur={M.gris} espace={4} opacity={repare}>
              RÉPARATION DU MUSCLE
            </Txt>
            <Txt
              x={CX}
              y={melange(960, 940, repare)}
              taille={TAILLE.titre}
              couleur={M.texte}
              espace={5}
              opacity={rd(repare, 0.5, 1)}
            >
              =
            </Txt>
            {suitCours > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("LE DOMMAGE SUIT SON COURS", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={suitCours}
              >
                LE DOMMAGE SUIT SON COURS
              </Txt>
            )}
          </g>
        )}

        {/* Écran 3 — ce qui change et ce qui ne change pas, côte à côte. */}
        {perception > 0 && (
          <g opacity={p3}>
            <g transform={`translate(0 ${melange(-24, 0, perception)})`}>
              <Etiquette x={CX} y={800} l={780} h={168} couleur={NEON} vise={TAILLE.etiquette} espace={3} opacity={perception}>
                TA PERCEPTION
              </Etiquette>
            </g>
            <g transform={`translate(0 ${melange(24, 0, vitesse)})`}>
              <Etiquette x={CX} y={1060} l={780} h={168} couleur={M.gris} vise={TAILLE.etiquette} espace={3} opacity={vitesse}>
                PAS TA GUÉRISON
              </Etiquette>
            </g>
            {vitesse > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("C'EST TOUT CE QUI CHANGE", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={rd(vitesse, 0.4, 1)}
              >
                C'EST TOUT CE QUI CHANGE
              </Txt>
            )}
          </g>
        )}
      </Panneau>
    </>
  );
};
