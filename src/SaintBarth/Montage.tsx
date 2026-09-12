import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Globe } from "./Globe";
import { Compteur, Fiscalite, Histoire, Reserve } from "./Plans";
import { BEATS, DUREE, P, s } from "./reperes";

/**
 * Montage complet — « L'île la plus riche du monde » (Saint-Barthélemy), 32 s.
 *
 * ⚠️ SANS VOIX : l'enregistrement n'existe pas encore. Les bornes des beats
 * viennent du brief, où elles sont données comme estimations à recaler sur la
 * vraie prise. Quand elle arrivera, il suffira d'ajouter la piste ici et de
 * corriger les bornes dans reperes.ts — aucun plan n'a besoin d'être retouché.
 *
 * Contrainte du brief, respectée par construction : la voix est continue et
 * n'est jamais recoupée. Les plans se posent par-dessus, chacun dans sa propre
 * Sequence ; déplacer une borne ne peut donc pas décaler le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Fichier voix, à poser ici une fois la prise enregistrée. */
// const VOIX = "voix/saintbarth.mp4";

/**
 * Bruitages, en secondes absolues (banque de `scripts/bruitages.py`).
 *
 * Volumes bas : ils devront passer sous une voix, pas devant elle. Ils sont
 * calés sur les bornes du brief et suivront donc le recalage des beats.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "whoosh-in.wav", t: 3.85, v: 0.5 }, // début de la descente
  { f: "impact.wav", t: 8.1, v: 0.55 }, // l'île est nommée
  { f: "whoosh-in.wav", t: 8.85, v: 0.45 },
  { f: "apparition.wav", t: 9.4, v: 0.5 }, // le compteur démarre
  { f: "carillon.wav", t: 11.6, v: 0.45 }, // il se fige sur sa valeur
  { f: "impact.wav", t: 11.8, v: 0.5 },
  { f: "whoosh-in.wav", t: 13.85, v: 0.45 },
  ...[0, 1, 2].map((i) => ({ f: "pop.wav", t: 14.95 + i * 0.5, v: 0.5 })),
  ...[0, 1, 2].map((i) => ({ f: "clic.wav", t: 15.35 + i * 0.5, v: 0.75 })),
  { f: "whoosh-in.wav", t: 18.85, v: 0.45 },
  { f: "marche.wav", t: 21.6, v: 0.6 }, // bascule des drapeaux
  { f: "impact.wav", t: 21.8, v: 0.5 },
  { f: "whoosh-out.wav", t: 23.85, v: 0.4 },
];

/** Chaque beat sait quel plan il porte ; le montage ne fait que les enchaîner. */
const PLAN: Record<string, React.FC<{ duree: number }>> = {
  B2: Globe,
  B3: Compteur,
  B4: Fiscalite,
  B5: Histoire,
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: P.fond }}>
    {/* <Audio src={staticFile(VOIX)} /> — à décommenter avec la prise */}

    {BRUITAGES.map((b, i) => (
      <Sequence key={`${b.f}-${i}`} from={s(b.t)} name={`SFX ${b.f}`}>
        {/* eslint-disable-next-line @remotion/volume-callback */}
        <Audio src={staticFile(`sfx/${b.f}`)} volume={b.v} />
      </Sequence>
    ))}

    {BEATS.map((b) => {
      const duree = s(b.fin) - s(b.debut);
      const Plan = PLAN[b.id];
      return (
        <Sequence
          key={b.id}
          from={s(b.debut)}
          durationInFrames={duree}
          name={`${b.id} — ${b.dit.slice(0, 46)}…`}
        >
          {Plan ? <Plan duree={duree} /> : <Reserve beat={b} />}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
