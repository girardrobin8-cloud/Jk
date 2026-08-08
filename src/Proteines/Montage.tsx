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
  // Niveaux mesurés après rendu : cette voix est nettement plus forte que
  // celle des montages précédents, si bien que les volumes d'alors tombaient
  // 10 dB trop bas et passaient inaperçus. Ils visent ici -8 à -4 dB sous la
  // voix. Le clic, trop bref pour porter, est remplacé par le pop partout où
  // il doit s'entendre.
  { f: "whoosh-in.wav", t: COUPE_1, v: 1.0 },
  { f: "whoosh-out.wav", t: COUPE_2, v: 1.0 },

  // Frise : le curseur avance, la croix tombe, « MYTHE » s'incruste
  { f: "apparition.wav", t: 6.7, v: 0.85 },
  ...[0, 1, 2, 3, 4].map((i) => ({ f: "pop.wav", t: 7.5 + i * 0.42, v: 0.6 })),
  { f: "marche.wav", t: 9.9, v: 1.0 },
  { f: "whoosh-in.wav", t: 12.25, v: 0.7 },
  { f: "carillon.wav", t: 12.4, v: 0.8 },

  // Bascule vers le total quotidien
  { f: "whoosh-in.wav", t: 16.4, v: 0.9 },
  { f: "carillon.wav", t: 16.9, v: 1.0 },
  { f: "pop.wav", t: 19.0, v: 0.8 },

  // Assiettes : trois, puis six
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 20.2 + i * 0.28, v: 0.7 })),
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ f: "pop.wav", t: 21.3 + i * 0.16, v: 0.55 })),

  // Deux clients
  { f: "whoosh-in.wav", t: 23.85, v: 0.7 },
  { f: "apparition.wav", t: 23.95, v: 0.85 },
  { f: "marche.wav", t: 25.9, v: 0.95 }, // « même entraînement » barré
  { f: "pop.wav", t: 27.0, v: 0.8 },
  { f: "pop.wav", t: 27.25, v: 0.8 },

  // Graphique
  { f: "apparition.wav", t: 28.6, v: 0.8 },
  { f: "whoosh-in.wav", t: 30.6, v: 0.6 },
  { f: "apparition.wav", t: 30.7, v: 0.85 },
  { f: "whoosh-in.wav", t: 34.5, v: 0.6 },
  { f: "apparition.wav", t: 34.6, v: 0.85 },
  { f: "carillon.wav", t: 36.1, v: 0.95 },

  // Retour de la frise, puis la chute
  { f: "whoosh-in.wav", t: 38.3, v: 0.9 },
  { f: "pop.wav", t: 39.3, v: 0.7 },
  { f: "pop.wav", t: 39.6, v: 0.7 },
  { f: "marche.wav", t: 40.55, v: 0.7 },
  { f: "carillon.wav", t: 40.7, v: 1.0 },
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
