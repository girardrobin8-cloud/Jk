import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  COCHE,
  CROIX,
  FOIE,
  PALETTE_COCHE,
  PALETTE_CROIX,
  PALETTE_FOIE,
  PALETTE_PERSO,
  PALETTE_SUCRE,
  PALETTE_VAISSEAU,
  PERSO,
  PERSO_CLIN,
  Pixels,
  SILHOUETTE,
  SUCRE,
  VAISSEAU,
} from "./pixel";
import { Beat, C, FONT } from "./reperes";

/**
 * Plans animés — « Le sucre n'est pas (que) le problème ».
 *
 * Le personnage reste le repère fixe du montage : ce sont les icônes qui
 * naissent et meurent autour de lui, jamais le décor qui change. C'est le
 * principe observé dans la référence, et il tient tout seul la continuité entre
 * des beats qui, sinon, seraient quatre plans sans rapport.
 *
 * Chaque plan reçoit sa durée et compte son temps depuis zéro : recaler un beat
 * sur la vraie prise ne demande que de changer ses bornes dans reperes.ts.
 */

const PX = 22; // côté d'un pixel du personnage
const PERSO_L = 14 * PX;
const PERSO_H = 17 * PX;
const PERSO_X = 540 - PERSO_L / 2;
const PERSO_Y = 1040;

const arrivee = (frame: number, fps: number, retard: number) =>
  spring({ frame: frame - retard * fps, fps, config: { damping: 200, mass: 0.8 } });

/** Fondu de sortie commun : aucun plan ne se coupe net sur la voix. */
const sortie = (t: number, total: number) =>
  interpolate(t, [total - 0.35, total - 0.05], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Le personnage, avec sa respiration et son clignement.
 *
 * Le balancement se fait par pixels entiers, jamais par fractions : un
 * déplacement sous-pixel réintroduirait l'antialiasing que toute la grille
 * cherche à éviter, et le personnage paraîtrait flou au milieu d'icônes nettes.
 */
const Perso: React.FC<{ t: number }> = ({ t }) => {
  const bond = Math.round(Math.sin(t * 2.1)) * PX * 0.5;
  const clin = t % 3.4 > 3.2;
  return (
    <>
      {/* Ombre portée : sans elle le personnage flotte sur le fond clair. */}
      <ellipse
        cx={540}
        cy={PERSO_Y + PERSO_H + 16}
        rx={PERSO_L * 0.42}
        ry={16}
        fill={C.ombre}
      />
      <Pixels
        bitmap={clin ? PERSO_CLIN : PERSO}
        palette={PALETTE_PERSO}
        taille={PX}
        x={PERSO_X}
        y={PERSO_Y + bond}
      />
    </>
  );
};

const Fond: React.FC<{ children: React.ReactNode; opacite?: number }> = ({
  children,
  opacite = 1,
}) => (
  <AbsoluteFill style={{ backgroundColor: C.fond, opacity: opacite }}>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      {children}
    </svg>
  </AbsoluteFill>
);

/** Étiquette empilée : « + GRAS », « + SEL », « + ADDITIFS ». */
const Ajout: React.FC<{ texte: string; y: number; a: number; couleur: string }> = ({
  texte,
  y,
  a,
  couleur,
}) => (
  <g opacity={a} transform={`translate(0 ${(1 - a) * 18})`}>
    <rect x={330} y={y} width={420} height={78} rx={10} fill={couleur} />
    <text
      x={540}
      y={y + 55}
      fill="#FFFFFF"
      fontFamily={FONT}
      fontSize={46}
      fontWeight={700}
      textAnchor="middle"
    >
      {texte}
    </text>
  </g>
);

/**
 * Beat 2 — ce que le sucre fait vraiment.
 *
 * Trois temps calés sur le brief : le sucre, puis la glycémie et le foie, puis
 * les vaisseaux. Chaque élément reste affiché jusqu'à la fin du plan plutôt que
 * de céder la place au suivant — la phrase les énumère, l'image doit les
 * accumuler.
 */
export const Sucre: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  const aSucre = arrivee(frame, fps, 0.25);
  const aCourbe = interpolate(t, [3, 4.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const aFoie = arrivee(frame, fps, 3.5);
  const aVaisseau = arrivee(frame, fps, 5.1);

  // Courbe tracée dans une boîte de 260 × 140, pour tenir dans la colonne du
  // milieu : dessinée à l'échelle de l'écran, elle débordait du cadre.
  const COURBE = "M 0 120 L 40 118 L 70 112 L 100 30 L 130 6 L 170 76 L 215 106 L 260 114";

  /** Trois colonnes régulières : les effets s'alignent au lieu de se disputer la place. */
  const COL = [220, 540, 860];
  const LIGNE_Y = 760;
  const LABEL_Y = 940;

  const label = (x: number, texte: string, a: number) => (
    <text
      x={x}
      y={LABEL_Y}
      fill={C.encre}
      fontFamily={FONT}
      fontSize={36}
      fontWeight={700}
      textAnchor="middle"
      opacity={a}
    >
      {texte}
    </text>
  );

  return (
    <Fond opacite={sortie(t, total)}>
      <Perso t={t} />

      <g opacity={aSucre} transform={`translate(0 ${(1 - aSucre) * 22})`}>
        <Pixels bitmap={SUCRE} palette={PALETTE_SUCRE} taille={30} x={390} y={250} />
        <text
          x={540}
          y={560}
          fill={C.encre}
          fontFamily={FONT}
          fontSize={52}
          fontWeight={700}
          textAnchor="middle"
        >
          SUCRE
        </text>
      </g>

      {/* Foie, cerclé de rouge : l'alerte est portée par le contour, pas par
          une couleur d'organe qui deviendrait illisible. */}
      <g opacity={aFoie} transform={`translate(0 ${(1 - aFoie) * 20})`}>
        <circle
          cx={COL[0]}
          cy={LIGNE_Y}
          r={104}
          fill="none"
          stroke={C.rouge}
          strokeWidth={7}
          strokeDasharray="18 14"
        />
        <Pixels bitmap={FOIE} palette={PALETTE_FOIE} taille={13} x={COL[0] - 78} y={LIGNE_Y - 58} />
        {label(COL[0], "FOIE", aFoie)}
      </g>

      <g transform={`translate(${COL[1] - 130} ${LIGNE_Y - 70})`}>
        <path
          d={COURBE}
          fill="none"
          stroke={C.rouge}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - aCourbe}
        />
      </g>
      {label(COL[1], "GLYCÉMIE", aCourbe)}

      <g opacity={aVaisseau} transform={`translate(0 ${(1 - aVaisseau) * 20})`}>
        <Pixels bitmap={VAISSEAU} palette={PALETTE_VAISSEAU} taille={16} x={COL[2] - 96} y={LIGNE_Y - 56} />
        {/* Pastille de fond sous la croix : rouge sur rouge, elle disparaissait
            dans le vaisseau. */}
        <circle cx={COL[2] + 62} cy={LIGNE_Y - 62} r={54} fill={C.fond} />
        <Pixels bitmap={CROIX} palette={PALETTE_CROIX} taille={9} x={COL[2] + 26} y={LIGNE_Y - 98} />
        {label(COL[2], "VAISSEAUX", aVaisseau)}
      </g>
    </Fond>
  );
};

/** Beat 3 — le sucre n'arrive jamais seul : gras, puis sel. */
export const Empilement: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  return (
    <Fond opacite={sortie(t, total)}>
      <Perso t={t} />
      <Pixels bitmap={SUCRE} palette={PALETTE_SUCRE} taille={26} x={410} y={430} />
      <Ajout texte="+ GRAS" y={660} a={arrivee(frame, fps, 3.0)} couleur={C.sucre} />
      <Ajout texte="+ SEL" y={758} a={arrivee(frame, fps, 4.3)} couleur={C.gris} />
    </Fond>
  );
};

/** Beat 4 — les additifs complètent la pile, puis tout cède au texte plein cadre. */
export const Conception: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  // Rupture de rythme voulue par le brief : la pile s'efface d'un coup et la
  // phrase occupe seule l'écran. Le fondu est court — une transition douce
  // ferait de la rupture un enchaînement.
  const bascule = interpolate(t, [2.9, 3.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frappe = arrivee(frame, fps, 3.2);

  return (
    <AbsoluteFill style={{ backgroundColor: C.fond, opacity: sortie(t, total) }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" opacity={1 - bascule}>
        <Perso t={t} />
        <Pixels bitmap={SUCRE} palette={PALETTE_SUCRE} taille={26} x={410} y={430} />
        <Ajout texte="+ GRAS" y={660} a={1} couleur={C.sucre} />
        <Ajout texte="+ SEL" y={758} a={1} couleur={C.gris} />
        <Ajout texte="+ ADDITIFS" y={856} a={arrivee(frame, fps, 0.3)} couleur={C.rouge} />
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 70px",
          opacity: bascule,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 118,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: -3,
            color: C.encre,
            textAlign: "center",
            transform: `scale(${0.94 + frappe * 0.06})`,
          }}
        >
          CONÇU POUR TE FAIRE TROP MANGER
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const COLONNES = 5;
const RANGS = 4;

/** Une grille de silhouettes, avec son label chiffré au-dessus. */
const Groupe: React.FC<{
  x: number;
  couleur: string;
  titre: string;
  a: number;
  frame: number;
  fps: number;
  retard: number;
}> = ({ x, couleur, titre, a, frame, fps, retard }) => (
  <g opacity={a > 0 ? 1 : 0}>
    <text
      x={x + 150}
      y={640}
      fill={C.encre}
      fontFamily={FONT}
      fontSize={33}
      fontWeight={700}
      textAnchor="middle"
      opacity={a}
    >
      {titre}
    </text>
    <rect
      x={x - 6}
      y={676}
      width={312}
      height={6}
      rx={3}
      fill={couleur}
      opacity={a}
    />
    {Array.from({ length: COLONNES * RANGS }, (_, i) => {
      // Les silhouettes se posent une à une : le groupe se constitue sous les
      // yeux au lieu d'apparaître déjà formé.
      const pose = arrivee(frame, fps, retard + i * 0.045);
      return (
        <g key={i} opacity={pose} transform={`translate(0 ${(1 - pose) * 14})`}>
          <Pixels
            bitmap={SILHOUETTE}
            palette={{ s: couleur }}
            taille={9}
            x={x + (i % COLONNES) * 62}
            y={716 + Math.floor(i / COLONNES) * 92}
          />
        </g>
      );
    })}
  </g>
);

const GAUCHE = 96;
const DROITE = 674;

/** Beat 5 — deux groupes, même surplus calorique. */
export const Groupes: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  const aRose = arrivee(frame, fps, 0.3);
  const aBleu = arrivee(frame, fps, 4.0);

  return (
    <Fond opacite={sortie(t, total)}>
      <text
        x={540}
        y={430}
        fill={C.encre}
        fontFamily={FONT}
        fontSize={52}
        fontWeight={700}
        textAnchor="middle"
        opacity={aRose}
      >
        MÊME SURPLUS, SUR UNE SEMAINE
      </text>
      <Groupe
        x={GAUCHE}
        couleur={C.rose}
        titre="SURPLUS CALORIQUE"
        a={aRose}
        frame={frame}
        fps={fps}
        retard={0.45}
      />
      <Groupe
        x={DROITE}
        couleur={C.bleu}
        titre="SURPLUS CALORIQUE"
        a={aBleu}
        frame={frame}
        fps={fps}
        retard={4.15}
      />
      <text
        x={GAUCHE + 150}
        y={1300}
        fill={C.rose}
        fontFamily={FONT}
        fontSize={38}
        fontWeight={700}
        textAnchor="middle"
        opacity={aRose}
      >
        sucreries
      </text>
      <text
        x={DROITE + 150}
        y={1300}
        fill={C.bleu}
        fontFamily={FONT}
        fontSize={38}
        fontWeight={700}
        textAnchor="middle"
        opacity={aBleu}
      >
        aliments « sains »
      </text>
    </Fond>
  );
};

/** Beat 6 — le verdict, puis le mot seul. */
export const Resultat: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = duree / fps;

  const aVerdict = arrivee(frame, fps, 0.3);
  const bascule = interpolate(t, [3.5, 3.85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frappe = arrivee(frame, fps, 3.8);

  return (
    <AbsoluteFill style={{ backgroundColor: C.fond, opacity: sortie(t, total) }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" opacity={1 - bascule}>
        {/* Les deux groupes restent en place : le verdict porte sur eux, et les
            faire disparaître entre les deux plans casserait la comparaison. */}
        <Groupe
          x={GAUCHE}
          couleur={C.rose}
          titre="SURPLUS CALORIQUE"
          a={1}
          frame={frame + 60}
          fps={fps}
          retard={0}
        />
        <Groupe
          x={DROITE}
          couleur={C.bleu}
          titre="SURPLUS CALORIQUE"
          a={1}
          frame={frame + 60}
          fps={fps}
          retard={0}
        />

        <g opacity={aVerdict} transform={`translate(0 ${(1 - aVerdict) * 20})`}>
          <rect x={300} y={1352} width={480} height={104} rx={12} fill={C.encre} />
          <text
            x={540}
            y={1424}
            fill={C.fond}
            fontFamily={FONT}
            fontSize={54}
            fontWeight={700}
            textAnchor="middle"
          >
            POIDS PRIS
          </text>
          <Pixels bitmap={COCHE} palette={PALETTE_COCHE} taille={13} x={176} y={1372} />
          <Pixels bitmap={COCHE} palette={PALETTE_COCHE} taille={13} x={812} y={1372} />
        </g>
      </svg>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: bascule }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 168,
            fontWeight: 700,
            letterSpacing: -6,
            color: C.vert,
            transform: `scale(${0.9 + frappe * 0.1})`,
          }}
        >
          IDENTIQUE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Fenêtre tête caméra : rush brut à venir.
 *
 * Le brief demande explicitement « aucune animation » sur ces trois fenêtres.
 * La réserve affiche donc seulement la réplique et la fenêtre, sans effet, et
 * disparaîtra sous le plan filmé.
 */
const mmss = (t: number) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

export const Reserve: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = arrivee(frame, fps, 0.08);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.fondCreux,
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
          border: `6px dashed ${C.gris}`,
          borderRadius: 24,
          padding: "70px 50px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: C.rouge, marginBottom: 24 }}>
          RUSH BRUT — AUCUNE ANIMATION
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.encre, marginBottom: 30 }}>
          {mmss(beat.debut)} → {mmss(beat.fin)}
        </div>
        <div style={{ fontSize: 32, lineHeight: 1.45, color: C.gris }}>« {beat.dit} »</div>
      </div>
    </AbsoluteFill>
  );
};
