import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Molecule } from "../components/Molecule";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { fadeInOut, ramp, sousTexte } from "../utils";
import { DOCK_Y, Jauge, MEMBRANE_Y, Membrane, RECEPTEURS } from "./S3Adenosine";

const COMPARAISON_FIN = 108;

export const S4Blocage: React.FC = () => {
  const frame = useCurrentFrame();

  const compare = fadeInOut(frame, 6, COMPARAISON_FIN, 16);
  const scene = ramp(frame, COMPARAISON_FIN - 6, COMPARAISON_FIN + 18);

  // La caféine s'installe dans les quatre récepteurs.
  const prises = RECEPTEURS.map((_, i) => ramp(frame, 126 + i * 16, 156 + i * 16));
  const occupation = prises.reduce((a, b) => a + b, 0) / RECEPTEURS.length;

  return (
    <Backdrop tint={COLORS.cafeine} chapter="Le blocage">
      {/* ── Phase 1 : les deux molécules, côte à côte ── */}
      <AbsoluteFill style={{ opacity: compare }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <g transform="translate(660 552)">
            <Molecule kind="adenosine" size={60} glow={0.55} />
          </g>
          <g transform="translate(1270 552)">
            <Molecule kind="cafeine" size={60} glow={0.55} />
          </g>
          <text
            x={960}
            y={578}
            textAnchor="middle"
            fill={COLORS.text}
            fontFamily={FONT}
            fontSize={92}
            opacity={0.75}
          >
            ≈
          </text>
          <text
            x={660}
            y={800}
            textAnchor="middle"
            fill={COLORS.adenosineSoft}
            fontFamily={FONT_MONO}
            fontSize={26}
            letterSpacing={3}
          >
            ADÉNOSINE
          </text>
          <text
            x={1270}
            y={800}
            textAnchor="middle"
            fill={COLORS.cafeineSoft}
            fontFamily={FONT_MONO}
            fontSize={26}
            letterSpacing={3}
          >
            CAFÉINE
          </text>
        </svg>

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 168,
            textAlign: "center",
          }}
        >
          <Rise at={10} until={COMPARAISON_FIN}>
            <Titre size={62}>Deux molécules presque jumelles</Titre>
          </Rise>
          <Rise at={34} until={COMPARAISON_FIN} style={{ marginTop: 20 }}>
            <Texte size={30} maxWidth={1120}>
              Même squelette purine. Assez ressemblant pour que le récepteur s’y
              trompe et laisse entrer la caféine.
            </Texte>
          </Rise>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ── Phase 2 : la caféine occupe le récepteur ── */}
      <AbsoluteFill style={{ opacity: scene }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <Membrane couleur={COLORS.cafeineSoft} />
          <Jauge
            niveau={1 - occupation}
            couleur={occupation > 0.5 ? COLORS.cafeine : COLORS.adenosine}
            label="SIGNAL DE FATIGUE"
          />

          {RECEPTEURS.map((x, i) => {
            const p = prises[i];
            if (p <= 0) return null;
            const y = interpolate(p, [0, 1], [-160, DOCK_Y]);
            return (
              <g key={x} transform={`translate(${x} ${y})`}>
                <Molecule kind="cafeine" size={20} glow={p} opacity={sousTexte(y)} />
              </g>
            );
          })}

          {/* L'adénosine se présente… et rebondit sur une porte déjà prise. */}
          {new Array(4).fill(0).map((_, i) => {
            const s = 208 + i * 15;
            const cible = RECEPTEURS[i];
            const approche = ramp(frame, s, s + 24);
            const rejet = ramp(frame, s + 24, s + 58);
            if (approche <= 0) return null;
            const dir = i % 2 === 0 ? -1 : 1;
            const contact = MEMBRANE_Y - 104;
            const y =
              interpolate(approche, [0, 1], [-170, contact]) +
              interpolate(rejet, [0, 1], [0, -150]);
            const x = cible + interpolate(rejet, [0, 1], [0, dir * 320]);
            return (
              <g key={i}>
                {rejet > 0 && rejet < 0.35 ? (
                  <circle
                    cx={cible}
                    cy={contact}
                    r={40 + rejet * 150}
                    fill="none"
                    stroke={COLORS.alerte}
                    strokeWidth={4}
                    opacity={0.7 - rejet * 2}
                  />
                ) : null}
                <g transform={`translate(${x} ${y}) rotate(${rejet * dir * 40})`}>
                  <Molecule
                    kind="adenosine"
                    size={19}
                    opacity={(1 - rejet) * sousTexte(y)}
                  />
                </g>
              </g>
            );
          })}
        </svg>

        <AbsoluteFill style={{ paddingLeft: 160, paddingTop: 190 }}>
          <Rise at={COMPARAISON_FIN + 6}>
            <Titre size={64}>
              Une clé qui entre,
              <br />
              mais ne tourne pas
            </Titre>
          </Rise>
          <Rise at={COMPARAISON_FIN + 42} style={{ marginTop: 30 }}>
            <Texte size={30} maxWidth={880}>
              La caféine se loge dans le récepteur sans jamais l’activer. Le
              message de fatigue n’est plus émis.
            </Texte>
          </Rise>
          <Rise at={218} style={{ marginTop: 26 }}>
            <Texte size={30} maxWidth={880} color={COLORS.cafeineSoft}>
              Et tant qu’elle occupe la place, l’adénosine ne trouve plus aucune
              porte libre.
            </Texte>
          </Rise>
          <Rise at={268} style={{ marginTop: 34 }}>
            <Etiquette color={COLORS.muted}>
              Antagoniste compétitif des récepteurs à l’adénosine
            </Etiquette>
          </Rise>
        </AbsoluteFill>
      </AbsoluteFill>
    </Backdrop>
  );
};
