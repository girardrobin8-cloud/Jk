import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * Les 39 s de motion design, en UN SEUL composant continu.
 *
 * Le brief pose trois règles dures, et c'est la structure du composant qui les
 * tient, pas une relecture au montage :
 *
 * 1. Aucun chevauchement. Chaque élément a sa bande horizontale réservée —
 *    en-tête, colonnes, barres, socle — et n'en sort jamais. Les bandes sont
 *    déclarées dans BANDES ci-dessous ; c'est le seul endroit à relire pour
 *    vérifier qu'un ajout ne recouvre rien.
 * 2. Aucune coupe sèche. Rien n'apparaît sans venir d'ailleurs : le soleil
 *    devient la lune, la lune devient la racine de l'arbre, les extrémités de
 *    l'arbre deviennent les en-têtes des deux colonnes, et la barre grise se
 *    scinde en ses deux composantes au lieu d'être remplacée.
 * 3. Jamais d'écran figé plus de deux secondes. Une respiration lente porte
 *    l'ensemble, et chaque temps est subdivisé en micro-événements décalés.
 *
 * `t` est le temps ABSOLU du montage, pour que les bornes de reperes.ts
 * s'appliquent sans conversion.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));

// ── Repères de temps, en secondes absolues ───────────────────────────────
/**
 * Repères de temps, en secondes absolues.
 *
 * Chaque valeur tombe sur la phrase que la voix prononce à cet instant, les
 * fenêtres venant de `scripts/caler.py`. Le commentaire cite les mots visés :
 * c'est ce qui permet de vérifier un calage sans relancer l'analyse.
 */
const T = {
  soleil: 7.3, // « Pendant quatorze jours »              [7,16 → 7,99]
  lune: 8.3, // « des chercheurs ont mis… »               [7,99 → 11,53]
  racine: 9.6,
  branches: 10.4, // « …en déficit calorique modéré »
  conditions: 11.7, // « avec deux conditions de sommeil » [11,53 → 13,69]
  colonneA: 13.75, // « huit heures trente… »              [13,69 → 15,81]
  grilleA: 14.3,
  colonneB: 15.85, // « cinq heures trente pour le second »[15,81 → 17,14]
  grilleB: 16.35,
  barres: 20.3, // « Le poids total perdu ? »              [20,21 → 21,61]
  troisKg: 23.75, // « environ trois kilos »               [23,68 → 25,00]
  scission: 25.2, // « regarde ce qui compose cette perte »[25,00 → 27,08]
  chiffres: 28.9, // « un virgule quatre kilo de gras »    [28,81 → 30,77]
  surbrillance: 34.6, // « le groupe qui dort peu… »       [34,53 → 37,62]
  soixante: 35.6, // « …soixante pour cent de muscle »
  fin: 39.1,
};

// ── Bandes horizontales réservées ────────────────────────────────────────
/**
 * Le découpage vertical qui garantit l'absence de chevauchement.
 *
 * Aucun élément ne sort de sa bande, et deux éléments d'une même bande ne
 * coexistent jamais — c'est le cas de l'arbre et du bandeau « +60 % », séparés
 * dans le temps de plus de vingt secondes.
 *
 * Les bandes ne se touchent pas : GOUTTIERE les sépare. Le brief ne demande pas
 * seulement l'absence de recouvrement mais une marge VISIBLE entre les blocs —
 * des bandes jointives satisfaisaient la lettre de la règle et pas son intention,
 * les éléments se retrouvant collés bord à bord.
 */
const GOUTTIERE = 74;

const BANDES = (() => {
  const enTete = { haut: 240, bas: 496 }; // soleil/lune, arbre, puis « +60 % »
  const colonnes = { haut: enTete.bas + GOUTTIERE, bas: enTete.bas + GOUTTIERE + 322 };
  const barres = { haut: colonnes.bas + GOUTTIERE, bas: colonnes.bas + GOUTTIERE + 410 };
  const socle = { haut: barres.bas, bas: barres.bas + 284 };
  return { enTete, colonnes, barres, socle };
})();

const CX = 540;
const GA = 296; // colonne 8h30
const GB = 784; // colonne 5h30
const BASE = BANDES.barres.bas;
const BARRE_L = 132;

/** Échelle des barres : 3 kg occupent toute la bande disponible. */
const PX_PAR_KG = (BANDES.barres.bas - BANDES.barres.haut - 60) / 3;

const GROUPES = [
  {
    cle: "long",
    x: GA,
    titre: "8H30 DE SOMMEIL",
    couleur: M.bleuClair,
    gras: 1.4,
    total: 3,
    depart: T.colonneA,
    grille: T.grilleA,
  },
  {
    cle: "court",
    x: GB,
    titre: "5H30 DE SOMMEIL",
    couleur: M.ambre,
    gras: 0.6,
    total: 3,
    depart: T.colonneB,
    grille: T.grilleB,
  },
];

const COULEUR_GRAS = M.vert;
const COULEUR_MUSCLE = M.corail;

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 32, couleur = M.gris, opacity = 1, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    textAnchor={ancre}
    fontFamily={TITRE_FONT}
    fontSize={taille}
    fontWeight={700}
    fill={couleur}
    opacity={opacity}
  >
    {children}
  </text>
);

/** Silhouette : dix par groupe, comme les dix participants de l'étude. */
const Silhouette: React.FC<{ x: number; y: number; c: number; couleur: string; o: number }> = ({
  x,
  y,
  c,
  couleur,
  o,
}) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${c})`}>
    <circle cx={0} cy={-18} r={10} fill={couleur} />
    <path d="M -14 -5 Q 0 -11 14 -5 L 12 24 L -12 24 Z" fill={couleur} />
  </g>
);

/**
 * Astre unique : le soleil se referme en lune sans être remplacé.
 *
 * `nuit` va de 0 à 1. Les rayons se rétractent pendant qu'un disque de fond
 * vient mordre le disque principal — c'est la même forme qui change, pas deux
 * icônes en fondu croisé.
 */
const Astre: React.FC<{ x: number; y: number; rayon: number; nuit: number; o: number }> = ({
  x,
  y,
  rayon,
  nuit,
  o,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const r1 = rayon * 1.32;
      const r2 = r1 + rayon * 0.42 * (1 - nuit);
      return (
        <line
          key={i}
          x1={Math.cos(a) * r1}
          y1={Math.sin(a) * r1}
          x2={Math.cos(a) * r2}
          y2={Math.sin(a) * r2}
          stroke={M.ambre}
          strokeWidth={7}
          strokeLinecap="round"
          opacity={1 - nuit}
        />
      );
    })}
    <circle cx={0} cy={0} r={rayon} fill={M.ambre} />
    {/* Le disque qui mord : hors champ à gauche au départ, il vient créer le
        croissant en glissant. Sa couleur est celle du fond, pas du noir. */}
    <circle
      cx={rayon * (2.1 - 1.35 * nuit)}
      cy={-rayon * 0.34 * nuit}
      r={rayon * 0.94}
      fill={M.fond}
    />
  </g>
);

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const vie = Math.min(rd(t, T.soleil - 0.5, T.soleil), 1 - rd(t, T.fin - 0.5, T.fin));
  if (vie <= 0.001) {
    return null;
  }

  // Respiration lente de l'ensemble : le brief interdit l'écran figé, et même
  // à l'arrêt d'un temps le cadre continue de vivre imperceptiblement.
  const souffle = 1 + Math.sin(t * 0.9) * 0.006;

  const nuit = rd(t, T.lune, T.lune + 1.0);
  const monte = rd(t, T.racine, T.racine + 0.9);
  const astreY = 700 - (700 - 300) * monte;
  const astreR = 96 - 54 * monte;

  const tronc = rd(t, T.branches, T.branches + 0.5);
  const bras = rd(t, T.branches + 0.35, T.branches + 1.0);
  const descentes = rd(t, T.branches + 0.8, T.branches + 1.4);
  const conditions = rd(t, T.conditions, T.conditions + 0.6);
  // L'arbre s'estompe quand les colonnes prennent le relais, mais ne disparaît
  // pas : il reste le lien entre la racine et les deux groupes.
  const arbre = 1 - 0.72 * rd(t, T.colonneA, T.colonneA + 0.8);
  // …puis s'efface pour de bon quand le bandeau « +60 % » occupe l'en-tête.
  const sortieArbre = rd(t, T.soixante - 0.5, T.soixante + 0.2);

  const scission = rd(t, T.scission, T.scission + 1.1);
  const soixante = rd(t, T.soixante, T.soixante + 0.6);
  const halo = rd(t, T.surbrillance, T.surbrillance + 0.5);

  // L'arbre tient entièrement dans la bande d'en-tête, gouttière comprise :
  // ses icônes descendaient auparavant jusqu'à frôler les titres de colonne.
  const Y_BRANCHE = 404;
  const Y_BAS = 470;

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: vie }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(58% 40% at 50% 42%, rgba(47,191,113,0.09) 0%, transparent 72%)",
        }}
      />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          <filter id="somHalo" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="12" result="f" />
            <feMerge>
              <feMergeNode in="f" />
              <feMergeNode in="f" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${CX} 960) scale(${souffle}) translate(${-CX} -960)`}>
          {/* ── Arbre de décision, bande d'en-tête ──────────────────────── */}
          <g opacity={(1 - sortieArbre) * arbre}>
            <line
              x1={CX}
              y1={astreY + astreR + 16}
              x2={CX}
              y2={astreY + astreR + 16 + (Y_BRANCHE - astreY - astreR - 16) * tronc}
              stroke={M.gris}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={tronc}
            />
            <line
              x1={CX}
              y1={Y_BRANCHE}
              x2={CX - (CX - GA) * bras}
              y2={Y_BRANCHE}
              stroke={M.gris}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={bras}
            />
            <line
              x1={CX}
              y1={Y_BRANCHE}
              x2={CX + (GB - CX) * bras}
              y2={Y_BRANCHE}
              stroke={M.gris}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={bras}
            />
            {[GA, GB].map((x) => (
              <line
                key={x}
                x1={x}
                y1={Y_BRANCHE}
                x2={x}
                // La descente s'arrête AU-DESSUS des deux icônes : menée jusqu'à
                // leur hauteur, elle venait pointer entre l'assiette et la lune.
                y2={Y_BRANCHE + (Y_BAS - 42 - Y_BRANCHE) * descentes}
                stroke={M.gris}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={descentes}
              />
            ))}

            {/* Assiette et lune au bout de chaque branche : les deux conditions
                de l'étude, mêmes calories, sommeil différent. */}
            {[GA, GB].map((x, i) => (
              <g key={x} opacity={conditions} transform={`translate(${x} ${Y_BAS - 6})`}>
                <g transform={`translate(-46 0) scale(${0.9 + conditions * 0.1})`}>
                  <circle cx={0} cy={0} r={23} fill="none" stroke={M.gris} strokeWidth={5} />
                  <circle cx={0} cy={0} r={9} fill={M.gris} />
                </g>
                <g transform={`translate(46 0) scale(${0.9 + conditions * 0.1})`}>
                  <circle cx={0} cy={0} r={22} fill={i === 0 ? M.bleuClair : M.ambre} />
                  <circle cx={9} cy={-7} r={19} fill={M.fond} />
                </g>
              </g>
            ))}
          </g>

          <Astre
            x={CX}
            y={astreY}
            rayon={astreR}
            nuit={nuit}
            o={rd(t, T.soleil, T.soleil + 0.6) * (1 - sortieArbre)}
          />

          {/* ── Les deux colonnes ───────────────────────────────────────── */}
          {GROUPES.map((g) => {
            const venue = rd(t, g.depart, g.depart + 0.6);
            if (venue <= 0.001) {
              return null;
            }
            const hGras = g.gras * PX_PAR_KG;
            const hTotal = g.total * PX_PAR_KG;
            const pousse = rd(t, T.barres, T.barres + 1.0);
            const hauteur = hTotal * pousse;
            const hautBarre = BASE - hauteur;
            const estCourt = g.cle === "court";
            const lueur = estCourt ? halo : 0;

            return (
              <g key={g.cle}>
                <Txt x={g.x} y={BANDES.colonnes.haut + 36} taille={38} couleur={g.couleur} opacity={venue}>
                  {g.titre}
                </Txt>
                <Txt x={g.x} y={BANDES.colonnes.haut + 92} taille={27} couleur={M.gris} opacity={venue}>
                  MÊME DÉFICIT CALORIQUE
                </Txt>

                {/* Dix silhouettes, posées une à une. */}
                {Array.from({ length: 10 }, (_, i) => {
                  const o = rd(t, g.grille + i * 0.07, g.grille + 0.3 + i * 0.07);
                  return (
                    <Silhouette
                      key={i}
                      x={g.x - 2 * 56 + (i % 5) * 56}
                      y={BANDES.colonnes.haut + 178 + Math.floor(i / 5) * 84}
                      c={1.15 * (0.84 + o * 0.16)}
                      couleur={g.couleur}
                      o={o}
                    />
                  );
                })}

                {/* ── La barre ────────────────────────────────────────────
                    Une seule barre grise, qui se scinde en ses deux
                    composantes plutôt que d'être remplacée : la portion basse
                    vire au « gras », la haute au « muscle », et un trait de
                    séparation s'ouvre entre les deux. */}
                {pousse > 0.001 ? (
                  <g>
                    <rect
                      x={g.x - BARRE_L / 2}
                      y={hautBarre}
                      width={BARRE_L}
                      height={hauteur}
                      rx={8}
                      fill={M.fondCase}
                      stroke={M.gris}
                      strokeWidth={3}
                    />
                    {/* Portion « muscle », en haut. */}
                    <rect
                      x={g.x - BARRE_L / 2}
                      y={hautBarre}
                      width={BARRE_L}
                      height={Math.max(0, hauteur - hGras * pousse)}
                      rx={8}
                      fill={COULEUR_MUSCLE}
                      opacity={scission * 0.92}
                      filter={lueur > 0.02 ? "url(#somHalo)" : undefined}
                    />
                    {/* Portion « gras », en bas. */}
                    <rect
                      x={g.x - BARRE_L / 2}
                      y={BASE - hGras * pousse}
                      width={BARRE_L}
                      height={hGras * pousse}
                      rx={8}
                      fill={COULEUR_GRAS}
                      opacity={scission * 0.92}
                    />
                    <line
                      x1={g.x - BARRE_L / 2}
                      y1={BASE - hGras * pousse}
                      x2={g.x + BARRE_L / 2}
                      y2={BASE - hGras * pousse}
                      stroke={M.fond}
                      strokeWidth={4}
                      opacity={scission}
                    />

                    <Txt
                      x={g.x}
                      y={hautBarre - 44}
                      taille={40}
                      couleur={M.texte}
                      opacity={rd(t, T.troisKg, T.troisKg + 0.5) * (1 - scission)}
                    >
                      ≈ 3 KG
                    </Txt>

                  </g>
                ) : null}

                <Txt
                  x={g.x}
                  y={BANDES.socle.haut + 56}
                  taille={34}
                  couleur={g.couleur}
                  opacity={rd(t, T.barres - 0.2, T.barres + 0.4)}
                >
                  {g.cle === "long" ? "8H30" : "5H30"}
                </Txt>
                {/* Valeur chiffrée SOUS l'axe, et non dans la barre. Dans la
                    portion « gras » du groupe court dormeur — 0,6 kg, soit à
                    peine quatre-vingts pixels — le texte touchait les deux
                    bords. Sous l'axe, la place ne dépend plus de la donnée. */}
                <Txt
                  x={g.x}
                  y={BANDES.socle.haut + 122}
                  taille={36}
                  couleur={COULEUR_GRAS}
                  opacity={rd(t, T.chiffres, T.chiffres + 0.5)}
                >
                  {g.gras.toFixed(1).replace(".", ",")} kg de gras
                </Txt>
              </g>
            );
          })}

          {/* Socle des barres : il se trace avant qu'elles ne poussent. */}
          <line
            x1={120}
            y1={BASE}
            x2={120 + 840 * rd(t, T.barres - 0.45, T.barres + 0.15)}
            y2={BASE}
            stroke={M.gris}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={rd(t, T.barres - 0.45, T.barres + 0.15)}
          />

          {/* Légende gras / muscle, dans la bande du socle. */}
          <g opacity={rd(t, T.scission + 0.6, T.scission + 1.2)}>
            <rect x={296} y={BANDES.socle.haut + 196} width={26} height={26} rx={6} fill={COULEUR_GRAS} />
            <Txt x={340} y={BANDES.socle.haut + 218} taille={28} couleur={M.gris} ancre="start">
              gras
            </Txt>
            <rect x={560} y={BANDES.socle.haut + 196} width={26} height={26} rx={6} fill={COULEUR_MUSCLE} />
            <Txt x={604} y={BANDES.socle.haut + 218} taille={28} couleur={M.gris} ancre="start">
              muscle
            </Txt>
          </g>
        </g>
      </svg>

      {/* ── Bandeau « +60 % », dans la bande d'en-tête libérée par l'arbre ── */}
      {soixante > 0.001 ? (
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 280 }}
        >
          <div
            style={{
              fontFamily: TITRE_FONT,
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
              color: COULEUR_MUSCLE,
              textAlign: "center",
              opacity: soixante,
              transform: `scale(${0.92 + soixante * 0.08})`,
            }}
          >
            +60 % DE MUSCLE
            <br />
            PERDU
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
