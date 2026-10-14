import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, TEXTE, ZONE } from "./charte";
import type { Mot } from "./schema";

/**
 * Sous-titres mot par mot (règle de forme n° 2) : 3 à 4 mots à la fois,
 * le mot prononcé passe en vert et grossit légèrement.
 */

type Bloc = { mots: Mot[]; debut: number; fin: number };

const PONCTUATION = /^[?!:;.,…]+$/;
const MAX_MOTS = 4;

/** Regroupe les mots en blocs courts, en coupant sur la ponctuation. */
export const decouper = (mots: Mot[]): Bloc[] => {
  // La transcription sort « ? » et « : » comme des mots à part : on les
  // recolle au mot précédent.
  const propres: Mot[] = [];
  for (const m of mots) {
    if (PONCTUATION.test(m.text) && propres.length) {
      const p = propres[propres.length - 1];
      propres[propres.length - 1] = { ...p, text: `${p.text}${m.text === "?" || m.text === ":" ? " " : ""}${m.text}` };
    } else {
      propres.push(m);
    }
  }

  const blocs: Bloc[] = [];
  let courant: Mot[] = [];
  for (const m of propres) {
    courant.push(m);
    if (courant.length >= MAX_MOTS || /[?!:;.,…]$/.test(m.text)) {
      blocs.push({ mots: courant, debut: courant[0].start, fin: m.end });
      courant = [];
    }
  }
  if (courant.length) {
    blocs.push({ mots: courant, debut: courant[0].start, fin: courant[courant.length - 1].end });
  }
  // Chaque bloc reste affiché jusqu'au suivant : pas de trou à l'écran.
  return blocs.map((b, i) => ({ ...b, fin: blocs[i + 1]?.debut ?? b.fin + 0.4 }));
};

const nettoyer = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const SousTitres: React.FC<{ mots: Mot[]; motsCles: string[] }> = ({ mots, motsCles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const blocs = decouper(mots);
  const bloc = blocs.find((b) => t >= b.debut && t < b.fin);
  if (!bloc) return null;

  const cles = new Set(motsCles.map(nettoyer));
  const entree = spring({ frame: frame - Math.round(bloc.debut * fps), fps, config: { damping: 14, mass: 0.5 } });

  return (
    <div
      style={{
        position: "absolute",
        top: ZONE.sousTitres,
        left: ZONE.marge,
        right: ZONE.margeDroite - 40,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 28px",
        transform: `scale(${interpolate(entree, [0, 1], [0.85, 1])})`,
        opacity: entree,
      }}
    >
      {bloc.mots.map((m, i) => {
        const dit = t >= m.start;
        const actif = t >= m.start && t < m.end + 0.05;
        const cle = cles.has(nettoyer(m.text));
        return (
          <span
            key={i}
            style={{
              fontFamily: TEXTE,
              fontWeight: 800,
              fontSize: 78,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: actif || cle ? C.vert : dit ? C.blanc : "rgba(255,255,255,0.55)",
              transform: `scale(${actif ? 1.08 : 1})`,
              display: "inline-block",
              WebkitTextStroke: "2px rgba(0,0,0,0.6)",
              textShadow: "0 6px 24px rgba(0,0,0,0.85)",
            }}
          >
            {m.text}
          </span>
        );
      })}
    </div>
  );
};
