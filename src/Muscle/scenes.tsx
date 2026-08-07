import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cle, M, Plan, TITRE_FONT } from "./Plan";
import {
  Batiment,
  Cerveau,
  Chercheur,
  Coche,
  Croix,
  Etoile,
  Groupe,
  Haltere,
  Interro,
  Muscle,
  Silhouette,
} from "./icones";

/**
 * Un plan par bloc de voix off. Chaque scène reçoit un temps local qui démarre
 * à 0 au début de son plan ; le mot-clé apparaît sur le mot prononcé.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Petit rebond utilisé pour toutes les apparitions. */
const useRebond = (retard: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - retard * fps,
    fps,
    config: { damping: 12, mass: 0.5 },
  });
};

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const CENTRE_Y = 820;

/** Points lumineux (myonoyaux) posés sur le muscle. */
const NOYAUX = [
  [-96, -40],
  [-24, -76],
  [44, -30],
  [-52, 40],
  [40, 48],
];

const Noyaux: React.FC<{ montrer: number[]; taille?: number; opacity?: number }> = ({
  montrer,
  taille = 1,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {NOYAUX.map((p, i) => {
      const v = montrer[i] ?? 0;
      if (v <= 0) return null;
      return (
        <g key={i} transform={`translate(${p[0] * taille} ${p[1] * taille}) scale(${v})`}>
          <circle r={30} fill={M.ambre} opacity={0.18} />
          <circle r={16} fill={M.fond} stroke={M.ambre} strokeWidth={5} />
          <circle r={6} fill={M.ambre} />
        </g>
      );
    })}
  </g>
);

// ── B2 · deux choses ─────────────────────────────────────────────────────
export const B2: React.FC = () => {
  const un = useRebond(0.15);
  const deux = useRebond(1.3);
  const t = useT();
  const allume = interpolate(t, [1.6, 1.9], [0, 1], CLAMP);

  const Badge: React.FC<{ n: string; x: number; pop: number; actif: number }> = ({
    n,
    x,
    pop,
    actif,
  }) => (
    <g transform={`translate(${x} ${CENTRE_Y}) scale(${pop})`}>
      <rect x={-110} y={-110} width={220} height={220} fill={M.noir} />
      <rect
        x={-96}
        y={-96}
        width={192}
        height={192}
        fill={actif > 0.5 ? M.bleu : M.fondCase}
      />
      <text
        x={0}
        y={46}
        textAnchor="middle"
        fontFamily={TITRE_FONT}
        fontSize={140}
        fontWeight={700}
        fill={actif > 0.5 ? "#FFFFFF" : M.gris}
      >
        {n}
      </text>
    </g>
  );

  return (
    <Plan
      titreAt={1.6}
      titre={
        <>
          Deux <Cle>choses</Cle>
        </>
      }
    >
      <Badge n="1" x={370} pop={un} actif={0} />
      <Badge n="2" x={710} pop={deux} actif={allume} />
    </Plan>
  );
};

// ── B3 · connexion cerveau ↔ muscle ──────────────────────────────────────
export const B3: React.FC = () => {
  const t = useT();
  const cerveau = useRebond(0.1);
  const muscle = useRebond(0.3);
  const trait = interpolate(t, [0.7, 1.7], [0, 1], CLAMP);
  const nPoints = 9;

  return (
    <Plan
      titreAt={1.2}
      titre={
        <>
          Connexion
          <br />
          <Cle>cerveau–muscle</Cle>
        </>
      }
    >
      <g transform={`translate(300 ${CENTRE_Y}) scale(${cerveau})`}>
        <Cerveau />
      </g>
      <g transform={`translate(790 ${CENTRE_Y}) scale(${muscle})`}>
        <Muscle />
      </g>
      {new Array(nPoints).fill(0).map((_, i) => {
        const p = (i + 1) / (nPoints + 1);
        if (trait < p) return null;
        return (
          <rect
            key={i}
            x={300 + p * 490 - 11}
            y={CENTRE_Y - 11}
            width={22}
            height={22}
            fill={M.bleu}
          />
        );
      })}
    </Plan>
  );
};

// ── B4 · les myonoyaux apparaissent ──────────────────────────────────────
export const B4: React.FC = () => {
  const t = useT();
  const muscle = useRebond(0.1);
  const montrer = NOYAUX.map((_, i) =>
    interpolate(t, [1.0 + i * 0.35, 1.25 + i * 0.35], [0, 1], CLAMP),
  );
  return (
    <Plan
      titreAt={1.5}
      titre={
        <>
          De nouveaux
          <br />
          <Cle c={M.rose}>myonoyaux</Cle>
        </>
      }
    >
      <g transform={`translate(540 ${CENTRE_Y}) scale(${muscle * 1.5})`}>
        <Muscle />
      </g>
      <g transform={`translate(540 ${CENTRE_Y}) scale(1.5)`}>
        <Noyaux montrer={montrer} />
      </g>
    </Plan>
  );
};

// ── B5 · centres de contrôle ─────────────────────────────────────────────
export const B5: React.FC = () => {
  const t = useT();
  const grille = interpolate(t, [0.1, 0.9], [0, 8], CLAMP);
  const silhouette = useRebond(1.0);
  const fleches = interpolate(t, [1.5, 2.6], [0, 5], CLAMP);

  return (
    <Plan
      titreAt={1.9}
      titre={
        <>
          Les <Cle>centres de contrôle</Cle>
        </>
      }
    >
      {new Array(8).fill(0).map((_, i) => {
        if (grille < i + 1) return null;
        const col = i % 4;
        const lig = Math.floor(i / 4);
        return (
          <g key={i} transform={`translate(${300 + col * 160} ${360 + lig * 130})`}>
            <Haltere />
          </g>
        );
      })}

      <g transform={`translate(540 760) scale(${silhouette * 1.1})`}>
        <Silhouette />
      </g>

      {/* Un pointillé par noyau, tracé du personnage vers sa cible. */}
      {NOYAUX.map((p, i) => {
        if (fleches < i + 1) return null;
        const cibleX = 540 + p[0] * 1.15;
        const cibleY = 1130 + p[1] * 1.15;
        return (
          <g key={i}>
            {new Array(5).fill(0).map((__, k) => {
              const u = (k + 1) / 6;
              return (
                <circle
                  key={k}
                  cx={540 + (cibleX - 540) * u}
                  cy={890 + (cibleY - 890) * u}
                  r={7}
                  fill={M.bleuClair}
                  opacity={0.55}
                />
              );
            })}
          </g>
        );
      })}

      <g transform={`translate(540 1130) scale(1.15)`}>
        <Muscle />
        <Noyaux montrer={NOYAUX.map((_, i) => (fleches > i + 1 ? 1 : 0))} />
      </g>
    </Plan>
  );
};

// ── B6 · capacité limitée ────────────────────────────────────────────────
export const B6: React.FC = () => {
  const t = useT();
  const muscle = useRebond(0.1);
  const battement = 1 + Math.sin(t * 5) * 0.05 * interpolate(t, [1.0, 1.4], [0, 1], CLAMP);
  const jauge = interpolate(t, [1.2, 2.4], [0, 1], CLAMP);

  return (
    <Plan
      titreAt={2.0}
      titre={
        <>
          Une capacité
          <br />
          <Cle c={M.rouge}>limitée</Cle>
        </>
      }
    >
      <g transform={`translate(540 ${CENTRE_Y}) scale(${muscle * 1.45})`}>
        <Muscle />
        <Noyaux montrer={[1, 1, 1, 1, 1]} />
      </g>

      {/* Plafond : barre de mesure qui pulse */}
      <g transform={`translate(540 1120) scale(${battement})`}>
        <rect x={-300} y={-10} width={600} height={20} fill={M.fondCase} />
        <rect x={-300} y={-10} width={600 * jauge} height={20} fill={M.rouge} />
        <rect x={-310} y={-34} width={20} height={68} fill={M.noir} />
        <rect x={290} y={-34} width={20} height={68} fill={M.noir} />
      </g>
      <text
        x={540}
        y={1210}
        textAnchor="middle"
        fontFamily={TITRE_FONT}
        fontSize={34}
        fontWeight={700}
        fill={M.gris}
      >
        PLAFOND PAR NOYAU
      </text>
    </Plan>
  );
};

// ── B7 · séance après séance ─────────────────────────────────────────────
export const B7: React.FC = () => {
  const t = useT();
  const total = 28;
  const combien = interpolate(t, [0.2, 2.3], [0, total], CLAMP);
  return (
    <Plan
      titreAt={1.7}
      titre={
        <>
          Séance
          <br />
          <Cle>après séance</Cle>
        </>
      }
    >
      {new Array(total).fill(0).map((_, i) => {
        if (combien < i + 1) return null;
        const col = i % 7;
        const lig = Math.floor(i / 7);
        return (
          <g key={i} transform={`translate(${300 + col * 80} ${640 + lig * 80})`}>
            <rect x={-30} y={-30} width={60} height={60} fill={M.noir} />
            <rect x={-24} y={-24} width={48} height={48} fill={M.bleu} />
          </g>
        );
      })}
    </Plan>
  );
};

// ── B9 · le volume baisse ────────────────────────────────────────────────
export const B9: React.FC = () => {
  const t = useT();
  const taille = interpolate(t, [0.2, 1.4], [1.5, 1.0], CLAMP);
  const eclat = interpolate(t, [0.2, 1.4], [1, 0.35], CLAMP);
  return (
    <Plan
      titreAt={0.5}
      titre={
        <>
          Le <Cle c={M.rouge}>volume</Cle> baisse
        </>
      }
    >
      <g transform={`translate(540 ${CENTRE_Y}) scale(${taille})`}>
        <Muscle />
        <Noyaux montrer={[1, 1, 1, 1, 1]} opacity={eclat} />
      </g>
    </Plan>
  );
};

// ── B10 · les myonoyaux restent ──────────────────────────────────────────
export const B10: React.FC = () => {
  const t = useT();
  const pulse = 1 + Math.sin(t * 4.5) * 0.07;
  return (
    <Plan
      titreAt={0.9}
      titre={
        <>
          Les myonoyaux
          <br />
          <Cle c={M.rose}>restent</Cle>
        </>
      }
    >
      <g transform={`translate(540 ${CENTRE_Y})`}>
        <Muscle opacity={0.35} />
      </g>
      <g transform={`translate(540 ${CENTRE_Y}) scale(${pulse})`}>
        <Noyaux montrer={[1, 1, 1, 1, 1]} />
      </g>
    </Plan>
  );
};

// ── B11 · le cerveau se souvient ─────────────────────────────────────────
export const B11: React.FC = () => {
  const t = useT();
  const va = (Math.sin(t * 2.6) + 1) / 2;
  return (
    <Plan
      titreAt={0.5}
      titre={
        <>
          Le cerveau
          <br />
          <Cle>se souvient</Cle>
        </>
      }
    >
      <g transform={`translate(540 620) scale(1.15)`}>
        <Cerveau />
      </g>
      <g transform={`translate(540 1090) scale(1.05)`}>
        <Muscle />
        <Noyaux montrer={[1, 1, 1, 1, 1]} />
      </g>
      {new Array(4).fill(0).map((_, i) => {
        const p = (i + va) / 4;
        return (
          <g key={i}>
            <rect x={420 - 9} y={760 + p * 200} width={18} height={18} fill={M.rose} />
            <rect x={660 - 9} y={960 - p * 200} width={18} height={18} fill={M.bleu} />
          </g>
        );
      })}
    </Plan>
  );
};

// ── B12 · rien à voir avec la première fois ──────────────────────────────
export const B12: React.FC = () => {
  const g = useRebond(0.2);
  const d = useRebond(0.45);
  const Etiquette: React.FC<{ x: number; txt: string; c: string }> = ({ x, txt, c }) => (
    <text
      x={x}
      y={1120}
      textAnchor="middle"
      fontFamily={TITRE_FONT}
      fontSize={34}
      fontWeight={700}
      fill={c}
    >
      {txt}
    </text>
  );
  return (
    <Plan
      titreAt={1.4}
      titre={
        <>
          <Cle>Rien à voir</Cle>
          <br />
          avec la première fois
        </>
      }
    >
      <line x1={540} y1={560} x2={540} y2={1060} stroke={M.gris} strokeWidth={5} />
      <g transform={`translate(300 ${CENTRE_Y}) scale(${g * 1.05})`}>
        <Muscle echelle={0.88} />
        <Noyaux montrer={[1, 1, 1, 1, 1]} taille={0.9} />
      </g>
      <g transform={`translate(790 ${CENTRE_Y}) scale(${d * 1.05})`}>
        <Muscle echelle={0.88} opacity={0.4} />
      </g>
      <Etiquette x={300} txt="DÉJÀ ENTRAÎNÉ" c={M.bleu} />
      <Etiquette x={790} txt="PREMIÈRE FOIS" c={M.gris} />
    </Plan>
  );
};

// ── B13 · plus efficace ──────────────────────────────────────────────────
export const B13: React.FC = () => {
  const t = useT();
  const c = useRebond(0.15);
  const x = useRebond(0.45);
  return (
    <Plan
      titreAt={0.7}
      titre={
        <>
          Beaucoup plus
          <br />
          <Cle c={M.vert}>efficace</Cle>
        </>
      }
    >
      <g transform={`translate(330 720) scale(${c * 2.4})`}>
        <Coche />
      </g>
      <g transform={`translate(760 720) scale(${x * 2.0})`}>
        <Croix />
      </g>
      {new Array(3).fill(0).map((_, i) => {
        const e = interpolate(t, [0.9 + i * 0.18, 1.1 + i * 0.18], [0, 1], CLAMP);
        return (
          <g key={i} transform={`translate(${330 + (i - 1) * 120} 1010) scale(${e * 1.5})`}>
            <Etoile />
          </g>
        );
      })}
    </Plan>
  );
};

// ── B14 · plus rapide ────────────────────────────────────────────────────
export const B14: React.FC = () => {
  const t = useT();
  const rapide = interpolate(t, [0.15, 0.65], [0, 1], CLAMP);
  const lent = interpolate(t, [0.15, 1.7], [0, 1], CLAMP);
  const Barre: React.FC<{ y: number; p: number; c: string; txt: string }> = ({
    y,
    p,
    c,
    txt,
  }) => (
    <g>
      <rect x={200} y={y - 30} width={680} height={60} fill={M.fondCase} />
      <rect x={200} y={y - 30} width={680 * p} height={60} fill={c} />
      <text
        x={200}
        y={y + 82}
        fontFamily={TITRE_FONT}
        fontSize={32}
        fontWeight={700}
        fill={M.gris}
      >
        {txt}
      </text>
    </g>
  );
  return (
    <Plan
      titreAt={0.5}
      titre={
        <>
          Et beaucoup plus
          <br />
          <Cle>rapide</Cle>
        </>
      }
    >
      <Barre y={700} p={rapide} c={M.bleu} txt="AVEC MÉMOIRE MUSCULAIRE" />
      <Barre y={920} p={lent} c={M.gris} txt="PREMIÈRE FOIS" />
    </Plan>
  );
};

// ── B16 · une étude ──────────────────────────────────────────────────────
export const B16: React.FC = () => {
  const t = useT();
  const bat = useRebond(0.1);
  const perso = useRebond(0.35);
  const flotte = Math.sin(t * 3) * 8;
  return (
    <Plan
      titreAt={0.6}
      titre={
        <>
          Une <Cle>étude</Cle>
        </>
      }
    >
      <g transform={`translate(600 640) scale(${bat * 1.5})`}>
        <Batiment />
      </g>
      <g transform={`translate(360 ${960 + flotte}) scale(${perso * 1.7})`}>
        <Chercheur />
      </g>
      <g transform={`translate(720 ${940 - flotte}) scale(${perso * 1.4})`}>
        <Interro />
      </g>
    </Plan>
  );
};

// ── Frise commune aux plans B17 / B18 / B19 ──────────────────────────────
const FRISE_X0 = 150;
const FRISE_X1 = 930;
const FRISE_Y = 900;
const SEM_MAX = 60;
const fx = (sem: number) => FRISE_X0 + (sem / SEM_MAX) * (FRISE_X1 - FRISE_X0);

const Frise: React.FC<{
  premiere: number; // 0 → 1, segment « 1re fois » (0 à 20 sem)
  pause: number; // segment gris (20 à 34 sem)
  seconde: number; // segment « 2e fois » (34 à 40 sem)
}> = ({ premiere, pause, seconde }) => (
  <g>
    <rect x={FRISE_X0} y={FRISE_Y + 46} width={FRISE_X1 - FRISE_X0} height={5} fill={M.gris} />
    {[0, 20, 40, 60].map((sem) => (
      <g key={sem}>
        <rect x={fx(sem) - 3} y={FRISE_Y + 46} width={6} height={20} fill={M.gris} />
        <text
          x={fx(sem)}
          y={FRISE_Y + 110}
          textAnchor="middle"
          fontFamily={TITRE_FONT}
          fontSize={30}
          fill={M.gris}
        >
          {sem}
        </text>
      </g>
    ))}
    <text
      x={FRISE_X1}
      y={FRISE_Y + 160}
      textAnchor="end"
      fontFamily={TITRE_FONT}
      fontSize={28}
      fill={M.gris}
    >
      SEMAINES
    </text>

    <rect
      x={fx(0)}
      y={FRISE_Y}
      width={(fx(20) - fx(0)) * premiere}
      height={40}
      fill={M.bleu}
    />
    {pause > 0 ? (
      <rect
        x={fx(20)}
        y={FRISE_Y + 8}
        width={(fx(34) - fx(20)) * pause}
        height={24}
        fill={M.gris}
      />
    ) : null}
    {seconde > 0 ? (
      <rect
        x={fx(34)}
        y={FRISE_Y}
        width={(fx(40) - fx(34)) * seconde}
        height={40}
        fill={M.rose}
      />
    ) : null}
  </g>
);

// ── B17 · 20 semaines, puis pause ────────────────────────────────────────
export const B17: React.FC = () => {
  const t = useT();
  const groupe = useRebond(0.1);
  const premiere = interpolate(t, [0.9, 4.2], [0, 1], CLAMP);
  const pause = interpolate(t, [5.0, 6.6], [0, 1], CLAMP);
  const jauge = premiere;
  return (
    <Plan
      titreAt={4.4}
      titre={
        <>
          <Cle>20 semaines</Cle>
          <br />
          la première fois
        </>
      }
    >
      <g transform={`translate(300 480) scale(${groupe * 1.6})`}>
        <Groupe />
      </g>
      {/* Jauge verticale */}
      <g transform="translate(620 480)">
        <rect x={-40} y={-120} width={80} height={240} fill={M.fondCase} />
        <rect x={-40} y={120 - 240 * jauge} width={80} height={240 * jauge} fill={M.bleu} />
        <rect x={-46} y={-126} width={92} height={12} fill={M.noir} />
        <rect x={-46} y={114} width={92} height={12} fill={M.noir} />
      </g>
      <g transform={`translate(810 480) scale(${0.9 + jauge * 0.5})`}>
        <Muscle echelle={0.7} />
      </g>

      <Frise premiere={premiere} pause={pause} seconde={0} />
      {pause > 0.3 ? (
        <text
          x={(fx(20) + fx(34)) / 2}
          y={FRISE_Y - 26}
          textAnchor="middle"
          fontFamily={TITRE_FONT}
          fontSize={30}
          fontWeight={700}
          fill={M.gris}
        >
          PAUSE
        </text>
      ) : null}
    </Plan>
  );
};

// ── B18 · 6 semaines ─────────────────────────────────────────────────────
export const B18: React.FC = () => {
  const t = useT();
  const seconde = interpolate(t, [1.4, 2.2], [0, 1], CLAMP);
  return (
    <Plan
      titreAt={2.2}
      titre={
        <>
          Plus que <Cle c={M.rose}>6 semaines</Cle>
        </>
      }
    >
      <Frise premiere={1} pause={1} seconde={seconde} />
      {seconde > 0.5 ? (
        <text
          x={(fx(34) + fx(40)) / 2}
          y={FRISE_Y - 26}
          textAnchor="middle"
          fontFamily={TITRE_FONT}
          fontSize={32}
          fontWeight={700}
          fill={M.rose}
        >
          6 SEM
        </text>
      ) : null}
      <text
        x={(fx(0) + fx(20)) / 2}
        y={FRISE_Y - 26}
        textAnchor="middle"
        fontFamily={TITRE_FONT}
        fontSize={32}
        fontWeight={700}
        fill={M.bleu}
      >
        20 SEM
      </text>
    </Plan>
  );
};

// ── B19 · trois fois plus vite ───────────────────────────────────────────
export const B19: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({
    frame: frame - 0.35 * fps,
    fps,
    config: { damping: 9, mass: 0.7 },
  });
  const taille = interpolate(punch, [0, 1], [2.6, 1], { extrapolateRight: "clamp" });
  return (
    <Plan
      titreAt={0.9}
      titre={
        <>
          La <Cle c={M.rose}>mémoire musculaire</Cle>
        </>
      }
    >
      <Frise premiere={1} pause={1} seconde={1} />
      <text
        x={(fx(0) + fx(20)) / 2}
        y={FRISE_Y - 26}
        textAnchor="middle"
        fontFamily={TITRE_FONT}
        fontSize={32}
        fontWeight={700}
        fill={M.bleu}
      >
        20 SEM
      </text>
      <text
        x={(fx(34) + fx(40)) / 2}
        y={FRISE_Y - 26}
        textAnchor="middle"
        fontFamily={TITRE_FONT}
        fontSize={32}
        fontWeight={700}
        fill={M.rose}
      >
        6 SEM
      </text>

      <g transform={`translate(540 560) scale(${Math.min(taille, 2.6)})`} opacity={Math.min(1, punch * 2)}>
        <rect x={-150} y={-92} width={300} height={184} fill={M.noir} />
        <rect x={-136} y={-78} width={272} height={156} fill={M.rose} />
        <text
          x={0}
          y={44}
          textAnchor="middle"
          fontFamily={TITRE_FONT}
          fontSize={130}
          fontWeight={700}
          fill="#FFFFFF"
        >
          3×
        </text>
      </g>
    </Plan>
  );
};
