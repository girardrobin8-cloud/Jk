import "./index.css";
import { Composition } from "remotion";
import { Cafeine, DUREE_TOTALE } from "./Cafeine";
import { S1Titre } from "./Cafeine/scenes/S1Titre";
import { S8Energisante } from "./Cafeine/scenes/S8Energisante";
import { Adaptation } from "./Metabolisme/Adaptation";
import { Montage, MONTAGE_FRAMES } from "./Metabolisme/Montage";
import { ANIM_FIN, s as sec } from "./Metabolisme/reperes";
import { Montage as MuscleMontage, MONTAGE_FRAMES as MUSCLE_FRAMES } from "./Muscle/Montage";
import { Montage as ProtMontage, MONTAGE_FRAMES as PROT_FRAMES } from "./Proteines/Montage";
import { Montage as MontreMontage, MONTAGE_FRAMES as MONTRE_FRAMES } from "./Montre/Montage";
import {
  Montage as PresentationMontage,
  MONTAGE_FRAMES as PRESENTATION_FRAMES,
} from "./Presentation/Montage";
import { Plage, PLAGE_FRAMES } from "./Plage/Plage";
import { Carte, CARTE_FRAMES } from "./Carte/Carte";
import {
  Montage as Jour9Montage,
  MONTAGE_FRAMES as JOUR9_FRAMES,
} from "./Jour9/Montage";
import {
  Montage as Jour7Montage,
  MONTAGE_FRAMES as JOUR7_FRAMES,
} from "./Jour7/Montage";
import {
  Montage as Jour6Montage,
  MONTAGE_FRAMES as JOUR6_FRAMES,
} from "./Jour6/Montage";
import {
  Montage as Jour5Montage,
  MONTAGE_FRAMES as JOUR5_FRAMES,
} from "./Jour5/Montage";
import {
  Montage as Jour4Montage,
  MONTAGE_FRAMES as JOUR4_FRAMES,
} from "./Jour4/Montage";
import {
  Montage as Jour3Montage,
  MONTAGE_FRAMES as JOUR3_FRAMES,
} from "./Jour3/Montage";
import {
  Montage as Jour2Montage,
  MONTAGE_FRAMES as JOUR2_FRAMES,
} from "./Jour2/Montage";
import {
  Montage as Jour1Montage,
  MONTAGE_FRAMES as JOUR1_FRAMES,
} from "./Jour1/Montage";
import {
  Montage as NeatMontage,
  MONTAGE_FRAMES as NEAT_FRAMES,
} from "./Neat/Montage";
import { Miniature as NeatMiniature } from "./Neat/Miniature";
import {
  Montage as AspartameMontage,
  MONTAGE_FRAMES as ASPARTAME_FRAMES,
} from "./Aspartame/Montage";
import {
  Montage as RecompMontage,
  MONTAGE_FRAMES as RECOMP_FRAMES,
} from "./Recomp/Montage";
import {
  Montage as SommeilMontage,
  MONTAGE_FRAMES as SOMMEIL_FRAMES,
} from "./Sommeil/Montage";
import {
  Montage as SucreMontage,
  MONTAGE_FRAMES as SUCRE_FRAMES,
} from "./Sucre/Montage";
import {
  Montage as SaintBarthMontage,
  MONTAGE_FRAMES as SAINTBARTH_FRAMES,
} from "./SaintBarth/Montage";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reel Jour 9 « immobile, c'est peut-être ta pire option » — 34,00 s.
          Structure de rythme du brief : hook de 2,8 s, un seul retour caméra
          entre les deux blocs animés, CTA en caméra. Seuls B2 et B4 ont un
          panneau. La prise fait 36,6 s au lieu des 45 s visées, toutes les
          bornes sont donc avancées.
          Média : public/rushes/jour9_resserre.mp4 (hors dépôt), normalisé de
          -8,9 à -14 LUFS — la prise écrêtait à +1,1 dBFS.
          npx remotion render Jour9 */}
      <Composition
        id="Jour9"
        component={Jour9Montage}
        durationInFrames={JOUR9_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 7 « aucune diète ne marche sans ça » — 46,58 s.
          Zones « tête parlante » jamais animées : seuls B2 et B4 ont un
          panneau. Resserrement poussé à 0,24 s de seuil pour 0,16 s gardées,
          comme le brief le demande — quinze coupes, 2,75 s retirées.
          Échelle typographique fermée à cinq corps (consigne 5 du brief).
          Média : public/rushes/jour7_resserre.mp4 (hors dépôt), normalisé à
          -14 LUFS, plafond -1 dBTP.
          npx remotion render Jour7 */}
      <Composition
        id="Jour7"
        component={Jour7Montage}
        durationInFrames={JOUR7_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 6 « les courbatures » — 47,96 s.
          Règle permanente du brief : les zones « tête parlante » sont des
          ESPACES RÉSERVÉS, l'animation n'y dessine rien et le CTA reste en
          caméra. L'animation ne couvre donc que B2 et B4 ; les trois autres
          fenêtres laissent passer le rush tel quel.
          Média : public/rushes/jour6_resserre.mp4 (hors dépôt), blancs
          resserrés et niveau ramené de -8,9 à -14 LUFS — la prise écrêtait.
          npx remotion render Jour6 */}
      <Composition
        id="Jour6"
        component={Jour6Montage}
        durationInFrames={JOUR6_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 5 « stagner, c'est ce qui attend ton programme » — 49,96 s.
          SANS TOURNAGE : l'export livré est un fond noir avec les sous-titres.
          Le découpage du brief est respecté — deux blocs caméra (B1, B3), deux
          animés, et la fin reste en motion design — mais les quatre sont animés
          faute d'image ; voir CAMERA dans reperes.ts.
          Média : public/rushes/jour5_resserre.mp4 (hors dépôt).
          npx remotion render Jour5 */}
      <Composition
        id="Jour5"
        component={Jour5Montage}
        durationInFrames={JOUR5_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 4 « tu n'as pas 30 minutes chrono » — 88,08 s.
          SANS TOURNAGE, comme le Jour 3 : l'export livré est un fond noir avec
          les sous-titres. L'animation couvre toute la durée ; voir CAMERA dans
          reperes.ts pour rendre hook et CTA à la caméra en une ligne.
          Bornes LUES sur les sous-titres incrustés, transposées par mappe().
          Média : public/rushes/jour4_resserre.mp4 (hors dépôt).
          npx remotion render Jour4 */}
      <Composition
        id="Jour4"
        component={Jour4Montage}
        durationInFrames={JOUR4_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 3 « si tu dors 5h, ça ne sert à rien » — 51,54 s.
          SANS TOURNAGE : Robin a livré un export audio sur fond noir, pas sa
          vidéo. L'animation couvre donc toute la durée, hook et CTA compris ;
          voir CAMERA dans reperes.ts pour les rendre à la caméra en une ligne.
          Bornes LUES sur les sous-titres incrustés, transposées par mappe().
          Média : public/rushes/jour3_resserre.mp4 (hors dépôt).
          npx remotion render Jour3 */}
      <Composition
        id="Jour3"
        component={Jour3Montage}
        durationInFrames={JOUR3_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 2 « combien de séries par semaine » — 84,93 s.
          Rush aux blancs resserrés + motion design par-dessus sur B2..B12.
          Bornes LUES sur les sous-titres incrustés, puis transposées par
          mappe() dans le temps du montage (voir reperes.ts).
          Média : public/rushes/jour2_resserre.mp4, produit par
          `python3 scripts/resserrer.py` (hors dépôt).
          npx remotion render Jour2 */}
      <Composition
        id="Jour2"
        component={Jour2Montage}
        durationInFrames={JOUR2_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel Jour 1 « arrêter le riz pour sécher » — 56,84 s.
          Rush nettoyé + motion design par-dessus sur B2..B6.
          Bornes MESURÉES : python3 scripts/caler.py <wav> jour1
          Média : public/rushes/jour1.mp4 (hors dépôt, voir reperes.ts).
          npx remotion render Jour1 */}
      <Composition
        id="Jour1"
        component={Jour1Montage}
        durationInFrames={JOUR1_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Miniature 9:16 de la vidéo NEAT — image fixe.
          npx remotion still NeatMiniature miniature.png */}
      <Composition
        id="NeatMiniature"
        component={NeatMiniature}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « NEAT / la dépense calorique cachée » — 64,8 s.
          SANS VOIX : script original, prise pas encore enregistrée. Bornes
          PRÉDITES d'après le débit horloge des trois prises mesurées — lire
          l'avertissement en tête de src/Neat/reperes.ts. Quand la prise
          arrivera : python3 scripts/caler.py <prise.wav> neat
          npx remotion render Neat */}
      <Composition
        id="Neat"
        component={NeatMontage}
        durationInFrames={NEAT_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Aspartame / Coca Zero » — 39,82 s, calé sur la prise réelle.
          Bornes MESURÉES : python3 scripts/caler.py <wav> aspartame.
          Voix : public/voix/aspartame.mp4, copiée sans réencodage.
          npx remotion render Aspartame */}
      <Composition
        id="Aspartame"
        component={AspartameMontage}
        durationInFrames={ASPARTAME_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Recomposition corporelle » — 57 s, calé sur la prise réelle.
          Bornes MESURÉES : python3 scripts/caler.py <wav> recomp.
          Voix : public/voix/recomp.mp4, copiée sans réencodage.
          npx remotion render Recomp */}
      <Composition
        id="Recomp"
        component={RecompMontage}
        durationInFrames={RECOMP_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Le sommeil décide si tu perds du gras ou du muscle » — 55 s.
          SANS VOIX : bornes du brief, à recaler (src/Sommeil/reperes.ts).
          npx remotion render Sommeil */}
      <Composition
        id="Sommeil"
        component={SommeilMontage}
        durationInFrames={SOMMEIL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Le sucre n'est pas (que) le problème » — 50 s, pixel-art sur fond
          clair. SANS VOIX : bornes du brief, à recaler (src/Sucre/reperes.ts).
          npx remotion render Sucre */}
      <Composition
        id="Sucre"
        component={SucreMontage}
        durationInFrames={SUCRE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « L'île la plus riche du monde » — Saint-Barthélemy, 32 s.
          SANS VOIX : la prise n'est pas enregistrée, les bornes viennent du
          brief et sont à recaler dessus (voir src/SaintBarth/reperes.ts).
          Géographie préparée par `node scripts/antilles.mjs`.
          npx remotion render SaintBarth */}
      <Composition
        id="SaintBarth"
        component={SaintBarthMontage}
        durationInFrames={SAINTBARTH_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Grande-Bretagne, Royaume-Uni, Îles Britanniques » — trois
          définitions emboîtées sur une carte réelle (Natural Earth).
          Tracés préparés par `node scripts/carte.mjs`.
          npx remotion render Carte */}
      <Composition
        id="Carte"
        component={Carte}
        durationInFrames={CARTE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Une personne marche au bord de l'eau, au crépuscule. Entièrement
          calculé : cycle de marche procédural, marée qui efface les empreintes.
          npx remotion render Plage */}
      <Composition
        id="Plage"
        component={Plage}
        durationInFrames={PLAGE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Bonjour, je m'appelle Robin » — présentation calée sur une voix
          TÉMOIN synthétique (scripts/voix_hors_ligne.py), en attendant la
          prise ElevenLabs. Voir src/Presentation/Montage.tsx pour la
          substitution.
          npx remotion render Presentation */}
      <Composition
        id="Presentation"
        component={PresentationMontage}
        durationInFrames={PRESENTATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Ta montre surestime tes calories » — motion design en beats,
          sans audio (la voix n'est pas encore enregistrée).
          npx remotion render Montre */}
      <Composition
        id="Montre"
        component={MontreMontage}
        durationInFrames={MONTRE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « Seul le total quotidien compte » — animation d'un seul tenant.
          npx remotion render Proteines */}
      <Composition
        id="Proteines"
        component={ProtMontage}
        durationInFrames={PROT_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* « La mémoire musculaire » — motion design calé sur la voix.
          npx remotion render MemoireMusculaire */}
      <Composition
        id="MemoireMusculaire"
        component={MuscleMontage}
        durationInFrames={MUSCLE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Montage complet « Pourquoi ta perte de poids stagne ».
          npx remotion render Metabolisme */}
      <Composition
        id="Metabolisme"
        component={Montage}
        durationInFrames={MONTAGE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* L'animation seule, pour la régler sans relire les rushes */}
      <Composition
        id="MetabolismeAnimation"
        component={Adaptation}
        durationInFrames={sec(ANIM_FIN)}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Étiquette d'une boisson énergisante, format vertical.
          npx remotion render Energisante */}
      <Composition
        id="Energisante"
        component={S8Energisante}
        durationInFrames={355}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Scène d'ouverture seule, au format vertical TikTok / Reels.
          npx remotion render CafeineTitreVertical */}
      <Composition
        id="CafeineTitreVertical"
        component={S1Titre}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* npx remotion render Cafeine */}
      <Composition
        id="Cafeine"
        component={Cafeine}
        durationInFrames={DUREE_TOTALE}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
