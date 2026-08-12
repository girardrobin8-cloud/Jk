import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Conception, Empilement, Groupes, Reserve, Resultat, Sucre } from "./Plans";
import { BEATS, C, DUREE, s } from "./reperes";

/**
 * Montage complet — « Le sucre n'est pas (que) le problème », 50 s.
 *
 * ⚠️ SANS VOIX : l'enregistrement n'existe pas encore. Les bornes viennent du
 * brief, qui les donne comme estimations sur un débit naturel. Quand la prise
 * arrivera, il suffira d'ajouter la piste ici et de corriger les bornes dans
 * reperes.ts — aucun plan n'a besoin d'être retouché.
 *
 * Contrainte du brief, respectée par construction : la voix est continue et
 * n'est jamais recoupée. Les plans se posent par-dessus, chacun dans sa propre
 * Sequence ; déplacer une borne ne peut donc pas décaler le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

/** Fichier voix, à poser ici une fois la prise enregistrée. */
// const VOIX = "voix/sucre.mp4";

/**
 * Bruitages, en secondes absolues (banque de `scripts/bruitages.py`).
 *
 * Volumes bas : ils passeront sous une voix, pas devant elle. Les deux ruptures
 * de rythme du brief — le texte plein cadre et le mot « IDENTIQUE » — reçoivent
 * un impact grave, seul son de la banque qui pèse assez pour marquer une coupe.
 */
const BRUITAGES: { f: string; t: number; v: number }[] = [
  { f: "apparition.wav", t: 5.25, v: 0.5 }, // le sucre apparaît
  { f: "whoosh-in.wav", t: 12.9, v: 0.4 }, // la glycémie grimpe
  { f: "clic.wav", t: 13.6, v: 0.7 },
  { f: "pop.wav", t: 15.2, v: 0.5 },

  { f: "pop.wav", t: 15.05, v: 0.55 }, // + GRAS
  { f: "pop.wav", t: 16.35, v: 0.55 }, // + SEL
  { f: "pop.wav", t: 18.35, v: 0.55 }, // + ADDITIFS

  { f: "whoosh-out.wav", t: 20.85, v: 0.5 }, // la pile s'efface
  { f: "impact.wav", t: 21.15, v: 0.75 }, // texte plein cadre

  { f: "whoosh-in.wav", t: 24.2, v: 0.4 },
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 24.6 + i * 0.22, v: 0.4 })),
  { f: "whoosh-in.wav", t: 27.9, v: 0.4 },
  ...[0, 1, 2, 3].map((i) => ({ f: "clic.wav", t: 28.3 + i * 0.22, v: 0.4 })),

  { f: "carillon.wav", t: 32.3, v: 0.45 }, // les deux coches
  { f: "whoosh-out.wav", t: 35.4, v: 0.5 },
  { f: "impact.wav", t: 35.75, v: 0.8 }, // « IDENTIQUE »
];

/** Chaque beat sait quel plan il porte ; le montage ne fait que les enchaîner. */
const PLAN: Record<string, React.FC<{ duree: number }>> = {
  B2: Sucre,
  B3: Empilement,
  B4: Conception,
  B5: Groupes,
  B6: Resultat,
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.fond }}>
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
          name={`${b.id} — ${b.dit.slice(0, 44)}…`}
        >
          {Plan ? <Plan duree={duree} /> : <Reserve beat={b} />}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
