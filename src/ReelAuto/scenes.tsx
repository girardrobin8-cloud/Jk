import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, TEXTE, TITRE, ZONE } from "./charte";
import type { Scene } from "./schema";

// ---------------------------------------------------------------------------
// Briques communes

const useEntree = (delai = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delai, fps, config: { damping: 13, mass: 0.6 } });
};

/** Léger zoom continu : l'image n'est jamais figée (règle de forme n° 1). */
const Respire: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.04, 1.0]);
  return <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
};

/** Zone visuelle : entre le haut et les sous-titres, hors des boutons. */
const Zone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: ZONE.haut,
      bottom: 1920 - ZONE.milieu,
      left: ZONE.marge,
      right: ZONE.margeDroite,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const nettoyer = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Texte en Anton, majuscules, mots clés en vert. */
const Gros: React.FC<{ texte: string; motsCles?: string[]; taille?: number }> = ({ texte, motsCles = [], taille = 130 }) => {
  const cles = new Set(motsCles.map(nettoyer));
  return (
    <div style={{ fontFamily: TITRE, fontSize: taille, lineHeight: 1.02, color: C.blanc, textTransform: "uppercase", letterSpacing: 1 }}>
      {texte.split(" ").map((m, i) => (
        <span key={i} style={{ color: cles.has(nettoyer(m)) ? C.vert : C.blanc }}>
          {m}{" "}
        </span>
      ))}
    </div>
  );
};

const Petit: React.FC<{ children: React.ReactNode; delai?: number }> = ({ children, delai = 6 }) => {
  const e = useEntree(delai);
  return (
    <div style={{ fontFamily: TEXTE, fontWeight: 600, fontSize: 50, color: C.gris, marginTop: 36, opacity: e, transform: `translateY(${interpolate(e, [0, 1], [20, 0])}px)` }}>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Les scènes

const Accroche: React.FC<Extract<Scene, { type: "accroche" }>> = ({ texte, motsCles, video }) => {
  const e = useEntree();
  const frame = useCurrentFrame();
  // Petite secousse à l'arrivée : le pouce s'arrête.
  const secousse = interpolate(frame, [0, 3, 6, 9], [0, -8, 6, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {video ? (
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,0.65), transparent 45%)" }} />
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", top: ZONE.haut + 40, left: ZONE.marge, right: ZONE.margeDroite, textAlign: "center", transform: `scale(${interpolate(e, [0, 1], [1.4, 1])}) translateX(${secousse}px)`, opacity: e }}>
        <Gros texte={texte} motsCles={motsCles} taille={120} />
      </div>
    </AbsoluteFill>
  );
};

const Titre: React.FC<Extract<Scene, { type: "titre" }>> = ({ texte, sousTexte, motsCles }) => {
  const e = useEntree();
  return (
    <Respire>
      <Zone>
        <div style={{ transform: `scale(${interpolate(e, [0, 1], [0.7, 1])})`, opacity: e }}>
          <Gros texte={texte} motsCles={motsCles} />
        </div>
        {sousTexte ? <Petit>{sousTexte}</Petit> : null}
      </Zone>
    </Respire>
  );
};

const Point: React.FC<Extract<Scene, { type: "point" }>> = ({ numero, texte, sousTexte }) => {
  const e = useEntree();
  const t = useEntree(5);
  return (
    <Respire>
      <Zone>
        <div
          style={{
            width: 230,
            height: 230,
            borderRadius: 999,
            border: `10px solid ${C.vert}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: TITRE,
            fontSize: 150,
            color: C.vert,
            transform: `scale(${e}) rotate(${interpolate(e, [0, 1], [-90, 0])}deg)`,
            marginBottom: 50,
            boxShadow: `0 0 60px rgba(47,191,113,0.35)`,
          }}
        >
          {numero}
        </div>
        <div style={{ opacity: t, transform: `translateY(${interpolate(t, [0, 1], [40, 0])}px)` }}>
          <Gros texte={texte} taille={110} />
        </div>
        {sousTexte ? <Petit delai={10}>{sousTexte}</Petit> : null}
      </Zone>
    </Respire>
  );
};

const Chiffre: React.FC<Extract<Scene, { type: "chiffre" }>> = ({ valeur, prefixe, unite, legende }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = useEntree();
  const progression = interpolate(frame, [0, 0.8 * fps], [0, 1], { extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const affiche = typeof valeur === "number" ? Math.round(valeur * progression).toLocaleString("fr-FR") : valeur;
  return (
    <Respire>
      <Zone>
        <div style={{ fontFamily: TITRE, fontSize: 250, lineHeight: 1, color: C.vert, transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`, textShadow: "0 0 80px rgba(47,191,113,0.35)" }}>
          {prefixe}
          {affiche}
          <span style={{ fontSize: 110, color: C.blanc, marginLeft: 16 }}>{unite}</span>
        </div>
        <Petit delai={8}>{legende}</Petit>
      </Zone>
    </Respire>
  );
};

const Etude: React.FC<Extract<Scene, { type: "etude" }>> = ({ resultat, source, detail }) => {
  const e = useEntree();
  return (
    <Respire>
      <Zone>
        <div
          style={{
            backgroundColor: C.fondCarte,
            border: `4px solid ${C.vert}`,
            borderRadius: 36,
            padding: "56px 54px",
            width: "100%",
            textAlign: "left",
            transform: `translateY(${interpolate(e, [0, 1], [120, 0])}px) rotate(${interpolate(e, [0, 1], [-4, 0])}deg)`,
            opacity: e,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontFamily: TEXTE, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: C.vert, marginBottom: 26 }}>ÉTUDE</div>
          <div style={{ fontFamily: TEXTE, fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: C.blanc }}>{resultat}</div>
          <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.12)", margin: "34px 0 26px" }} />
          <div style={{ fontFamily: TEXTE, fontWeight: 600, fontSize: 36, color: C.gris }}>{source}</div>
          {detail ? <div style={{ fontFamily: TEXTE, fontWeight: 600, fontSize: 32, color: C.gris, marginTop: 10 }}>{detail}</div> : null}
        </div>
      </Zone>
    </Respire>
  );
};

const TONS = { vert: C.vert, rouge: C.rouge, gris: C.gris };

const Barres: React.FC<Extract<Scene, { type: "barres" }>> = ({ titre, barres }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...barres.map((b) => b.valeur));
  return (
    <Respire>
      <Zone>
        <Gros texte={titre} taille={96} />
        <div style={{ width: "100%", marginTop: 60, display: "flex", flexDirection: "column", gap: 44 }}>
          {barres.map((b, i) => {
            const p = interpolate(frame, [6 + i * 8, 6 + i * 8 + 0.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
            return (
              <div key={i} style={{ textAlign: "left" }}>
                <div style={{ fontFamily: TEXTE, fontWeight: 800, fontSize: 44, color: C.blanc, marginBottom: 14 }}>{b.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ height: 70, borderRadius: 14, width: `${(b.valeur / max) * 55 * p}%`, backgroundColor: TONS[b.ton] }} />
                  <div style={{ fontFamily: TITRE, fontSize: 64, color: TONS[b.ton], opacity: p }}>{b.affichage ?? b.valeur}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Zone>
    </Respire>
  );
};

const PALIERS: Record<string, string> = { S: C.vert, A: C.vertClair, B: "#E8B62C", C: C.rouge, D: C.gris };

const Classement: React.FC<Extract<Scene, { type: "classement" }>> = ({ titre, lignes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Respire>
      <Zone>
        <Gros texte={titre} taille={90} />
        <div style={{ width: "100%", marginTop: 50, display: "flex", flexDirection: "column", gap: 22 }}>
          {lignes.map((l, i) => {
            const e = spring({ frame: frame - 6 - i * 7, fps, config: { damping: 14 } });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, opacity: e, transform: `translateX(${interpolate(e, [0, 1], [-200, 0])}px)` }}>
                <div style={{ width: 110, height: 96, borderRadius: 16, backgroundColor: PALIERS[l.palier] ?? C.gris, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITRE, fontSize: 70, color: C.fond }}>
                  {l.palier}
                </div>
                <div style={{ fontFamily: TEXTE, fontWeight: 800, fontSize: 50, color: C.blanc, textAlign: "left" }}>{l.texte}</div>
              </div>
            );
          })}
        </div>
      </Zone>
    </Respire>
  );
};

const Cta: React.FC<Extract<Scene, { type: "cta" }>> = ({ mot, texte, sousTexte }) => {
  const frame = useCurrentFrame();
  const e = useEntree();
  const pulse = 1 + 0.03 * Math.sin(frame / 5);
  return (
    <Zone>
      <div style={{ fontFamily: TEXTE, fontWeight: 800, fontSize: 64, color: C.blanc, opacity: e }}>{texte}</div>
      <div
        style={{
          marginTop: 30,
          padding: "26px 60px",
          borderRadius: 28,
          backgroundColor: C.vert,
          fontFamily: TITRE,
          fontSize: 140,
          color: C.fond,
          transform: `scale(${e * pulse})`,
          boxShadow: "0 0 90px rgba(47,191,113,0.5)",
        }}
      >
        {mot}
      </div>
      <Petit delai={8}>{sousTexte}</Petit>
    </Zone>
  );
};

export const SceneVue: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "accroche":
      return <Accroche {...scene} />;
    case "titre":
      return <Titre {...scene} />;
    case "point":
      return <Point {...scene} />;
    case "chiffre":
      return <Chiffre {...scene} />;
    case "etude":
      return <Etude {...scene} />;
    case "barres":
      return <Barres {...scene} />;
    case "classement":
      return <Classement {...scene} />;
    case "cta":
      return <Cta {...scene} />;
  }
};
