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
