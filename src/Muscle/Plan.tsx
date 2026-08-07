import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/** Fond clair, contraste net avec les plans filmés. */
export const M = {
  fond: "#EFEFEA",
  fondCase: "#E2E2DA",
  noir: "#16160F",
  gris: "#8A8A80",
  bleu: "#2B6BE4",
  bleuClair: "#7FA9F2",
  rouge: "#A32334",
  rose: "#F0709A",
  vert: "#2FA35E",
  jaune: "#E8B62C",
};

/**
 * Faute de police pixel/gaming installée, on prend la sans-serif la plus
 * grasse disponible avec un chasse serrée. À remplacer par une police
 * pixelisée pour coller pleinement à la direction artistique.
 */
export const TITRE_FONT =
  '"Liberation Sans", "DejaVu Sans", Helvetica, Arial, sans-serif';

export const cadre = (frame: number, fps: number) =>
  interpolate(frame, [0, 0.12 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Gabarit d'un plan de motion design : fond uni, zone graphique au centre,
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
  c = M.bleu,
}) => <span style={{ color: c }}>{children}</span>;
