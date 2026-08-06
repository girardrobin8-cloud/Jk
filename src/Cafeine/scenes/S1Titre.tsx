import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Molecule } from "../components/Molecule";
import { Tasse, Vapeur } from "../components/Tasse";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS } from "../theme";
import { rand, ramp } from "../utils";

/**
 * Deux mises en page pour un même contenu.
 *
 * En portrait (TikTok, Reels), la zone réellement visible est plus étroite que
 * le cadre : l'interface de l'application recouvre le haut, le bas et la
 * colonne de droite. La tasse et le texte sont donc resserrés entre y = 300 et
 * y = 1430 pour ne jamais passer sous les boutons ni sous la légende.
 */
const PAYSAGE = {
  vb: { w: 1920, h: 1080 },
  tasse: "translate(960 428) scale(1)",
  vapeurs: [-55, 0, 55],
  bas: 118,
  titre: 104,
  lignes: ["La caféine dans le corps"],
  sousTitre: 34,
  legende: "Ce qu’il se passe vraiment, minute après minute, après une tasse.",
  largeur: 1080,
};

const PORTRAIT = {
  vb: { w: 1080, h: 1920 },
  tasse: "translate(540 700) scale(1.5)",
  vapeurs: [-82, 0, 82],
  bas: 500,
  titre: 78,
  // Sur deux lignes : une seule ligne passerait sous la colonne de boutons.
  lignes: ["La caféine", "dans le corps"],
  sousTitre: 30,
  legende: "Ce qu’il se passe vraiment, minute après minute.",
  largeur: 700,
};

export const S1Titre: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = height > width ? PORTRAIT : PAYSAGE;

  const grow = ramp(frame, 0, 30);

  return (
    <Backdrop tint={COLORS.cafeine}>
      <AbsoluteFill>
        <svg viewBox={`0 0 ${L.vb.w} ${L.vb.h}`} width="100%" height="100%">
          {/* Molécules qui dérivent en arrière-plan */}
          {new Array(9).fill(0).map((_, i) => {
            const px = L.vb.w * (0.09 + rand(i + 1) * 0.82);
            const py = L.vb.h * (0.13 + rand(i + 21) * 0.74);
            const derive = Math.sin(frame * 0.02 + i) * 22;
            return (
              <g key={i} transform={`translate(${px} ${py + derive})`}>
                <Molecule
                  kind={i % 3 === 0 ? "adenosine" : "cafeine"}
                  size={9 + rand(i + 41) * 7}
                  opacity={0.14}
                />
              </g>
            );
          })}

          <g opacity={grow} transform={L.tasse}>
            {L.vapeurs.map((d, i) => (
              <Vapeur key={i} decalage={d} frame={frame} seed={i} />
            ))}
            <Tasse />
          </g>
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: L.bas,
          paddingLeft: 60,
          paddingRight: 60,
          textAlign: "center",
        }}
      >
        <Rise at={22} style={{ marginBottom: 20 }}>
          <Etiquette color={COLORS.cafeine}>Physiologie · en une minute</Etiquette>
        </Rise>
        <Rise at={32}>
          <Titre size={L.titre}>
            {L.lignes.map((ligne, i) => (
              <div key={i}>{ligne}</div>
            ))}
          </Titre>
        </Rise>
        <Rise at={48} style={{ marginTop: 22 }}>
          <Texte size={L.sousTitre} maxWidth={L.largeur}>
            {L.legende}
          </Texte>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
