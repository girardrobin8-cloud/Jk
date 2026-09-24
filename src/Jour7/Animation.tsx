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
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 7, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Deux panneaux seulement — B2 et B4 — parce que les trois autres blocs sont des
 * espaces réservés à la tête parlante. Rien n'y est dessiné, pas même un texte.
 *
 * La consigne 5 du brief demande des tailles cohérentes et rien hors cadre.
 * D'où `TAILLE` ci-dessous : une échelle FERMÉE de cinq corps, et pas un texte
 * qui en sorte. `corps()` ne peut que réduire à partir de ces valeurs, jamais
 * les dépasser, et les libellés d'un même groupe partagent le corps du plus
 * long — sans quoi une étiquette de huit lettres s'afficherait deux fois plus
 * grosse que sa voisine de vingt.
 */

const transition = faireTransition(BEATS, FONDU);

/** L'échelle typographique de la vidéo. Rien d'autre n'est permis. */
const TAILLE = {
  titre: 92, // révélations plein écran, deux lignes au plus
  chiffre: 112, // les nombres qui portent une étude
  etiquette: 44, // les libellés d'encadré
  legende: 32, // les précisions sous un objet
  socle: 48, // la ligne de conclusion, en bas
};

// ── Repères internes, en secondes de l'export d'origine ──────────────────
const RUSH = {
  // ── B2 — 2,25 → 14,80 : une seule règle
  keto: 2.6, // « keto »                                2,6
  sansSucre: 3.2, // « sans sucre »                     3,2 → 3,4
  jeune: 4.0, // « jeûne »                              4,0
  peuImporte: 4.5, // « peu importe le nom »            4,5 → 5,1
  regle: 5.6, // « une seule règle décide »             5,6 → 6,4
  balance: 8.1, // « pour perdre du gras »              8,1 → 8,8
  depenser: 9.4, // « ton corps doit dépenser plus »    9,4 → 10,4
  recoit: 11.2, // « qu'il n'en reçoit »                10,9 → 11,5
  sansDeficit: 12.2, // « sans déficit réel »           12,2 → 12,9
  aucune: 13.3, // « aucune méthode fait fondre le gras » 13,3 → 14,7

  // ── B4 — 18,75 → 46,15 : les deux études
  etude: 19.0, // « une étude a suivi »                 19,0 → 19,7
  personnes: 20.1, // « six-cent-neuf personnes »       20,1 → 20,9
  douzeMois: 21.7, // « pendant 12 mois »               21,7 → 21,8
  groupes: 22.4, // « pauvre en gras / pauvre en glucide » 22,5 → 24,3
  cinq3: 25.8, // « résultat : moins 5,3 kg »           25,2 → 26,1
  six: 27.4, // « contre moins 6 kg »                   27,4 → 27,9
  nonSignif: 28.8, // « une différence non significative » 28,8 → 29,6
  compte: 30.3, // « ce qui compte vraiment »           30,4 → 31,0
  tenir: 31.5, // « ta capacité à tenir ta diète sur la durée » 31,6 → 33,8
  inverse: 34.4, // « et à l'inverse, un déficit trop rapide » 34,5 → 36,1
  etude2: 37.2, // « une étude a comparé des athlètes » 37,3 → 38,3
  zero7: 38.7, // « perdant 0,7 % de leur poids de corps » 38,8 → 41,4
  un4: 41.8, // « contre 1,4 % pour les autres »        41,9 → 43,4
  muscle: 43.9, // « ont perdu davantage de muscles »   44,0 → 45,8
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

/** Géométrie de la balance du beat 2, en un seul endroit. */
const BAL = { x: CX, y: 660, bras: 250, sol: 1180 };

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
  /**
   * Un libellé cède la place au suivant AVANT qu'il n'entre — consigne 4 du
   * brief : un élément graphique disparaît avant que le suivant apparaisse.
   */
  const cede = (quand: number) => 1 - rd(t, quand - 0.45, quand - 0.15);

  // ── B2 ────────────────────────────────────────────────────────────────
  const regimes = [
    { l: "KETO", t0: T.keto, y: 720 },
    { l: "SANS SUCRE", t0: T.sansSucre, y: 900 },
    { l: "JEÛNE", t0: T.jeune, y: 1080 },
  ].map((r) => ({ ...r, e: rd(t, r.t0, r.t0 + 0.5) }));
  /** Un seul corps pour les trois : celui du plus long. */
  const corpsRegime = Math.min(...regimes.map((r) => corps(r.l, TAILLE.etiquette, 3, 560)));
  const peuImporte = rd(t, T.peuImporte, T.peuImporte + 0.6);
  /** Bascule : les régimes se dissolvent, la balance prend la place. */
  const q2 = rd(t, T.regle - 0.05, T.regle + 0.55);
  const bras = rd(t, T.regle + 0.2, T.regle + 1.1);
  const plateaux = rd(t, T.regle + 1.0, T.regle + 1.8);
  /** Le penchant vers la dépense : c'est lui qui dit « déficit ». */
  const penche =
    rd(t, T.depenser, T.depenser + 1.6) * 0.72 + rd(t, T.aucune, T.aucune + 1.1) * 0.28;
  const sansDeficit = rd(t, T.sansDeficit, T.sansDeficit + 0.6);
  const aucune = rd(t, T.aucune, T.aucune + 0.6);

  // La balance, calculée une fois.
  const ang = (melange(0, 13, penche) * Math.PI) / 180;
  const xG = BAL.x - BAL.bras * Math.cos(ang);
  const yG = BAL.y + BAL.bras * Math.sin(ang);
  const xD = BAL.x + BAL.bras * Math.cos(ang);
  const yD = BAL.y - BAL.bras * Math.sin(ang);

  // ── B4 ────────────────────────────────────────────────────────────────
  const etude = rd(t, T.etude, T.etude + 0.6);
  const personnes = rd(t, T.personnes, T.personnes + 0.7);
  const douzeMois = rd(t, T.douzeMois, T.douzeMois + 0.6);
  const groupes = rd(t, T.groupes, T.groupes + 0.9);
  const groupes2 = rd(t, T.groupes + 1.5, T.groupes + 2.4);
  const cinq3 = rd(t, T.cinq3, T.cinq3 + 0.6);
  const six = rd(t, T.six, T.six + 0.6);
  const nonSignif = rd(t, T.nonSignif, T.nonSignif + 0.6);
  /** Deuxième temps : plein écran sur ce qui compte. */
  const p2 = rd(t, T.compte - 0.05, T.compte + 0.55);
  const compte = rd(t, T.compte, T.compte + 0.6);
  const tenir = rd(t, T.tenir, T.tenir + 0.7);
  /** Troisième temps : la vitesse de perte et son coût. */
  const p3 = rd(t, T.inverse - 0.05, T.inverse + 0.55);
  const inverse = rd(t, T.inverse, T.inverse + 0.7);
  const p3b = rd(t, T.etude2 - 0.05, T.etude2 + 0.55);
  const jauge1 = rd(t, T.zero7, T.zero7 + 1.2);
  const jauge2 = rd(t, T.un4, T.un4 + 1.2);
  const muscle = rd(t, T.muscle, T.muscle + 0.7);

  /** Les deux groupes de l'étude DIETFITS, à la même échelle. */
  const bras4 = [
    { x: 290, c: NEON, l1: "PAUVRE", l2: "EN GRAS", kg: "−5,3 KG", e: cinq3, a: groupes },
    { x: 790, c: CYAN, l1: "PAUVRE", l2: "EN GLUCIDES", kg: "−6 KG", e: six, a: groupes2 },
  ];
  const corpsBras = Math.min(
    ...bras4.flatMap((g) => [corps(g.l1, TAILLE.legende, 2, 420), corps(g.l2, TAILLE.legende, 2, 420)]),
  );

  /** Les deux vitesses de perte, et la part de muscle qui part avec. */
  const vitesses = [
    { x: 300, l: "0,7 %", c: NEON, tot: 300, mus: 60, e: jauge1, m: rd(t, T.zero7 + 1.0, T.zero7 + 2.0) },
    { x: 780, l: "1,4 %", c: AMBRE, tot: 330, mus: 170, e: jauge2, m: rd(t, T.un4 + 0.9, T.un4 + 1.9) },
  ];

  return (
    <>
      {/* ══ B2 — une seule règle ═══════════════════════════════════════ */}
      <Panneau {...b2} t={t}>
        <EnTete opacity={ouverture("B2") * cede(T.regle)}>PEU IMPORTE LE NOM</EnTete>
        <EnTete opacity={q2}>UNE SEULE RÈGLE DÉCIDE</EnTete>

        {/* Les trois régimes, empilés puis dissous ensemble — le brief les veut
            « qui apparaissent puis se dissolvent l'une après l'autre ». */}
        {regimes.map((r) =>
          r.e <= 0 ? null : (
            <g key={r.l} opacity={r.e * (1 - q2)} transform={`translate(0 ${melange(26, 0, r.e)})`}>
              <Etiquette x={CX} y={r.y} l={640} h={136} couleur={AMBRE} vise={corpsRegime} espace={3}>
                {r.l}
              </Etiquette>
            </g>
          ),
        )}
        {peuImporte > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("AUCUN NE SUFFIT", TAILLE.socle, 3)}
            couleur={M.texte}
            espace={3}
            opacity={peuImporte * (1 - q2)}
          >
            AUCUN NE SUFFIT
          </Txt>
        )}

        {/* La balance : elle penche du côté de la dépense, et c'est ce penchant
            qui définit le déficit. Rien d'autre n'est écrit pour le dire. */}
        {q2 > 0 && (
          <g opacity={q2}>
            <line x1={BAL.x} y1={BAL.y} x2={BAL.x} y2={BAL.sol} stroke={M.noir} strokeWidth={10} />
            <line x1={BAL.x - 130} y1={BAL.sol} x2={BAL.x + 130} y2={BAL.sol} stroke={M.noir} strokeWidth={10} />
            <g opacity={bras}>
              <line x1={xG} y1={yG} x2={xD} y2={yD} stroke={M.texte} strokeWidth={10} strokeLinecap="round" />
              <circle cx={BAL.x} cy={BAL.y} r={16} fill={M.texte} />
            </g>
            {plateaux > 0 &&
              [
                { x: xG, y: yG, c: NEON, l: "DÉPENSÉ" },
                { x: xD, y: yD, c: M.gris, l: "REÇU" },
              ].map((p) => (
                <g key={p.l} opacity={plateaux}>
                  <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 86} stroke={M.noir} strokeWidth={5} />
                  <rect x={p.x - 95} y={p.y + 86} width={190} height={20} fill={p.c} />
                  <Txt x={p.x} y={p.y + 160} taille={TAILLE.legende} couleur={p.c} espace={3}>
                    {p.l}
                  </Txt>
                </g>
              ))}
          </g>
        )}
        {sansDeficit > 0 && (
          <Txt
            x={CX}
            y={SOCLE}
            taille={corps("SANS DÉFICIT, RIEN NE FOND", TAILLE.socle, 3)}
            couleur={M.texte}
            espace={3}
            opacity={Math.max(sansDeficit, aucune)}
          >
            SANS DÉFICIT, RIEN NE FOND
          </Txt>
        )}
      </Panneau>

      {/* ══ B4 — les deux études ═══════════════════════════════════════ */}
      {/* Le brief demande trois temps visuels distincts sur vingt-sept
          secondes. Les voici : l'étude DIETFITS et son résultat nul, la
          révélation plein écran, puis le coût d'une perte trop rapide. */}
      <Panneau {...b4} t={t}>
        <EnTete opacity={ouverture("B4") * cede(T.compte)}>UNE ÉTUDE SUR 12 MOIS</EnTete>
        <EnTete opacity={p2 * cede(T.inverse)}>CE QUI COMPTE VRAIMENT</EnTete>
        <EnTete opacity={p3 * cede(T.etude2)}>ET À L'INVERSE</EnTete>
        <EnTete opacity={p3b}>PERDRE TROP VITE</EnTete>

        {/* ── Temps 1 : 609 personnes, deux régimes, un résultat nul ──── */}
        {etude > 0 && (
          <g opacity={cede(T.compte)}>
            <Txt
              x={CX}
              y={melange(720, 700, personnes)}
              taille={corps("609 PERSONNES", TAILLE.titre, 3)}
              couleur={M.texte}
              espace={3}
              opacity={personnes}
            >
              609 PERSONNES
            </Txt>
            <Txt x={CX} y={800} taille={TAILLE.legende} couleur={M.gris} espace={4} opacity={douzeMois}>
              PENDANT 12 MOIS
            </Txt>

            {bras4.map((g) => (
              <g key={g.l2} opacity={g.a}>
                <Txt x={g.x} y={930} taille={corpsBras} couleur={g.c} espace={2}>
                  {g.l1}
                </Txt>
                <Txt x={g.x} y={974} taille={corpsBras} couleur={g.c} espace={2}>
                  {g.l2}
                </Txt>
                <Txt
                  x={g.x}
                  y={melange(1120, 1100, g.e)}
                  taille={corps(g.kg, TAILLE.chiffre, 3, 420)}
                  couleur={g.c}
                  espace={3}
                  opacity={g.e}
                >
                  {g.kg}
                </Txt>
              </g>
            ))}
            {nonSignif > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("DIFFÉRENCE NON SIGNIFICATIVE", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={nonSignif}
              >
                DIFFÉRENCE NON SIGNIFICATIVE
              </Txt>
            )}
          </g>
        )}

        {/* ── Temps 2 : la révélation, seule dans le cadre ────────────── */}
        {compte > 0 && (
          <g opacity={cede(T.inverse) * compte} transform={`translate(0 ${melange(20, 0, compte)})`}>
            <Perso x={CX} y={760} k={1.7} couleur={NEON} opacity={compte} />
            <Txt x={CX} y={1060} taille={corps("TENIR TA DIÈTE", TAILLE.titre, 5)} couleur={M.texte} espace={5} opacity={tenir}>
              TENIR TA DIÈTE
            </Txt>
            <Txt x={CX} y={1190} taille={corps("SUR LA DURÉE", TAILLE.titre, 5)} couleur={NEON} espace={5} opacity={tenir}>
              SUR LA DURÉE
            </Txt>
          </g>
        )}

        {/* ── Temps 3 : deux vitesses, et ce que la plus rapide coûte ─── */}
        {p3 > 0 && (
          <>
            <Txt
              x={CX}
              y={860}
              taille={corps("UN DÉFICIT TROP RAPIDE", TAILLE.titre, 5)}
              couleur={M.texte}
              espace={5}
              opacity={inverse * (1 - p3b)}
            >
              UN DÉFICIT TROP RAPIDE
            </Txt>
            <Txt
              x={CX}
              y={990}
              taille={corps("A UN COÛT", TAILLE.titre, 5)}
              couleur={AMBRE}
              espace={5}
              opacity={inverse * (1 - p3b)}
            >
              A UN COÛT
            </Txt>

            {p3b > 0 &&
              vitesses.map((v) => (
                <g key={v.l} opacity={p3b * v.e}>
                  {/* La barre entière est la perte de poids ; la part corail est
                      le muscle parti avec. Même échelle des deux côtés. */}
                  <rect
                    x={v.x - 92}
                    y={1240 - v.tot * v.e}
                    width={184}
                    height={v.tot * v.e}
                    fill={v.c}
                    opacity={0.9}
                  />
                  <rect
                    x={v.x - 92}
                    y={1240 - v.mus * v.m}
                    width={184}
                    height={v.mus * v.m}
                    fill={M.corail}
                  />
                  <Txt x={v.x} y={melange(1360, 1340, v.e)} taille={TAILLE.chiffre} couleur={v.c} espace={3}>
                    {v.l}
                  </Txt>
                  <Txt x={v.x} y={1440} taille={TAILLE.legende} couleur={M.gris} espace={3}>
                    PAR SEMAINE
                  </Txt>
                </g>
              ))}
            {p3b > 0 && (
              <line x1={150} y1={1240} x2={930} y2={1240} stroke={M.noir} strokeWidth={4} opacity={p3b} />
            )}
            {muscle > 0 && (
              <g opacity={muscle} transform={`translate(0 ${melange(22, 0, muscle)})`}>
                <Case x={CX} y={700} l={720} h={130} couleur={M.corail} />
                <Txt
                  x={CX}
                  y={700}
                  taille={corps("PLUS DE MUSCLE PERDU", TAILLE.etiquette, 3, 660)}
                  couleur={M.corail}
                  espace={3}
                >
                  PLUS DE MUSCLE PERDU
                </Txt>
              </g>
            )}
          </>
        )}
      </Panneau>
    </>
  );
};
