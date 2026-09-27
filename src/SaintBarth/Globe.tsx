import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GEO } from "./geo";
import { FONT, P } from "./reperes";

/**
 * Beat 2 — descente depuis l'espace jusqu'à Saint-Barthélemy.
 *
 * La projection change à chaque frame : impossible de préparer les tracés
 * comme pour la carte des îles Britanniques, ils sont donc calculés au rendu.
 * Une seule projection orthographique couvre tout le plan — vue du globe et
 * vue rapprochée — parce qu'à grande échelle elle devient localement une
 * projection plane. Enchaîner deux projections aurait demandé un raccord.
 *
 * L'échelle progresse en logarithme : un rapproché perçu comme régulier est
 * une progression géométrique, et sur trois ordres de grandeur l'écart avec
 * une interpolation droite est flagrant.
 */

const CENTRE: [number, number] = [GEO.centre[0], GEO.centre[1]];
const DEPART: [number, number] = [-46, 24]; // milieu de l'Atlantique

const ECHELLE_GLOBE = 470;
const ECHELLE_FINALE = 27000;

/** Au-delà, le 110m montre ses angles ; en deçà, le 50m est du détail perdu. */
const BASCULE = [2600, 5200];

const VUE = { x: 540, y: 690 };

type Props = { duree: number };

export const Globe: React.FC<Props> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  // Départ posé, arrivée freinée : la descente s'amorce doucement puis se cale.
  const p = interpolate(t, [0.15, total - 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const echelle = Math.exp(
    Math.log(ECHELLE_GLOBE) + (Math.log(ECHELLE_FINALE) - Math.log(ECHELLE_GLOBE)) * p,
  );
  const lon = DEPART[0] + (CENTRE[0] - DEPART[0]) * p;
  const lat = DEPART[1] + (CENTRE[1] - DEPART[1]) * p;

  const projection = geoOrthographic()
    .rotate([-lon, -lat])
    .scale(echelle)
    .translate([VUE.x, VUE.y])
    .clipAngle(90);
  const chemin = geoPath(projection);

  const opaciteLoin = interpolate(echelle, BASCULE, [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacitePres = 1 - opaciteLoin;

  // L'île n'est nommée qu'une fois qu'on la distingue vraiment.
  const nomme = interpolate(echelle, [9000, 17000], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulsation = 1 + Math.sin(t * 5.2) * 0.05;

  const marqueur = projection(CENTRE);

  return (
    <AbsoluteFill style={{ backgroundColor: P.fond }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          {/* Lueur posée sous l'île. Saint-Barthélemy ne compte que onze points
              dans les données libres : à fort grossissement son contour devient
              un polygone visible. La lueur porte l'accent à sa place, et le
              tracé n'a plus qu'à en marquer le cœur. */}
          <radialGradient id="sbLueur">
            <stop offset="0%" stopColor={P.orClair} stopOpacity={0.85} />
            <stop offset="45%" stopColor={P.or} stopOpacity={0.35} />
            <stop offset="100%" stopColor={P.or} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="sbOcean">
            <stop offset="0%" stopColor={P.merPres} />
            <stop offset="100%" stopColor={P.mer} />
          </radialGradient>
          <filter id="sbHalo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="f" />
            <feMerge>
              <feMergeNode in="f" />
              <feMergeNode in="f" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Étoiles : positions dérivées de l'indice, jamais tirées au hasard —
            un rendu doit rester identique d'une passe à l'autre. */}
        {opaciteLoin > 0.01
          ? Array.from({ length: 90 }, (_, i) => (
              <circle
                key={i}
                cx={((i * 167) % 1080) + Math.sin(i) * 3}
                cy={((i * 389) % 1920) + Math.cos(i * 1.7) * 3}
                r={0.8 + ((i * 7) % 5) * 0.22}
                fill="#FFFFFF"
                opacity={opaciteLoin * (0.18 + ((i * 13) % 9) * 0.055)}
              />
            ))
          : null}

        {/* Le disque du globe tant qu'on le voit ; au sol, une mer pleine cadre. */}
        {opaciteLoin > 0.01 ? (
          <path d={chemin({ type: "Sphere" }) ?? ""} fill="url(#sbOcean)" opacity={opaciteLoin} />
        ) : (
          <rect x="0" y="0" width="1080" height="1920" fill="url(#sbOcean)" />
        )}

        {opaciteLoin > 0.01 ? (
          <>
            <path
              d={chemin(geoGraticule10()) ?? ""}
              fill="none"
              stroke="#6FB8D8"
              strokeWidth={0.7}
              opacity={opaciteLoin * 0.2}
            />
            <path d={chemin(GEO.monde) ?? ""} fill={P.terre} opacity={opaciteLoin} />
          </>
        ) : null}

        {opacitePres > 0.01 ? (
          <path
            d={chemin(GEO.antilles) ?? ""}
            fill="#3E5546"
            stroke="#6E8C74"
            strokeWidth={Math.max(0.8, 1400 / echelle)}
            opacity={opacitePres}
          />
        ) : null}

        {/* Saint-Barthélemy, en or, à toutes les échelles : de loin ce n'est
            qu'un point lumineux, ce qui suffit à guider l'œil pendant la
            descente. */}
        {marqueur ? (
          <circle
            cx={marqueur[0]}
            cy={marqueur[1]}
            r={Math.max(40, echelle * 0.0075)}
            fill="url(#sbLueur)"
          />
        ) : null}
        <path
          d={chemin(GEO.blm) ?? ""}
          fill={P.orClair}
          stroke={P.orClair}
          strokeWidth={Math.max(0.6, 900 / echelle)}
          filter="url(#sbHalo)"
        />

        {marqueur ? (
          <circle
            cx={marqueur[0]}
            cy={marqueur[1]}
            r={Math.max(26, echelle * 0.004) * pulsation}
            fill="none"
            stroke={P.orClair}
            strokeWidth={3}
            opacity={0.5 * (1 - nomme * 0.55)}
          />
        ) : null}

        {/* Voisins nommés : ils situent l'île sans commentaire. */}
        {GEO.voisins.map((v, i) => {
          const q = projection([v.centre[0], v.centre[1]]);
          if (!q || nomme < 0.05) {
            return null;
          }
          // Saint-Martin et Sint Maarten partagent une île : sans décalage
          // alterné, leurs deux libellés se superposent exactement.
          const dy = i % 2 === 0 ? -26 : 34;
          return (
            <text
              key={v.id}
              x={q[0]}
              y={q[1] + dy}
              fill={P.gris}
              fontFamily={FONT}
              fontSize={26}
              textAnchor="middle"
              opacity={nomme * 0.8}
            >
              {v.nom}
            </text>
          );
        })}
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 430,
          opacity: nomme,
          transform: `translateY(${(1 - nomme) * 22}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 68,
            fontWeight: 700,
            color: P.or,
            backgroundColor: P.cartouche,
            padding: "12px 34px 18px",
            borderRadius: 10,
            letterSpacing: -1,
          }}
        >
          SAINT-BARTHÉLEMY
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 34,
            color: P.texte,
            marginTop: 18,
            letterSpacing: 2,
          }}
        >
          25 km² · 10 000 habitants
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
