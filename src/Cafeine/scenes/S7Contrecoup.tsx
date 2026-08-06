import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Molecule } from "../components/Molecule";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { fadeInOut, rand, ramp, sousTexte } from "../utils";
import {
  DOCK_Y,
  Impulsions,
  Jauge,
  MEMBRANE_Y,
  Membrane,
  RECEPTEURS,
} from "./S3Adenosine";

const CARTE = 172; // frame où l'on bascule sur la carte de fin

const REPERES = [
  {
    valeur: "400 mg",
    texte: "par jour pour un adulte en bonne santé — environ 4 tasses de café filtre",
  },
  { valeur: "200 mg", texte: "par jour pendant la grossesse et l’allaitement" },
  { valeur: "8 h", texte: "entre la dernière tasse et le coucher, pour protéger le sommeil" },
];

export const S7Contrecoup: React.FC = () => {
  const frame = useCurrentFrame();

  const scene = fadeInOut(frame, 0, CARTE + 14, 16);
  const depart = ramp(frame, 18, 68); // la caféine se dissipe
  const retour = ramp(frame, 62, 122); // l'adénosine reprend toute la place

  return (
    <Backdrop tint={retour > 0.4 ? COLORS.adenosine : COLORS.cafeine} chapter="Le contrecoup">
      <AbsoluteFill style={{ opacity: scene }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <Membrane />
          <Impulsions frame={frame} intensite={Math.max(0, retour - 0.45) * 1.8} />
          <Jauge niveau={retour} couleur={COLORS.adenosine} label="SIGNAL DE FATIGUE" />

          {/* La caféine quitte les récepteurs */}
          {RECEPTEURS.map((x, i) => {
            const y = DOCK_Y - depart * 280;
            return (
              <g
                key={x}
                transform={`translate(${x + depart * (i % 2 === 0 ? -120 : 120)} ${y})`}
              >
                <Molecule
                  kind="cafeine"
                  size={20}
                  opacity={(1 - depart) * sousTexte(y)}
                />
              </g>
            );
          })}

          {/* L'adénosine accumulée pendant le blocage déferle d'un coup */}
          {new Array(16).fill(0).map((_, i) => {
            const enSlot = i < RECEPTEURS.length;
            const cibleX = enSlot ? RECEPTEURS[i] : 280 + rand(i + 3) * 1340;
            const cibleY = enSlot
              ? DOCK_Y
              : MEMBRANE_Y - 46 - rand(i + 17) * 70;
            const depX = 240 + rand(i + 31) * 1400;
            const t = ramp(frame, 58 + rand(i + 7) * 26, 108 + rand(i + 7) * 26);
            if (t <= 0) return null;
            const y = interpolate(t, [0, 1], [-180, cibleY]);
            return (
              <g
                key={i}
                transform={`translate(${interpolate(t, [0, 1], [depX, cibleX])} ${y})`}
              >
                <Molecule
                  kind="adenosine"
                  size={enSlot ? 20 : 13 + rand(i + 51) * 6}
                  glow={enSlot ? t : 0}
                  opacity={(enSlot ? 1 : 0.6) * sousTexte(y)}
                />
              </g>
            );
          })}
        </svg>

        <AbsoluteFill style={{ paddingLeft: 160, paddingTop: 186 }}>
          <Rise at={6} until={CARTE}>
            <Titre size={62}>
              L’adénosine, elle,
              <br />
              n’a jamais cessé de monter
            </Titre>
          </Rise>
          <Rise at={42} until={CARTE} style={{ marginTop: 28 }}>
            <Texte size={30} maxWidth={900}>
              La caféine bloquait le message, pas sa cause. Pendant tout ce temps,
              l’adénosine a continué de s’accumuler.
            </Texte>
          </Rise>
          <Rise at={104} until={CARTE} style={{ marginTop: 24 }}>
            <Texte size={30} maxWidth={900} color={COLORS.adenosineSoft}>
              Quand la caféine se dissipe, les récepteurs se libèrent d’un coup :
              c’est le coup de barre.
            </Texte>
          </Rise>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ── Carte de fin ── */}
      <AbsoluteFill
        style={{
          opacity: ramp(frame, CARTE, CARTE + 22),
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 140px",
        }}
      >
        <Rise at={CARTE + 6}>
          <Titre size={68}>
            La caféine ne crée pas d’énergie.
            <br />
            Elle masque la fatigue, puis la rend.
          </Titre>
        </Rise>

        <div style={{ display: "flex", gap: 78, marginTop: 84 }}>
          {REPERES.map((r, i) => (
            <Rise key={r.valeur} at={CARTE + 30 + i * 14}>
              <div style={{ width: 400 }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 62,
                    color: COLORS.cafeine,
                    marginBottom: 14,
                  }}
                >
                  {r.valeur}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 24,
                    lineHeight: 1.45,
                    color: COLORS.muted,
                  }}
                >
                  {r.texte}
                </div>
              </div>
            </Rise>
          ))}
        </div>

        <Rise at={CARTE + 84} style={{ marginTop: 76 }}>
          <Etiquette color={COLORS.muted}>
            Repères EFSA · à titre informatif, pas un avis médical
          </Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
