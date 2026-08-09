import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { BEATS, DUREE, FENETRES, s } from "./beats";

/**
 * Montage complet, SANS audio : la voix n'est pas encore enregistrée.
 * Les fenêtres « visage » affichent le beat à filmer.
 */

export const MONTAGE_FRAMES = s(DUREE);

/**
 * Bruitages. La voix est posée telle quelle : le flux d'origine a été copié
 * sans ré-encodage, et rien ici ne la touche — les bruitages sont des pistes
 * séparées, calées sous elle.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "whoosh-in.wav", t: 4.14, v: 0.95 },
  { f: "whoosh-out.wav", t: 32.58, v: 0.9 },
  { f: "whoosh-in.wav", t: 37.13, v: 0.95 },
  { f: "whoosh-out.wav", t: 52.82, v: 0.9 },

  { f: "apparition.wav", t: 4.5, v: 0.8 },
  { f: "carillon.wav", t: 6.7, v: 0.8 }, // le badge se pose
  { f: "whoosh-in.wav", t: 8.5, v: 0.6 }, // il se range en en-tête
  { f: "carillon.wav", t: 10.3, v: 1.0 }, // + 50 %

  // Empilement des appareils, puis miniaturisation
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 14.6 + i * 0.42, v: 0.8 })),
  { f: "whoosh-in.wav", t: 18.1, v: 0.7 },
  // Empilement des activités, même gabarit, mêmes sons
  ...[0, 1, 2, 3].map((i) => ({ f: "pop.wav", t: 20.0 + i * 0.42, v: 0.8 })),
  { f: "whoosh-in.wav", t: 23.7, v: 0.7 },
  { f: "marche.wav", t: 24.7, v: 0.85 }, // le « ? »

  // Comparaison
  { f: "apparition.wav", t: 26.5, v: 0.8 },
  { f: "apparition.wav", t: 29.3, v: 0.9 },
  { f: "carillon.wav", t: 31.4, v: 0.9 }, // presque le double

  // Nuage de complexité : quatre pastilles, puis la surcharge
  { f: "apparition.wav", t: 37.6, v: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ f: "pop.wav", t: 38.2 + i * 0.45, v: 0.75 })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    f: "pop.wav",
    t: 40.6 + i * 0.46,
    v: 0.4,
  })),

  // L'objet et son prix : la montre, le prix, puis la mention sur les
  // derniers mots — trois appuis pour tenir les 7,4 s du beat.
  { f: "whoosh-in.wav", t: 45.5, v: 0.8 },
  { f: "carillon.wav", t: 47.6, v: 1.0 },
  { f: "marche.wav", t: 51.45, v: 0.85 },
];

const mmss = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

const Reserve: React.FC<{ b: (typeof BEATS)[number] }> = ({ b }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#0D120F",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 90px",
      textAlign: "center",
      fontFamily: TITRE_FONT,
    }}
  >
    <div style={{ border: `6px dashed ${M.gris}`, borderRadius: 24, padding: "70px 56px", width: "100%" }}>
      <div style={{ fontSize: 32, letterSpacing: 6, color: M.ambre, marginBottom: 24 }}>
        {`BEAT ${b.n} — PLAN VISAGE`}
      </div>
      <div style={{ fontSize: 56, fontWeight: 700, color: "#FFFFFF", marginBottom: 28 }}>
        {mmss(b.debut)} → {mmss(b.fin)}
      </div>
      <div style={{ fontSize: 34, color: M.gris }}>{b.role}</div>
      <div style={{ fontSize: 25, color: M.gris, marginTop: 32, opacity: 0.75 }}>
        garder les mêmes accessoires en main du début à la fin
      </div>
    </div>
  </AbsoluteFill>
);

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile("voix/montre.mp4")} />

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    {BEATS.filter((b) => b.type === "visage").map((b) => (
      <Sequence
        key={b.n}
        from={s(b.debut)}
        durationInFrames={s(b.fin) - s(b.debut)}
        name={`Beat ${b.n} — visage`}
      >
        <Reserve b={b} />
      </Sequence>
    ))}

    {FENETRES.map((f, i) => (
      <Sequence
        key={i}
        from={s(f.debut)}
        durationInFrames={s(f.fin) - s(f.debut)}
        name={`Animation ${i + 1}`}
      >
        <Animation depart={f.debut} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
