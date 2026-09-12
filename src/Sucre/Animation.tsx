import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";

/**
 * Les 33 s de motion design, en UN SEUL composant continu.
 *
 * Première version : cinq plans indépendants, chacun dans sa Sequence. Les
 * éléments y naissaient et mouraient sur place, et chaque beat coupait net sur
 * le suivant. C'est précisément ce que la référence ne fait pas : chez elle un
 * objet posé reste à l'écran et se déplace vers son rôle suivant, si bien que
 * l'œil n'a jamais à recommencer sa lecture.
 *
 * Ici tout partage donc la même horloge : le jeton « sucre » qui ouvre le film
 * devient la première ligne de l'empilement, l'empilement se resserre pour
 * devenir la phrase plein cadre, et la phrase se miniaturise en en-tête
 * au-dessus des deux groupes. Aucun élément n'est détruit puis recréé.
 *
 * `t` est le temps ABSOLU du montage, pour que les bornes de reperes.ts
 * s'appliquent sans conversion.
 */

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CL);

/** Adoucissement : départ et arrivée posés, milieu franc. */
const doux = (p: number) => p * p * (3 - 2 * p);
const rd = (t: number, a: number, b: number) => doux(r(t, a, b));

// ── Repères de temps, en secondes absolues ───────────────────────────────
const T = {
  entree: 6.4, // « Trop de sucre… » : le jeton entre, seul et grand
  courbe: 8.3, // « …grimper ta glycémie en flèche »
  foie: 9.9, // « …stresse ton foie »
  vaisseaux: 11.9, // « …abîme tes vaisseaux sanguins »
  // Le rangement en frise tombe sur la fin de phrase : les trois effets sont
  // classés au moment même où la voix passe à autre chose.
  frise: 12.95,
  // Le jeton descend APRÈS le rangement. Simultanés, les effets qui montent
  // traversaient la ligne qui descend, exactement à la même hauteur.
  pile: 13.5,
  gras: 14.5,
  sel: 15.4,
  additifs: 16.6, // « Cette combinaison… »
  phrase: 18.0, // « …conçue pour te faire manger plus »
  entete: 21.5,
  rose: 23.0, // « Deux groupes, même surplus… »
  bleu: 26.6, // « …l'autre en aliments qu'on appelle sains »
  verdict: 29.9, // « Le poids pris ? »
  identique: 30.8, // « Quasiment identique »
  fin: 34.98,
};

const CX = 540;

// ── Positions de la pile ─────────────────────────────────────────────────
const PILE_Y = 760;
const PILE_PAS = 132;
const PILE_L = 560;

const LIGNES = [
  { cle: "sucre", texte: "SUCRE", couleur: M.ambre, t: T.entree },
  { cle: "gras", texte: "+ GRAS", couleur: M.corail, t: T.gras },
  { cle: "sel", texte: "+ SEL", couleur: M.gris, t: T.sel },
  { cle: "additifs", texte: "+ ADDITIFS", couleur: M.vert, t: T.additifs },
];

const EFFETS = [
  { cle: "glycemie", texte: "GLYCÉMIE", t: T.courbe },
  { cle: "foie", texte: "FOIE", t: T.foie },
  { cle: "vaisseaux", texte: "VAISSEAUX", t: T.vaisseaux },
];

/** Courbe de glycémie, dans une boîte de 360 × 190. */
const COURBE = "M 0 168 L 52 164 L 92 154 L 132 44 L 172 10 L 224 96 L 288 144 L 360 158";

const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  taille?: number;
  couleur?: string;
  opacity?: number;
  gras?: number;
  ancre?: "start" | "middle" | "end";
}> = ({ x, y, children, taille = 34, couleur = M.gris, opacity = 1, gras = 700, ancre = "middle" }) => (
  <text
    x={x}
    y={y}
    textAnchor={ancre}
    fontFamily={TITRE_FONT}
    fontSize={taille}
    fontWeight={gras}
    fill={couleur}
    opacity={opacity}
  >
    {children}
  </text>
);

/** Silhouette d'un groupe : tête et corps, en formes pleines. */
const Silhouette: React.FC<{ x: number; y: number; c: number; couleur: string; o: number }> = ({
  x,
  y,
  c,
  couleur,
  o,
}) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${c})`}>
    <circle cx={0} cy={-19} r={11} fill={couleur} />
    <path d="M -15 -5 Q 0 -12 15 -5 L 13 26 L -13 26 Z" fill={couleur} />
  </g>
);

const COLONNES = 5;
const RANGS = 4;
const GRILLE_PAS_X = 62;
const GRILLE_PAS_Y = 96;

const Groupe: React.FC<{
  cx: number;
  couleur: string;
  legende: string;
  depart: number;
  t: number;
  /**
   * Effacement des libellés quand le verdict prend la parole.
   *
   * Une version précédente rapprochait les deux groupes sur la fin. Les deux
   * « SURPLUS CALORIQUE » se chevauchaient alors mot pour mot : le rappel de
   * l'égalité passait par un télescopage illisible. Les groupes restent donc en
   * place et ce sont leurs libellés, devenus redondants, qui s'effacent.
   */
  retrait: number;
}> = ({ cx, couleur, legende, depart, t, retrait }) => {
  const entree = rd(t, depart, depart + 0.5);
  const x = cx;
  const largeur = (COLONNES - 1) * GRILLE_PAS_X;

  return (
    <g opacity={entree}>
      <Txt x={x} y={860} taille={30} couleur={M.gris} opacity={1 - retrait}>
        SURPLUS CALORIQUE
      </Txt>
      <rect
        x={x - largeur / 2 - 22}
        y={886}
        width={largeur + 44}
        height={5}
        rx={3}
        fill={couleur}
        opacity={1 - retrait}
      />
      {Array.from({ length: COLONNES * RANGS }, (_, i) => {
        // Les silhouettes se posent une à une : le groupe se constitue sous les
        // yeux au lieu d'apparaître déjà formé.
        const o = rd(t, depart + 0.35 + i * 0.055, depart + 0.62 + i * 0.055);
        return (
          <Silhouette
            key={i}
            x={x - largeur / 2 + (i % COLONNES) * GRILLE_PAS_X}
            y={952 + Math.floor(i / COLONNES) * GRILLE_PAS_Y}
            c={1.34 * (0.86 + o * 0.14)}
            couleur={couleur}
            o={o}
          />
        );
      })}
      <Txt x={x} y={1372} taille={34} couleur={couleur}>
        {legende}
      </Txt>
    </g>
  );
};

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Le bloc entier s'ouvre et se referme sur les fenêtres tête caméra.
  const vie = Math.min(rd(t, T.entree - 0.45, T.entree), 1 - rd(t, T.fin - 0.45, T.fin));
  if (vie <= 0.001) {
    return null;
  }

  // ── Le jeton « sucre » : il entre seul, puis rejoint la pile ───────────
  const descente = rd(t, T.pile, T.pile + 0.75);
  const jetonY = 470 + (PILE_Y - 470) * descente;
  // Il entre plus grand que les autres — il est seul à l'écran — puis rejoint
  // exactement leur gabarit : au terme de la descente c'est une ligne comme
  // les trois suivantes, pas un rescapé plus petit.
  const jetonC = 1.42 - 0.42 * descente;

  // ── Les trois effets : ils se rangent en frise d'en-tête ───────────────
  const rangement = rd(t, T.frise, T.frise + 0.8);
  // …puis cèdent l'en-tête à la phrase, qui vient s'y ranger à son tour. Les
  // deux occupent la même bande : sans cette sortie, ils se superposaient.
  const sortieEffets = rd(t, T.entete - 0.15, T.entete + 0.5);

  // ── L'empilement se resserre pour devenir la phrase ────────────────────
  const contraction = rd(t, T.phrase, T.phrase + 0.7);
  const phrase = rd(t, T.phrase + 0.25, T.phrase + 0.85);
  const rangementPhrase = rd(t, T.entete, T.entete + 0.7);

  // ── Le verdict, puis le mot seul ───────────────────────────────────────
  const retrait = rd(t, T.verdict - 0.2, T.verdict + 0.4);
  const verdict = rd(t, T.verdict, T.verdict + 0.55);
  const identique = rd(t, T.identique, T.identique + 0.6);

  // La phrase plein cadre vit entre sa venue et son rangement.
  const phraseTaille = 108 - 62 * rangementPhrase;
  const phraseY = 940 - 640 * rangementPhrase;
  const phraseCouleur = rangementPhrase > 0.5 ? M.gris : M.texte;

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond, opacity: vie }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(58% 40% at 50% 40%, rgba(47,191,113,0.10) 0%, transparent 72%)",
        }}
      />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* ── Les trois effets ─────────────────────────────────────────── */}
        {EFFETS.map((e, i) => {
          const venue = rd(t, e.t, e.t + 0.55);
          if (venue <= 0.001) {
            return null;
          }
          // Chaque effet quitte sa place pleine pour une pastille d'en-tête :
          // il n'est jamais détruit, seulement réduit et déplacé.
          const plein = { x: 220 + i * 320, y: 1180 };
          const range = { x: 250 + i * 290, y: 270 };
          const x = plein.x + (range.x - plein.x) * rangement;
          const y = plein.y + (range.y - plein.y) * rangement;
          const c = 1 - 0.52 * rangement;

          return (
            <g
              key={e.cle}
              opacity={venue * (1 - sortieEffets)}
              transform={`translate(0 ${-70 * sortieEffets})`}
            >
              <g transform={`translate(${x} ${y}) scale(${c})`}>
                {e.cle === "glycemie" ? (
                  <g transform="translate(-180 -96)">
                    <path
                      d={COURBE}
                      fill="none"
                      stroke={M.corail}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - rd(t, e.t, e.t + 1.1)}
                    />
                  </g>
                ) : null}

                {e.cle === "foie" ? (
                  <>
                    <path
                      d="M -78 -46 Q 0 -74 78 -46 Q 86 6 30 46 Q -20 66 -60 26 Z"
                      fill={M.corail}
                      opacity={0.85}
                    />
                    <circle
                      cx={0}
                      cy={0}
                      r={104}
                      fill="none"
                      stroke={M.corail}
                      strokeWidth={5}
                      strokeDasharray="16 13"
                      opacity={0.8}
                    />
                  </>
                ) : null}

                {e.cle === "vaisseaux" ? (
                  <>
                    <rect x={-96} y={-34} width={192} height={68} rx={34} fill={M.corail} opacity={0.35} />
                    <rect x={-96} y={-13} width={192} height={26} rx={13} fill={M.corail} />
                    <g stroke={M.rouge} strokeWidth={9} strokeLinecap="round">
                      <line x1={44} y1={-30} x2={92} y2={30} />
                      <line x1={92} y1={-30} x2={44} y2={30} />
                    </g>
                  </>
                ) : null}
              </g>
              <Txt
                x={x}
                y={y + 150 - 84 * rangement}
                taille={32 - 8 * rangement}
                couleur={M.gris}
              >
                {e.texte}
              </Txt>
            </g>
          );
        })}

        {/* ── L'empilement ─────────────────────────────────────────────── */}
        {LIGNES.map((l, i) => {
          const venue = rd(t, l.t, l.t + 0.55);
          if (venue <= 0.001) {
            return null;
          }
          const estSucre = i === 0;
          // Le jeton sucre a sa propre trajectoire d'entrée ; les autres lignes
          // se posent directement à leur rang.
          const y = estSucre ? jetonY : PILE_Y + i * PILE_PAS;
          const c = estSucre ? jetonC : 1;
          // À la contraction, toutes les lignes convergent vers le centre en
          // s'effaçant : la pile ne disparaît pas, elle se referme.
          const cible = PILE_Y + 1.5 * PILE_PAS;
          const yy = y + (cible - y) * contraction;
          const cc = c * (1 - 0.55 * contraction);

          return (
            <g
              key={l.cle}
              opacity={venue * (1 - contraction)}
              transform={`translate(${CX} ${yy}) scale(${cc})`}
            >
              <rect
                x={-PILE_L / 2}
                y={-52}
                width={PILE_L}
                height={104}
                rx={14}
                fill={M.fondCase}
                stroke={l.couleur}
                strokeWidth={4}
              />
              <Txt x={0} y={18} taille={52} couleur={l.couleur}>
                {l.texte}
              </Txt>
            </g>
          );
        })}

        {/* ── Les deux groupes ─────────────────────────────────────────── */}
        {t > T.rose - 0.6 ? (
          <g opacity={1 - 0.72 * identique}>
            <Groupe
              cx={288}
              couleur={M.ambre}
              legende="sucreries"
              depart={T.rose}
              t={t}
              retrait={retrait}
            />
            <Groupe
              cx={792}
              couleur={M.bleuClair}
              legende="aliments « sains »"
              depart={T.bleu}
              t={t}
              retrait={retrait}
            />

            {/* Verdict, posé entre les deux grilles. */}
            <g opacity={verdict} transform={`translate(${CX} ${1546 - 14 * verdict})`}>
              <rect x={-260} y={-56} width={520} height={112} rx={16} fill={M.fondCase} stroke={M.vert} strokeWidth={4} />
              <Txt x={0} y={18} taille={54} couleur={M.texte}>
                POIDS PRIS
              </Txt>
              <g stroke={M.vert} strokeWidth={10} strokeLinecap="round" fill="none">
                <path d="M -360 0 l 24 26 l 46 -58" />
                <path d="M 290 0 l 24 26 l 46 -58" />
              </g>
            </g>
          </g>
        ) : null}
      </svg>

      {/* ── La phrase plein cadre, puis son en-tête ────────────────────── */}
      {phrase > 0.001 ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: phraseY,
            paddingLeft: 70,
            paddingRight: 70,
            opacity: phrase,
          }}
        >
          <div
            style={{
              fontFamily: TITRE_FONT,
              fontSize: phraseTaille,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              color: phraseCouleur,
              textAlign: "center",
              transform: `scale(${0.94 + phrase * 0.06})`,
            }}
          >
            CONÇU POUR TE FAIRE TROP MANGER
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ── Le mot final ──────────────────────────────────────────────── */}
      {/* Posé dans la bande libre entre l'en-tête et les grilles : au centre de
          l'écran, il barrait les silhouettes qu'il commente. */}
      {identique > 0.001 ? (
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 520 }}
        >
          <div
            style={{
              fontFamily: TITRE_FONT,
              fontSize: 146,
              fontWeight: 700,
              letterSpacing: -6,
              color: M.vert,
              opacity: identique,
              transform: `scale(${0.9 + identique * 0.1})`,
            }}
          >
            IDENTIQUE
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
