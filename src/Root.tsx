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
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
