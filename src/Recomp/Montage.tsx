import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { Beat, BEATS, DUREE, s } from "./reperes";

/**
 * Montage complet — « Recomposition corporelle », 57,11 s.
 *
 * Calé sur la prise réelle : les bornes de reperes.ts sont MESURÉES sur
 * l'enveloppe sonore par scripts/caler.py, pas estimées d'après le brief.
 *
 * Contrainte du brief, répétée deux fois dans le document : la voix est
 * continue et n'est jamais recoupée ni resynchronisée. C'est ce que garantit la
 * structure : la piste est montée d'un seul bloc à l'origine du montage, et
 * l'animation lit le temps ABSOLU — elle est donc montée sur toute la durée,
 * les réserves tête caméra venant la recouvrir sur leurs fenêtres. Déplacer une
 * borne ne peut pas déplacer le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

/**
 * Piste voix, telle qu'enregistrée.
 *
 * Le flux d'origine est copié sans réencodage (`-c:a copy`) depuis le .mov de
 * la prise : le brief interdit de toucher à l'audio, et un simple transcodage
 * suffirait à en changer le rendu.
 */
const VOIX = "voix/recomp.mp4";

/**
 * AUCUN BRUITAGE sur ce montage.
 *
 * Le brief le demande en toutes lettres — « pas de sound design, pas de
 * "whoosh", pas de pop, pas de tick, uniquement la voix de Robin » — et c'est
 * aussi une demande explicite et répétée de Robin, qui ajoute le sien
 * lui-même. Il n'y a donc pas de tableau de bruitages ici, et il ne doit pas
 * en apparaître : la bande son ne porte que la voix, telle quelle.
 */

/**
 * Fenêtre tête caméra : rush brut à venir.
 *
 * Le brief demande le rush brut avec des légendes impact sur ces deux fenêtres,
 * et Robin a précisé qu'on n'y voit QUE la tête parlante et son texte — aucune
 * animation ne doit s'y poursuivre. La réserve est donc opaque et recouvre
 * entièrement l'animation ; le plan filmé viendra la remplacer sans rien
 * changer d'autre.
 *
 * C'est aussi pourquoi la ligne de temps que le brief propose en fond de la
 * clôture n'est pas montée : elle tomberait dans une fenêtre tête caméra. Le
 * brief la donne d'ailleurs comme facultative — « si Robin veut un visuel
 * léger » — et la consigne de Robin, plus récente, tranche dans l'autre sens.
 */
const mmss = (t: number) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

const Reserve: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = Math.min(1, frame / (0.2 * fps));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0D120F",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        textAlign: "center",
        fontFamily: TITRE_FONT,
        opacity: a,
      }}
    >
      <div
        style={{
          border: `6px dashed ${M.gris}`,
          borderRadius: 24,
          padding: "70px 50px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: M.ambre, marginBottom: 24 }}>
          RUSH BRUT — AUCUNE ANIMATION
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: M.texte, marginBottom: 30 }}>
          {mmss(beat.debut)} → {mmss(beat.fin)}
        </div>
        <div style={{ fontSize: 32, lineHeight: 1.45, color: M.gris }}>« {beat.dit} »</div>
      </div>
    </AbsoluteFill>
  );
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    <Audio src={staticFile(VOIX)} />

    {/* Montée sur toute la durée : c'est ce qui lui donne le temps absolu. */}
    <Animation />

    {BEATS.filter((b) => b.type === "visage").map((b) => (
      <Sequence
        key={b.id}
        from={s(b.debut)}
        durationInFrames={s(b.fin) - s(b.debut)}
        name={`${b.id} — tête caméra`}
      >
        <Reserve beat={b} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
