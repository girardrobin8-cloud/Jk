import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Canette } from "../components/Canette";
import { Etiquette, Rise, Texte, Titre } from "../components/Type";
import { COLORS, FONT, FONT_MONO } from "../theme";
import { ramp } from "../utils";

/**
 * Décomposition de l'étiquette d'une boisson énergisante, au format vertical.
 *
 * La liste défile depuis le bas, dépasse volontairement vers le haut, puis
 * revient se caler. Les catégories apparaissent ensuite en pastilles, et la
 * caféine est gardée pour la fin : c'est elle qui relie cette scène au reste
 * de la série.
 */

const CATEGORIES: { [k: string]: string } = {
  eau: COLORS.adenosine,
  edulcorant: COLORS.calme,
  amine: "#FF7BC8",
  vitamine: COLORS.alerte,
  cafeine: COLORS.cafeine,
  neutre: COLORS.muted,
};

// Étiquette type d'une boisson énergisante sans sucre de 500 ml.
const INGREDIENTS: { nom: string; cat: string }[] = [
  { nom: "Eau gazéifiée", cat: "eau" },
  { nom: "Acide citrique", cat: "neutre" },
  { nom: "Érythritol", cat: "edulcorant" },
  { nom: "Citrate de sodium", cat: "neutre" },
  { nom: "Arômes naturels et artificiels", cat: "neutre" },
  { nom: "Ginseng (Panax)", cat: "neutre" },
  { nom: "L-carnitine L-tartrate", cat: "amine" },
  { nom: "Caféine", cat: "cafeine" },
  { nom: "Sucralose", cat: "edulcorant" },
  { nom: "Acide sorbique", cat: "neutre" },
  { nom: "Acide benzoïque", cat: "neutre" },
  { nom: "Taurine", cat: "amine" },
  { nom: "Vitamine B3", cat: "vitamine" },
  { nom: "Vitamine B5", cat: "vitamine" },
  { nom: "Vitamine B8", cat: "vitamine" },
  { nom: "Vitamine B6", cat: "vitamine" },
  { nom: "Vitamine B12", cat: "vitamine" },
  { nom: "Acésulfame-K", cat: "edulcorant" },
];

const INDEX_CAFEINE = 7;

const LIGNE = 46; // pas vertical entre deux ingrédients
const PREMIERE = 545; // ordonnée du premier ingrédient une fois calé

// Pastilles : `cote` -1 à gauche, +1 à droite. `ligne` cale la pastille sur
// l'ingrédient concerné. Les pastilles de droite s'arrêtent à x = 914, avant
// la colonne de boutons de TikTok.
const PASTILLES = [
  { texte: ["eau"], cat: "eau", cote: -1, ligne: 0, at: 206, r: 74, taille: 32 },
  { texte: ["édulcorants"], cat: "edulcorant", cote: 1, ligne: 2, at: 228, r: 74, taille: 21 },
  { texte: ["acides", "aminés"], cat: "amine", cote: -1, ligne: 6, at: 250, r: 74, taille: 24 },
  { texte: ["vitamines"], cat: "vitamine", cote: 1, ligne: 14, at: 272, r: 74, taille: 24 },
  { texte: ["caféine"], cat: "cafeine", cote: 1, ligne: 7, at: 300, r: 88, taille: 28 },
];

const DEBUT_CHUTE = 312; // tout s'estompe sauf la caféine

export const S8Energisante: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // La canette se réduit et remonte pour laisser la place à la liste.
  const montee = interpolate(frame, [72, 108], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const canY = interpolate(montee, [0, 1], [860, 360]);
  const canScale = interpolate(montee, [0, 1], [1.5, 0.65]);
  const canEntree = spring({ frame, fps, config: { damping: 200, mass: 0.8 } });

  // Défilement : la liste monte, dépasse, puis redescend se caler.
  const defilement = interpolate(frame, [96, 152, 210], [1460, -470, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const chute = ramp(frame, DEBUT_CHUTE, DEBUT_CHUTE + 22);

  return (
    <Backdrop tint={COLORS.cafeine}>
      {/* ── Liste des ingrédients, masquée en haut pour passer derrière la canette ── */}
      <AbsoluteFill
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0px, transparent 496px, black 538px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: PREMIERE - LIGNE / 2,
            width: "100%",
            transform: `translateY(${defilement}px)`,
          }}
        >
          {INGREDIENTS.map((ing, i) => {
            const estCafeine = i === INDEX_CAFEINE;
            const attenue = estCafeine ? 0 : chute;
            return (
              <div
                key={ing.nom}
                style={{
                  height: LIGNE,
                  lineHeight: `${LIGNE}px`,
                  textAlign: "center",
                  fontFamily: FONT,
                  fontSize: 32,
                  color: CATEGORIES[ing.cat],
                  opacity: 1 - attenue * 0.72,
                  transform: estCafeine
                    ? `scale(${1 + chute * 0.12})`
                    : undefined,
                }}
              >
                {ing.nom}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ── Canette et pastilles ── */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <g
            transform={`translate(540 ${canY}) scale(${canScale * (0.9 + canEntree * 0.1)})`}
            opacity={canEntree}
          >
            <Canette />
          </g>

          {PASTILLES.map((p) => {
            const pop = spring({
              frame: frame - p.at,
              fps,
              config: { damping: 11, mass: 0.5 },
            });
            if (frame < p.at) return null;
            const estCafeine = p.cat === "cafeine";
            const attenue = estCafeine ? 0 : chute;
            const x = p.cote < 0 ? 172 : 838;
            const y = PREMIERE + p.ligne * LIGNE;
            return (
              <g
                key={p.cat}
                transform={`translate(${x} ${y}) scale(${pop})`}
                opacity={1 - attenue * 0.7}
              >
                <circle r={p.r} fill={CATEGORIES[p.cat]} />
                {p.texte.map((ligne, j) => (
                  <text
                    key={ligne}
                    x={0}
                    y={
                      p.texte.length === 1
                        ? p.taille * 0.36
                        : (j - 0.5) * p.taille * 1.2 + p.taille * 0.36
                    }
                    textAnchor="middle"
                    fill="#12101D"
                    fontFamily={FONT}
                    fontSize={p.taille}
                    fontWeight={700}
                  >
                    {ligne}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Chute : la dose réelle de caféine */}
          <g opacity={ramp(frame, DEBUT_CHUTE + 6, DEBUT_CHUTE + 26)}>
            <text
              x={838}
              y={1000}
              textAnchor="middle"
              fill={COLORS.cafeine}
              fontFamily={FONT_MONO}
              fontSize={34}
            >
              160 mg
            </text>
            <text
              x={838}
              y={1034}
              textAnchor="middle"
              fill={COLORS.muted}
              fontFamily={FONT}
              fontSize={20}
            >
              ≈ 2 tasses de café
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* ── Accroche d'ouverture ── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 1230,
          paddingLeft: 60,
          paddingRight: 60,
          textAlign: "center",
        }}
      >
        <Rise at={12} until={100} style={{ marginBottom: 18 }}>
          <Etiquette color={COLORS.cafeine}>Boisson énergisante · 500 ml</Etiquette>
        </Rise>
        <Rise at={22} until={100}>
          <Titre size={76}>18 ingrédients</Titre>
        </Rise>
        <Rise at={40} until={100} style={{ marginTop: 20 }}>
          <Texte size={30} maxWidth={780}>
            Un seul agit vraiment sur votre cerveau.
          </Texte>
        </Rise>
      </AbsoluteFill>

      {/* Rappel du format une fois la canette en haut */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 168,
        }}
      >
        <Rise at={112}>
          <Etiquette color={COLORS.muted}>Étiquette · 500 ml</Etiquette>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
