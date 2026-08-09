import { AbsoluteFill, Sequence } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { BEATS, DUREE, FENETRES, s } from "./beats";

/**
 * Montage complet, SANS audio : la voix n'est pas encore enregistrée.
 * Les fenêtres « visage » affichent le beat à filmer.
 */

export const MONTAGE_FRAMES = s(DUREE);

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
