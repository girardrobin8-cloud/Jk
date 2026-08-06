// Palette et typographie partagées par toutes les scènes.

export const COLORS = {
  bg: "#08070F",
  bgLift: "#12101D",
  panel: "rgba(255, 255, 255, 0.04)",
  stroke: "rgba(255, 255, 255, 0.12)",

  // La caféine est toujours ambrée, l'adénosine toujours bleue.
  cafeine: "#F5A524",
  cafeineSoft: "#FFC661",
  adenosine: "#4DA3FF",
  adenosineSoft: "#8FC7FF",

  alerte: "#FF6B5A",
  calme: "#5CD6A9",

  text: "#F6F3EC",
  muted: "#98918A",
};

export const FONT = '"Liberation Sans", "DejaVu Sans", Helvetica, Arial, sans-serif';
export const FONT_MONO = '"DejaVu Sans Mono", "Liberation Mono", monospace';

export const FPS = 30;

// Chaque scène s'ouvre et se ferme sur du noir : c'est la transition.
export const FADE = 14;
