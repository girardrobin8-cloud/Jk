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
  Pointe,
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 10, en UN SEUL composant continu lisant le
 * temps ABSOLU du montage.
 *
 * Deux panneaux seulement, B2 et B4 : les trois autres blocs — dont le CTA —
 * sont des espaces réservés à la tête parlante, et rien n'y est dessiné.
 *
 * B4 dure trente-trois secondes, ce que le brief prévoit explicitement (« bloc
 * long, prévoir 4 temps visuels distincts »). Il en compte sept en réalité, un
 * par idée prononcée : la whey à elle seule en occupe quatre, parce que Robin y
 * enchaîne quatre arguments sans reprendre son souffle et qu'un écran unique
 * resterait figé quinze secondes.
 *
 * Le non-chevauchement est structurel : `ecran(a, b)` éteint complètement un
 * écran 0,15 s AVANT que le suivant ne commence à entrer, si bien que deux
 * textes ne peuvent pas se croiser, même d'une image.
 *
 * L'anneau de compléments du beat 2 revient grisé au dernier temps du beat 4 :
 * c'est la même géométrie, donc « le reste » se lit comme ce qui a été écarté au
 * début, sans qu'une légende ait à le dire.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);

/** L'échelle typographique de la vidéo. Rien d'autre n'est permis. */
const TAILLE = {
  hero: 280,
  chiffre: 112,
  titre: 92,
  etiquette: 44,
  legende: 32,
  socle: 48,
};

// ── Repères internes, en secondes de l'export d'origine ──────────────────
const RUSH = {
  // ── B2 — 2,95 → 11,15 : le rayon, puis ce qu'il en reste
  rayons: 3.05, // « des rayons entiers de produits »        3,0 → 4,2
  vendus: 4.7, // « tous vendus comme indispensables »       4,7 → 5,7
  realite: 6.75, // « la réalité est bien plus simple »      6,7 → 8,0
  trois: 8.6, // « il y en a vraiment que 3 »                8,3 → 9,1
  preuve: 9.85, // « un vrai niveau de preuve scientifique » 9,5 → 10,9

  // ── B4, temps 1 — la créatine
  creatine: 14.75, // carte n°1
  efficace: 15.85, // « le plus efficace » (le mot tombe à 15,9) 14,7 → 17,1
  athletes: 16.35, // « disponible pour les athlètes »        16,3 → 17,1
  etudie: 18.0, // « c'est aussi le plus étudié »            17,9 → 19,1
  mille: 19.75, // « quasiment 1000 études sur le sujet »    19,7 → 20,9

  // ── B4, temps 2 — la caféine
  cafeine: 21.2, // « en n°2, on a la caféine »              21,2 → 22,1
  dose: 22.75, // « prise de 3 à 6 mg par kilo poids corps » 22,7 → 24,8
  avant: 24.1, // « avant l'entraînement »                   25,1 → 25,2
  perf: 25.85, // « elle améliore mesurément la performance » 25,8 → 27,3
  mesure: 26.6, // socle de la même phrase

  // ── B4, temps 3 — la whey, en quatre écrans
  troisieme: 28.3, // « et pour finir, la 3e »               28,2 → 28,9
  whey: 28.9, // la carte, posée pendant « …la 3e, la whey »   29,7
  trait: 29.15, // le trait qui se tire sous le titre, 1 s durant
  pratique: 30.2, // « pratique… »                            30,2
  pasMagique: 30.5, // « …pas magique »                       30,8
  source: 31.7, // « juste 1 source de protéines »            31,2 → 31,9
  total: 32.5, // « rien de plus »                            32,4 → 32,7
  condition: 33.05, // « si ton total est déjà atteint »      32,9 → 34,1
  quandMeme: 34.55, // « elle reste quand même intéressante » 34,5 → 35,4
  econo: 36.05, // « du fait de son aspect économique »      36,0 → 37,1
  leucine: 37.85, // « de forte concentration en leucine »   37,7 → 39,2
  mtor: 40.05, // « qui active la voie mTOR »                39,9 → 40,7
  synthese: 41.45, // « responsable de la construction musculaire » 41,4 → 43,2

  // ── B4, temps 4 — tout le reste
  reste: 43.95, // « le reste, brûleur de graisse compris »  43,9 → 45,2
  effets: 45.75, // « peu d'effets négatifs, ou carrément pas d'effets démontrés » 45,7 → 47,6
};

/** Les bornes d'écran, elles aussi en secondes de l'export d'origine. */
const BORNE = {
  b2Anneau: [3.05, 8.6],
  // Bornes de FIN posées au-delà du beat pour les deux derniers écrans : rien
  // ne leur succède à l'intérieur du panneau, c'est la sortie du panneau
  // lui-même qui les emporte, sinon ils s'éteignaient une demi-seconde avant
  // le retour caméra et laissaient un fond vide.
  b2Reveal: [8.6, 11.6],
  b2H1: [3.05, 6.7],
  b2H2: [6.7, 8.6],

  t1: [14.65, 21.1], // en-tête « n°1 »
  t1Carte: [14.65, 19.6],
  t1Mille: [19.6, 21.1],

  t2: [21.1, 28.15], // en-tête « n°2 »
  t2Dose: [21.1, 25.8],
  t2Perf: [25.8, 28.15],

  t3: [28.15, 43.65], // en-tête « n°3 »
  t3Nom: [28.15, 31.55],
  t3Source: [31.55, 35.95],
  t3Atouts: [35.95, 39.85],
  t3Chaine: [39.85, 43.65],

  t4: [43.65, 48.05], // en-tête « le reste »
  t4Anneau: [43.65, 45.7],
  t4Effets: [45.7, 49.5],
} as const;

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;
const B = Object.fromEntries(
  Object.entries(BORNE).map(([c, [a, b]]) => [c, [mappe(a), mappe(b)] as [number, number]]),
) as Record<keyof typeof BORNE, [number, number]>;

/**
 * L'anneau de compléments : neuf pastilles autour du centre de la scène.
 *
 * Il sert deux fois — plein au beat 2, grisé au dernier temps du beat 4 — d'où
 * la géométrie calculée une seule fois ici. Le rayon et le centre sont choisis
 * pour que la pastille la plus haute reste sous la bande d'en-tête et la plus
 * basse au-dessus de la bande de socle.
 */
const ANNEAU = { cy: 910, r: 310, n: 9, taille: 80 };
const PASTILLES = Array.from({ length: ANNEAU.n }, (_, k) => {
  const a = ((-90 + (360 / ANNEAU.n) * k) * Math.PI) / 180;
  return { k, x: CX + ANNEAU.r * Math.cos(a), y: ANNEAU.cy + ANNEAU.r * Math.sin(a) };
});
/** Les trois qui survivent au tri — celles qui ont un niveau de preuve. */
const GARDEES = [0, 3, 6];
/** Les six autres, dans l'ordre où elles se dissolvent. */
const ECARTEES = PASTILLES.filter((p) => !GARDEES.includes(p.k));

const Pastille: React.FC<{ x: number; y: number; couleur: string; opacity: number }> = ({
  x,
  y,
  couleur,
  opacity,
}) => (
  <g opacity={opacity}>
    <Case x={x} y={y} l={ANNEAU.taille} h={ANNEAU.taille} couleur={couleur} />
    <circle cx={x} cy={y} r={15} fill={couleur} opacity={0.75} />
  </g>
);

/** Flèche descendante de la chaîne leucine → mTOR → synthèse. */
const Fleche: React.FC<{ y: number; opacity: number }> = ({ y, opacity }) => (
  <g opacity={opacity}>
    <line x1={CX} y1={y} x2={CX} y2={y + 90} stroke={NEON} strokeWidth={6} strokeLinecap="round" />
    <Pointe x={CX} y={y + 100} couleur={NEON} />
  </g>
);

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b2 = transition(t, "B2");
  const b4 = transition(t, "B4");
  if (Math.max(b2.e, b4.e) <= 0) return null;

  /**
   * L'opacité et la poussée d'un écran entre `a` et `b`.
   *
   * La sortie est terminée à `b - 0,15` et l'entrée du suivant ne commence qu'à
   * `b - 0,10` : c'est la garantie mécanique qu'aucun texte n'en recouvre un
   * autre, consigne 4 du brief.
   */
  const ecran = ([a, b]: [number, number]) => {
    const e = rd(t, a - 0.1, a + 0.3);
    return { o: e * (1 - rd(t, b - 0.5, b - 0.15)), dy: melange(34, 0, e) };
  };
  /** L'apparition d'un élément à l'intérieur d'un écran. */
  const vient = (quand: number, duree = 0.45) => rd(t, quand, quand + duree);
  /** Un élément s'efface AVANT que le suivant n'entre — consigne 4. */
  const cede = (quand: number) => 1 - rd(t, quand - 0.5, quand - 0.15);

  // ── B2 ────────────────────────────────────────────────────────────────
  const anneau = ecran(B.b2Anneau);
  const reveal = ecran(B.b2Reveal);
  const rayons = vient(T.rayons, 0.6);
  const vendus = vient(T.vendus);
  const trois = vient(T.trois, 0.55);
  const preuve = vient(T.preuve);
  /** Le virage au vert des trois rescapées : il ouvre la cascade, pour que
   *  l'extinction des six se lise comme un tri et non comme une panne. */
  const vire = rd(t, T.realite, T.realite + 0.6);

  // ── B4 ────────────────────────────────────────────────────────────────
  const t1Carte = ecran(B.t1Carte);
  const t1Mille = ecran(B.t1Mille);
  const t2Dose = ecran(B.t2Dose);
  const t2Perf = ecran(B.t2Perf);
  const t3Nom = ecran(B.t3Nom);
  const t3Source = ecran(B.t3Source);
  const t3Atouts = ecran(B.t3Atouts);
  const t3Chaine = ecran(B.t3Chaine);
  const t4Anneau = ecran(B.t4Anneau);
  const t4Effets = ecran(B.t4Effets);

  /** La dose : la barre se remplit de 0 à 6, la zone utile 3→6 se peint après. */
  const barre = vient(T.dose, 1.1);
  const zone = rd(t, T.dose + 0.7, T.dose + 1.8);
  const monte = vient(T.perf, 1.3);

  return (
    <>
      {/* ══ B2 — le rayon entier, puis ce qui en reste ═════════════════ */}
      <Panneau {...b2} t={t}>
        <EnTete opacity={ecran(B.b2H1).o}>LE RAYON COMPLÉMENTS</EnTete>
        <EnTete opacity={ecran(B.b2H2).o}>LA RÉALITÉ</EnTete>

        {/* Écran 1 — neuf pastilles autour du pratiquant, six s'éteignent
            une à une pendant « la réalité est bien plus simple que ça ». */}
        {anneau.o > 0 && (
          <g opacity={anneau.o} transform={`translate(0 ${anneau.dy})`}>
            <Perso x={CX} y={ANNEAU.cy} k={1.9} couleur={M.gris} opacity={rayons} />
            {/* Les trois qui restent sont grises comme les autres tant que le
                rayon est encore entier : elles ne passent au vert qu'au
                moment du tri, sinon la révélation serait donnée d'avance. */}
            {GARDEES.map((k) => (
              <g key={k}>
                <Pastille x={PASTILLES[k].x} y={PASTILLES[k].y} couleur={M.gris} opacity={rayons * (1 - vire)} />
                <Pastille x={PASTILLES[k].x} y={PASTILLES[k].y} couleur={NEON} opacity={rayons * vire} />
              </g>
            ))}
            {ECARTEES.map((p, j) => (
              <Pastille
                key={p.k}
                x={p.x}
                y={p.y}
                couleur={M.gris}
                opacity={rayons * (1 - rd(t, T.realite + j * 0.14, T.realite + j * 0.14 + 0.32))}
              />
            ))}
            {vendus > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("TOUS VENDUS COMME INDISPENSABLES", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={vendus * cede(T.realite)}
              >
                TOUS VENDUS COMME INDISPENSABLES
              </Txt>
            )}
          </g>
        )}

        {/* Écran 2 — la révélation, seule dans le cadre, sans une icône. */}
        {reveal.o > 0 && (
          <g opacity={reveal.o} transform={`translate(0 ${reveal.dy})`}>
            <Txt x={CX} y={700} taille={TAILLE.legende} couleur={M.gris} espace={5} opacity={trois}>
              IL N'Y EN A VRAIMENT QUE
            </Txt>
            <g transform={`translate(${CX} 960) scale(${melange(0.82, 1, trois)}) translate(${-CX} -960)`}>
              <Txt x={CX} y={960} taille={TAILLE.hero} couleur={NEON} opacity={trois}>
                3
              </Txt>
            </g>
            {preuve > 0 && (
              <Txt
                x={CX}
                y={SOCLE}
                taille={corps("AVEC UN VRAI NIVEAU DE PREUVE", TAILLE.socle, 3)}
                couleur={M.texte}
                espace={3}
                opacity={preuve}
              >
                AVEC UN VRAI NIVEAU DE PREUVE
              </Txt>
            )}
          </g>
        )}
      </Panneau>

      {/* ══ B4 — les trois qui tiennent, puis tout le reste ════════════ */}
      <Panneau {...b4} t={t}>
        <EnTete opacity={ecran(B.t1).o} couleur={NEON}>
          N°1 — LA CRÉATINE
        </EnTete>
        <EnTete opacity={ecran(B.t2).o} couleur={CYAN}>
          N°2 — LA CAFÉINE
        </EnTete>
        <EnTete opacity={ecran(B.t3).o} couleur={AMBRE}>
          N°3 — LA WHEY
        </EnTete>
        <EnTete opacity={ecran(B.t4).o}>ET TOUT LE RESTE</EnTete>

        {/* ── Temps 1 — la créatine ─────────────────────────────────── */}
        {t1Carte.o > 0 && (
          <g opacity={t1Carte.o} transform={`translate(0 ${t1Carte.dy})`}>
            <Txt
              x={CX}
              y={680}
              taille={corps("CRÉATINE", TAILLE.titre, 6)}
              couleur={NEON}
              espace={6}
              opacity={vient(T.creatine, 0.5)}
            >
              CRÉATINE
            </Txt>
            <Etiquette
              x={CX}
              y={920}
              l={780}
              h={160}
              couleur={M.texte}
              vise={TAILLE.etiquette}
              espace={3}
              opacity={vient(T.efficace)}
            >
              LE PLUS EFFICACE
            </Etiquette>
            <Etiquette
              x={CX}
              y={1130}
              l={780}
              h={160}
              couleur={M.texte}
              vise={TAILLE.etiquette}
              espace={3}
              opacity={vient(T.etudie)}
            >
              LE PLUS ÉTUDIÉ
            </Etiquette>
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("DISPONIBLE POUR LES ATHLÈTES", TAILLE.socle, 3)}
              couleur={M.gris}
              espace={3}
              opacity={vient(T.athletes)}
            >
              DISPONIBLE POUR LES ATHLÈTES
            </Txt>
          </g>
        )}

        {/* La révélation chiffrée du temps 1, seule dans le cadre. */}
        {t1Mille.o > 0 && (
          <g opacity={t1Mille.o} transform={`translate(0 ${t1Mille.dy})`}>
            <Txt x={CX} y={700} taille={TAILLE.legende} couleur={M.gris} espace={5} opacity={vient(T.mille, 0.4)}>
              QUASIMENT
            </Txt>
            <g
              transform={`translate(${CX} 960) scale(${melange(0.85, 1, vient(T.mille, 0.5))}) translate(${-CX} -960)`}
            >
              <Txt x={CX} y={960} taille={corps("+1000", TAILLE.hero, 4)} couleur={NEON} espace={4}>
                +1000
              </Txt>
            </g>
            <Txt
              x={CX}
              y={1190}
              taille={corps("ÉTUDES SUR LE SUJET", TAILLE.legende, 5)}
              couleur={M.texte}
              espace={5}
              opacity={vient(T.mille + 0.35, 0.4)}
            >
              ÉTUDES SUR LE SUJET
            </Txt>
          </g>
        )}

        {/* ── Temps 2 — la caféine ──────────────────────────────────── */}
        {t2Dose.o > 0 && (
          <g opacity={t2Dose.o} transform={`translate(0 ${t2Dose.dy})`}>
            <Txt
              x={CX}
              y={680}
              taille={corps("CAFÉINE", TAILLE.titre, 6)}
              couleur={CYAN}
              espace={6}
              opacity={vient(T.cafeine, 0.5)}
            >
              CAFÉINE
            </Txt>
            <Txt
              x={CX}
              y={900}
              taille={corps("3 À 6 MG/KG", TAILLE.chiffre, 4)}
              couleur={M.texte}
              espace={4}
              opacity={vient(T.dose, 0.5)}
            >
              3 À 6 MG/KG
            </Txt>

            {/* L'échelle de dose : le trait se déroule, puis la fourchette
                utile se peint dessus. Le mouvement porte le chiffre. */}
            {barre > 0 && (
              <>
                <line
                  x1={180}
                  y1={1060}
                  x2={melange(180, 900, barre)}
                  y2={1060}
                  stroke={M.noir}
                  strokeWidth={10}
                  strokeLinecap="round"
                />
                <line
                  x1={540}
                  y1={1060}
                  x2={melange(540, 900, zone)}
                  y2={1060}
                  stroke={CYAN}
                  strokeWidth={10}
                  strokeLinecap="round"
                />
                <Txt x={180} y={1130} taille={TAILLE.legende} couleur={M.gris} espace={2} opacity={barre}>
                  0
                </Txt>
                <Txt x={540} y={1130} taille={TAILLE.legende} couleur={CYAN} espace={2} opacity={zone}>
                  3
                </Txt>
                <Txt x={900} y={1130} taille={TAILLE.legende} couleur={CYAN} espace={2} opacity={zone}>
                  6
                </Txt>
              </>
            )}

            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("PAR KILO, AVANT L'ENTRAÎNEMENT", TAILLE.socle, 3)}
              couleur={M.texte}
              espace={3}
              opacity={vient(T.avant)}
            >
              PAR KILO, AVANT L'ENTRAÎNEMENT
            </Txt>
          </g>
        )}

        {/* Ce que la dose produit : deux jauges, une qui monte. */}
        {t2Perf.o > 0 && (
          <g opacity={t2Perf.o} transform={`translate(0 ${t2Perf.dy})`}>
            <Txt x={CX} y={640} taille={TAILLE.legende} couleur={M.gris} espace={4} opacity={monte}>
              SUR LA PERFORMANCE
            </Txt>
            <Jauge x={340} l={240} haut={740} bas={1180} part={0.5 * monte} couleur={M.gris} libelle="SANS" />
            <Jauge
              x={740}
              l={240}
              haut={740}
              bas={1180}
              part={melange(0.5, 0.86, monte) * monte}
              couleur={CYAN}
              libelle="AVEC CAFÉINE"
            />
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("UNE AMÉLIORATION MESURÉE", TAILLE.socle, 3)}
              couleur={M.texte}
              espace={3}
              opacity={vient(T.mesure)}
            >
              UNE AMÉLIORATION MESURÉE
            </Txt>
          </g>
        )}

        {/* ── Temps 3 — la whey, en quatre écrans ───────────────────── */}
        {t3Nom.o > 0 && (
          <g opacity={t3Nom.o} transform={`translate(0 ${t3Nom.dy})`}>
            <Txt x={CX} y={660} taille={TAILLE.legende} couleur={M.gris} espace={5} opacity={vient(T.troisieme, 0.4)}>
              ET POUR FINIR, LA 3e
            </Txt>
            <Txt
              x={CX}
              y={840}
              taille={corps("WHEY", TAILLE.titre, 6)}
              couleur={AMBRE}
              espace={6}
              opacity={vient(T.whey, 0.4)}
            >
              WHEY
            </Txt>
            {/* Le trait se tire pendant toute la seconde qui sépare le titre de
                « pratique » : sans lui, l'écran resterait figé le temps que
                Robin finisse sa phrase. */}
            <line
              x1={melange(CX, 280, rd(t, T.trait, T.trait + 1.0))}
              y1={920}
              x2={melange(CX, 800, rd(t, T.trait, T.trait + 1.0))}
              y2={920}
              stroke={AMBRE}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={vient(T.trait, 0.25)}
            />
            <Txt
              x={CX}
              y={1030}
              taille={corps("PRATIQUE", TAILLE.titre, 6)}
              couleur={M.texte}
              espace={6}
              opacity={vient(T.pratique, 0.35)}
            >
              PRATIQUE
            </Txt>
            <Txt
              x={CX}
              y={1190}
              taille={corps("PAS MAGIQUE", TAILLE.titre, 6)}
              couleur={M.gris}
              espace={6}
              opacity={vient(T.pasMagique, 0.35)}
            >
              PAS MAGIQUE
            </Txt>
          </g>
        )}

        {t3Source.o > 0 && (
          <g opacity={t3Source.o} transform={`translate(0 ${t3Source.dy})`}>
            <Txt x={CX} y={660} taille={TAILLE.legende} couleur={M.gris} espace={5} opacity={vient(T.source, 0.4)}>
              CE QUE C'EST VRAIMENT
            </Txt>
            <Etiquette
              x={CX}
              y={900}
              l={820}
              h={170}
              couleur={AMBRE}
              vise={TAILLE.etiquette}
              espace={3}
              opacity={vient(T.source)}
            >
              UNE SOURCE DE PROTÉINES
            </Etiquette>
            <Txt
              x={CX}
              y={1140}
              taille={corps("RIEN DE PLUS", TAILLE.titre, 6)}
              couleur={M.texte}
              espace={6}
              opacity={vient(T.total, 0.4)}
            >
              RIEN DE PLUS
            </Txt>
            {/* Deux lignes de socle qui se succèdent : la première s'efface
                avant que la seconde n'entre — consigne 4. */}
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("SI TON TOTAL EST DÉJÀ ATTEINT", TAILLE.socle, 3)}
              couleur={M.gris}
              espace={3}
              opacity={vient(T.condition) * cede(T.quandMeme)}
            >
              SI TON TOTAL EST DÉJÀ ATTEINT
            </Txt>
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("ELLE RESTE QUAND MÊME INTÉRESSANTE", TAILLE.socle, 3)}
              couleur={AMBRE}
              espace={3}
              opacity={vient(T.quandMeme)}
            >
              ELLE RESTE QUAND MÊME INTÉRESSANTE
            </Txt>
          </g>
        )}

        {t3Atouts.o > 0 && (
          <g opacity={t3Atouts.o} transform={`translate(0 ${t3Atouts.dy})`}>
            <Txt x={CX} y={660} taille={TAILLE.legende} couleur={M.gris} espace={5} opacity={vient(T.econo, 0.4)}>
              POURQUOI ELLE TIENT ENCORE
            </Txt>
            <Etiquette
              x={CX}
              y={900}
              l={780}
              h={170}
              couleur={AMBRE}
              vise={TAILLE.etiquette}
              espace={3}
              opacity={vient(T.econo)}
            >
              ÉCONOMIQUE
            </Etiquette>
            <Etiquette
              x={CX}
              y={1120}
              l={780}
              h={170}
              couleur={NEON}
              vise={TAILLE.etiquette}
              espace={3}
              opacity={vient(T.leucine)}
            >
              RICHE EN LEUCINE
            </Etiquette>
          </g>
        )}

        {/* La chaîne mécanique du brief, dépliée de haut en bas. */}
        {t3Chaine.o > 0 && (
          <g opacity={t3Chaine.o} transform={`translate(0 ${t3Chaine.dy})`}>
            <Etiquette
              x={CX}
              y={670}
              l={640}
              h={126}
              couleur={NEON}
              vise={TAILLE.etiquette}
              espace={4}
              opacity={vient(T.mtor - 0.2, 0.4)}
            >
              LEUCINE
            </Etiquette>
            <Fleche y={745} opacity={vient(T.mtor - 0.05, 0.35)} />
            <Etiquette
              x={CX}
              y={930}
              l={640}
              h={126}
              couleur={NEON}
              vise={TAILLE.etiquette}
              espace={4}
              opacity={vient(T.mtor + 0.1, 0.4)}
            >
              VOIE mTOR
            </Etiquette>
            <Fleche y={1005} opacity={vient(T.synthese - 0.15, 0.35)} />
            <Etiquette
              x={CX}
              y={1190}
              l={640}
              h={126}
              couleur={NEON}
              vise={TAILLE.etiquette}
              espace={4}
              opacity={vient(T.synthese, 0.4)}
            >
              SYNTHÈSE
            </Etiquette>
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("LA CONSTRUCTION MUSCULAIRE", TAILLE.socle, 3)}
              couleur={M.texte}
              espace={3}
              opacity={vient(T.synthese + 0.5)}
            >
              LA CONSTRUCTION MUSCULAIRE
            </Txt>
          </g>
        )}

        {/* ── Temps 4 — tout le reste, grisé ────────────────────────── */}
        {/* Même anneau qu'au beat 2, mais éteint : ce qui avait été écarté au
            début revient pour être nommé. */}
        {t4Anneau.o > 0 && (
          <g opacity={t4Anneau.o} transform={`translate(0 ${t4Anneau.dy})`}>
            {PASTILLES.map((p) => (
              <Pastille key={p.k} x={p.x} y={p.y} couleur={M.gris} opacity={0.32 * vient(T.reste - 0.2, 0.7)} />
            ))}
            <Etiquette
              x={CX}
              y={ANNEAU.cy}
              l={480}
              h={150}
              couleur={M.gris}
              vise={TAILLE.etiquette}
              espace={2}
              opacity={vient(T.reste)}
            >
              BRÛLEURS DE GRAISSE
            </Etiquette>
            <Txt
              x={CX}
              y={SOCLE}
              taille={corps("ET TOUT CE QUI VA AVEC", TAILLE.socle, 3)}
              couleur={M.gris}
              espace={3}
              opacity={vient(T.reste + 0.5)}
            >
              ET TOUT CE QUI VA AVEC
            </Txt>
          </g>
        )}

        {t4Effets.o > 0 && (
          <g opacity={t4Effets.o} transform={`translate(0 ${t4Effets.dy})`}>
            <Txt
              x={CX}
              y={860}
              taille={corps("PEU D'EFFETS NÉGATIFS", TAILLE.titre, 5)}
              couleur={M.gris}
              espace={5}
              opacity={vient(T.effets, 0.45)}
            >
              PEU D'EFFETS NÉGATIFS
            </Txt>
            <Txt
              x={CX}
              y={1040}
              taille={corps("PAS D'EFFETS DÉMONTRÉS", TAILLE.titre, 5)}
              couleur={M.corail}
              espace={5}
              opacity={vient(T.effets + 0.95, 0.45)}
            >
              PAS D'EFFETS DÉMONTRÉS
            </Txt>
          </g>
        )}
      </Panneau>
    </>
  );
};
