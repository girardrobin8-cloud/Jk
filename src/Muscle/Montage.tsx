import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { M, TITRE_FONT } from "./Plan";
import { BLOCS, COUPES, FENETRES, s, VOIX_DUREE } from "./reperes";
import * as P from "./scenes";
import type { Duree } from "./scenes";

/**
 * Montage complet, calé sur l'enregistrement voix.
 *
 * Les fenêtres « visage » sont laissées en réserve : elles affichent une
 * pancarte indiquant le plan à insérer et la réplique correspondante. Il suffit
 * de poser le rush filmé par-dessus, la voix continue en dessous sans coupure.
 */

export const MONTAGE_FRAMES = s(VOIX_DUREE);

/**
 * Bruitages, en secondes absolues. Réutilise la banque synthétisée par
 * `scripts/bruitages.py`. Volumes bas : la voix off reste prioritaire.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  // Coupes franches visage ↔ motion design
  ...COUPES.map((t) => ({ f: "whoosh-in.wav", t, v: 0.3 })),

  // Un souffle léger à chaque changement de plan, pour lier les enchaînements
  ...BLOCS.filter((b) => b.type === "md").map((b) => ({
    f: "clic.wav",
    t: b.debut,
    v: 0.3,
  })),

  // Badges 1 puis 2
  { f: "pop.wav", t: 8.8, v: 0.24 },
  { f: "pop.wav", t: 10.26, v: 0.3 },
  // Le trait cerveau → muscle
  { f: "apparition.wav", t: 13.36, v: 0.2 },
  // Les cinq myonoyaux
  ...[0, 1, 2, 3, 4].map((i) => ({
    f: "pop.wav",
    t: 15.9 + i * 0.35,
    v: 0.22,
  })),
  // Les pointillés qui descendent vers le muscle
  { f: "apparition.wav", t: 19.0, v: 0.2 },
  // Le plafond qui pulse
  { f: "marche.wav", t: 22.4, v: 0.26 },
  // La grille de séances qui se remplit
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 24.6 + i * 0.5, v: 0.26 })),
  // Le muscle qui rétrécit
  { f: "whoosh-out.wav", t: 33.7, v: 0.24 },
  // Coche puis croix
  { f: "pop.wav", t: 43.15, v: 0.3 },
  { f: "marche.wav", t: 43.45, v: 0.28 },
  // Les barres « plus rapide »
  { f: "apparition.wav", t: 44.57, v: 0.24 },
  // La frise qui se dessine
  { f: "apparition.wav", t: 50.7, v: 0.24 },
  { f: "marche.wav", t: 54.8, v: 0.22 },
  { f: "apparition.wav", t: 59.24, v: 0.26 },
  // La chute
  { f: "whoosh-in.wav", t: 61.9, v: 0.26 },
  { f: "carillon.wav", t: 62.37, v: 0.34 },
];

const PLANS: { [id: string]: React.FC<Duree> } = {
  B2: P.B2,
  B3: P.B3,
  B4: P.B4,
  B5: P.B5,
  B6: P.B6,
  B7: P.B7,
  B9: P.B9,
  B10: P.B10,
  B11: P.B11,
  B12: P.B12,
  B13: P.B13,
  B14: P.B14,
  B16: P.B16,
  B17: P.B17,
  B18: P.B18,
  B19: P.B19,
};

const mmss = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** Pancarte occupant les fenêtres réservées aux plans filmés. */
const Reserve: React.FC<{ debut: number; fin: number; repliques: string[] }> = ({
  debut,
  fin,
  repliques,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#1A1A16",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 90px",
      textAlign: "center",
      fontFamily: TITRE_FONT,
    }}
  >
    <div
      style={{
        border: `6px dashed ${M.gris}`,
        borderRadius: 24,
        padding: "70px 56px",
        width: "100%",
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: 6, color: M.jaune, marginBottom: 26 }}>
        PLAN VISAGE À INSÉRER
      </div>
      <div style={{ fontSize: 58, fontWeight: 700, color: "#FFFFFF", marginBottom: 34 }}>
        {mmss(debut)} → {mmss(fin)}
      </div>
      {repliques.map((r) => (
        <div
          key={r}
          style={{ fontSize: 31, lineHeight: 1.45, color: M.gris, marginBottom: 10 }}
        >
          « {r} »
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile("voix/memoire.mp4")} />

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    {FENETRES.map((f, i) => {
      const debut = s(f.debut);
      const duree = s(f.fin) - debut;

      if (f.type === "visage") {
        const dedans = BLOCS.filter(
          (b) => b.type === "visage" && b.debut >= f.debut && b.debut < f.fin,
        );
        return (
          <Sequence key={i} from={debut} durationInFrames={duree} name={`Visage ${i}`}>
            <Reserve debut={f.debut} fin={f.fin} repliques={dedans.map((b) => b.dit)} />
          </Sequence>
        );
      }

      // Les plans se relaient sans trou : chacun tient jusqu'au début du suivant.
      const dedans = BLOCS.filter(
        (b) => b.type === "md" && b.debut >= f.debut && b.debut < f.fin,
      );
      return (
        <Sequence key={i} from={debut} durationInFrames={duree} name={`Motion ${i}`}>
          <AbsoluteFill>
            {dedans.map((b, k) => {
              const Composant = PLANS[b.id];
              if (!Composant) return null;
              const d = k === 0 ? f.debut : b.debut;
              const fin = k + 1 < dedans.length ? dedans[k + 1].debut : f.fin;
              return (
                <Sequence
                  key={b.id}
                  from={s(d) - debut}
                  durationInFrames={s(fin) - s(d)}
                  name={`${b.id} — ${b.dit}`}
                >
                  <Composant duree={s(fin) - s(d)} />
                </Sequence>
              );
            })}
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
