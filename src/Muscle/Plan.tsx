import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Thème sombre à dominante verte, dans la continuité des scènes caféine :
 * fond profond, grille discrète, halo coloré, accents verts.
 *
 * Les clés de couleur sont restées celles de la première version pour que les
 * scènes n'aient pas à changer ; seules les valeurs ont basculé en vert.
 */
export const M = {
  fond: "#070B09",
  fondCase: "#111A15",
  /** Ancien « noir » : sur fond sombre, c'est un cadre vert profond. */
  noir: "#1E3A2C",
  gris: "#8A9A91",
  texte: "#EDF3EF",

  bleu: "#2FBF71", // accent principal, désormais vert
  bleuClair: "#7FE3AE",
  vert: "#2FBF71",
  rouge: "#E0655A",
  rose: "#E8B62C",
  jaune: "#E8B62C",
  corail: "#E0655A",
  ambre: "#E8B62C",

  grille: "rgba(127, 227, 174, 0.10)",
};

export const TITRE_FONT =
  '"Liberation Sans", "DejaVu Sans", Helvetica, Arial, sans-serif';

export const cadre = (frame: number, fps: number) =>
  interpolate(frame, [0, 0.12 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Gabarit d'un plan de motion design : fond sombre, zone graphique au centre,
 * mot-clé en bas. Le texte reste au-dessus de y = 1440 pour ne pas passer
 * sous la légende de l'application.
 */
export const Plan: React.FC<{
  children: React.ReactNode;
  titre?: React.ReactNode;
  titreAt?: number;
}> = ({ children, titre, titreAt = 0.25 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const apparition = interpolate(
    frame,
    [titreAt * fps, (titreAt + 0.18) * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: M.fond }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 44% at 50% 42%, rgba(47,191,113,0.13) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${M.grille} 1px, transparent 1px), linear-gradient(90deg, ${M.grille} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(52% 40% at 50% 44%, black 10%, transparent 78%)",
        }}
      />

      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {children}
      </svg>

      {titre ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 480,
            paddingLeft: 70,
            paddingRight: 70,
            opacity: apparition,
            transform: `translateY(${(1 - apparition) * 14}px)`,
          }}
        >
          <div
            style={{
              fontFamily: TITRE_FONT,
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.08,
              textAlign: "center",
              color: M.gris,
              textTransform: "uppercase",
            }}
          >
            {titre}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Mot mis en couleur dans le titre. */
export const Cle: React.FC<{ children: React.ReactNode; c?: string }> = ({
  children,
  c = M.vert,
}) => <span style={{ color: c }}>{children}</span>;
