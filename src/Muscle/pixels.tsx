/**
 * Kit pixel-art. Chaque icône est une grille de caractères, rendue en carrés :
 * les bords sont donc réellement crénelés, sans imitation par une police.
 *
 * Légende des couleurs — voir `PALETTE` : K noir, R rouge, r rouge clair,
 * B bleu, b bleu clair, P rose, G gris, V vert, W blanc.
 */

export const PALETTE: { [c: string]: string } = {
  K: "#16160F",
  R: "#A32334",
  r: "#D9566A",
  B: "#2B6BE4",
  b: "#7FA9F2",
  P: "#F0709A",
  G: "#9A9A90",
  g: "#C9C9C0",
  V: "#2FA35E",
  W: "#FFFFFF",
  J: "#E8B62C",
};

export const Pixels: React.FC<{
  art: string[];
  px: number;
  opacity?: number;
  couleurs?: { [c: string]: string };
}> = ({ art, px, opacity = 1, couleurs }) => {
  const pal = couleurs ? { ...PALETTE, ...couleurs } : PALETTE;
  const l = art[0].length;
  const h = art.length;
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < l; x++) {
      const c = art[y][x];
      if (c === "." || !pal[c]) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={(x - l / 2) * px}
          y={(y - h / 2) * px}
          width={px + 0.5}
          height={px + 0.5}
          fill={pal[c]}
        />,
      );
    }
  }
  return <g opacity={opacity}>{rects}</g>;
};

// ── Icônes ───────────────────────────────────────────────────────────────

/** Biceps contracté. */
export const MUSCLE = [
  "..KKKKK.........",
  ".KrrrrrK........",
  "KrrrrrrrK.......",
  "KrrrrrrrK.......",
  "KrrrrrrrK.......",
  ".KrrrrrK........",
  ".KrrrrrKKKK.....",
  ".KrrrrRRRRRKK...",
  ".KrrrRRRRRRRRK..",
  ".KrrRRRRRRRRRRK.",
  "..KRRRRRRRRRRRK.",
  "..KRRRRRRRRRRRK.",
  "...KRRRRRRRRRRK.",
  "....KRRRRRRRRK..",
  ".....KKKKKKKK...",
];

/** Cerveau. */
export const CERVEAU = [
  "....KKKKKK....",
  "..KKPPPPPPKK..",
  ".KPPKPPKPPPPK.",
  "KPPPPKPPKPPPPK",
  "KPKPPPKPPPKPPK",
  "KPPKPPPPKPPPPK",
  "KPPPKPPKPPKPPK",
  ".KPPPPKPPPPPK.",
  "..KKPPPPPPKK..",
  "....KKKKKK....",
];

/** Haltère. */
export const HALTERE = [
  "..............",
  "KK..........KK",
  "KBK........KBK",
  "KBKKKKKKKKKKBK",
  "KBBBBBBBBBBBBK",
  "KBKKKKKKKKKKBK",
  "KBK........KBK",
  "KK..........KK",
];

/** Silhouette debout. */
export const SILHOUETTE = [
  "...KKKK...",
  "..KBBBBK..",
  "..KBBBBK..",
  "...KKKK...",
  ".KKKKKKKK.",
  "KBKBBBBKBK",
  "KBKBBBBKBK",
  "KKKBBBBKKK",
  "...KBBK...",
  "...KBBK...",
  "..KKKKKK..",
  "..KBK.KBK.",
  "..KBK.KBK.",
  "..KKK.KKK.",
];

/** Bâtiment universitaire. */
export const BATIMENT = [
  ".......KK.......",
  "......KWWK......",
  ".....KWWWWK.....",
  "...KKWWWWWWKK...",
  "..KWWWWWWWWWWK..",
  ".KKKKKKKKKKKKKK.",
  ".KWKWKWKWKWKWKK.",
  ".KWKWKWKWKWKWKK.",
  ".KWKWKWKWKWKWKK.",
  ".KWKWKWKWKWKWKK.",
  ".KKKKKKKKKKKKKK.",
  ".KWWWWKKWWWWWWK.",
  ".KWWWWKKWWWWWWK.",
  ".KKKKKKKKKKKKKK.",
];

/** Chercheur : blouse et fiole. */
export const CHERCHEUR = [
  "...KKKK.....",
  "..KJJJJK....",
  "..KJKJKJK...",
  "..KJJJJJK...",
  "...KKKK.....",
  "..KWWWWK....",
  ".KWWWWWWK.KK",
  "KWWWWWWWWKVK",
  "KWKWWWWKWKVK",
  "KWKWWWWKWKKK",
  "..KWWWWK....",
  "..KWWKWWK...",
  "..KWK.KWK...",
  "..KKK.KKK...",
];

/** Groupe de personnes. */
export const GROUPE = [
  ".KK...KK...KK.",
  "KBBK.KBBK.KBBK",
  "KBBK.KBBK.KBBK",
  ".KK...KK...KK.",
  "KBBBKKBBBKKBBB",
  "KBBBKKBBBKKBBB",
  "KBBBKKBBBKKBBB",
  "KKKKKKKKKKKKKK",
];

export const COCHE = [
  "..........KK",
  ".........KVK",
  "........KVK.",
  "KK.....KVK..",
  "KVK...KVK...",
  ".KVK.KVK....",
  "..KVKVK.....",
  "...KVK......",
  "....K.......",
];

export const CROIX = [
  "KK........KK",
  "KRK......KRK",
  ".KRK....KRK.",
  "..KRK..KRK..",
  "...KRKKRK...",
  "....KRRK....",
  "...KRKKRK...",
  "..KRK..KRK..",
  ".KRK....KRK.",
  "KRK......KRK",
  "KK........KK",
];

export const ETOILE = [
  "....KK....",
  "...KJJK...",
  "...KJJK...",
  "KKKKJJKKKK",
  "KJJJJJJJJK",
  ".KJJJJJJK.",
  "..KJJJJK..",
  ".KJJKKJJK.",
  "KJJK..KJJK",
  "KK......KK",
];

export const INTERRO = [
  "..KKKK..",
  ".KPPPPK.",
  "KPK..KPK",
  "KK...KPK",
  "....KPK.",
  "...KPK..",
  "...KPK..",
  "...KK...",
  "........",
  "...KK...",
  "..KPPK..",
  "..KPPK..",
  "...KK...",
];
