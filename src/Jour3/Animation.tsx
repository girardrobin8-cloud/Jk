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
 * Le motion design du reel Jour 3, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Particularité de cette vidéo : il n'y a PAS de rush. Robin a livré un export
 * audio sur fond noir, donc les deux fenêtres que le brief réserve à la caméra
 * — le hook et le CTA — sont animées elles aussi. `CAMERA`, dans reperes.ts,
 * dit lesquelles rendre au tournage quand il arrivera ; les panneaux
 * correspondants s'effacent alors tout seuls.
 *
 * Le reste suit la méthode des deux vidéos précédentes : un beat se joue en
 * deux écrans successifs, trois blocs au plus à l'écran, les bandes séparées
 * d'au moins 90 px, tous les corps de texte mesurés, et l'en-tête de chaque
 * beat monte AVEC son panneau pour qu'aucune borne ne laisse voir un écran
 * vide.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);
const aLaCamera = (id: string) => CAMERA.includes(id);

// ── Repères internes, en secondes de l'export d'origine ──────────────────
/**
 * Chaque valeur est LUE sur les sous-titres incrustés. Le commentaire cite le
 * mot visé et l'instant où il s'affiche, ce qui permet de vérifier un calage
 * sans relancer l'extraction. `mappe()` les transpose ensuite dans le montage
 * aux blancs resserrés, une fois pour toutes.
 */
const RUSH = {
  // ── B1 — 0 → 4,60 : le hook
  programme: 0.6, // « le meilleur programme du monde »  0,8 → 1,7
  cinqH: 2.1, // « si tu dors 5h par nuit »              2,0 → 3,0
  rien: 3.3, // « ça ne sert strictement à rien »        3,2 → 4,2

  // ── B2 — 4,60 → 11,60 : le mécanisme
  profond: 4.9, // « c'est pendant le sommeil profond »  4,9 → 5,9
  secrete: 6.5, // « que ton corps sécrète »             6,3 → 6,9
  hormones: 8.0, // « la majorité de tes hormones »      7,6 → 9,0
  reparation: 10.0, // « à la réparation musculaire »    9,6 → 10,9

  // ── B3 — 11,60 → 15,15 : la fenêtre qui se referme
  moins: 12.0, // « moins tu dors profondément »         12,0 → 12,8
  fenetre: 13.4, // « moins cette fenêtre est exploitée » 13,5 → 14,6

  // ── B4 — 15,15 → 21,25 : le dérèglement hormonal
  manque: 15.6, // « le manque de sommeil »              15,6 → 16,2
  cortisol: 16.7, // « fait grimper ton cortisol »       16,7 → 17,4
  testo: 18.6, // « en faisant baisser ta testostérone » 18,2 → 20,5
  bilan: 20.1, // le bilan des deux, au socle

  // ── B5 — 21,25 → 28,55 : l'étude
  etude: 21.6, // « cette étude a suivi »                21,6 → 22,2
  basket: 22.4, // « des basketteurs universitaires »    22,4 → 23,4
  etendu: 24.4, // « qui ont étendu leur sommeil »       24,2 → 25,2
  dixH: 25.4, // « d'environ dix heures par nuit »       25,5 → 26,7
  semaines: 27.3, // « pendant 5 à 7 semaines »          27,4 → 28,3

  // ── B6 — 28,55 → 32,40 : les résultats
  resultats: 28.8, // « résultats »                      28,8
  sprint: 29.3, // « sprint plus rapide »                29,4 → 30,2
  tir: 30.4, // « tir réussi en hausse »                 30,5 → 31,4
  neufPct: 30.9, // « en hausse de 9 % »                  31,4 → 31,8

  // ── B7 — 32,40 → 36,75 : la fourchette générale
  fourchette: 32.6, // « la fourchette générale recommandée » 32,6 → 33,8
  chiffre: 34.2, // « environ 7h30 à 9h »                34,4 → 35,7
  deSommeil: 36.0, // « de sommeil »                     36,1 → 36,2

  // ── B8 — 36,75 → 45,20 : les sportifs de haut niveau
  sportifs: 37.0, // « on pourrait recommander à des sportifs » 36,9 → 38,2
  haltere: 37.3, // « recommander à des sportifs »        36,9 → 38,2
  hautNiveau: 38.5, // « de haut niveau »                38,7 → 39,1
  volume: 39.6, // « avec un volume »                    39,7 → 40,1
  intensite: 40.6, // « d'intensité élevée »             40,6 → 42,1
  neufDix: 42.7, // « une fourchette de 9 à dix heures » 42,8 → 44,2

  // ── B9 — 45,20 → 51,65 : les risques
  chronique: 45.5, // « manquer de sommeil chroniquement » 45,5 → 46,4
  blessure: 47.1, // « plus de risque de blessure »      46,9 → 48,0
  perf: 48.3, // « une performance qui baisse »          48,4 → 49,8
  recup: 50.1, // « une récupération qui ralentit »      50,2 → 51,2

  // ── B10 — 51,65 → fin : le CTA
  envoie: 51.9, // « envoie-moi SOMMEIL en DM »          51,9 → 52,8
  ensemble: 53.2, // « qu'on voit ensemble ta récupération » 53,1 → 54,2
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

const ONDE = { x: 150, l: 780, haut: 900, h: 240 };

/**
 * L'hypnogramme : une nuit en trois cycles et demi, du réveil vers le profond.
 *
 * `facteur` écrase la profondeur — c'est lui qui porte tout l'argument du beat
 * 3, où la même courbe est rejouée aplatie. `avance` la fait se DESSINER de
 * gauche à droite au lieu d'apparaître.
 *
 * Le tracé revient en deux morceaux : la courbe entière, et les seuls segments
 * profonds. Ce sont eux qu'on allume, parce que ce sont eux qui comptent.
 */
const onde = (avance: number, facteur: number) => {
  const N = 96;
  const pts: [number, number][] = [];
  for (let i = 0; i <= Math.max(1, Math.round(N * avance)); i++) {
    const p = i / N;
    const creux = ((1 - Math.cos(2 * Math.PI * 3.2 * p)) / 2) * (1 - 0.42 * p) * facteur;
    pts.push([ONDE.x + p * ONDE.l, ONDE.haut + creux * ONDE.h, creux] as unknown as [number, number]);
  }
  const chemin = `M ${pts.map(([x, y]) => `${x},${y}`).join(" L ")}`;
  const profonds: string[] = [];
  let courant: string[] = [];
  for (const pt of pts) {
    const creux = (pt as unknown as number[])[2];
    if (creux > 0.72) courant.push(`${pt[0]},${pt[1]}`);
    else if (courant.length > 1) {
      profonds.push(`M ${courant.join(" L ")}`);
      courant = [];
    } else courant = [];
  }
  if (courant.length > 1) profonds.push(`M ${courant.join(" L ")}`);
  return { chemin, profonds };
};

/** Le personnage, couché. Le même bonhomme que debout, tourné d'un quart. */
const Dormeur: React.FC<{ x: number; y: number; k: number; opacity: number }> = ({ x, y, k, opacity }) => (
  <g transform={`rotate(-90 ${x} ${y})`}>
    <Perso x={x} y={y} k={k} opacity={opacity} />
  </g>
);

/** Trois Z qui montent en boucle : la seule chose qui bouge en continu au beat 2. */
const Ronflement: React.FC<{ t: number; x: number; y: number; opacity: number }> = ({ t, x, y, opacity }) => (
  <>
    {[0, 1, 2].map((i) => {
      const p = ((t * 0.55 + i / 3) % 1 + 1) % 1;
      return (
        <Txt
          key={i}
          x={x + p * 70}
          y={y - p * 130}
          taille={26 + p * 22}
          couleur={CYAN}
          espace={2}
          opacity={opacity * Math.sin(Math.PI * p) * 0.9}
        >
          Z
        </Txt>
      );
    })}
  </>
);

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b = Object.fromEntries(BEATS.map((x) => [x.id, transition(t, x.id)])) as Record<
    string,
    { e: number; dy: number; k: number }
  >;
  if (Math.max(...BEATS.map((x) => b[x.id].e)) <= 0) return null;

  /** L'en-tête d'un beat monte AVEC son panneau, jamais après. */
  const ouverture = (id: string) => {
    const d = BEATS.find((x) => x.id === id)!.debut;
    return rd(t, d - FONDU, d + 0.25);
  };

  // ── B1 ────────────────────────────────────────────────────────────────
  const programme = rd(t, T.programme, T.programme + 0.6);
  const cinqH = rd(t, T.cinqH, T.cinqH + 0.6);
  const rien = rd(t, T.rien, T.rien + 0.6);
  const q1 = rd(t, T.rien - 0.45, T.rien + 0.15);

  // ── B2 ────────────────────────────────────────────────────────────────
  const dort = rd(t, T.profond, T.profond + 0.7);
  const trace = rd(t, T.profond + 0.5, T.secrete + 1.6);
  const allume = rd(t, T.hormones - 0.5, T.hormones + 0.7);
  const hormones = rd(t, T.hormones, T.hormones + 0.6);
  const reparation = rd(t, T.reparation, T.reparation + 0.6);

  // ── B3 ────────────────────────────────────────────────────────────────
  const aplatit = rd(t, T.moins + 0.4, T.fenetre + 0.5);
  const fenetre = rd(t, T.fenetre, T.fenetre + 0.6);

  // ── B4 ────────────────────────────────────────────────────────────────
  const cortisol = rd(t, T.cortisol, T.cortisol + 1.3);
  const testo = rd(t, T.testo, T.testo + 1.5);
  const bilan = rd(t, T.bilan, T.bilan + 0.6);

  // ── B5 ────────────────────────────────────────────────────────────────
  const basket = rd(t, T.basket, T.basket + 0.9);
  const etendu = rd(t, T.etendu, T.etendu + 0.6);
  const monte10 = rd(t, T.etendu + 0.3, T.dixH + 0.9);
  const semaines = rd(t, T.semaines, T.semaines + 0.6);
  const q5 = rd(t, T.etendu - 0.5, T.etendu + 0.2);

  // ── B6 ────────────────────────────────────────────────────────────────
  const sprint = rd(t, T.sprint, T.sprint + 0.6);
  const course = rd(t, T.sprint, T.sprint + 1.1);
  const q6 = rd(t, T.tir - 0.4, T.tir + 0.3);
  const tir = rd(t, T.tir, T.tir + 0.6);
  /** Le gain monte au lieu de se poser — même procédé qu'aux Jours 2. */
  const neuf = Math.round(9 * rd(t, T.neufPct, T.neufPct + 0.9));

  // ── B7 ────────────────────────────────────────────────────────────────
  /** L'axe se trace dès l'ouverture : sinon l'écran tient une seconde et demie
      sur son seul en-tête, avant que le chiffre n'arrive. */
  const axe7 = rd(t, T.fourchette + 0.1, T.fourchette + 1.3);
  const chiffre = rd(t, T.chiffre, T.chiffre + 0.7);
  const bande7 = rd(t, T.chiffre + 0.3, T.chiffre + 1.4);
  const deSommeil = rd(t, T.deSommeil, T.deSommeil + 0.5);

  // ── B8 ────────────────────────────────────────────────────────────────
  const haltere = rd(t, T.haltere, T.haltere + 0.6);
  /** Les deux jauges se posent VIDES sur « de haut niveau », et ne se
      remplissent qu'ensuite : l'écran tenait sinon une seconde et demie sur son
      en-tête et son haltère, sans rien qui bouge. */
  const cadres = rd(t, T.hautNiveau, T.hautNiveau + 0.7);
  const volume = rd(t, T.volume, T.volume + 1.0);
  const intensite = rd(t, T.intensite, T.intensite + 1.2);
  const q8 = rd(t, T.neufDix - 0.5, T.neufDix + 0.2);
  const neufDix = rd(t, T.neufDix, T.neufDix + 0.6);
  const rallonge = rd(t, T.neufDix + 0.3, T.neufDix + 1.3);

  // ── B9 ────────────────────────────────────────────────────────────────
  const slots = rd(t, T.chronique + 0.2, T.chronique + 1.0);
  const risques = [
    { l: "RISQUE DE BLESSURE", e: rd(t, T.blessure, T.blessure + 0.6), y: 800, c: M.corail, i: "croix" },
    { l: "PERFORMANCE EN BAISSE", e: rd(t, T.perf, T.perf + 0.6), y: 1010, c: AMBRE, i: "pente" },
    { l: "RÉCUPÉRATION QUI RALENTIT", e: rd(t, T.recup, T.recup + 0.6), y: 1220, c: CYAN, i: "horloge" },
  ];
  /** Un seul corps pour les trois lignes : celui de la plus longue. Sinon la
      liste dégringole de 46 à 32 px et se lit comme une hiérarchie. */
  const corpsRisque = Math.min(...risques.map((r) => corps(r.l, 46, 3, 580)));

  // ── B10 ───────────────────────────────────────────────────────────────
  const envoie = rd(t, T.envoie, T.envoie + 0.6);
  const ensemble = rd(t, T.ensemble, T.ensemble + 0.6);

  const nuit2 = onde(trace, 1);
  const nuit3 = onde(1, melange(1, 0.34, aplatit));

  /** Les trois pictogrammes du beat 9, dessinés à la main dans 72 px. */
  const picto = (nom: string, x: number, y: number, c: string) =>
    nom === "croix" ? (
      <g>
        <rect x={x - 10} y={y - 30} width={20} height={60} fill={c} />
        <rect x={x - 30} y={y - 10} width={60} height={20} fill={c} />
      </g>
    ) : nom === "pente" ? (
      <path
        d={`M ${x - 32} ${y - 24} L ${x - 4} ${y + 4} L ${x + 10} ${y - 8} L ${x + 32} ${y + 26}`}
        fill="none"
        stroke={c}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <g>
        <circle cx={x} cy={y} r={28} fill="none" stroke={c} strokeWidth={6} />
        <path d={`M ${x} ${y - 16} L ${x} ${y} L ${x + 16} ${y + 8}`} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />
      </g>
    );

  return (
    <>
      {/* ══ B1 — le hook ═══════════════════════════════════════════════ */}
      {/* Animé faute de tournage. Ajouter "B1" à CAMERA le fait disparaître. */}
      {!aLaCamera("B1") && (
        <Panneau {...b.B1} t={t}>
          <EnTete opacity={ouverture("B1") * (1 - q1)}>LE MEILLEUR PROGRAMME DU MONDE</EnTete>
          {programme > 0 && (
            <g opacity={(1 - q1) * programme} transform={`translate(0 ${melange(30, 0, programme)})`}>
              <Perso x={CX} y={820} k={2.0} couleur={NEON} />
            </g>
          )}
          {cinqH > 0 && (
            <g opacity={(1 - q1) * cinqH} transform={`translate(0 ${melange(34, 0, cinqH)})`}>
              <Etiquette x={CX} y={1180} l={520} h={160} couleur={M.corail} vise={72} espace={3}>
                5H PAR NUIT
              </Etiquette>
            </g>
          )}
          {rien > 0 && (
            <g opacity={rien} transform={`translate(0 ${melange(20, 0, rien)})`}>
              <Txt x={CX} y={880} taille={corps("ÇA NE SERT", 122, 5)} couleur={M.texte} espace={5}>
                ÇA NE SERT
              </Txt>
              <Txt x={CX} y={1040} taille={corps("À RIEN", 122, 5)} couleur={M.corail} espace={5}>
                À RIEN
              </Txt>
            </g>
          )}
        </Panneau>
      )}

      {/* ══ B2 — le mécanisme ══════════════════════════════════════════ */}
      {/* Le dormeur et ses Z tournent en boucle du début à la fin du beat :
          c'est ce qui empêche l'écran d'être figé pendant que l'hypnogramme se
          trace, puis pendant qu'on lit les deux libellés. */}
      <Panneau {...b.B2} t={t}>
        <EnTete opacity={ouverture("B2")}>PENDANT LE SOMMEIL PROFOND</EnTete>

        {dort > 0 && (
          <>
            <Dormeur x={330} y={680} k={1.4} opacity={dort} />
            <Ronflement t={t} x={500} y={640} opacity={dort} />
          </>
        )}

        {trace > 0 && (
          <g>
            <path d={nuit2.chemin} fill="none" stroke={M.noir} strokeWidth={7} strokeLinejoin="round" />
            {nuit2.profonds.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={NEON}
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={allume}
              />
            ))}
            <Txt x={CX} y={ONDE.haut + ONDE.h + 74} taille={28} couleur={M.gris} espace={4} opacity={trace}>
              UNE NUIT
            </Txt>
          </g>
        )}

        {hormones > 0 && (
          <g transform={`translate(0 ${melange(26, 0, hormones)})`}>
            <Etiquette x={CX} y={1380} l={760} h={124} couleur={NEON} vise={42} espace={3} opacity={hormones}>
              HORMONE DE CROISSANCE
            </Etiquette>
          </g>
        )}
        {reparation > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 90, SOCLE + 80, reparation)}
            taille={corps("RÉPARATION MUSCULAIRE", 46, 3)}
            couleur={M.texte}
            espace={3}
            opacity={reparation}
          >
            RÉPARATION MUSCULAIRE
          </Txt>
        )}
      </Panneau>

      {/* ══ B3 — la fenêtre qui se referme ═════════════════════════════ */}
      {/* La MÊME courbe qu'au beat 2, rejouée aplatie. Reprendre le dessin plutôt
          que d'en inventer un autre est ce qui rend la perte lisible d'un coup
          d'œil : les creux profonds s'éteignent sous les yeux. */}
      <Panneau {...b.B3} t={t}>
        <EnTete opacity={ouverture("B3")}>MOINS TU DORS PROFONDÉMENT</EnTete>

        <path d={nuit3.chemin} fill="none" stroke={M.noir} strokeWidth={7} strokeLinejoin="round" />
        {nuit3.profonds.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={NEON}
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={1 - aplatit}
          />
        ))}
        <line
          x1={ONDE.x}
          y1={ONDE.haut + ONDE.h * 0.72}
          x2={ONDE.x + ONDE.l}
          y2={ONDE.haut + ONDE.h * 0.72}
          stroke={AMBRE}
          strokeWidth={4}
          strokeDasharray="16 12"
          opacity={0.8}
        />
        <Txt x={CX} y={ONDE.haut + ONDE.h + 74} taille={28} couleur={AMBRE} espace={4}>
          SEUIL DU SOMMEIL PROFOND
        </Txt>

        {fenetre > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, fenetre)}
            taille={corps("LA FENÊTRE SE REFERME", 52, 3)}
            couleur={M.corail}
            espace={3}
            opacity={fenetre}
          >
            LA FENÊTRE SE REFERME
          </Txt>
        )}
      </Panneau>

      {/* ══ B4 — le dérèglement hormonal ═══════════════════════════════ */}
      <Panneau {...b.B4} t={t}>
        <EnTete opacity={ouverture("B4")}>LE MANQUE DE SOMMEIL</EnTete>

        <Jauge x={320} l={240} part={cortisol} couleur={M.corail} libelle="CORTISOL" opacity={cortisol > 0 ? 1 : 0} />
        <Jauge x={760} l={240} part={melange(0.85, 0.2, testo)} couleur={NEON} libelle="TESTO + IGF-1" opacity={cortisol} />

        {/* Les deux flèches disent le sens, que les jauges seules ne donnent
            qu'après coup. Dessinées et non écrites : la police du dépôt n'a pas
            les caractères ↑ et ↓, ils sortaient en traits maigres. */}
        <path
          d="M 320 620 L 320 556 M 296 578 L 320 550 L 344 578"
          fill="none"
          stroke={M.corail}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={rd(cortisol, 0.25, 0.7)}
        />
        <path
          d="M 760 550 L 760 614 M 736 592 L 760 620 L 784 592"
          fill="none"
          stroke={NEON}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={testo}
        />

        {bilan > 0 && (
          <g opacity={bilan} transform={`translate(0 ${melange(24, 0, bilan)})`}>
            <Txt x={CX} y={SOCLE + 20} taille={corps("PLUS DE DÉGRADATION", 52, 3)} couleur={M.corail} espace={3}>
              PLUS DE DÉGRADATION
            </Txt>
            <Txt x={CX} y={SOCLE + 100} taille={corps("MOINS DE CONSTRUCTION", 52, 3)} couleur={NEON} espace={3}>
              MOINS DE CONSTRUCTION
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B5 — l'étude ═══════════════════════════════════════════════ */}
      <Panneau {...b.B5} t={t}>
        <EnTete opacity={ouverture("B5") * (1 - q5)}>UNE ÉTUDE A SUIVI</EnTete>
        <EnTete opacity={q5}>ILS ONT ÉTENDU LEUR SOMMEIL</EnTete>

        {basket > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const e = rd(basket, i * 0.09, i * 0.09 + 0.4);
            return e <= 0 ? null : (
              <Perso key={i} x={200 + i * 170} y={melange(760, 720, e)} k={1.0} couleur={CYAN} opacity={e * (1 - q5 * 0.55)} />
            );
          })}
        {basket > 0 && (
          <Txt x={CX} y={930} taille={corps("BASKETTEURS UNIVERSITAIRES", 40, 4)} couleur={CYAN} espace={4} opacity={basket}>
            BASKETTEURS UNIVERSITAIRES
          </Txt>
        )}

        {/* La barre de sommeil s'allonge jusqu'à dix heures : le geste est
            l'information, la valeur ne fait que la confirmer. */}
        {etendu > 0 && (
          <g opacity={etendu}>
            <rect x={150} y={1060} width={780} height={96} fill="none" stroke={M.noir} strokeWidth={5} />
            <rect x={150} y={1060} width={(780 * (6 + 4 * monte10)) / 12} height={96} fill={NEON} opacity={0.9} />
            <Txt x={150 + (780 * (6 + 4 * monte10)) / 12 - 70} y={1108} taille={52} couleur={M.fond} espace={3}>
              {`${(6 + 4 * monte10).toFixed(0)} H`}
            </Txt>
            <Txt x={CX} y={1230} taille={30} couleur={M.gris} espace={4}>
              PAR NUIT
            </Txt>
          </g>
        )}
        {semaines > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, semaines)}
            taille={corps("PENDANT 5 À 7 SEMAINES", 48, 3)}
            couleur={M.texte}
            espace={3}
            opacity={semaines}
          >
            PENDANT 5 À 7 SEMAINES
          </Txt>
        )}
      </Panneau>

      {/* ══ B6 — les résultats ═════════════════════════════════════════ */}
      <Panneau {...b.B6} t={t}>
        <EnTete opacity={ouverture("B6") * (1 - q6)}>RÉSULTATS</EnTete>
        <EnTete opacity={q6}>TIRS RÉUSSIS</EnTete>

        {/* Le coureur traverse le cadre, sa traînée derrière lui : le mot
            « sprint » ne peut pas être illustré par une image fixe. */}
        {sprint > 0 && (
          <g opacity={sprint * (1 - q6)}>
            {[0, 1, 2].map((i) => (
              <Perso
                key={i}
                x={melange(190, 850, course) - i * 152}
                y={880}
                k={1.3}
                couleur={NEON}
                opacity={sprint * (i === 0 ? 1 : 0.22 / i)}
              />
            ))}
            <Txt x={CX} y={1130} taille={corps("SPRINT PLUS RAPIDE", 64, 4)} couleur={M.texte} espace={4}>
              SPRINT PLUS RAPIDE
            </Txt>
          </g>
        )}

        {tir > 0 && (
          <g opacity={tir} transform={`translate(0 ${melange(22, 0, tir)})`}>
            <Txt x={CX} y={920} taille={168} couleur={AMBRE} espace={2}>
              {`+${neuf} %`}
            </Txt>
            <Txt x={CX} y={1110} taille={corps("DE TIRS RÉUSSIS EN PLUS", 44, 4)} couleur={M.gris} espace={4}>
              DE TIRS RÉUSSIS EN PLUS
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B7 — la fourchette générale ════════════════════════════════ */}
      {/* L'axe des heures posé ici sert deux fois : le beat 8 le reprend tel
          quel pour y prolonger la zone. */}
      <Panneau {...b.B7} t={t}>
        <EnTete opacity={ouverture("B7")}>LA FOURCHETTE RECOMMANDÉE</EnTete>

        {chiffre > 0 && (
          <g opacity={chiffre} transform={`translate(0 ${melange(24, 0, chiffre)})`}>
            <Txt x={CX} y={860} taille={corps("7H30 À 9H", 148, 6)} couleur={AMBRE} espace={6}>
              7H30 À 9H
            </Txt>
          </g>
        )}
        {axe7 > 0 && (
          <g>
            <rect x={380} y={1060} width={240 * bande7} height={100} fill={AMBRE} opacity={0.9} />
            <line x1={140} y1={1160} x2={melange(140, 940, axe7)} y2={1160} stroke={M.gris} strokeWidth={4} />
            {axe7 < 1 && <rect x={melange(140, 940, axe7) - 8} y={1144} width={16} height={32} fill={AMBRE} />}
            {[
              { x: 140, l: "6H", vif: false },
              { x: 380, l: "7H30", vif: true },
              { x: 620, l: "9H", vif: true },
              { x: 780, l: "10H", vif: false },
              { x: 940, l: "11H", vif: false },
            ].map((g) => (
              <g key={g.l} opacity={rd(melange(140, 940, axe7), g.x - 30, g.x + 20) * (g.vif ? 1 : 0.4)}>
                <line x1={g.x} y1={1160} x2={g.x} y2={1192} stroke={g.vif ? AMBRE : M.gris} strokeWidth={4} />
                <Txt x={g.x} y={1240} taille={g.vif ? 34 : 26} couleur={g.vif ? AMBRE : M.gris} espace={2}>
                  {g.l}
                </Txt>
              </g>
            ))}
          </g>
        )}
        {deSommeil > 0 && (
          <Txt x={CX} y={SOCLE} taille={corps("DE SOMMEIL PAR NUIT", 48, 3)} couleur={M.texte} espace={3} opacity={deSommeil}>
            DE SOMMEIL PAR NUIT
          </Txt>
        )}
      </Panneau>

      {/* ══ B8 — les sportifs de haut niveau ═══════════════════════════ */}
      <Panneau {...b.B8} t={t}>
        <EnTete opacity={ouverture("B8") * (1 - q8)}>SPORTIFS DE HAUT NIVEAU</EnTete>
        <EnTete opacity={q8}>ALORS LE HAUT DE LA FOURCHETTE</EnTete>

        {haltere > 0 && (
          <g opacity={haltere * (1 - q8)} transform={`translate(0 ${melange(-26, 0, haltere)})`}>
            <rect x={CX - 84} y={666} width={168} height={34} fill={NEON} />
            <rect x={CX - 140} y={616} width={48} height={134} fill={NEON} />
            <rect x={CX + 92} y={616} width={48} height={134} fill={NEON} />
          </g>
        )}
        {cadres > 0 && (
          <g opacity={cadres * (1 - q8)}>
            <Jauge x={320} l={230} haut={870} bas={1250} part={volume} couleur={CYAN} libelle="VOLUME" />
            <Jauge x={760} l={230} haut={870} bas={1250} part={intensite} couleur={AMBRE} libelle="INTENSITÉ" />
          </g>
        )}

        {/* Le même axe qu'au beat 7 : la zone générale passe en gris et la zone
            des sportifs la prolonge jusqu'à dix heures. */}
        {q8 > 0 && (
          <g opacity={q8}>
            <Txt x={CX} y={860} taille={corps("9H À 10H", 148, 6)} couleur={NEON} espace={6} opacity={neufDix}>
              9H À 10H
            </Txt>
            <rect x={380} y={1060} width={240} height={100} fill={M.noir} opacity={0.9} />
            <rect x={620} y={1060} width={160 * rallonge} height={100} fill={NEON} opacity={0.9} />
            <line x1={140} y1={1160} x2={940} y2={1160} stroke={M.gris} strokeWidth={4} />
            {[
              { x: 140, l: "6H", vif: false },
              { x: 380, l: "7H30", vif: false },
              { x: 620, l: "9H", vif: true },
              { x: 780, l: "10H", vif: true },
              { x: 940, l: "11H", vif: false },
            ].map((g) => (
              <g key={g.l} opacity={g.vif ? 1 : 0.4}>
                <line x1={g.x} y1={1160} x2={g.x} y2={1192} stroke={g.vif ? NEON : M.gris} strokeWidth={4} />
                <Txt x={g.x} y={1240} taille={g.vif ? 34 : 26} couleur={g.vif ? NEON : M.gris} espace={2}>
                  {g.l}
                </Txt>
              </g>
            ))}
            <Txt x={CX} y={SOCLE} taille={corps("LE HAUT DE LA FOURCHETTE", 46, 3)} couleur={M.texte} espace={3} opacity={rallonge}>
              LE HAUT DE LA FOURCHETTE
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B9 — les risques ═══════════════════════════════════════════ */}
      {/* Trois lignes qui s'empilent, une par risque énoncé, chacune avec son
          pictogramme à gauche du cadre et son texte aligné à droite de lui —
          jamais l'un par-dessus l'autre. */}
      <Panneau {...b.B9} t={t}>
        <EnTete opacity={ouverture("B9")}>MANQUER DE SOMMEIL CHRONIQUEMENT</EnTete>

        {risques.map((r) => (
          <Case key={`${r.l}-vide`} x={CX} y={r.y} l={820} h={156} couleur={M.noir} opacity={slots * (1 - r.e)} />
        ))}
        {risques.map((r) =>
          r.e <= 0 ? null : (
            <g key={r.l} opacity={r.e} transform={`translate(0 ${melange(32, 0, r.e)})`}>
              <Case x={CX} y={r.y} l={820} h={156} couleur={r.c} />
              {picto(r.i, 240, r.y, r.c)}
              <Txt
                x={330}
                y={r.y}
                taille={corpsRisque}
                couleur={r.c}
                espace={3}
                ancre="start"
              >
                {r.l}
              </Txt>
            </g>
          ),
        )}
      </Panneau>

      {/* ══ B10 — le CTA ═══════════════════════════════════════════════ */}
      {/* Animé faute de tournage, comme le hook. Ajouter "B10" à CAMERA le fait
          disparaître au profit du rush. */}
      {!aLaCamera("B10") && (
        <Panneau {...b.B10} t={t}>
          <EnTete opacity={ouverture("B10")}>ENVOIE-MOI</EnTete>
          {envoie > 0 && (
            <g opacity={envoie} transform={`translate(0 ${melange(28, 0, envoie)})`}>
              <Etiquette x={CX} y={900} l={720} h={200} couleur={NEON} vise={104} espace={6}>
                SOMMEIL
              </Etiquette>
              <Txt x={CX} y={1110} taille={44} couleur={M.gris} espace={6}>
                EN DM
              </Txt>
            </g>
          )}
          {ensemble > 0 && (
            <Txt
              x={CX}
              y={melange(SOCLE + 10, SOCLE, ensemble)}
              taille={corps("ON REGARDE TA RÉCUPÉRATION", 46, 3)}
              couleur={M.texte}
              espace={3}
              opacity={ensemble}
            >
              ON REGARDE TA RÉCUPÉRATION
            </Txt>
          )}
        </Panneau>
      )}
    </>
  );
};
