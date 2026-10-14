// Charte graphique unique de tous les Reels : on ne la redéfinit nulle part
// ailleurs. Changer une couleur ici la change dans toutes les vidéos.

import "@fontsource/anton/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";

export const C = {
  fond: "#0A0A0A",
  fondCarte: "#141414",
  vert: "#2FBF71",
  vertClair: "#7FE3AE",
  vertSombre: "#0F3B27",
  rouge: "#E0655A",
  blanc: "#FFFFFF",
  gris: "#9A9A9A",
  grille: "rgba(127, 227, 174, 0.07)",
};

export const TITRE = '"Anton", "Liberation Sans Narrow", Impact, sans-serif';
export const TEXTE = '"Inter", "Liberation Sans", Helvetica, sans-serif';

export const FPS = 30;
export const LARGEUR = 1080;
export const HAUTEUR = 1920;

/**
 * Zones sûres (règle de forme n° 6) : les boutons d'Instagram et de TikTok
 * couvrent le bas et le bord droit. Le visuel vit entre HAUT et MILIEU, les
 * sous-titres juste en dessous, et rien ne descend sous BAS.
 */
export const ZONE = {
  haut: 230,
  milieu: 1050,
  sousTitres: 1180,
  bas: 1500,
  marge: 80,
  margeDroite: 150,
};

/** Secondes → images. */
export const s = (secondes: number) => Math.round(secondes * FPS);
