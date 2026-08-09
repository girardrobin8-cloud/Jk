import { geoOrthographic, geoPath } from "d3-geo";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEO } from "./geo";
import { Beat, FONT, P } from "./reperes";

/**
 * Plans animés des beats 3 à 5, et le gabarit des plans tête caméra.
 *
 * Tous partagent la même règle : ils se posent sur une voix continue, donc
 * chacun tient dans sa fenêtre sans jamais dépendre de ce qui précède. Recaler
 * un beat sur la vraie prise ne demande que de changer ses bornes.
 */

const arrivee = (frame: number, fps: number, retard = 0) =>
  spring({ frame: frame - retard * fps, fps, config: { damping: 200, mass: 0.8 } });

const Cartouche: React.FC<{
  children: React.ReactNode;
  couleur?: string;
  taille?: number;
  opacite?: number;
  decale?: number;
}> = ({ children, couleur = P.or, taille = 64, opacite = 1, decale = 0 }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: taille,
      fontWeight: 700,
      color: couleur,
      backgroundColor: P.cartouche,
      padding: "10px 30px 16px",
      borderRadius: 10,
      letterSpacing: -1,
      opacity: opacite,
      transform: `translateY(${decale}px)`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
/**
 * Groupes de milliers separes par une espace fine insecable.
 *
 * Ecrit a la main plutot que via toLocaleString : le separateur produit par la
 * locale varie d'un environnement a l'autre, et un rendu ne doit pas dependre
 * de la machine qui le lance.
 */
const milliers = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");

/**
 * Beat 3 — le prix au mètre carré.
 *
 * Le compteur s'arrête net sur la valeur pleine plutôt que de s'en approcher
 * asymptotiquement : un chiffre qui frémit encore quand la voix a fini de le
 * dire donne l'impression d'une estimation, pas d'un fait.
 */
export const Compteur: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = duree / fps;

  const montee = interpolate(frame / fps, [0.35, total * 0.46], [0, 50000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const valeur = Math.round(montee / 100) * 100;
  const villas = arrivee(frame, fps, total * 0.56);
  const cadre = arrivee(frame, fps, 0.2);

  return (
    <AbsoluteFill style={{ backgroundColor: P.fond }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at 50% 42%, rgba(242,176,30,0.16) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 34,
            color: P.gris,
            letterSpacing: 6,
            opacity: cadre,
          }}
        >
          PRIX DE L'IMMOBILIER
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 168,
            fontWeight: 700,
            color: P.or,
            letterSpacing: -6,
            lineHeight: 1,
            opacity: cadre,
            // Chiffres à chasse fixe : sans cela, la largeur du nombre saute à
            // chaque incrément et tout le bloc tremble.
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {milliers(valeur)} €
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 42,
            color: P.texte,
            letterSpacing: 3,
            opacity: cadre,
          }}
        >
          par mètre carré
        </div>

        <div style={{ marginTop: 54, opacity: villas, transform: `scale(${0.95 + villas * 0.05})` }}>
          <Cartouche couleur={P.texte} taille={54}>
            VILLAS : 12 M€ – 30 M€
          </Cartouche>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const IMPOTS = ["Impôt sur le revenu", "Impôt sur la fortune (IFI)", "Droits de succession"];

/** Beat 4 — les trois impôts qui tombent, une fois la résidence acquise. */
export const Fiscalite: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = duree / fps;

  const entete = arrivee(frame, fps, 0.2);

  return (
    <AbsoluteFill style={{ backgroundColor: P.fond }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 40% at 50% 44%, rgba(63,207,127,0.13) 0%, transparent 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <div style={{ opacity: entete, marginBottom: 26 }}>
          <Cartouche couleur={P.or} taille={52}>
            APRÈS 5 ANS DE RÉSIDENCE
          </Cartouche>
        </div>

        {IMPOTS.map((nom, i) => {
          const pose = arrivee(frame, fps, 0.75 + i * 0.5);
          // La rature part une demi-seconde après la ligne : on lit d'abord ce
          // qui est dû, puis on le voit disparaître.
          const rature = interpolate(
            frame / fps,
            [1.15 + i * 0.5, 1.75 + i * 0.5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
          );
          const coche = arrivee(frame, fps, Math.min(total - 0.4, 1.7 + i * 0.5));
          return (
            <div
              key={nom}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 26,
                opacity: pose,
                transform: `translateY(${(1 - pose) * 24}px)`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  backgroundColor: P.cartouche,
                  borderRadius: 10,
                  padding: "16px 34px",
                  minWidth: 640,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 46,
                    fontWeight: 700,
                    color: rature > 0.6 ? P.gris : P.texte,
                  }}
                >
                  {nom}
                </span>
                <div
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 30,
                    top: "50%",
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: P.rouge,
                    transformOrigin: "left center",
                    transform: `scaleX(${rature})`,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 62,
                  fontWeight: 700,
                  color: P.vert,
                  opacity: coche,
                  transform: `scale(${0.6 + coche * 0.4})`,
                }}
              >
                ✓
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Drapeau suédois puis français : deux tracés, pas une image à charger. */
const Drapeau: React.FC<{ suedois: boolean; opacite: number }> = ({ suedois, opacite }) => (
  <svg width="260" height="164" viewBox="0 0 260 164" style={{ opacity: opacite }}>
    {suedois ? (
      <>
        <rect width="260" height="164" fill="#005293" />
        <rect x="78" y="0" width="42" height="164" fill="#FECB00" />
        <rect x="0" y="61" width="260" height="42" fill="#FECB00" />
      </>
    ) : (
      <>
        <rect width="87" height="164" fill="#002395" />
        <rect x="87" width="86" height="164" fill="#FFFFFF" />
        <rect x="173" width="87" height="164" fill="#ED2939" />
      </>
    )}
  </svg>
);

/**
 * Beat 5 — le passé suédois, jusqu'à la vente de 1878.
 *
 * La carte est projetée une fois pour toutes : ce plan ne bouge pas, inutile
 * de refaire le calcul à chaque frame comme le fait le globe.
 */
const projectionFixe = geoOrthographic()
  .rotate([-GEO.centre[0], -GEO.centre[1]])
  .scale(23000)
  .translate([540, 640])
  .clipAngle(90);
const cheminFixe = geoPath(projectionFixe);
const TRACE_ANTILLES = cheminFixe(GEO.antilles) ?? "";
const TRACE_BLM = cheminFixe(GEO.blm) ?? "";
const marqueurHist = projectionFixe(GEO.centre);

export const Histoire: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  // Le sépia s'installe, puis se retire : la carte ancienne ne fait que passer.
  const vieilli = interpolate(t, [0.3, 1.3, total - 1.5, total - 0.5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bascule = interpolate(t, [total * 0.5, total * 0.66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const annee = arrivee(frame, fps, total * 0.58);

  return (
    <AbsoluteFill style={{ backgroundColor: P.fond }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          <radialGradient id="sbLueurHist">
            <stop offset="0%" stopColor={P.orClair} stopOpacity={0.8} />
            <stop offset="100%" stopColor={P.or} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Carte moderne, puis carte ancienne par-dessus en fondu.
            Un simple voile sépia sur la carte moderne avait été essayé : il
            aplatissait mer et terre à la même valeur et tout le cadre virait
            au brun uniforme. Changer la palette entière — parchemin et encre —
            garde le contraste et lit vraiment comme une carte d'époque. */}
        <rect x="0" y="0" width="1080" height="1920" fill={P.mer} />
        <path d={TRACE_ANTILLES} fill={P.terre} />

        <g opacity={vieilli}>
          <rect x="0" y="0" width="1080" height="1920" fill="#D8C49B" />
          <path d={TRACE_ANTILLES} fill="#B79B6B" />
          <path
            d={TRACE_ANTILLES}
            fill="none"
            stroke="#6B5330"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Grain du papier : positions dérivées de l'indice, reproductibles. */}
          {Array.from({ length: 420 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 313) % 1080}
              cy={(i * 577) % 1920}
              r={0.8 + ((i * 5) % 4) * 0.4}
              fill="#6B5330"
              opacity={0.16}
            />
          ))}
          <rect
            x="46"
            y="46"
            width="988"
            height="1828"
            fill="none"
            stroke="#6B5330"
            strokeWidth={5}
            opacity={0.5}
          />
        </g>

        {marqueurHist ? (
          <circle
            cx={marqueurHist[0]}
            cy={marqueurHist[1]}
            r={110}
            fill="url(#sbLueurHist)"
          />
        ) : null}
        <path d={TRACE_BLM} fill={P.orClair} stroke={P.or} strokeWidth={2} />
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 380,
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div style={{ position: "relative", width: 260, height: 164 }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <Drapeau suedois opacite={1 - bascule} />
            </div>
            <div style={{ position: "absolute", inset: 0 }}>
              <Drapeau suedois={false} opacite={bascule} />
            </div>
          </div>
          <span style={{ fontFamily: FONT, fontSize: 66, color: P.texte }}>→</span>
          <div style={{ opacity: annee }}>
            <Cartouche couleur={P.or} taille={72}>
              1878
            </Cartouche>
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            color: P.texte,
            letterSpacing: 2,
            opacity: annee,
          }}
        >
          suédoise, puis vendue à la France
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Plan tête caméra à insérer, avec sa fenêtre et sa réplique.
 *
 * Même gabarit que les autres montages du dépôt : le plan filmé n'existe pas
 * encore, la réserve tient sa place et rappelle ce qui doit y être dit.
 */
const mmss = (t: number) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

export const Reserve: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = arrivee(frame, fps, 0.05);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0F0D",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        textAlign: "center",
        fontFamily: FONT,
        opacity: a,
      }}
    >
      <div
        style={{
          border: `6px dashed ${P.gris}`,
          borderRadius: 24,
          padding: "70px 50px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 6, color: P.or, marginBottom: 26 }}>
          PLAN TÊTE CAMÉRA À INSÉRER
        </div>
        <div style={{ fontSize: 58, fontWeight: 700, color: P.texte, marginBottom: 34 }}>
          {mmss(beat.debut)} → {mmss(beat.fin)}
        </div>
        <div style={{ fontSize: 33, lineHeight: 1.45, color: P.gris }}>« {beat.dit} »</div>
      </div>
    </AbsoluteFill>
  );
};
