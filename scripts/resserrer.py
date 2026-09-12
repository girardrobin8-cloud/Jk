#!/usr/bin/env python3
"""Resserre les blancs d'un rush, et publie la table de correspondance des temps.

Pourquoi un script et pas une commande ffmpeg à la main : couper la piste
DÉPLACE tout ce qui vient après. Les repères d'animation, eux, ont été relevés
sur les sous-titres du rush D'ORIGINE — les réécrire à la main après chaque
coupe serait le meilleur moyen de les désynchroniser en silence.

Le script écrit donc, à côté du média resserré, un module TypeScript qui décrit
les segments conservés. Le montage garde ses repères en temps rush et les fait
passer par `mappe()` : une nouvelle coupe ne demande qu'une régénération, pas
une relecture.

    python3 scripts/resserrer.py public/rushes/jour2.mp4 \
        public/rushes/jour2_resserre.mp4 src/Jour2/coupes.ts

Règle appliquée : tout silence de plus de SEUIL est ramené à GARDE, en
conservant son DÉBUT — la respiration reste, l'attente disparaît. Les coupes
tombent sur des frontières d'image, et sont appliquées à l'image ET au son par
le même filtre, donc rien ne peut se désynchroniser.
"""
import math
import re
import subprocess
import sys

import imageio_ffmpeg

FPS = 30
BRUIT = "-28dB"     # plancher de détection, calé sur le souffle de la pièce
MINI = 0.30         # en deçà, ce n'est pas un blanc mais une articulation
SEUIL = 0.36        # au-delà, on resserre
GARDE = 0.24        # ce qu'il reste d'un blanc resserré


def silences(exe, entree):
    sortie = subprocess.run(
        [exe, "-nostats", "-i", entree, "-af", f"silencedetect=noise={BRUIT}:d={MINI}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    fins = re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", sortie)
    return [(float(f) - float(d), float(f)) for f, d in fins]


def segments(entree, duree):
    """Les tranches à CONSERVER, bornes alignées sur l'image."""
    coupes = []
    for a, b in entree:
        if b - a > SEUIL:
            coupes.append((round((a + GARDE) * FPS) / FPS, round(b * FPS) / FPS))
    gardes, curseur = [], 0.0
    for a, b in coupes:
        if a > curseur:
            gardes.append((curseur, a))
        curseur = b
    gardes.append((curseur, math.floor(duree * FPS) / FPS))
    return [(a, b) for a, b in gardes if b - a > 1 / FPS]


def duree_de(exe, chemin):
    sortie = subprocess.run([exe, "-i", chemin], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", sortie).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def main():
    entree, sortie, module = sys.argv[1], sys.argv[2], sys.argv[3]
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    duree = duree_de(exe, entree)
    gardes = segments(silences(exe, entree), duree)
    retire = duree - sum(b - a for a, b in gardes)
    print(f"{len(gardes)} tranches conservées, {retire:.2f} s retirées, "
          f"{duree:.2f} s → {duree - retire:.2f} s")

    # La sélection image porte sur le NUMÉRO d'image, pas sur la seconde.
    # `between(t,…)` compare des flottants à des estampilles et gardait une
    # image de trop ici, une de moins là : le fichier produit et la table des
    # temps divergeaient de cinq images. Sur des entiers, la question ne se
    # pose plus — le nombre d'images conservées est exactement celui écrit
    # dans la table.
    bornes = [(math.ceil(a * FPS - 1e-6), math.floor(b * FPS + 1e-6) - 1) for a, b in gardes]
    vexpr = "+".join(f"between(n,{k0},{k1})" for k0, k1 in bornes)
    aexpr = "+".join(f"between(t,{k0 / FPS:.6f},{(k1 + 1) / FPS:.6f})" for k0, k1 in bornes)
    subprocess.run([
        exe, "-y", "-i", entree,
        # `FRAME_RATE` vaut ici la cadence DEVINÉE par le filtre, pas celle du
        # rush : sans la cadence écrite en clair, ffmpeg sortait du 25 i/s et
        # étirait tout le montage de 4 %.
        "-vf", f"select='{vexpr}',setpts=N/{FPS}/TB",
        "-af", f"aselect='{aexpr}',asetpts=N/SR/TB",
        "-r", str(FPS), "-fps_mode", "cfr",
        "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        sortie,
    ], check=True, capture_output=True)

    # La table publiée compte des IMAGES, pas des secondes. `between` est
    # inclusif et ses bornes ne tombent pas exactement sur une image : le
    # nombre d'images réellement conservées par tranche se calcule, il ne se
    # devine pas. Compté ainsi, le total tombe à l'image près sur la durée du
    # fichier produit — sans quoi le montage dérivait de quelques images sur la
    # fin, et les animations avec lui.
    images, cumul = [], 0
    for (a, _), (k0, k1) in zip(gardes, bornes):
        images.append((k0 / FPS, k1 - k0 + 1))
        cumul += k1 - k0 + 1
    lignes = ",\n".join(f"  [{a:.6f}, {n}]" for a, n in images)
    with open(module, "w", encoding="utf-8") as f:
        f.write(f'''/**
 * GÉNÉRÉ par scripts/resserrer.py — ne pas modifier à la main.
 *
 * Les tranches du rush d'origine conservées au montage : pour chacune, sa
 * seconde de départ DANS LE RUSH et son nombre d'images. Les blancs de plus de
 * {SEUIL:.2f} s ont été ramenés à {GARDE:.2f} s, soit {retire:.2f} s retirées, {duree:.2f} s → {cumul / FPS:.2f} s.
 *
 * La coupe est appliquée à l'image et au son par le même filtre, donc les
 * sous-titres incrustés restent calés sur la voix. Le total ci-dessous tombe à
 * l'image près sur la durée du fichier produit.
 */

export const FPS = {FPS};

export const SEGMENTS: [number, number][] = [
{lignes},
];

/** Durée du montage resserré, en secondes. */
export const DUREE_MONTEE = {cumul / FPS:.4f};
''')
    print("écrit :", sortie, "et", module)


if __name__ == "__main__":
    main()
