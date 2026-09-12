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
  melange,
  NEON,
  Panneau,
  Perso,
  Pointe,
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 2, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Même méthode qu'au Jour 1 : le rush existe et porte le son, l'animation le
 * RECOUVRE sur B2..B12 et laisse le hook en caméra. La charpente — bandes
 * réservées, corps de texte mesurés, panneau opaque à respiration lente — vient
 * de src/commun/Motion.tsx ; ce fichier ne contient que le contenu.
 *
 * Onze beats animés pour quatre-vingt-trois secondes, c'est beaucoup : chacun se
 * joue donc en DEUX écrans successifs, jamais en un empilement. Un écran porte
 * au plus trois blocs, et le suivant entre pendant que le précédent sort.
 *
 * Aucun bruitage : le montage ne porte que la voix de Robin.
 */

const transition = faireTransition(BEATS, FONDU);

// ── Repères internes, en secondes absolues ───────────────────────────────
/**
 * Chaque valeur est LUE sur les sous-titres incrustés, pas estimée. Le
 * commentaire cite le mot visé et l'instant où il s'affiche, ce qui permet de
 * vérifier un calage sans relancer l'extraction.
 *
 * Règle tenue partout : l'élément COMMENCE à monter deux à quatre dixièmes avant
 * son mot, pour être en place quand le spectateur le lit.
 *
 * Les valeurs sont en temps RUSH. `mappe()` les transpose dans le montage
 * resserré, une fois pour toutes, juste en dessous — si bien qu'une nouvelle
 * passe de coupe ne demande pas de retoucher une seule de ces secondes.
 */
const RUSH = {
  // ── B2 — 7,15 → 17,70 : la méta-analyse
  analyse: 7.3, // « par exemple »                    7,3 → 7,4
  methodo: 7.7, // « une méthodologie »               7,7 → 8,4
  large: 8.7, // « récente et large »                 8,8 → 9,5
  n67: 9.7, // le compteur remplace les deux lignes
  compte: 9.9, // « a réanalysé 67 »                  9,9 → 10,8
  etudes: 11.1, // « études »                         11,4
  participants: 12.1, // « plus de 2000 participants » 12,0 → 12,7
  precise: 13.3, // « une méthode plus précise »      13,3 → 14,3
  ciblent: 14.6, // « pour ne compter que les séries » 14,7 → 16,2
  muscle: 16.2, // « vraiment chaque muscle »         16,7 → 17,2

  // ── B3 — 17,70 → 23,65 : le chiffre
  resultat: 18.0, // « le résultat de l'étude »       18,0 → 18,6
  chiffre: 19.3, // « plus 0,24 % »                   19,2 → 19,6
  parSerie: 20.8, // « de gains par série »           20,8 → 21,5
  rendements: 21.9, // « et les rendements »          21,8 → 22,1
  vite: 22.5, // « diminuent vite »                   22,5 → 23,2

  // ── B4 — 23,65 → 30,10 : ce qui limite vraiment
  audela: 23.8, // « sauf qu'au-delà »                23,8 → 24,0
  volume: 24.6, // « d'un certain volume »            24,6 → 25,1
  stimulus: 25.9, // « ta capacité à stimuler »       25,5 → 27,2
  plafond: 27.5, // « qui limite tes gains »          27,5 → 28,3
  recup: 28.7, // « c'est ta récupération »           28,7 → 29,1

  // ── B5 — 30,10 → 39,00 : l'autre moitié de l'équation
  equation: 30.6, // « le nombre de séries »          30,6 → 31,2
  moitie: 31.6, // « c'est une moitié de l'équation » 31,6 → 32,6
  autre: 33.4, // « l'autre, c'est la proximité »     33,4 → 34,1
  echec: 34.6, // « à l'échec »                       34,6 → 34,8
  pousses: 35.6, // « à quel point tu pousses »       35,6 → 36,5
  plusProche: 37.4, // « au plus proche de l'échec »  37,5 → 38,4

  // ── B6 — 39,00 → 44,15 : une seule série suffit
  parceque: 39.4, // « parce que »                    39,4 → 39,6
  uneSerie: 39.8, // « même une série à l'échec »     39,8 → 40,7
  exercice: 41.3, // « par exercice »                 41,3 → 41,5
  produire: 42.1, // « suffit à produire »            42,1 → 42,6
  mesurables: 43.2, // « des gains mesurables »       43,2 → 43,6

  // ── B7 — 44,15 → 54,20 : la fourchette
  zone: 44.3, // « la zone la plus étudiée »          44,3 → 45,2
  axe: 44.6, // l'axe se trace, avant que la zone n'arrive
  fourchette: 46.6, // « entre 10 et 20 »             46,7 → 47,4
  parSemaine: 47.7, // « séries par muscle par semaine » 47,7 → 48,8
  largeur: 49.5, // « alors oui, ça peut sembler large » 49,7 → 50,8
  depend: 51.1, // « mais elle dépend énormément »    51,4 → 52,3
  individuels: 52.6, // « de facteurs individuels »   52,7 → 53,4

  // ── B8 — 54,20 → 60,50 : modéré contre élevé
  comparant: 54.6, // « mais une étude comparant »    54,6 → 55,4
  modere: 55.9, // « volume modéré »                  56,0 → 56,3
  eleve: 56.7, // « et volume élevé »                 56,8 → 57,3
  aucune: 58.0, // « n'a trouvé aucune différence »   57,8 → 58,7
  plupart: 59.3, // « plupart des muscles »           59,4 → 59,9

  // ── B9 — 60,50 → 68,80 : ce qui fait varier ton chiffre
  conclure: 60.8, // « on pourrait conclure »         60,8 → 61,2
  suffit: 62.1, // « la fourchette suffit amplement » 62,3 → 63,2
  mais: 63.8, // « mais tu devras en compte »         63,8 → 64,8
  experience: 65.1, // « ton niveau d'expérience »    65,2 → 65,4
  recuperation: 66.0, // « ta capacité de récupération » 66,1 → 66,8
  genetique: 67.4, // « et ta génétique »             67,5 → 67,9

  // ── B10 — 68,80 → 76,75 : la variabilité entre personnes
  programme: 69.2, // « sur le même programme »       69,3 → 69,8
  mesure: 70.1, // « une étude a mesuré »             70,2 → 70,8
  ecart: 72.2, // « allant de 0 à 59 % »              71,8 → 72,7
  selon: 73.5, // « de muscles selon les personnes »  73,6 → 74,7
  chacun: 75.3, // « chacun réagit différemment »     75,4 → 76,3

  // ── B11 — 76,75 → 85,20 : l'avis de Robin
  avis: 76.9, // « je serai plutôt d'avis »           76,9 → 77,3
  rappelZone: 77.0, // l'axe du beat 7 revient
  resserre: 78.9, // la zone étudiée se resserre sur sa recommandation
  dixDouze: 79.1, // « aux alentours de 10 à 12 »     78,7 → 79,8
  semaine: 79.9, // « séries par muscle et par semaine » 80,0 → 81,3
  pallier: 81.6, // « pour pallier au fait »          81,7 → 82,5
  pasEchec: 82.6, // « les gens ne sont pas à l'échec » 82,7 → 84,5

  // ── B12 — 85,20 → 90,17 : la conclusion
  intensite: 85.4, // « plus tu augmenteras cette intensité » 85,5 → 87,3
  diminuer: 87.7, // « tu pourras diminuer le nombre » 87,9 → 89,5
  inversement: 89.2, // « de séries par semaine »     89,5 → 90,0
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

/**
 * Une jauge verticale : cadre, remplissage, et le libellé sous le cadre.
 *
 * Elle sert trois fois — le stimulus qui plafonne, la proximité à l'échec, puis
 * le rappel de cette même proximité au beat 11. Les trois emplois partagent donc
 * la même géométrie, ce qui fait du rappel une VRAIE reprise visuelle et non un
 * dessin voisin.
 */
const Jauge: React.FC<{
  x: number;
  l?: number;
  haut?: number;
  bas?: number;
  part: number;
  couleur: string;
  opacity?: number;
  libelle?: string;
}> = ({ x, l = 220, haut = 640, bas = 1240, part, couleur, opacity = 1, libelle }) => (
  <g opacity={opacity}>
    <rect x={x - l / 2} y={haut} width={l} height={bas - haut} fill="none" stroke={M.noir} strokeWidth={5} />
    <rect
      x={x - l / 2}
      y={bas - (bas - haut) * part}
      width={l}
      height={(bas - haut) * part}
      fill={couleur}
      opacity={0.9}
    />
    {libelle ? (
      <Txt x={x} y={bas + 80} taille={corps(libelle, 30, 3, l + 180)} couleur={couleur} espace={3}>
        {libelle}
      </Txt>
    ) : null}
  </g>
);

/**
 * Une courbe de rendements décroissants, tracée progressivement.
 *
 * `avance` va de 0 à 1 et coupe le tracé : la courbe se DESSINE au lieu
 * d'apparaître, ce qui est la seule façon honnête de montrer « ça monte puis ça
 * s'aplatit » — on voit l'aplatissement arriver.
 */
const courbe = (x0: number, largeur: number, base: number, ampleur: number, avance: number) => {
  const pts: string[] = [];
  const n = Math.max(2, Math.round(48 * avance));
  for (let i = 0; i <= n; i++) {
    const p = (i / 48) * 1;
    const v = 1 - Math.exp(-3.2 * p);
    pts.push(`${x0 + p * largeur},${base - v * ampleur}`);
  }
  return `M ${pts.join(" L ")}`;
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
   * L'ouverture d'un beat : son en-tête monte AVEC le panneau, pas après.
   *
   * Les bornes tombent sur la reprise de la parole et le premier mot suit d'un
   * dixième ou deux. L'en-tête calé sur ce mot laissait donc voir, à chaque
   * borne, un écran noir vide le temps d'un battement — c'est ce qui faisait
   * lire la transition comme une coupure plutôt que comme un enchaînement.
   */
  const ouverture = (id: string) => {
    const d = BEATS.find((x) => x.id === id)!.debut;
    return rd(t, d - FONDU, d + 0.25);
  };

  // ── B2 ────────────────────────────────────────────────────────────────
  const methodo = rd(t, T.methodo, T.methodo + 0.6);
  const large = rd(t, T.large, T.large + 0.6);
  const n67 = rd(t, T.n67, T.n67 + 0.45);
  /** La valeur affichée par le compteur : elle monte, elle ne surgit pas. */
  const compte = Math.round(67 * rd(t, T.compte, T.compte + 1.0));
  const etudes = rd(t, T.etudes, T.etudes + 0.5);
  const participants = rd(t, T.participants, T.participants + 0.5);
  const precise = rd(t, T.precise, T.precise + 0.6);
  const ciblent = rd(t, T.ciblent, T.ciblent + 0.9);
  const muscle = rd(t, T.muscle, T.muscle + 0.6);
  /** Bascule de B2 : les chiffres montent en en-tête et libèrent la scène. */
  const q2 = rd(t, T.precise - 0.5, T.precise + 0.2);

  // ── B3 ────────────────────────────────────────────────────────────────
  const chiffre = rd(t, T.chiffre, T.chiffre + 0.6);
  const parSerie = rd(t, T.parSerie, T.parSerie + 0.5);
  const vite = rd(t, T.vite, T.vite + 0.6);
  const trace = rd(t, T.rendements, T.rendements + 1.4);
  const q3 = rd(t, T.rendements - 0.5, T.rendements + 0.2);

  // ── B4 ────────────────────────────────────────────────────────────────
  const volume = rd(t, T.volume, T.volume + 2.6);
  const stimulus = rd(t, T.volume, T.volume + 1.3) * 0.66;
  const plafond = rd(t, T.plafond, T.plafond + 0.6);
  const recup = rd(t, T.recup, T.recup + 0.6);
  const q4 = rd(t, T.recup - 0.5, T.recup + 0.2);

  // ── B5 ────────────────────────────────────────────────────────────────
  const moitie = rd(t, T.moitie, T.moitie + 0.6);
  const autre = rd(t, T.autre, T.autre + 0.7);
  const echec = rd(t, T.echec, T.echec + 0.5);
  const monte = rd(t, T.pousses + 0.3, T.plusProche + 1.0);
  const plusProche = rd(t, T.plusProche, T.plusProche + 0.6);
  const q5 = rd(t, T.pousses - 0.5, T.pousses + 0.2);

  // ── B6 ────────────────────────────────────────────────────────────────
  const uneSerie = rd(t, T.uneSerie, T.uneSerie + 0.6);
  const exercice = rd(t, T.exercice, T.exercice + 0.5);
  const mesurables = rd(t, T.mesurables, T.mesurables + 0.6);
  const q6 = rd(t, T.produire + 0.4, T.mesurables + 0.1);

  // ── B7 ────────────────────────────────────────────────────────────────
  const axe = rd(t, T.axe, T.axe + 1.1);
  const bande = rd(t, T.fourchette, T.fourchette + 0.9);
  const largeur = rd(t, T.largeur, T.largeur + 0.7);
  const parSemaine = rd(t, T.parSemaine, T.parSemaine + 0.6);
  const individuels = rd(t, T.individuels, T.individuels + 0.6);
  const q7 = rd(t, T.depend - 0.4, T.depend + 0.3);

  // ── B8 ────────────────────────────────────────────────────────────────
  const modere = rd(t, T.modere, T.modere + 0.6);
  const eleve = rd(t, T.eleve, T.eleve + 0.6);
  const barres = rd(t, T.aucune, T.aucune + 1.1);
  const plupart = rd(t, T.plupart, T.plupart + 0.6);
  const q8 = rd(t, T.aucune - 0.5, T.aucune + 0.2);

  // ── B9 ────────────────────────────────────────────────────────────────
  const suffit = rd(t, T.suffit, T.suffit + 0.6);
  const mais = rd(t, T.mais, T.mais + 0.5);
  const facteurs = [
    { l: "TON EXPÉRIENCE", e: rd(t, T.experience, T.experience + 0.6), y: 1000, c: NEON },
    { l: "TA RÉCUPÉRATION", e: rd(t, T.recuperation, T.recuperation + 0.6), y: 1160, c: CYAN },
    { l: "TA GÉNÉTIQUE", e: rd(t, T.genetique, T.genetique + 0.6), y: 1320, c: AMBRE },
  ];
  const q9 = rd(t, T.experience - 0.5, T.experience + 0.2);

  // ── B10 ───────────────────────────────────────────────────────────────
  const mesure = rd(t, T.mesure, T.mesure + 0.6);
  const ecart = rd(t, T.ecart, T.ecart + 0.7);
  /** Le second nombre monte au lieu de se poser — même procédé qu'au beat 2. */
  const jusqua59 = Math.round(59 * rd(t, T.ecart + 0.2, T.ecart + 1.7));
  const selon = rd(t, T.selon, T.selon + 0.6);
  const chacun = rd(t, T.chacun, T.chacun + 0.6);
  const q10 = rd(t, T.ecart - 0.5, T.ecart + 0.2);

  // ── B11 ───────────────────────────────────────────────────────────────
  const rappelZone = rd(t, T.rappelZone, T.rappelZone + 0.8);
  const resserre = rd(t, T.resserre, T.resserre + 0.9);
  const dixDouze = rd(t, T.dixDouze, T.dixDouze + 0.6);
  const semaine = rd(t, T.semaine, T.semaine + 0.6);
  const rappel = rd(t, T.pallier + 0.3, T.pasEchec + 0.9) * 0.45;
  const pasEchec = rd(t, T.pasEchec, T.pasEchec + 0.6);
  const q11 = rd(t, T.pallier - 0.4, T.pallier + 0.3);

  // ── B12 ───────────────────────────────────────────────────────────────
  const intensite = rd(t, T.intensite, T.intensite + 0.6);
  const fleche = rd(t, T.diminuer - 1.4, T.diminuer - 0.1);
  const diminuer = rd(t, T.diminuer, T.diminuer + 0.6);
  const inversement = rd(t, T.inversement, T.inversement + 0.5);

  return (
    <>
      {/* ══ B2 — ce que montre l'analyse ═══════════════════════════════ */}
      {/* Deux écrans. Le premier pose les chiffres de l'étude ; le second les
          range en en-tête — ils restent lisibles, ils cessent d'occuper la
          scène — pour montrer CE QU'ELLE COMPTE. */}
      <Panneau {...b.B2} t={t}>
        <EnTete opacity={ouverture("B2") * (1 - q2)}>UNE ANALYSE RÉCENTE</EnTete>

        {/* Ce que dit Robin pendant les trois secondes qui précèdent le premier
            chiffre. Sans elles, l'écran restait figé sur son seul en-tête —
            c'est le plus long temps mort qu'avait le montage. */}
        {methodo > 0 && (
          <g opacity={1 - n67}>
            <Txt
              x={CX}
              y={melange(920, 880, methodo)}
              taille={corps("UNE MÉTHODOLOGIE", 78, 4)}
              couleur={M.texte}
              espace={4}
              opacity={methodo}
            >
              UNE MÉTHODOLOGIE
            </Txt>
            <Txt
              x={CX}
              y={melange(1080, 1040, large)}
              taille={corps("RÉCENTE ET LARGE", 78, 4)}
              couleur={NEON}
              espace={4}
              opacity={large}
            >
              RÉCENTE ET LARGE
            </Txt>
          </g>
        )}

        {/* Les deux chiffres de l'étude : d'abord seuls et grands, puis rangés
            côte à côte tout en haut. Une fois rangés ils TIENNENT LIEU
            d'en-tête — en poser un second par-dessus les faisait se toucher.
            Le premier ROULE de 0 à 67 pendant que Robin dit « a réanalysé » :
            un nombre qui monte occupe le temps qu'un nombre posé laisse vide. */}
        <Txt
          x={melange(CX, 260, q2)}
          y={melange(800, 250, q2)}
          taille={melange(170, 46, q2)}
          couleur={M.texte}
          espace={2}
          opacity={n67}
        >
          {compte}
        </Txt>
        <Txt
          x={melange(CX, 260, q2)}
          y={melange(940, 306, q2)}
          taille={melange(40, 24, q2)}
          couleur={M.gris}
          espace={4}
          opacity={etudes}
        >
          ÉTUDES RÉANALYSÉES
        </Txt>
        <Txt
          x={melange(CX, 800, q2)}
          y={melange(1100, 250, q2)}
          taille={melange(110, 46, q2)}
          couleur={AMBRE}
          espace={2}
          opacity={participants}
        >
          2000+
        </Txt>
        <Txt
          x={melange(CX, 800, q2)}
          y={melange(1210, 306, q2)}
          taille={melange(36, 24, q2)}
          couleur={M.gris}
          espace={4}
          opacity={participants}
        >
          PARTICIPANTS
        </Txt>

        {precise > 0 && (
          <Txt
            x={CX}
            y={700}
            taille={corps("UNE MÉTHODE PLUS PRÉCISE", 56, 4)}
            couleur={M.texte}
            espace={4}
            opacity={precise * q2}
          >
            UNE MÉTHODE PLUS PRÉCISE
          </Txt>
        )}

        {/* Huit séries alignées ; seules celles qui ciblent le muscle comptent.
            Les autres ne disparaissent pas — elles s'éteignent, ce qui est
            exactement ce que dit la voix. */}
        {ciblent > 0 &&
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const compte = [0, 2, 3, 6].includes(i);
            const e = rd(ciblent, i * 0.06, i * 0.06 + 0.4);
            return (
              <rect
                key={i}
                x={120 + i * 110}
                y={melange(1000, 940, e)}
                width={70}
                height={melange(60, 120, e)}
                fill={compte ? NEON : M.fondCase}
                stroke={compte ? NEON : M.noir}
                strokeWidth={4}
                opacity={e * (compte ? 1 : melange(1, 0.22, muscle))}
              />
            );
          })}
        {muscle > 0 && (
          <Txt
            x={CX}
            y={1210}
            taille={corps("SEULEMENT CELLES QUI CIBLENT LE MUSCLE", 36, 3, 900)}
            couleur={M.texte}
            espace={3}
            opacity={muscle}
          >
            SEULEMENT CELLES QUI CIBLENT LE MUSCLE
          </Txt>
        )}
      </Panneau>

      {/* ══ B3 — le chiffre, puis sa pente ═════════════════════════════ */}
      <Panneau {...b.B3} t={t}>
        <EnTete opacity={ouverture("B3") * (1 - q3)}>LE RÉSULTAT</EnTete>
        <EnTete opacity={q3}>ET ÇA S'APLATIT VITE</EnTete>

        <Txt
          x={CX}
          y={melange(900, 470, q3)}
          taille={melange(180, 80, q3)}
          couleur={AMBRE}
          espace={2}
          opacity={chiffre}
        >
          +0,24 %
        </Txt>
        <Txt
          x={CX}
          y={melange(1080, 552, q3)}
          taille={melange(44, 28, q3)}
          couleur={M.gris}
          espace={4}
          opacity={parSerie}
        >
          DE GAINS PAR SÉRIE
        </Txt>

        {/* La courbe se dessine au lieu d'apparaître : on voit l'aplatissement
            arriver, c'est l'argument lui-même. */}
        {trace > 0 && (
          <g opacity={q3}>
            <line x1={170} y1={1220} x2={930} y2={1220} stroke={M.noir} strokeWidth={4} />
            <path
              d={courbe(190, 700, 1220, 380, trace)}
              fill="none"
              stroke={NEON}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Txt x={CX} y={1300} taille={28} couleur={M.gris} espace={4}>
              SÉRIES EN PLUS
            </Txt>
          </g>
        )}
        {vite > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, vite)}
            taille={corps("LES RENDEMENTS DIMINUENT VITE", 46, 3)}
            couleur={M.texte}
            espace={3}
            opacity={vite}
          >
            LES RENDEMENTS DIMINUENT VITE
          </Txt>
        )}
      </Panneau>

      {/* ══ B4 — ce qui limite vraiment ════════════════════════════════ */}
      {/* Deux jauges côte à côte : le volume continue de monter, le stimulus
          plafonne. C'est l'écart entre les deux qui porte l'idée, donc elles
          partagent la même échelle et la même base. */}
      <Panneau {...b.B4} t={t}>
        <EnTete opacity={ouverture("B4") * (1 - q4)}>AU-DELÀ D'UN CERTAIN VOLUME</EnTete>

        {volume > 0 && (
          <g opacity={1 - q4}>
            <Jauge x={320} l={240} part={volume} couleur={CYAN} libelle="VOLUME" />
            <Jauge x={760} l={240} part={stimulus} couleur={NEON} libelle="STIMULUS" />
            {plafond > 0 && (
              <g opacity={plafond}>
                <line
                  x1={610}
                  y1={1240 - 600 * 0.66}
                  x2={910}
                  y2={1240 - 600 * 0.66}
                  stroke={AMBRE}
                  strokeWidth={5}
                  strokeDasharray="16 12"
                />
                <Txt x={760} y={1240 - 600 * 0.66 - 100} taille={30} couleur={AMBRE} espace={3}>
                  PLAFOND
                </Txt>
              </g>
            )}
          </g>
        )}

        {recup > 0 && (
          <g opacity={recup} transform={`translate(0 ${melange(18, 0, recup)})`}>
            <Txt x={CX} y={880} taille={corps("C'EST TA", 116, 5)} couleur={M.texte} espace={5}>
              C'EST TA
            </Txt>
            <Txt x={CX} y={1040} taille={corps("RÉCUPÉRATION", 116, 5)} couleur={NEON} espace={5}>
              RÉCUPÉRATION
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B5 — l'autre moitié de l'équation ══════════════════════════ */}
      <Panneau {...b.B5} t={t}>
        <EnTete opacity={ouverture("B5") * (1 - q5)}>L'ÉQUATION</EnTete>
        <EnTete opacity={q5}>À QUEL POINT TU POUSSES</EnTete>

        {/* Une barre coupée en deux : la moitié connue, puis la moitié oubliée.
            Le cadre entier est posé dès le départ — le spectateur voit donc
            qu'il manque quelque chose avant qu'on le lui dise. */}
        {moitie > 0 && (
          <g opacity={1 - q5}>
            <rect x={140} y={860} width={800} height={160} fill="none" stroke={M.noir} strokeWidth={5} />
            <rect x={140} y={860} width={400 * moitie} height={160} fill={NEON} opacity={0.9} />
            <rect x={540} y={860} width={400 * autre} height={160} fill={CYAN} opacity={0.9} />
            <Txt x={340} y={1110} taille={30} couleur={NEON} espace={2} opacity={moitie}>
              LE NOMBRE
            </Txt>
            <Txt x={340} y={1156} taille={30} couleur={NEON} espace={2} opacity={moitie}>
              DE SÉRIES
            </Txt>
            <Txt x={740} y={1110} taille={30} couleur={CYAN} espace={2} opacity={autre}>
              LA PROXIMITÉ
            </Txt>
            <Txt x={740} y={1156} taille={30} couleur={CYAN} espace={2} opacity={echec}>
              À L'ÉCHEC
            </Txt>
          </g>
        )}

        {/* La jauge de proximité : même géométrie qu'au beat 4, et reprise telle
            quelle au beat 11 pour que le rappel se voie. */}
        {q5 > 0 && (
          <g opacity={q5}>
            <Jauge x={CX} l={260} part={0.92 * monte} couleur={CYAN} libelle="PROXIMITÉ À L'ÉCHEC" />
            <line x1={400} y1={660} x2={680} y2={660} stroke={AMBRE} strokeWidth={5} strokeDasharray="16 12" />
            <Txt x={790} y={660} taille={30} couleur={AMBRE} espace={3} ancre="start">
              ÉCHEC
            </Txt>
          </g>
        )}
        {plusProche > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, plusProche)}
            taille={corps("CHAQUE SÉRIE, AU PLUS PROCHE", 44, 3)}
            couleur={M.texte}
            espace={3}
            opacity={plusProche}
          >
            CHAQUE SÉRIE, AU PLUS PROCHE
          </Txt>
        )}
      </Panneau>

      {/* ══ B6 — une seule série suffit ════════════════════════════════ */}
      {/* Le brief demande ici du plein écran, sans rien autour. C'est aussi la
          seule révélation du montage qui tienne en trois mots : on la laisse
          seule. */}
      <Panneau {...b.B6} t={t}>
        <EnTete opacity={ouverture("B6") * (1 - q6)}>PARCE QUE</EnTete>
        <EnTete opacity={q6}>SUFFIT À PRODUIRE</EnTete>

        {uneSerie > 0 && (
          <g opacity={uneSerie * (1 - q6)}>
            <Txt x={CX} y={880} taille={corps("MÊME 1 SÉRIE", 110, 4)} couleur={M.texte} espace={4}>
              MÊME 1 SÉRIE
            </Txt>
            <Txt x={CX} y={1030} taille={corps("À L'ÉCHEC", 110, 4)} couleur={NEON} espace={4}>
              À L'ÉCHEC
            </Txt>
          </g>
        )}
        {exercice > 0 && (
          <Txt x={CX} y={1230} taille={36} couleur={M.gris} espace={4} opacity={exercice * (1 - q6)}>
            PAR EXERCICE
          </Txt>
        )}
        {mesurables > 0 && (
          <g opacity={mesurables} transform={`translate(0 ${melange(18, 0, mesurables)})`}>
            <Txt x={CX} y={880} taille={corps("DES GAINS", 116, 5)} couleur={M.texte} espace={5}>
              DES GAINS
            </Txt>
            <Txt x={CX} y={1040} taille={corps("MESURABLES", 116, 5)} couleur={AMBRE} espace={5}>
              MESURABLES
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B7 — la fourchette ═════════════════════════════════════════ */}
      {/* L'axe reste à l'écran d'un écran à l'autre : c'est lui qui fait le lien
          entre « voilà la zone » et « et elle dépend de toi ». */}
      <Panneau {...b.B7} t={t}>
        <EnTete opacity={ouverture("B7") * (1 - q7)}>LA ZONE LA PLUS ÉTUDIÉE</EnTete>
        <EnTete opacity={q7}>MAIS ELLE DÉPEND DE TOI</EnTete>

        {/* L'axe se trace d'abord, seul, pendant que Robin annonce la zone :
            deux secondes qui étaient auparavant immobiles. La bande colorée ne
            vient se poser dessus qu'au moment où il donne les chiffres. */}
        {axe > 0 && (
          <>
            <line x1={120} y1={1110} x2={melange(120, 960, axe)} y2={1110} stroke={M.gris} strokeWidth={5} />
            {axe < 1 && (
              <rect x={melange(120, 960, axe) - 8} y={1094} width={16} height={32} fill={NEON} />
            )}
            {[
              { x: 120, l: "0", vif: false },
              { x: 400, l: "10", vif: true },
              { x: 680, l: "20", vif: true },
              { x: 960, l: "30", vif: false },
            ].map((g) => {
              const e = rd(melange(120, 960, axe), g.x - 30, g.x + 20) * (g.vif ? 1 : 0.45);
              return e <= 0 ? null : (
                <g key={g.l} opacity={e}>
                  <line x1={g.x} y1={1110} x2={g.x} y2={1142} stroke={g.vif ? NEON : M.gris} strokeWidth={4} />
                  <Txt x={g.x} y={1190} taille={g.vif ? 38 : 28} couleur={g.vif ? NEON : M.gris} espace={2}>
                    {g.l}
                  </Txt>
                </g>
              );
            })}
          </>
        )}
        {bande > 0 && (
          <>
            <Txt x={CX} y={800} taille={corps("10 À 20 SÉRIES", 96, 4)} couleur={NEON} espace={4} opacity={bande * (1 - q7)}>
              10 À 20 SÉRIES
            </Txt>
            <rect x={400} y={1010} width={280 * bande} height={100} fill={NEON} opacity={0.9} />
          </>
        )}

        {/* « Alors oui, ça peut sembler large » : la double flèche mesure la
            zone pendant qu'il le dit, et le socle enchaîne sur ses mots. */}
        {largeur > 0 && (
          <g opacity={largeur * (1 - q7)}>
            <line
              x1={melange(540, 400, largeur)}
              y1={1270}
              x2={melange(540, 680, largeur)}
              y2={1270}
              stroke={AMBRE}
              strokeWidth={5}
            />
            <path
              d={`M ${melange(540, 428, largeur)} 1246 L ${melange(540, 400, largeur)} 1270 L ${melange(540, 428, largeur)} 1294`}
              fill="none"
              stroke={AMBRE}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${melange(540, 652, largeur)} 1246 L ${melange(540, 680, largeur)} 1270 L ${melange(540, 652, largeur)} 1294`}
              fill="none"
              stroke={AMBRE}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
        {parSemaine > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, parSemaine)}
            taille={corps("PAR MUSCLE ET PAR SEMAINE", 44, 3)}
            couleur={M.texte}
            espace={3}
            opacity={parSemaine * (1 - largeur)}
          >
            PAR MUSCLE ET PAR SEMAINE
          </Txt>
        )}
        {largeur > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("ÇA PEUT SEMBLER LARGE", 44, 3)}
            couleur={AMBRE}
            espace={3}
            opacity={largeur * (1 - q7)}
          >
            ÇA PEUT SEMBLER LARGE
          </Txt>
        )}
        {q7 > 0 && (
          <Txt x={CX} y={800} taille={corps("ÇA DÉPEND DE TOI", 92, 4)} couleur={M.texte} espace={4} opacity={q7}>
            ÇA DÉPEND DE TOI
          </Txt>
        )}
        {individuels > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("FACTEURS INDIVIDUELS", 44, 3)}
            couleur={AMBRE}
            espace={3}
            opacity={individuels}
          >
            FACTEURS INDIVIDUELS
          </Txt>
        )}
      </Panneau>

      {/* ══ B8 — modéré contre élevé ═══════════════════════════════════ */}
      {/* Reprise exacte de la structure qui a fonctionné au Jour 1 : les groupes
          d'abord, puis les barres qui les remplacent. */}
      <Panneau {...b.B8} t={t}>
        <EnTete opacity={ouverture("B8") * (1 - q8)}>MODÉRÉ CONTRE ÉLEVÉ</EnTete>
        <EnTete opacity={q8}>LE RÉSULTAT</EnTete>

        {[
          { x: 285, c: NEON, l: "VOLUME", l2: "MODÉRÉ", h: 300, e: modere },
          { x: 795, c: CYAN, l: "VOLUME", l2: "ÉLEVÉ", h: 292, e: eleve },
        ].map((g, gi) => (
          <g key={g.l2}>
            {g.e > 0 &&
              [0, 1, 2, 3, 4, 5].map((i) => {
                const e = rd(g.e, i * 0.06, i * 0.06 + 0.35);
                return e <= 0 ? null : (
                  <Perso
                    key={i}
                    x={g.x - 96 + (i % 3) * 96}
                    y={630 + Math.floor(i / 3) * 150}
                    k={0.7}
                    couleur={g.c}
                    opacity={e * 0.85 * (1 - q8)}
                  />
                );
              })}
            <g opacity={g.e * (1 - q8)}>
              <Txt x={g.x} y={940} taille={30} couleur={g.c} espace={2}>
                {g.l}
              </Txt>
              <Txt x={g.x} y={986} taille={30} couleur={g.c} espace={2}>
                {g.l2}
              </Txt>
            </g>

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
            {gi === 0 && barres > 0 && (
              <line x1={150} y1={1250} x2={930} y2={1250} stroke={M.noir} strokeWidth={4} opacity={barres} />
            )}
          </g>
        ))}

        {plupart > 0 && (
          <g opacity={plupart} transform={`translate(0 ${melange(24, 0, plupart)})`}>
            <Case x={CX} y={1470} l={760} h={200} couleur={M.texte} />
            <Txt x={CX} y={1424} taille={corps("AUCUNE DIFFÉRENCE", 48, 3, 700)} couleur={M.texte} espace={3}>
              AUCUNE DIFFÉRENCE
            </Txt>
            <Txt x={CX} y={1508} taille={corps("SUR LA PLUPART DES MUSCLES", 30, 3, 700)} couleur={M.gris} espace={3}>
              SUR LA PLUPART DES MUSCLES
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B9 — ce qui fait varier ton chiffre ════════════════════════ */}
      <Panneau {...b.B9} t={t}>
        <EnTete opacity={ouverture("B9") * (1 - q9)}>ON POURRAIT CONCLURE</EnTete>
        <EnTete opacity={q9}>CE QUI FAIT VARIER TON CHIFFRE</EnTete>

        {suffit > 0 && (
          <g opacity={(1 - q9) * melange(1, 0.35, mais)}>
            <Txt
              x={CX}
              y={920}
              taille={corps("LA FOURCHETTE SUFFIT", 72, 4)}
              couleur={M.texte}
              espace={4}
              opacity={suffit}
            >
              LA FOURCHETTE SUFFIT
            </Txt>
            <Txt x={CX} y={1050} taille={corps("AMPLEMENT", 72, 4)} couleur={M.texte} espace={4} opacity={suffit}>
              AMPLEMENT
            </Txt>
          </g>
        )}
        {mais > 0 && (
          <Txt x={CX} y={1270} taille={64} couleur={AMBRE} espace={6} opacity={mais * (1 - q9)}>
            MAIS…
          </Txt>
        )}

        {/* Les trois facteurs entrent l'un après l'autre sous le personnage, une
            ligne chacun : c'est une énumération, elle se lit de haut en bas. */}
        {q9 > 0 && (
          <>
            <Perso x={CX} y={720} k={1.6} opacity={q9} />
            {facteurs.map((f) => (
              <g key={f.l} transform={`translate(0 ${melange(30, 0, f.e)})`}>
                <Etiquette x={CX} y={f.y} l={700} h={124} couleur={f.c} vise={44} espace={3} opacity={f.e * q9}>
                  {f.l}
                </Etiquette>
              </g>
            ))}
          </>
        )}
      </Panneau>

      {/* ══ B10 — la variabilité entre personnes ═══════════════════════ */}
      <Panneau {...b.B10} t={t}>
        <EnTete opacity={ouverture("B10") * (1 - q10)}>SUR LE MÊME PROGRAMME</EnTete>
        <EnTete opacity={q10}>LES GAINS MESURÉS</EnTete>

        {mesure > 0 && (
          <Txt
            x={CX}
            y={960}
            taille={corps("UNE ÉTUDE A MESURÉ", 82, 4)}
            couleur={M.texte}
            espace={4}
            opacity={mesure * (1 - q10)}
          >
            UNE ÉTUDE A MESURÉ
          </Txt>
        )}

        {ecart > 0 && (
          <g opacity={ecart}>
            <Txt x={430} y={900} taille={melange(80, 120, ecart)} couleur={AMBRE} espace={2} ancre="end">
              0 %
            </Txt>
            <line x1={470} y1={900} x2={melange(470, 600, ecart)} y2={900} stroke={M.gris} strokeWidth={7} strokeLinecap="round" />
            <path
              d="M 578 876 L 614 900 L 578 924"
              fill="none"
              stroke={M.gris}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={rd(ecart, 0.7, 1)}
            />
            <Txt x={650} y={900} taille={melange(80, 120, ecart)} couleur={AMBRE} espace={2} ancre="start">
              {`${jusqua59} %`}
            </Txt>
          </g>
        )}
        {selon > 0 && (
          <Txt x={CX} y={1120} taille={corps("SELON LES PERSONNES", 40, 4)} couleur={M.gris} espace={4} opacity={selon}>
            SELON LES PERSONNES
          </Txt>
        )}
        {chacun > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, chacun)}
            taille={corps("CHACUN RÉAGIT DIFFÉREMMENT", 46, 3)}
            couleur={M.texte}
            espace={3}
            opacity={chacun}
          >
            CHACUN RÉAGIT DIFFÉREMMENT
          </Txt>
        )}
      </Panneau>

      {/* ══ B11 — l'avis de Robin ══════════════════════════════════════ */}
      {/* La jauge du beat 5 revient ici, à la même place et à la même échelle,
          mais arrêtée bien avant le repère « ÉCHEC » : c'est le même dessin, et
          c'est ce qui fait comprendre l'écart sans une ligne de texte de plus. */}
      <Panneau {...b.B11} t={t}>
        <EnTete opacity={ouverture("B11") * (1 - q11)}>MON AVIS</EnTete>
        <EnTete opacity={q11}>POURQUOI PAS PLUS</EnTete>

        {dixDouze > 0 && (
          <Txt
            x={CX}
            y={820}
            taille={corps("10 À 12 SÉRIES", 104, 4)}
            couleur={NEON}
            espace={4}
            opacity={dixDouze * (1 - q11)}
          >
            10 À 12 SÉRIES
          </Txt>
        )}

        {/* Le même axe qu'au beat 7, à la même échelle : la zone étudiée est
            rappelée en pointillés, et la barre s'y resserre sur les 10 à 12
            séries de Robin. C'est le rappel qui fait l'argument. */}
        {rappelZone > 0 && (
          <g opacity={rappelZone * (1 - q11)}>
            <rect
              x={400}
              y={1010}
              width={melange(280, 56, resserre) * rappelZone}
              height={100}
              fill={NEON}
              opacity={0.9}
            />
            <rect
              x={400}
              y={1010}
              width={280}
              height={100}
              fill="none"
              stroke={M.gris}
              strokeWidth={4}
              strokeDasharray="14 10"
              opacity={resserre * 0.8}
            />
            <line x1={120} y1={1110} x2={960} y2={1110} stroke={M.gris} strokeWidth={4} />
            {[
              { x: 120, l: "0", vif: false },
              { x: 400, l: "10", vif: true },
              { x: 680, l: "20", vif: false },
              { x: 960, l: "30", vif: false },
            ].map((g) => (
              <g key={g.l} opacity={g.vif ? 1 : 0.45}>
                <line x1={g.x} y1={1110} x2={g.x} y2={1142} stroke={g.vif ? NEON : M.gris} strokeWidth={4} />
                <Txt x={g.x} y={1190} taille={g.vif ? 38 : 28} couleur={g.vif ? NEON : M.gris} espace={2}>
                  {g.l}
                </Txt>
              </g>
            ))}
          </g>
        )}
        {semaine > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("PAR MUSCLE ET PAR SEMAINE", 44, 3)}
            couleur={M.texte}
            espace={3}
            opacity={semaine * (1 - q11)}
          >
            PAR MUSCLE ET PAR SEMAINE
          </Txt>
        )}

        {q11 > 0 && (
          <g opacity={q11}>
            <Jauge x={CX} l={260} part={rappel} couleur={CYAN} libelle="LÀ OÙ S'ARRÊTENT LA PLUPART" />
            <line x1={400} y1={660} x2={680} y2={660} stroke={AMBRE} strokeWidth={5} strokeDasharray="16 12" />
            <Txt x={790} y={660} taille={30} couleur={AMBRE} espace={3} ancre="start">
              ÉCHEC
            </Txt>
          </g>
        )}
        {pasEchec > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, pasEchec)}
            taille={corps("PEU DE GENS Y VONT VRAIMENT", 44, 3)}
            couleur={M.texte}
            espace={3}
            opacity={pasEchec}
          >
            PEU DE GENS Y VONT VRAIMENT
          </Txt>
        )}
      </Panneau>

      {/* ══ B12 — la conclusion ════════════════════════════════════════ */}
      <Panneau {...b.B12} t={t}>
        <EnTete opacity={ouverture("B12")}>LES DEUX SE COMPENSENT</EnTete>

        <g transform={`translate(0 ${melange(-36, 0, intensite)})`}>
          <Etiquette x={CX} y={780} l={700} h={160} couleur={AMBRE} vise={58} espace={3} opacity={intensite}>
            + D'INTENSITÉ
          </Etiquette>
        </g>
        {fleche > 0 && (
          <g opacity={fleche}>
            <line
              x1={CX}
              y1={876}
              x2={CX}
              y2={melange(876, 1060, fleche)}
              stroke={AMBRE}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <Pointe x={CX} y={1072} couleur={AMBRE} opacity={rd(fleche, 0.75, 1)} />
            <Txt x={700} y={985} taille={34} couleur={M.gris} espace={4} ancre="start" opacity={rd(fleche, 0.35, 0.8)}>
              PERMET
            </Txt>
          </g>
        )}
        <g transform={`translate(0 ${melange(36, 0, diminuer)})`}>
          <Etiquette x={CX} y={1240} l={700} h={160} couleur={NEON} vise={58} espace={3} opacity={diminuer}>
            − DE VOLUME
          </Etiquette>
        </g>
        {inversement > 0 && (
          <Txt x={CX} y={SOCLE} taille={40} couleur={M.gris} espace={5} opacity={inversement}>
            ET INVERSEMENT
          </Txt>
        )}
      </Panneau>
    </>
  );
};
