import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { BLOCS, COUPE_1, COUPE_2, s, VOIX_DUREE } from "./reperes";

/**
 * Montage complet. La voix est lue d'un seul tenant ; l'animation occupe la
 * fenêtre centrale et les deux fenêtres visage restent en réserve.
 */

export const MONTAGE_FRAMES = s(VOIX_DUREE);

/** Bruitages, en secondes absolues (banque de `scripts/bruitages.py`). */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "whoosh-in.wav", t: COUPE_1, v: 0.3 },
  { f: "whoosh-out.wav", t: COUPE_2, v: 0.28 },
  // Frise : le curseur avance, la croix tombe, « MYTHE » s'incruste
  { f: "apparition.wav", t: 6.7, v: 0.24 },
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 7.5 + i * 0.5, v: 0.22 })),
  { f: "marche.wav", t: 9.9, v: 0.32 },
  { f: "carillon.wav", t: 12.4, v: 0.2 },
  // Révélation du total
  { f: "whoosh-in.wav", t: 16.5, v: 0.24 },
  { f: "carillon.wav", t: 16.9, v: 0.3 },
  { f: "clic.wav", t: 19.0, v: 0.26 },
  // Assiettes
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 20.2 + i * 0.3, v: 0.2 })),
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 21.3 + i * 0.3, v: 0.2 })),
  // Deux clients
  { f: "apparition.wav", t: 23.95, v: 0.26 },
  { f: "marche.wav", t: 25.9, v: 0.26 }, // « même entraînement » barré
  { f: "clic.wav", t: 27.0, v: 0.26 },
  // Graphique
  { f: "apparition.wav", t: 28.6, v: 0.24 },
  { f: "apparition.wav", t: 30.7, v: 0.22 },
  { f: "apparition.wav", t: 34.6, v: 0.24 },
  { f: "carillon.wav", t: 36.1, v: 0.3 },
  // Retour de la frise, puis la chute
  { f: "whoosh-in.wav", t: 38.3, v: 0.26 },
  { f: "clic.wav", t: 39.3, v: 0.24 },
  { f: "carillon.wav", t: 40.7, v: 0.34 },
];

const mmss = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

const Reserve: React.FC<{ debut: number; fin: number; repliques: string[] }> = ({
  debut,
  fin,
  repliques,
}) => (
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
    <div
      style={{
        border: `6px dashed ${M.gris}`,
        borderRadius: 24,
        padding: "70px 56px",
        width: "100%",
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: 6, color: M.ambre, marginBottom: 26 }}>
        PLAN VISAGE À INSÉRER
      </div>
      <div style={{ fontSize: 58, fontWeight: 700, color: "#FFFFFF", marginBottom: 34 }}>
        {mmss(debut)} → {mmss(fin)}
      </div>
      {repliques.map((r) => (
        <div key={r} style={{ fontSize: 31, lineHeight: 1.45, color: M.gris }}>
          « {r} »
        </div>
      ))}
      <div style={{ fontSize: 26, color: M.gris, marginTop: 34, opacity: 0.75 }}>
        garder le shaker en main d’un plan à l’autre
      </div>
    </div>
  </AbsoluteFill>
);

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile("voix/proteines.mp4")} />

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    <Sequence durationInFrames={s(COUPE_1)} name="Visage — ouverture">
      <Reserve debut={0} fin={COUPE_1} repliques={[BLOCS[0].dit]} />
    </Sequence>

    <Sequence
      from={s(COUPE_1)}
      durationInFrames={s(COUPE_2) - s(COUPE_1)}
      name="Animation — 36,6 s d'un seul tenant"
    >
      <Animation />
    </Sequence>

    <Sequence
      from={s(COUPE_2)}
      durationInFrames={MONTAGE_FRAMES - s(COUPE_2)}
      name="Visage — clôture"
    >
      <Reserve debut={COUPE_2} fin={VOIX_DUREE} repliques={[BLOCS[6].dit]} />
    </Sequence>
  </AbsoluteFill>
);
