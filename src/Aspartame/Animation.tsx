import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * Le motion design de « aspartame / Coca Zero », en UN SEUL composant continu.
 *
 * Particularité de ce montage : l'animation ne forme pas un bloc unique mais
 * DEUX ÎLOTS, séparés par une fenêtre tête caméra — 4,15 → 9,50, puis 15,45 →
 * 29,40. Le composant est malgré tout monté sur toute la durée et lit le temps
 * ABSOLU : c'est ce qui permet aux bornes de reperes.ts de s'appliquer sans
 * conversion, et à la piste voix de ne jamais dépendre d'un réglage d'image.
 *
 * Les règles du brief, tenues par la structure :
 *
 * 1. AUCUNE SUPERPOSITION, « même partielle ou momentanée pendant une
 *    transition ». C'est la formulation la plus stricte reçue jusqu'ici, et
 *    elle interdit la sortie la plus commode — faire converger plusieurs
 *    éléments vers un même point pour les fondre en un seul. Les groupes
 *    sortent donc PAR LE BAS en gardant leur abscisse, décalés les uns des
 *    autres : ils ne se croisent à aucune image. Les emprises sont déclarées
 *    dans POSTES.
 * 2. AUCUNE COUPE SÈCHE. Un groupe sortant est encore en mouvement quand le
 *    suivant commence à descendre du haut : l'enchaînement se lit comme un
 *    relais, sans qu'il y ait jamais recouvrement.
 * 3. AUCUN BRUITAGE. Rien à faire ici — c'est le montage qui porte la bande
 *    son, et il ne monte que la voix. La conséquence est qu'aucune transition
 *    ne peut compter sur un son pour se faire remarquer.
 * 4. JAMAIS D'ÉCRAN FIGÉ PLUS DE DEUX OU TROIS SECONDES. Le plus long temps
 *    mort possible est la construction de la jauge à canettes, subdivisée en
 *    quinze apparitions successives.
 *
 * Les repères de temps sont RECONSTRUITS et non mesurés : voir l'avertissement
 * en tête de reperes.ts.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));
const melange = (a: number, b: number, p: number) => a + (b - a) * p;

// ── Repères de temps, en secondes absolues ───────────────────────────────
/**
 * Les fenêtres citées en commentaire sont celles du découpage syllabique
 * interne à chaque beat, calculé dans reperes.ts. Règle tenue partout : un
 * élément qui illustre un mot COMMENCE à monter avant ce mot, pour être en
 * place quand il est dit.
 */
const T = {
  // ── ÎLOT 1 — « la dose fait le poison »   B2 4,15 → 9,50
  ilot1: 4.15,
  sel: 4.15, // « Le sel »                                  [4,15 → 4,56]
  cafe: 4.55, // « le café »                                [4,56 → 5,17]
  oxygene: 5.15, // « l'oxygène »                           [5,17 → 5,79]
  // Les trois curseurs glissent pendant « à trop forte dose, tout devient
  // dangereux » et sont tous arrivés avant la chute de la phrase.
  curseurs: [5.75, 6.25, 6.75], //                          [5,79 → 8,05]
  poison: 7.95, // « C'est la dose qui fait le poison »     [8,05 → 9,50]
  sortie1: 9.15,
  fin1: 9.5,

  // ── ÎLOT 2 — comparaison puis dose réelle   B4 15,45 → 20,30, B5 → 29,40
  ilot2: 15.45,
  etiquette: 15.45, // « j'oublie souvent ce détail »       [15,45 → 16,93]
  canette: 16.35, // le sujet, posé avant la comparaison
  aloe: 16.95, // « c'est la même que l'aloe vera »         [16,93 → 18,40]
  legumes: 18.4, // « ou de certains légumes fermentés »    [18,40 → 20,30]
  sortie2B: 20.05, // le groupe 2B descend et quitte la scène

  enteteDose: 20.9, // la scène est libre, l'en-tête peut descendre
  valeur: 22.3, // « quarante milligrammes… »               [22,44 → 24,94]
  rangeValeur: 24.8, // le chiffre remonte en en-tête, la scène se libère
  adulte: 25.0, // « Pour un adulte de soixante-dix kilos » [24,94 → 27,26]
  canettes: 25.4, // la jauge se construit, canette par canette
  zones: 27.3, // « entre neuf et quatorze canettes »       [27,26 → 29,40]
  fin2: 29.4,
};

// ── Bandes horizontales réservées ────────────────────────────────────────
/**
 * Les bandes ne se touchent pas : GOUTTIERE les sépare. Le brief demande « son
 * propre espace » pour chaque élément, pas seulement l'absence de recouvrement.
 */
const GOUTTIERE = 72;

const BANDES = (() => {
  const enTete = { haut: 210, bas: 470 };
  const scene = { haut: enTete.bas + GOUTTIERE, bas: enTete.bas + GOUTTIERE + 664 };
  const socle = { haut: scene.bas + GOUTTIERE, bas: scene.bas + GOUTTIERE + 282 };
  return { enTete, scene, socle };
})();

const CX = 540;

/**
 * Les postes des deux îlots, avec leur emprise réelle.
 *
 * Les deux îlots n'étant jamais à l'écran en même temps, ils peuvent occuper
 * les mêmes coordonnées. À l'intérieur d'un îlot, en revanche, deux postes ne
 * se recouvrent jamais — c'est ce qui se vérifie en lisant les emprises.
 */
const POSTES = {
  /** Îlot 1 : trois colonnes de 300 px d'entraxe. x 90..990 */
  colonnes: [240, CX, 840],
  icone1Y: 760, //  emprise verticale        y 685..835
  label1Y: 890, //                           y 872..908
  jaugeY: 962, //  piste de 200 px de large  y 948..976
  axeY: 1074, //                             y 1052..1096
  jaugeL: 200,

  /** Îlot 2, comparaison : mêmes colonnes, icônes plus basses. */
  icone2Y: 820, //                           y 740..900
  label2aY: 966,
  label2bY: 1006,

  /** Îlot 2, dose : la jauge à canettes.    x 126..954   y 750..850 */
  adulteY: 646,
  canY: 800,
  canL: 44,
  canH: 68,
  canPas: 56,
  canGauche: 126,
  zoneHaut: 750,
  zoneBas: 850,
  zoneLabelY: 906,
  /** Le chiffre, d'abord au centre de la scène puis rangé en en-tête. */
  valeurPres: { y: 830, taille: 148 },
  valeurHaut: { y: BANDES.enTete.haut + 168, taille: 92 },
};

const ACCENT = M.bleuClair; // mot-clé
const SUR = M.vert; // réservé aux validations
const DANGER = M.rouge; // réservé aux rejets et au dépassement
const SEUIL = M.ambre; // la zone intermédiaire

/** Les trois substances de l'escalade, dans l'ordre où la voix les nomme. */
const SUBSTANCES = [
  { cle: "sel", label: "SEL", entre: T.sel },
  { cle: "cafe", label: "CAFÉ", entre: T.cafe },
  { cle: "oxygene", label: "OXYGÈNE", entre: T.oxygene },
];

/** Les trois occupants du groupe 2B. La canette d'abord : c'est le sujet. */
const GROUPE2B = [
  { cle: "canette", haut: "SODA", bas: "LIGHT", entre: T.canette },
  { cle: "aloe", haut: "ALOE", bas: "VERA", entre: T.aloe },
  { cle: "legumes", haut: "LÉGUMES", bas: "FERMENTÉS", entre: T.legumes },
];

const CANETTES_TOTAL = 15;
const CANETTES_SUR = 9; // en deçà, la DJA n'est pas approchée
const CANETTES_DJA = 14; // au-delà, la DJA est dépassée

// ── Petites briques de dessin ────────────────────────────────────────────

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  poids?: number;
  espace?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, poids = 700, espace = 0, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    fill={couleur}
    fontSize={taille}
    fontWeight={poids}
    letterSpacing={espace}
    opacity={opacity}
    textAnchor={ancre}
    dominantBaseline="middle"
    fontFamily={TITRE_FONT}
  >
    {children}
  </text>
);

/** Salière. */
const Sel: React.FC = () => (
  <g>
    <path d="M-34 -22 C-34 -46 -18 -58 0 -58 C18 -58 34 -46 34 -22 L40 62 C40 74 32 80 22 80 L-22 80 C-32 80 -40 74 -40 62 Z" fill={M.gris} />
    <rect x={-38} y={-30} width={76} height={22} rx={9} fill={M.texte} />
    {[-18, 0, 18].map((x) => (
      <circle key={x} cx={x} cy={-42} r={5} fill={M.fond} />
    ))}
    {[-9, 9].map((x) => (
      <circle key={x} cx={x} cy={-54} r={5} fill={M.fond} />
    ))}
  </g>
);

/** Tasse de café. */
const Cafe: React.FC = () => (
  <g>
    <path d="M-46 -20 L46 -20 L36 54 C35 64 28 70 18 70 L-18 70 C-28 70 -35 64 -36 54 Z" fill={M.gris} />
    <path d="M46 -8 C72 -8 76 30 46 34" stroke={M.gris} strokeWidth={12} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={80} rx={62} ry={11} fill={M.texte} opacity={0.55} />
    {[-20, 4].map((x, i) => (
      <path
        key={x}
        d={`M${x} -44 C${x + 16} -58 ${x - 12} -70 ${x + 6} -86`}
        stroke={M.texte}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        opacity={0.45 + i * 0.15}
      />
    ))}
  </g>
);

/** Dioxygène : deux atomes liés. */
const Oxygene: React.FC = () => (
  <g>
    <line x1={-30} y1={-8} x2={30} y2={-8} stroke={M.texte} strokeWidth={7} opacity={0.7} />
    <line x1={-30} y1={12} x2={30} y2={12} stroke={M.texte} strokeWidth={7} opacity={0.7} />
    {[-44, 44].map((x) => (
      <g key={x}>
        <circle cx={x} cy={2} r={40} fill={M.gris} />
        <Txt x={x} y={4} taille={38} couleur={M.fond} poids={800}>
          O
        </Txt>
      </g>
    ))}
  </g>
);

/** Canette de soda. `k` met à l'échelle sans toucher aux proportions. */
const Canette: React.FC<{ k?: number; couleur?: string }> = ({ k = 1, couleur = M.gris }) => (
  <g transform={`scale(${k})`}>
    <rect x={-42} y={-70} width={84} height={140} rx={20} fill={couleur} />
    <rect x={-42} y={-14} width={84} height={30} fill={M.fond} opacity={0.5} />
    <ellipse cx={0} cy={-70} rx={30} ry={8} fill={M.fond} opacity={0.45} />
  </g>
);

/** Feuille d'aloe vera : trois lames dentelées. */
const Aloe: React.FC = () => (
  <g>
    {[
      { d: "M0 76 C-14 20 -26 -30 -14 -78 C-2 -34 6 16 0 76 Z", o: 0.75 },
      { d: "M0 76 C-44 30 -62 -12 -58 -56 C-28 -22 -6 22 0 76 Z", o: 0.9 },
      { d: "M0 76 C44 30 62 -12 58 -56 C28 -22 6 22 0 76 Z", o: 0.9 },
    ].map((f, i) => (
      <path key={i} d={f.d} fill={SUR} opacity={f.o} />
    ))}
  </g>
);

/** Bocal de légumes fermentés. */
const Legumes: React.FC = () => (
  <g>
    <rect x={-52} y={-58} width={104} height={128} rx={18} fill={M.gris} />
    <rect x={-58} y={-80} width={116} height={26} rx={9} fill={M.texte} />
    <g opacity={0.55}>
      {[
        [-26, -18],
        [4, -26],
        [28, -8],
        [-16, 16],
        [16, 24],
        [-32, 40],
        [22, 48],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={11} fill={M.fond} />
      ))}
    </g>
  </g>
);

const ICONES: Record<string, React.FC> = {
  sel: Sel,
  cafe: Cafe,
  oxygene: Oxygene,
  canette: () => <Canette />,
  aloe: Aloe,
  legumes: Legumes,
};

/** Check vert, tracé d'un trait. */
const Check: React.FC<{ x: number; y: number; taille: number; opacity?: number }> = ({ x, y, taille, opacity = 1 }) => {
  const a = taille / 2;
  return (
    <polyline
      points={`${-a},${0.02 * a} ${-0.18 * a},${0.66 * a} ${a},${-0.72 * a}`}
      fill="none"
      stroke={SUR}
      strokeWidth={taille * 0.17}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={`translate(${x} ${y})`}
      opacity={opacity}
    />
  );
};

/** Croix rouge. */
const Croix: React.FC<{ x: number; y: number; taille: number; opacity?: number }> = ({ x, y, taille, opacity = 1 }) => {
  const a = taille / 2;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <line x1={-a} y1={-a} x2={a} y2={a} stroke={DANGER} strokeWidth={taille * 0.17} strokeLinecap="round" />
      <line x1={a} y1={-a} x2={-a} y2={a} stroke={DANGER} strokeWidth={taille * 0.17} strokeLinecap="round" />
    </g>
  );
};

// ── L'animation ──────────────────────────────────────────────────────────

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  /**
   * Les deux îlots. Chacun monte APRÈS la fin de la réplique précédente et
   * s'efface avant la reprise du plan filmé ; rien, pas même un fondu, ne
   * commence avant la borne de son îlot.
   */
  const vie1 = rd(t, T.ilot1, T.ilot1 + 0.35) * (1 - rd(t, T.fin1 - 0.3, T.fin1));
  const vie2 = rd(t, T.ilot2, T.ilot2 + 0.35) * (1 - rd(t, T.fin2 - 0.28, T.fin2));
  const vie = Math.max(vie1, vie2);
  if (vie <= 0) return null;

  // Respiration lente : jamais tout à fait immobile, jamais assez pour distraire.
  const souffle = 1 + 0.006 * Math.sin(2 * Math.PI * (t - T.ilot1) / 7.5);

  // ── Îlot 1 ─────────────────────────────────────────────────────────────
  const poison = rd(t, T.poison, T.poison + 0.6) * (1 - rd(t, T.sortie1, T.sortie1 + 0.3));

  // ── Îlot 2, comparaison ────────────────────────────────────────────────
  const etiquette = rd(t, T.etiquette, T.etiquette + 0.5) * (1 - rd(t, T.sortie2B, T.sortie2B + 0.45));

  // ── Îlot 2, dose ───────────────────────────────────────────────────────
  const enteteDose = rd(t, T.enteteDose, T.enteteDose + 0.55);
  const valeur = rd(t, T.valeur, T.valeur + 0.6);
  const rangeValeur = rd(t, T.rangeValeur, T.rangeValeur + 0.7);
  const adulte = rd(t, T.adulte, T.adulte + 0.55);
  const jauge = rd(t, T.canettes, T.canettes + 0.5);
  const zones = rd(t, T.zones, T.zones + 0.6);
  const remplissage = r(t, T.canettes, T.canettes + 3.2); // linéaire : une canette après l'autre

  const valeurY = melange(POSTES.valeurPres.y, POSTES.valeurHaut.y, rangeValeur);
  const valeurTaille = melange(POSTES.valeurPres.taille, POSTES.valeurHaut.taille, rangeValeur);

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: vie }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <defs>
          {/* La piste de dose va du vert au rouge : la teinte porte à elle
              seule la lecture « normale → extrême », le curseur n'a plus qu'à
              dire où l'on se trouve. */}
          <linearGradient id="asp-dose" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={SUR} />
            <stop offset="52%" stopColor={SEUIL} />
            <stop offset="100%" stopColor={DANGER} />
          </linearGradient>
        </defs>

        <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>
          {/* ══ ÎLOT 1 — l'escalade « la dose fait le poison » ══════════════ */}
          {vie1 > 0 &&
            SUBSTANCES.map((s, i) => {
              const nait = rd(t, s.entre, s.entre + 0.5);
              // Sortie par le bas, décalée d'une colonne à l'autre : les trois
              // gardent leur abscisse et ne se croisent donc jamais.
              const part = rd(t, T.sortie1 + i * 0.06, T.sortie1 + i * 0.06 + 0.3);
              if (nait <= 0) return null;
              const e = nait * (1 - part);
              const x = POSTES.colonnes[i];
              const dy = melange(melange(34, 0, nait), 150, part);
              const Icone = ICONES[s.cle];
              const glisse = rd(t, T.curseurs[i], T.curseurs[i] + 1.15);
              const g = POSTES.jaugeL / 2;
              return (
                <g key={s.cle} opacity={e} transform={`translate(0 ${dy})`}>
                  <g transform={`translate(${x} ${POSTES.icone1Y}) scale(${melange(0.78, 1, nait)})`}>
                    <Icone />
                  </g>
                  <Txt x={x} y={POSTES.label1Y} taille={32} couleur={M.texte} espace={3}>
                    {s.label}
                  </Txt>
                  {/* Mini-jauge : piste teintée, puis curseur. */}
                  <rect
                    x={x - g}
                    y={POSTES.jaugeY - 14}
                    width={POSTES.jaugeL}
                    height={28}
                    rx={14}
                    fill="url(#asp-dose)"
                    opacity={0.32 + 0.5 * glisse}
                  />
                  <circle
                    cx={x - g + POSTES.jaugeL * glisse}
                    cy={POSTES.jaugeY}
                    r={19}
                    fill={M.texte}
                    stroke={M.fond}
                    strokeWidth={5}
                  />
                </g>
              );
            })}

          {/* L'axe partagé par les trois jauges : une seule fois, aux
              extrémités de la rangée. Trois paires de repères auraient encombré
              la bande sans rien ajouter. */}
          {vie1 > 0 &&
            (() => {
              const e = rd(t, T.curseurs[0] - 0.35, T.curseurs[0] + 0.15) * (1 - rd(t, T.sortie1, T.sortie1 + 0.3));
              if (e <= 0) return null;
              return (
                <g opacity={e}>
                  <Check x={152} y={POSTES.axeY} taille={38} />
                  <Txt x={192} y={POSTES.axeY} taille={28} couleur={SUR} espace={2} ancre="start">
                    DOSE NORMALE
                  </Txt>
                  <Croix x={928} y={POSTES.axeY} taille={34} />
                  <Txt x={888} y={POSTES.axeY} taille={28} couleur={DANGER} espace={2} ancre="end">
                    DOSE EXTRÊME
                  </Txt>
                </g>
              );
            })()}

          {poison > 0 && (
            <Txt
              x={CX}
              y={BANDES.socle.haut + melange(80, 70, poison)}
              taille={melange(50, 58, poison)}
              couleur={ACCENT}
              espace={2}
              opacity={poison}
            >
              C'EST LA DOSE QUI FAIT LE POISON
            </Txt>
          )}

          {/* ══ ÎLOT 2a — le groupe 2B ═════════════════════════════════════ */}
          {etiquette > 0 && (
            <g opacity={etiquette} transform={`translate(0 ${melange(-26, 0, etiquette)})`}>
              {/* 520 px pour 68 px de corps : « GROUPE 2B » et son interlettrage
                  font 430 px, et l'étiquette doit garder une marge visible de
                  part et d'autre. À 420 px le G et le B chevauchaient le cadre. */}
              <rect
                x={CX - 260}
                y={BANDES.enTete.haut + 92}
                width={520}
                height={116}
                rx={24}
                fill={M.fondCase}
                stroke={SEUIL}
                strokeWidth={4}
              />
              <Txt x={CX} y={BANDES.enTete.haut + 150} taille={68} couleur={SEUIL} espace={4}>
                GROUPE 2B
              </Txt>
              <Txt x={CX} y={BANDES.enTete.haut + 244} taille={30} couleur={M.gris} espace={3}>
                « POSSIBLEMENT CANCÉROGÈNE » — OMS
              </Txt>
            </g>
          )}

          {vie2 > 0 &&
            GROUPE2B.map((s, i) => {
              const nait = rd(t, s.entre, s.entre + 0.55);
              const part = rd(t, T.sortie2B + i * 0.07, T.sortie2B + i * 0.07 + 0.34);
              if (nait <= 0) return null;
              const e = nait * (1 - part);
              const x = POSTES.colonnes[i];
              const dy = melange(melange(38, 0, nait), 170, part);
              const Icone = ICONES[s.cle];
              return (
                <g key={s.cle} opacity={e} transform={`translate(0 ${dy})`}>
                  <g transform={`translate(${x} ${POSTES.icone2Y}) scale(${melange(0.76, 1, nait)})`}>
                    <Icone />
                  </g>
                  <Txt x={x} y={POSTES.label2aY} taille={30} couleur={M.gris} espace={3}>
                    {s.haut}
                  </Txt>
                  <Txt x={x} y={POSTES.label2bY} taille={30} couleur={M.texte} espace={3}>
                    {s.bas}
                  </Txt>
                </g>
              );
            })}

          {/* ══ ÎLOT 2b — la dose réelle ═══════════════════════════════════ */}
          {enteteDose > 0 && (
            <Txt
              x={CX}
              y={BANDES.enTete.haut + melange(66, 56, enteteDose)}
              taille={32}
              couleur={M.gris}
              espace={4}
              opacity={enteteDose}
            >
              DOSE JOURNALIÈRE ADMISE — OMS
            </Txt>
          )}

          {/* Le chiffre s'incruste au centre quand il est prononcé, puis remonte
              en en-tête pour libérer la scène : il reste lisible pendant toute
              la construction de la jauge, sans jamais la toucher. */}
          {valeur > 0 && (
            <Txt x={CX} y={valeurY} taille={valeurTaille} couleur={M.texte} opacity={valeur}>
              40 mg/kg
            </Txt>
          )}

          {adulte > 0 && (
            <Txt
              x={CX}
              y={melange(POSTES.adulteY + 12, POSTES.adulteY, adulte)}
              taille={38}
              couleur={ACCENT}
              espace={3}
              opacity={adulte}
            >
              POUR UN ADULTE DE 70 KG
            </Txt>
          )}

          {/* Les deux zones, tracées derrière les canettes. */}
          {jauge > 0 &&
            (
              [
                { de: 0, a: CANETTES_SUR, couleur: SUR },
                { de: CANETTES_SUR, a: CANETTES_DJA, couleur: SEUIL },
                { de: CANETTES_DJA, a: CANETTES_TOTAL, couleur: DANGER },
              ] as const
            ).map((z, i) => (
              <rect
                key={i}
                x={POSTES.canGauche + z.de * POSTES.canPas}
                y={POSTES.zoneHaut}
                width={(z.a - z.de) * POSTES.canPas}
                height={POSTES.zoneBas - POSTES.zoneHaut}
                rx={14}
                fill={z.couleur}
                opacity={0.14 * jauge}
              />
            ))}

          {jauge > 0 &&
            Array.from({ length: CANETTES_TOTAL }, (_, i) => {
              // Chaque canette a sa propre fenêtre d'apparition : la jauge se
              // remplit une unité à la fois, jamais d'un bloc.
              const e = rd(remplissage, i / CANETTES_TOTAL, i / CANETTES_TOTAL + 0.09);
              if (e <= 0) return null;
              const couleur = i < CANETTES_SUR ? SUR : i < CANETTES_DJA ? SEUIL : DANGER;
              const x = POSTES.canGauche + POSTES.canPas * i + POSTES.canPas / 2;
              return (
                <g
                  key={i}
                  opacity={e * jauge}
                  transform={`translate(${x} ${melange(POSTES.canY + 18, POSTES.canY, e)})`}
                >
                  <Canette k={POSTES.canL / 84} couleur={couleur} />
                </g>
              );
            })}

          {zones > 0 && (
            <g opacity={zones}>
              <Txt
                x={POSTES.canGauche + (CANETTES_SUR * POSTES.canPas) / 2}
                y={POSTES.zoneLabelY}
                taille={30}
                couleur={SUR}
                espace={3}
              >
                SÛR
              </Txt>
              <Txt
                x={POSTES.canGauche + ((CANETTES_SUR + CANETTES_DJA) / 2) * POSTES.canPas}
                y={POSTES.zoneLabelY}
                taille={30}
                couleur={SEUIL}
                espace={3}
              >
                SEUIL DJA
              </Txt>
              <Txt x={CX} y={BANDES.socle.haut + 76} taille={52} couleur={M.texte} espace={2}>
                9 À 14 CANETTES PAR JOUR
              </Txt>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
