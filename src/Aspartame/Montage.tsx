import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { M, TITRE_FONT } from "../Muscle/Plan";
import { Animation } from "./Animation";
import { Beat, BEATS, DUREE, s } from "./reperes";

/**
 * Montage complet — « Aspartame / Coca Zero », 39 s.
 *
 * SANS VOIX : la prise n'a pas été fournie avec le brief. Les bornes de
 * reperes.ts sont reconstruites et NON mesurées — l'avertissement en tête de
 * ce fichier-là explique comment elles ont été obtenues et ce qu'il faudra
 * faire quand la prise arrivera.
 *
 * Pour brancher la voix le moment venu, il y a exactement trois gestes, et le
 * premier est de loin le plus important :
 *
 *   1. mesurer   python3 scripts/caler.py <prise.wav> aspartame
 *                puis reporter les bornes dans reperes.ts et ajuster DUREE.
 *   2. copier    la piste SANS réencodage dans public/voix/aspartame.mp4
 *                (ffmpeg -i <prise.mov> -vn -c:a copy …) — le brief interdit
 *                de toucher à l'audio, et un simple transcodage suffirait à en
 *                changer le rendu.
 *   3. monter    décommenter l'<Audio> ci-dessous.
 *
 * Contrainte du brief : la voix est continue et n'est jamais recoupée ni
 * resynchronisée. C'est ce que garantit la structure : la piste se montera
 * d'un seul bloc à l'origine du montage, et l'animation lit le temps ABSOLU —
 * elle est donc montée sur toute la durée, les réserves tête caméra venant la
 * recouvrir sur leurs fenêtres. Déplacer une borne ne peut pas déplacer le son.
 */

export const MONTAGE_FRAMES = s(DUREE);

// import { Audio, staticFile } from "remotion";
// const VOIX = "voix/aspartame.mp4";

/**
 * AUCUN BRUITAGE sur ce montage.
 *
 * Le brief le demande en toutes lettres — « pas de sound design, pas de
 * "whoosh", pas de pop, pas de tick, uniquement la voix de Robin » — et c'est
 * aussi une demande explicite et répétée de Robin, qui ajoute le sien
 * lui-même. Il n'y a donc pas de tableau de bruitages ici, et il ne doit pas
 * en apparaître.
 */

/**
 * Fenêtre tête caméra : rush brut à venir.
 *
 * Le brief demande le rush brut avec des légendes impact sur ces fenêtres, et
 * Robin a précisé qu'on n'y voit QUE la tête parlante et son texte — aucune
 * animation ne doit s'y poursuivre. La réserve est donc opaque et recouvre
 * entièrement l'animation.
 *
 * Elle rappelle aussi l'accessoire et le mot d'action à faire ressortir en
 * couleur : le brief relève ce principe sur la prise de Robin — un mot-clé mis
 * en avant par phrase — et demande de le garder pour les légendes.
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
        {beat.motCle && (
          <div style={{ fontSize: 28, letterSpacing: 3, color: M.bleuClair, marginTop: 30 }}>
            MOT ACCENTUÉ DANS LA LÉGENDE : {beat.motCle.toUpperCase()}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.fond }}>
    {/* <Audio src={staticFile(VOIX)} /> */}

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
