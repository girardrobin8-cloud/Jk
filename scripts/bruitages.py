#!/usr/bin/env python3
"""
Génère les bruitages de l'animation, dans public/sfx/.

Tout est synthétisé ici plutôt que pris dans une banque de sons : des sons
d'interface courts et neutres accompagnent mieux un graphique qu'un bruitage
enregistré, et ils restent libres de droits.

Usage :  python3 scripts/bruitages.py
"""

import array
import math
import os
import random
import wave

SR = 44100
SORTIE = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")

random.seed(7)  # rendu reproductible


def ecrire(nom, ech, crete=0.72):
    """Normalise puis écrit un WAV mono 16 bits."""
    m = max(abs(v) for v in ech) or 1.0
    g = crete / m
    data = array.array("h", (int(max(-1.0, min(1.0, v * g)) * 32767) for v in ech))
    chemin = os.path.join(SORTIE, nom)
    with wave.open(chemin, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  {nom:20s} {len(ech)/SR:.2f}s")


def n(secondes):
    return int(SR * secondes)


def decroissance(i, total, tau=0.25):
    """Enveloppe exponentielle décroissante, normalisée sur la durée."""
    return math.exp(-(i / total) / tau)


def attaque(i, duree_attaque):
    return min(1.0, i / max(1, duree_attaque))


def passe_bas(ech, a):
    """Filtre à un pôle. `a` peut être un flottant ou une fonction de i."""
    out, y = [], 0.0
    for i, x in enumerate(ech):
        coef = a(i) if callable(a) else a
        y += coef * (x - y)
        out.append(y)
    return out


def souffle(duree, montant=True):
    """Bruit filtré à coupure glissante : le classique « whoosh »."""
    total = n(duree)
    brut = [random.uniform(-1, 1) for _ in range(total)]

    def coupure(i):
        t = i / total
        return 0.02 + (0.34 * t if montant else 0.34 * (1 - t))

    filtre = passe_bas(brut, coupure)
    # Retrait des très basses fréquences, sinon ça gronde sous la voix.
    grave = passe_bas(filtre, 0.0016)
    corps = [filtre[i] - grave[i] for i in range(total)]
    return [corps[i] * math.sin(math.pi * (i / total)) ** 1.6 for i in range(total)]


def blip(f0, f1, duree, tau=0.28, harmonique=0.35):
    """Petite note glissante, pour une apparition."""
    total = n(duree)
    out, phase = [], 0.0
    for i in range(total):
        t = i / total
        f = f0 + (f1 - f0) * t
        phase += 2 * math.pi * f / SR
        v = math.sin(phase) + harmonique * math.sin(2 * phase)
        out.append(v * decroissance(i, total, tau) * attaque(i, n(0.004)))
    return out


def marche(duree=0.24):
    """Bruit sourd descendant : une marche de l'escalier."""
    total = n(duree)
    out, phase = [], 0.0
    clic = n(0.004)
    for i in range(total):
        t = i / total
        f = 320 - 150 * t
        phase += 2 * math.pi * f / SR
        v = math.sin(phase) * decroissance(i, total, 0.22)
        if i < clic:  # transitoire d'attaque
            v += random.uniform(-1, 1) * 0.5 * (1 - i / clic)
        out.append(v * attaque(i, n(0.002)))
    return passe_bas(out, 0.28)


def clic(duree=0.07):
    """
    Clic discret, pour une incrustation de texte.

    Volontairement brillant : posé sous la parole, un clic sourd se fait
    entièrement masquer. En le gardant dans l'aigu, il passe au-dessus de la
    voix sans avoir à monter le volume.
    """
    total = n(duree)
    brut = [random.uniform(-1, 1) * decroissance(i, total, 0.07) for i in range(total)]
    filtre = passe_bas(brut, 0.55)
    grave = passe_bas(filtre, 0.05)
    return [filtre[i] - grave[i] for i in range(total)]


def carillon(duree=1.0):
    """Accord chaud et résolutif, pour le bandeau final."""
    total = n(duree)
    partiels = [(523.25, 1.0, 0.30), (784.0, 0.55, 0.26), (1046.5, 0.28, 0.20)]
    out = []
    for i in range(total):
        v = 0.0
        for f, amp, tau in partiels:
            v += amp * math.sin(2 * math.pi * f * i / SR) * decroissance(i, total, tau)
        out.append(v * attaque(i, n(0.008)))
    return out


if __name__ == "__main__":
    os.makedirs(SORTIE, exist_ok=True)
    print("Génération des bruitages :")
    ecrire("whoosh-in.wav", souffle(0.55, montant=True))
    ecrire("whoosh-out.wav", souffle(0.45, montant=False), crete=0.6)
    ecrire("apparition.wav", blip(420, 880, 0.22))
    ecrire("pop.wav", blip(700, 560, 0.15, tau=0.2, harmonique=0.2))
    ecrire("marche.wav", marche())
    ecrire("clic.wav", clic(), crete=0.95)
    ecrire("carillon.wav", carillon())
