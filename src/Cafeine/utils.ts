import { interpolate } from "remotion";

export type Pt = { x: number; y: number };

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Opacité qui monte puis redescend, en frames absolues. */
export const fadeInOut = (
  frame: number,
  inAt: number,
  outAt: number,
  dur = 12,
) => {
  const half = Math.min(dur, Math.max(1, (outAt - inAt) / 2));
  return interpolate(
    frame,
    [inAt, inAt + half, outAt - half, outAt],
    [0, 1, 1, 0],
    CLAMP,
  );
};

/** Progression 0 → 1 entre deux frames, avec accélération douce. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], CLAMP);

/** Amorti sinusoïdal : utile pour les pulsations (cœur, halo). */
export const pulse = (frame: number, period: number, amount = 1) =>
  Math.sin((frame / period) * Math.PI * 2) * amount;

/**
 * Les molécules tombent depuis le haut du cadre, là où se trouvent les textes.
 * On ne les révèle qu'une fois descendues sous la colonne de texte.
 */
export const sousTexte = (y: number, seuil = 600, fondu = 120) =>
  Math.max(0, Math.min(1, (y - seuil) / fondu));

/** Longueurs cumulées le long d'une polyligne. */
export const cumulative = (pts: Pt[]): number[] => {
  const acc: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    acc.push(acc[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return acc;
};

/** Point situé à la fraction `t` (0 → 1) d'une polyligne. */
export const pointAt = (pts: Pt[], t: number): Pt => {
  const acc = cumulative(pts);
  const total = acc[acc.length - 1];
  const target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    if (target <= acc[i]) {
      const seg = acc[i] - acc[i - 1];
      const u = seg === 0 ? 0 : (target - acc[i - 1]) / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
      };
    }
  }
  return pts[pts.length - 1];
};

export const toPath = (pts: Pt[]): string =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

/** Générateur pseudo-aléatoire déterministe — indispensable pour un rendu reproductible. */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Caféine restante après `hours`, pour une demi-vie donnée.
 * Décroissance exponentielle : la moitié disparaît à chaque demi-vie.
 */
export const remaining = (dose: number, hours: number, halfLife = 5) =>
  dose * Math.pow(0.5, hours / halfLife);
