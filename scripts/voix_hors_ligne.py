#!/usr/bin/env python3
"""
Génère une voix témoin hors ligne, dans public/voix/.

Complément de voix.py, pas son remplaçant : la synthèse est ici formantique
(espeak-ng), donc nettement robotique. Elle ne remplace pas ElevenLabs au
montage final — elle sert à caler l'animation sur une piste de la bonne durée
sans dépendre du réseau ni consommer de quota. La vraie voix se substitue à
elle plus tard, à durée égale.

Le débit est ajusté automatiquement pour atteindre la durée visée : on mesure
une première passe, puis on corrige, la durée étant inversement proportionnelle
au débit. Une seule itération suffit à tomber à quelques centièmes.

Dépendance :  pip install espeakng-loader

Usage :  python3 scripts/voix_hors_ligne.py
         python3 scripts/voix_hors_ligne.py --duree 12
         python3 scripts/voix_hors_ligne.py --texte "..." --sortie public/voix/x.wav
"""

import argparse
import ctypes
import os
import sys
import wave

try:
    import espeakng_loader
except ImportError:
    sys.exit("Dépendance manquante :  pip install espeakng-loader")

RACINE = os.path.join(os.path.dirname(__file__), "..")
SORTIE = os.path.join(RACINE, "public", "voix", "presentation.wav")

TEXTE = (
    "Bonjour, je m'appelle Robin, j'ai vingt-trois ans. "
    "J'habite à Saint-Barthélemy, une petite île des Caraïbes "
    "où le soleil ne manque jamais. "
    "J'aime la mer, les journées simples, et le temps passé avec mes proches. "
    "Je travaille, j'apprends, et j'essaie d'avancer un peu chaque jour. "
    "Je suis heureux dans la vie, et j'avais envie de vous le dire."
)

DUREE = 17.0
DEBIT_REPERE = 150  # mots/minute, point de départ de la mesure
DEBIT_MIN, DEBIT_MAX = 105, 195  # hors de cette plage, l'élocution se dégrade

AUDIO_OUTPUT_RETRIEVAL = 1
ESPEAK_CHARS_UTF8 = 1
ESPEAK_RATE = 1

RAPPEL = ctypes.CFUNCTYPE(
    ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p
)


class Moteur:
    """Enveloppe ctypes autour de libespeak-ng, en mode récupération."""

    def __init__(self, langue="fr"):
        self.lib = ctypes.CDLL(espeakng_loader.get_library_path())
        self.lib.espeak_Initialize.restype = ctypes.c_int
        self.taux = self.lib.espeak_Initialize(
            AUDIO_OUTPUT_RETRIEVAL, 0, espeakng_loader.get_data_path().encode(), 0
        )
        if self.taux <= 0:
            sys.exit("Initialisation d'espeak-ng impossible.")
        if self.lib.espeak_SetVoiceByName(langue.encode()) != 0:
            sys.exit(f"Voix « {langue} » indisponible.")

        self._tampon = []
        # La référence est gardée sur l'instance : sans cela le trampoline
        # ctypes serait ramassé par le GC pendant la synthèse.
        self._rappel = RAPPEL(self._collecter)
        self.lib.espeak_SetSynthCallback(self._rappel)

    def _collecter(self, wav, n, evenements):
        if wav and n > 0:
            self._tampon.extend(wav[:n])
        return 0

    def dire(self, texte, debit):
        """Renvoie les échantillons synthétisés au débit demandé."""
        self._tampon = []
        self.lib.espeak_SetParameter(ESPEAK_RATE, int(debit), 0)
        octets = texte.encode("utf-8")
        self.lib.espeak_Synth(
            octets, len(octets) + 1, 0, 0, 0, ESPEAK_CHARS_UTF8, None, None
        )
        self.lib.espeak_Synchronize()
        return list(self._tampon)


def ecrire(chemin, echantillons, taux):
    os.makedirs(os.path.dirname(chemin) or ".", exist_ok=True)
    donnees = bytearray()
    for v in echantillons:
        donnees += int(v).to_bytes(2, "little", signed=True)
    with wave.open(chemin, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taux)
        w.writeframes(bytes(donnees))


def main():
    a = argparse.ArgumentParser(description="Voix témoin hors ligne (espeak-ng).")
    a.add_argument("--texte", default=TEXTE)
    a.add_argument("--sortie", default=SORTIE)
    a.add_argument("--duree", type=float, default=DUREE, help="durée visée, secondes")
    a.add_argument("--langue", default="fr")
    args = a.parse_args()

    moteur = Moteur(args.langue)

    repere = moteur.dire(args.texte, DEBIT_REPERE)
    duree_repere = len(repere) / moteur.taux
    print(f"Passe de mesure : {duree_repere:.1f} s à {DEBIT_REPERE} mots/min")

    # durée ∝ 1/débit : le débit visé se déduit d'une simple proportion.
    vise = DEBIT_REPERE * duree_repere / args.duree
    debit = max(DEBIT_MIN, min(DEBIT_MAX, round(vise)))

    if debit == DEBIT_REPERE:
        echantillons = repere
    else:
        echantillons = moteur.dire(args.texte, debit)

    duree = len(echantillons) / moteur.taux
    ecrire(args.sortie, echantillons, moteur.taux)

    print(f"Débit retenu    : {debit} mots/min")
    print(f"Écrit           : {args.sortie}")
    print(f"Durée           : {duree:.1f} s (visée {args.duree:.0f} s)")

    if round(vise) != debit:
        print(
            f"\nLe débit idéal serait {vise:.0f} mots/min, hors plage lisible "
            f"[{DEBIT_MIN}, {DEBIT_MAX}].\n"
            f"Pour tenir {args.duree:.0f} s sans dégrader l'élocution, "
            f"{'allongez' if vise < DEBIT_MIN else 'raccourcissez'} le texte."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
