/**
 * Silhouette en cycle de marche, dessinée à partir d'angles articulaires.
 *
 * Rien n'est interpolé entre des poses clés : la pose se calcule entièrement
 * depuis la phase, ce qui rend le cycle exactement périodique et donc bouclable
 * sans raccord. Une seule variable pilote tout le corps.
 *
 * Repère local : origine à la hanche, y vers le bas, marche vers les x positifs.
 * Les angles sont mesurés depuis la verticale descendante, positifs vers l'avant.
 */

const deg = (d: number) => (d * Math.PI) / 180;

/** Amplitudes : au-delà, la marche devient une parade militaire. */
const CUISSE_AMPL = deg(26);
const GENOU_AMPL = deg(62);
const BRAS_AMPL = deg(22);
const PENCHE = deg(-5); // buste très légèrement en avant

type Point = { x: number; y: number };

const avance = (p: Point, angle: number, longueur: number): Point => ({
  x: p.x + Math.sin(angle) * longueur,
  y: p.y + Math.cos(angle) * longueur,
});

export type Pose = {
  hanche: Point;
  epaule: Point;
  tete: Point;
  jambes: [Point, Point][];
  bras: [Point, Point][];
  rayonTete: number;
};

/**
 * Calcule la pose complète pour une phase donnée.
 *
 * `phase` avance de 2π par cycle complet, soit deux pas. Exporté séparément du
 * rendu pour que la scène puisse en tirer la position des pieds — c'est ce qui
 * permet de poser les empreintes exactement là où le pied touche.
 */
export const poser = (phase: number, H: number): Pose => {
  const TORSE = 0.3 * H;
  const CUISSE = 0.24 * H;
  const TIBIA = 0.23 * H;
  const BRAS = 0.16 * H;
  const AVANT_BRAS = 0.15 * H;
  const RAYON_TETE = 0.055 * H;

  // Le bassin remonte quand les jambes se croisent, deux fois par cycle.
  const hanche: Point = { x: 0, y: -0.012 * H * Math.cos(2 * phase) };
  const epaule = avance(hanche, PENCHE + Math.PI, TORSE);
  const cou = avance(epaule, PENCHE + Math.PI, 0.06 * H);
  const tete = avance(cou, PENCHE + Math.PI, RAYON_TETE);

  const jambe = (decalage: number): [Point, Point][] => {
    const p = phase + decalage;
    const cuisse = CUISSE_AMPL * Math.sin(p);
    // Le genou ne plie qu'en phase d'élan : à l'appui il reste tendu, sinon
    // la silhouette a l'air de s'accroupir à chaque pas.
    const genou = GENOU_AMPL * Math.max(0, Math.cos(p)) ** 1.4;
    const articulation = avance(hanche, cuisse, CUISSE);
    const pied = avance(articulation, cuisse - genou, TIBIA);
    return [
      [hanche, articulation],
      [articulation, pied],
    ];
  };

  const brasDe = (decalage: number): [Point, Point][] => {
    const p = phase + decalage;
    // Les bras balancent à l'opposé de la jambe du même côté.
    const epaulement = -BRAS_AMPL * Math.sin(p);
    const coude = deg(18) + deg(16) * Math.max(0, Math.sin(p));
    const c = avance(epaule, epaulement, BRAS);
    const main = avance(c, epaulement + coude, AVANT_BRAS);
    return [
      [epaule, c],
      [c, main],
    ];
  };

  return {
    hanche,
    epaule,
    tete,
    rayonTete: RAYON_TETE,
    jambes: [...jambe(0), ...jambe(Math.PI)],
    bras: [...brasDe(Math.PI), ...brasDe(0)],
  };
};

/** Position du pied de la jambe `decalage`, dans le repère local. */
export const pied = (phase: number, H: number, decalage: number): Point => {
  const pose = poser(phase + decalage, H);
  return pose.jambes[1][1];
};

export const Marcheur: React.FC<{
  phase: number;
  hauteur: number;
  couleur: string;
  opacite?: number;
}> = ({ phase, hauteur: H, couleur, opacite = 1 }) => {
  const pose = poser(phase, H);

  return (
    <g opacity={opacite} strokeLinecap="round" stroke={couleur} fill={couleur}>
      {/* Bras arrière d'abord : il doit passer derrière le buste. */}
      {pose.bras.slice(0, 2).map(([a, b], i) => (
        <line
          key={`ba${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          strokeWidth={0.036 * H}
          opacity={0.75}
        />
      ))}
      {pose.jambes.slice(2).map(([a, b], i) => (
        <line
          key={`ja${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          strokeWidth={0.052 * H}
          opacity={0.8}
        />
      ))}

      <line
        x1={pose.hanche.x}
        y1={pose.hanche.y}
        x2={pose.epaule.x}
        y2={pose.epaule.y}
        strokeWidth={0.088 * H}
      />
      <circle cx={pose.tete.x} cy={pose.tete.y} r={pose.rayonTete} stroke="none" />

      {pose.jambes.slice(0, 2).map(([a, b], i) => (
        <line
          key={`jav${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          strokeWidth={0.052 * H}
        />
      ))}
      {pose.bras.slice(2).map(([a, b], i) => (
        <line
          key={`bav${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          strokeWidth={0.036 * H}
        />
      ))}
    </g>
  );
};
