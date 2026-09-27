import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { corps, Txt } from "../commun/Motion";
import { Animation, cadreCamera } from "./Animation";
import { R } from "./Plan";
import { DUREE, s } from "./script";

/**
 * Montage du format « rayon ».
 *
 * ── État : MAQUETTE ────────────────────────────────────────────────────
 *
 * Robin n'a pas encore enregistré ce script — le format vient d'être défini.
 * Ce montage tourne donc sur les bornes PROVISOIRES de script.ts, sans son, et
 * l'encart caméra affiche un gabarit plutôt qu'une image. Il sert à valider le
 * look et le rythme, pas à publier.
 *
 * ── Ce qu'il faut faire quand la prise arrive ──────────────────────────
 *
 * 1. Resserrer les blancs et normaliser :
 *      python3 scripts/resserrer.py <prise.mov> public/rushes/rayon_resserre.mp4 \
 *              src/Rayon/coupes.ts -14.0 0.24 0.16
 * 2. Relever les bornes réelles :
 *      python3 scripts/caler.py <prise.wav> rayon
 *    et recopier la sortie dans BORNES, dans script.ts.
 * 3. Renseigner RUSH ci-dessous.
 *
 * Rien d'autre ne bouge. L'animation ne lit que les onze bornes et le fichier.
 *
 * ── Pourquoi l'image et le son sont montés séparément ──────────────────
 *
 * L'encart n'est visible que sur les huit blocs produit et s'ouvre en plein
 * cadre pour le CTA. Si le son venait du même élément, il se couperait avec
 * lui à chaque bloc de cadre. Le rush est donc monté deux fois : une piste
 * <Audio> continue qui porte la voix d'un bout à l'autre, et un
 * <OffthreadVideo muted> qui n'est qu'une image, découpée par le gabarit.
 */

export const MONTAGE_FRAMES = s(DUREE);

/**
 * Le rush, une fois resserré et normalisé. `null` tant que Robin n'a pas
 * enregistré : l'encart affiche alors son gabarit. Une ligne à changer.
 */
const RUSH: string | null = null;

export const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cadreCamera(frame / fps);

  return (
    <AbsoluteFill style={{ backgroundColor: R.fond }}>
      {/* La voix, continue : elle ne dépend d'aucun bloc. */}
      {RUSH !== null && <Audio src={staticFile(RUSH)} />}

      {/* L'image du rush, découpée par le gabarit. Elle passe SOUS l'animation
          pour que le cadre dessiné borde exactement l'encart. */}
      {c.opacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            width: c.l,
            height: c.h,
            borderRadius: c.rayon,
            overflow: "hidden",
            opacity: c.opacity,
            backgroundColor: R.carte,
          }}
        >
          {RUSH !== null ? (
            <OffthreadVideo
              src={staticFile(RUSH)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Gabarit l={c.l} h={c.h} />
          )}
        </div>
      )}

      <Animation />
    </AbsoluteFill>
  );
};

/**
 * Le gabarit de l'encart, tant qu'il n'y a pas de rush.
 *
 * Il dit exactement ce qui manque plutôt que d'afficher un rectangle vide :
 * c'est la seule lecture honnête d'une maquette, et ça évite de croire en la
 * regardant que le format est fini.
 */
const Gabarit: React.FC<{ l: number; h: number }> = ({ l, h }) => (
  <svg width="100%" height="100%" viewBox={`0 0 ${l} ${h}`}>
    <rect x={0} y={0} width={l} height={h} fill={R.carte} />
    {Array.from({ length: Math.ceil((l + h) / 60) }, (_, i) => (
      <line key={i} x1={i * 60 - h} y1={h} x2={i * 60} y2={0} stroke={R.trait} strokeWidth={2} />
    ))}
    <Txt x={l / 2} y={h / 2 - 22} taille={corps("TA CAMÉRA", 44, 4, l - 80)} couleur={R.gris} espace={4}>
      TA CAMÉRA
    </Txt>
    <Txt x={l / 2} y={h / 2 + 34} taille={corps("PAS ENCORE TOURNÉE", 26, 3, l - 80)} couleur={R.trait} espace={3}>
      PAS ENCORE TOURNÉE
    </Txt>
  </svg>
);
