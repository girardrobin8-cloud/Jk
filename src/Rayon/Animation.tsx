import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { corps, CX, melange, rd, Txt } from "../commun/Motion";
import { R, VERDICT } from "./Plan";
import { Pixels, SPRITE, SPRITES } from "./Sprites";
import { BEAT, BLOCS, PRODUITS } from "./script";

/**
 * Le motion design du format « rayon ».
 *
 * ── Le mouvement qui porte tout ────────────────────────────────────────
 *
 * Les huit produits ne sont dessinés QU'UNE FOIS, dans un seul calque dont la
 * position est une fonction du temps. Ils commencent en grille plein cadre,
 * se rangent en frise sous l'image pendant qu'on les passe en revue, puis se
 * retrient en trois colonnes à la fin. Il n'y a donc jamais de « disparition
 * puis réapparition » : l'œil suit les mêmes objets d'un bout à l'autre, et
 * la conclusion se lit comme un rangement de ce qu'on vient de voir.
 *
 * C'est ce qui remplace ici le fondu enchaîné des Jours 1 à 10. Sur fond clair
 * un fondu se voit mal ; un déplacement, lui, se lit parfaitement.
 *
 * ── Le code couleur ────────────────────────────────────────────────────
 *
 * Un produit porte un verdict et une couleur, les mêmes partout. Dans la frise
 * il reste PÂLE tant qu'on n'en a pas parlé et prend sa couleur au moment où
 * on l'aborde : la frise est donc à la fois l'index et la barre de progression,
 * sans une seule pastille ajoutée.
 *
 * Aucun bruitage.
 */

// ── Gabarit ─────────────────────────────────────────────────────────────
/** Le titre, une seule ligne, toujours à la même hauteur. */
const TITRE_Y = 250;
/** La grille d'ouverture : deux colonnes, quatre rangées. */
const GRILLE = { cols: [320, 760], rows: [650, 950, 1250, 1550], k: 13 };
/** La frise du bas : les huit produits alignés, petits. */
const FRISE = { y: 1640, x0: 130, pas: 117, k: 5 };
/** Le produit en cours, en grand, à gauche. */
const VEDETTE = { x: 300, y: 780, k: 30 };
/** Le tri final, trois colonnes. */
const TRI = { x: [220, 540, 860], y0: 760, pas: 185, k: 8 };
/** Le socle : une phrase, jamais deux. */
const SOCLE_Y = 1470;

/** L'encart caméra. Montage.tsx y place le rush — voir son en-tête. */
export const ENCART = { x: 560, y: 600, l: 440, h: 720 };
/** Le cadre plein, où l'encart s'ouvre pour le CTA. */
const PLEIN = { x: 0, y: 0, l: 1080, h: 1920 };

/** Durée des glissements de calque. Plus long qu'un fondu : c'est un rangement,
 *  il doit se lire comme un mouvement et non comme une coupe. */
const TRANSIT = 1.2;

/** L'échelle typographique. Rien d'autre n'est permis. */
const TAILLE = { titre: 78, vedette: 92, badge: 44, socle: 44, frise: 20, colonne: 32 };

const ORDRE = PRODUITS.map((b) => b.produit as string);
/** Le rang d'un produit dans les trois colonnes du tri final. */
const COLONNE: Record<string, [number, number]> = (() => {
  const compte = [0, 0, 0];
  const out: Record<string, [number, number]> = {};
  for (const id of ORDRE) {
    const v = SPRITE[id].verdict;
    const c = v === "oui" ? 0 : v === "depend" ? 1 : 2;
    out[id] = [c, compte[c]++];
  }
  return out;
})();

/**
 * L'ordre dans lequel les produits rejoignent les colonnes : colonne par
 * colonne, et non dans l'ordre du rayon.
 *
 * C'est ce qui met le mouvement en phase avec la phrase — « deux valent ton
 * argent » pendant que la première colonne se remplit, « deux dépendent de ton
 * assiette » pendant la deuxième, « quatre peuvent rester en rayon » pendant la
 * troisième. Dans l'ordre du rayon, les trois colonnes se rempliraient en même
 * temps et la phrase ne désignerait plus rien.
 */
const RANG_TRI: Record<string, number> = (() => {
  const trie = [...ORDRE].sort((a, b) => {
    const [ca, ja] = COLONNE[a];
    const [cb, jb] = COLONNE[b];
    return ca - cb || ja - jb;
  });
  return Object.fromEntries(trie.map((id, r) => [id, r]));
})();

/** Cadence du tri final : un produit toutes les 0,38 s, 0,7 s de vol. */
const TRI_PAS = 0.38;
const TRI_VOL = 0.7;
const TRI_DEPART = 0.25;
/** Cadence de la cascade d'ouverture : un produit toutes les 0,36 s. */
const OUVRE_PAS = 0.36;
const OUVRE_DEPART = 0.4;

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b1 = BEAT.B1;
  const b10 = BEAT.B10;
  const b11 = BEAT.B11;

  /** 0 tant que les produits sont en grille, 1 une fois rangés en frise. */
  const range = rd(t, b1.fin - TRANSIT, b1.fin);
  /** L'avancement d'ENSEMBLE du tri, pour ce qui doit basculer d'un coup. */
  const trie = rd(t, b10.debut, b10.debut + TRI_DEPART + 7 * TRI_PAS + TRI_VOL);
  /** L'instant où le produit de rang `r` quitte la frise pour sa colonne. */
  const departTri = (r: number) => b10.debut + TRI_DEPART + r * TRI_PAS;
  /** Le vol de CE produit-là, indépendant des sept autres. */
  const volTri = (r: number) => rd(t, departTri(r), departTri(r) + TRI_VOL);

  /** Le bloc en cours, et le produit qu'il présente. */
  const bloc = BLOCS.find((b) => t >= BEAT[b.id].debut && t < BEAT[b.id].fin) ?? BLOCS[BLOCS.length - 1];
  const rang = ORDRE.indexOf(bloc.produit ?? "");

  /**
   * La position d'un produit à l'instant t : grille → frise → colonnes.
   * Une seule fonction, trois états, deux glissements.
   */
  const place = (i: number, id: string) => {
    const g = { x: GRILLE.cols[i % 2], y: GRILLE.rows[Math.floor(i / 2)], k: GRILLE.k };
    const f = { x: FRISE.x0 + i * FRISE.pas, y: FRISE.y, k: FRISE.k };
    const [c, j] = COLONNE[id];
    const q = { x: TRI.x[c], y: TRI.y0 + j * TRI.pas, k: TRI.k };
    const v = volTri(RANG_TRI[id]);
    const a = { x: melange(g.x, f.x, range), y: melange(g.y, f.y, range), k: melange(g.k, f.k, range) };
    return { x: melange(a.x, q.x, v), y: melange(a.y, q.y, v), k: melange(a.k, q.k, v), v };
  };

  /**
   * Le degré de décoloration d'un produit dans la frise.
   *
   * Zéro pendant la grille d'ouverture : le rayon se montre d'abord tel qu'on
   * le voit en magasin, en couleurs, c'est ce qui accroche. Les produits ne
   * s'éteignent qu'en descendant dans la frise, et chacun reprend sa couleur
   * au moment où on l'aborde.
   */
  const eteint = (i: number) => {
    const b = BEAT[PRODUITS[i].id];
    return range * (1 - rd(t, b.debut - 0.25, b.debut + 0.25));
  };

  /**
   * L'arrivée du produit `i` dans la grille d'ouverture.
   *
   * Les huit ne se posent pas ensemble : ils tombent l'un après l'autre
   * pendant que Robin annonce « huit compléments, un seul rayon ». Une grille
   * qui apparaît d'un bloc tient quatre secondes sans un mouvement — c'est
   * exactement ce que le détecteur de plages figées avait relevé au premier
   * rendu de la maquette.
   */
  const arrive = (i: number) => rd(t, OUVRE_DEPART + i * OUVRE_PAS, OUVRE_DEPART + i * OUVRE_PAS + 0.45);

  // ── Le titre ──────────────────────────────────────────────────────────
  const titre =
    bloc.produit !== null ? SPRITE[bloc.produit].nom.toLowerCase() : bloc.id === "B1" ? "le rayon" : "le verdict";
  const titreOpacite =
    bloc.id === "B11"
      ? 1 - rd(t, b11.debut, b11.debut + 0.4)
      : rd(t, BEAT[bloc.id].debut, BEAT[bloc.id].debut + 0.35) * (1 - rd(t, BEAT[bloc.id].fin - 0.3, BEAT[bloc.id].fin));

  // ── La vedette et son encart ─────────────────────────────────────────
  const surProduit = bloc.produit !== null;
  const dedans = surProduit ? rd(t, BEAT[bloc.id].debut + 0.15, BEAT[bloc.id].debut + 0.75) : 0;
  const dehors = surProduit ? 1 - rd(t, BEAT[bloc.id].fin - 0.45, BEAT[bloc.id].fin - 0.05) : 0;
  const vedette = dedans * dehors;

  /** Le balancement du sprite vedette, calé sur la grille de pixels. */
  const idle = Math.round(Math.sin((2 * Math.PI * t) / 1.6)) * VEDETTE.k;

  // ── Le tri final ─────────────────────────────────────────────────────
  /** Un en-tête se pose au départ du premier produit de SA colonne : les trois
   *  groupes se nomment donc dans l'ordre où la phrase les énumère. */
  const PREMIER = [0, 2, 4]; // rangs de tri de créatine, whey, magnésium
  const entete = (c: number) =>
    rd(t, departTri(PREMIER[c]), departTri(PREMIER[c]) + 0.4) * (1 - rd(t, b11.debut - 0.4, b11.debut));
  const sortieTri = 1 - rd(t, b11.debut - 0.5, b11.debut - 0.1);

  // Fond TRANSPARENT : le fond clair est posé par Montage.tsx, et l'encart
  // caméra passe entre les deux. Un fond opaque ici masquerait l'encart —
  // c'est exactement ce qui s'est passé au premier rendu de la maquette.
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        {/* ── Le titre, au marqueur, en minuscules comme la référence ── */}
        {titreOpacite > 0.01 && (
          <Txt
            x={CX}
            y={melange(TITRE_Y - 14, TITRE_Y, rd(t, BEAT[bloc.id].debut, BEAT[bloc.id].debut + 0.35))}
            taille={corps(titre, TAILLE.titre, 2, 900)}
            couleur={R.encre}
            espace={2}
            opacity={titreOpacite}
          >
            {titre}
          </Txt>
        )}

        {/* ── Les huit produits : UN seul calque, du début à la fin ──── */}
        <g opacity={sortieTri}>
          {PRODUITS.map((b, i) => {
            const id = b.produit as string;
            const p = place(i, id);
            const pale = eteint(i);
            const a = arrive(i);
            return (
              <g key={id} opacity={a}>
                <Pixels sprite={SPRITE[id]} x={p.x} y={melange(p.y - 30, p.y, a)} k={p.k} pale={pale} />
                {/* Le nom n'accompagne le produit qu'en grille et en colonnes :
                    dans la frise il n'y a pas la place, et la vedette porte
                    déjà le nom en titre. */}
                {range < 0.5 && (
                  <Txt
                    x={p.x}
                    y={p.y + 8 * p.k + 34}
                    taille={corps(SPRITE[id].nom, 30, 2, 400)}
                    couleur={R.gris}
                    espace={2}
                    opacity={a * (1 - range * 2)}
                  >
                    {SPRITE[id].nom}
                  </Txt>
                )}
                {/* Le nom en colonne suit SON produit, pas le tri d'ensemble :
                    il se pose juste après que celui-ci a atterri. */}
                {p.v > 0.95 && (
                  <Txt
                    x={p.x}
                    y={p.y + 8 * p.k + 30}
                    taille={corps(SPRITE[id].court, TAILLE.colonne, 2, 300)}
                    couleur={R.encre}
                    espace={2}
                    opacity={rd(t, departTri(RANG_TRI[id]) + TRI_VOL + 0.1, departTri(RANG_TRI[id]) + TRI_VOL + 0.45)}
                  >
                    {SPRITE[id].court}
                  </Txt>
                )}
              </g>
            );
          })}
        </g>

        {/* Le repère sous le produit en cours : la frise sert de barre de
            progression sans qu'on ait eu à en ajouter une. */}
        {rang >= 0 && range > 0.9 && trie < 0.1 && (
          <rect
            x={FRISE.x0 + rang * FRISE.pas - 34}
            y={FRISE.y + 52}
            width={68}
            height={7}
            rx={3.5}
            fill={VERDICT[SPRITE[bloc.produit as string].verdict].couleur}
            opacity={vedette}
          />
        )}

        {/* ── Les trois en-têtes du tri final ───────────────────────── */}
        {(["oui", "depend", "non"] as const).map((v, c) =>
          entete(c) <= 0.01 ? null : (
            <Txt
              key={v}
              x={TRI.x[c]}
              y={600}
              taille={corps(VERDICT[v].mot, 30, 2, 300)}
              couleur={VERDICT[v].couleur}
              espace={2}
              opacity={entete(c)}
            >
              {VERDICT[v].mot}
            </Txt>
          ),
        )}

        {/* ── Le produit en vedette, à gauche ───────────────────────── */}
        {vedette > 0.01 && bloc.produit && (
          <g opacity={vedette} transform={`translate(0 ${melange(26, 0, dedans)})`}>
            {/* L'idle du sprite : un pixel de haut, un pixel de bas, toutes les
                huit dixièmes. C'est la respiration des personnages de jeu, et
                c'est ce qui empêche un bloc produit de huit secondes d'être une
                image fixe — la règle « pas de passage sans mouvement » tient
                ici sans qu'on ait à animer le texte. */}
            <Pixels sprite={SPRITE[bloc.produit]} x={VEDETTE.x} y={VEDETTE.y + idle} k={VEDETTE.k} />
            <rect
              x={VEDETTE.x - 180}
              y={VEDETTE.y + 292}
              width={360}
              height={92}
              rx={8}
              fill="none"
              stroke={VERDICT[SPRITE[bloc.produit].verdict].couleur}
              strokeWidth={5}
            />
            <Txt
              x={VEDETTE.x}
              y={VEDETTE.y + 338}
              taille={corps(VERDICT[SPRITE[bloc.produit].verdict].mot, TAILLE.badge, 3, 320)}
              couleur={VERDICT[SPRITE[bloc.produit].verdict].couleur}
              espace={3}
            >
              {VERDICT[SPRITE[bloc.produit].verdict].mot}
            </Txt>
          </g>
        )}

        {/* ── Le cadre de l'encart caméra ───────────────────────────── */}
        {vedette > 0.01 && (
          <rect
            x={ENCART.x}
            y={ENCART.y}
            width={ENCART.l}
            height={ENCART.h}
            rx={18}
            fill="none"
            stroke={R.encre}
            strokeWidth={6}
            opacity={vedette}
          />
        )}

        {/* ── Le socle : une phrase, jamais deux ────────────────────── */}
        {vedette > 0.01 && bloc.socle !== "" && (
          <Txt
            x={CX}
            y={SOCLE_Y}
            taille={corps(bloc.socle, TAILLE.socle, 3)}
            couleur={R.encre}
            espace={3}
            opacity={rd(t, BEAT[bloc.id].debut + 0.6, BEAT[bloc.id].debut + 1.1) * dehors}
          >
            {bloc.socle}
          </Txt>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** Le cadre où Montage.tsx doit poser le rush, à l'instant t. */
export const cadreCamera = (t: number) => {
  const b11 = BEAT.B11;
  const ouvre = rd(t, b11.debut - 0.5, b11.debut + 0.3);
  const bloc = BLOCS.find((b) => t >= BEAT[b.id].debut && t < BEAT[b.id].fin);
  const surProduit = bloc?.produit != null;
  const visible = Math.max(
    surProduit ? rd(t, BEAT[bloc!.id].debut + 0.15, BEAT[bloc!.id].debut + 0.75) * (1 - rd(t, BEAT[bloc!.id].fin - 0.45, BEAT[bloc!.id].fin - 0.05)) : 0,
    ouvre,
  );
  return {
    x: melange(ENCART.x, PLEIN.x, ouvre),
    y: melange(ENCART.y, PLEIN.y, ouvre),
    l: melange(ENCART.l, PLEIN.l, ouvre),
    h: melange(ENCART.h, PLEIN.h, ouvre),
    rayon: melange(18, 0, ouvre),
    opacity: visible,
  };
};

/** Les huit sprites, exportés pour la planche de contrôle. */
export const TOUS = SPRITES;
