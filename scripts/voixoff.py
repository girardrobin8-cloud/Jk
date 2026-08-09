#!/usr/bin/env python3
"""
Génère une voix off avec ElevenLabs.

    export ELEVENLABS_API_KEY=sk_...
    python3 scripts/voixoff.py "Bonjour, je m'appelle Robin, j'ai vingt ans." \
        --sortie public/voix/essai.mp3

Sans --voix, le script liste les voix du compte, retient les voix d'homme les
plus graves et prend la première. Avec --lister, il affiche seulement la liste
et s'arrête — utile pour choisir une fois pour toutes et figer l'identifiant.

Rien à installer : uniquement la bibliothèque standard, comme bruitages.py.

À savoir : ElevenLabs n'a pas de réglage de hauteur. Le grave se choisit par la
voix, pas par un paramètre — d'où le tri ci-dessous sur les étiquettes du
catalogue plutôt qu'un « pitch » qui n'existe pas.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.elevenlabs.io/v1"

# Le modèle multilingue est indispensable : les modèles anglais lisent le
# français avec un accent très marqué.
MODELE = "eleven_multilingual_v2"

# Étiquettes du catalogue qui trahissent une voix grave, de la plus explicite
# à la plus vague. Sert à classer les voix d'homme.
GRAVES = ("deep", "grave", "low", "husky", "raspy", "mature", "middle-aged", "old")


def appel(chemin, cle, donnees=None, brut=False):
    req = urllib.request.Request(
        API + chemin,
        data=json.dumps(donnees).encode() if donnees else None,
        headers={
            "xi-api-key": cle,
            **({"Content-Type": "application/json"} if donnees else {}),
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.read() if brut else json.load(r)
    except urllib.error.HTTPError as e:
        corps = e.read().decode(errors="replace")[:400]
        sys.exit(f"ElevenLabs a répondu {e.code} sur {chemin} :\n{corps}")
    except urllib.error.URLError as e:
        sys.exit(
            f"Impossible de joindre {API} : {e.reason}\n"
            "Si tu es derrière un proxy filtrant, l'hôte api.elevenlabs.io doit "
            "être autorisé."
        )


def voix_du_compte(cle):
    """Les voix disponibles, les hommes les plus graves en tête."""
    voix = appel("/voices", cle)["voices"]
    for v in voix:
        et = {k: str(x).lower() for k, x in (v.get("labels") or {}).items()}
        blob = " ".join(et.values())
        v["_homme"] = "male" in et.get("gender", "") and "female" not in et.get("gender", "")
        # Score : plus l'étiquette est explicitement grave, plus il remonte.
        v["_grave"] = next((len(GRAVES) - i for i, g in enumerate(GRAVES) if g in blob), 0)
        v["_desc"] = blob
    voix.sort(key=lambda v: (v["_homme"], v["_grave"]), reverse=True)
    return voix


def main():
    p = argparse.ArgumentParser()
    p.add_argument("texte", nargs="?", help="le texte à dire")
    p.add_argument("--voix", help="identifiant de voix ; sinon la plus grave trouvée")
    p.add_argument("--sortie", default="voixoff.mp3")
    p.add_argument("--lister", action="store_true", help="lister les voix et s'arrêter")
    p.add_argument("--stabilite", type=float, default=0.45)
    p.add_argument("--ressemblance", type=float, default=0.80)
    # Au-delà de ~0,3 le style ajoute des effets de diction qui rendent une
    # phrase courte inutilement théâtrale.
    p.add_argument("--style", type=float, default=0.15)
    a = p.parse_args()

    cle = os.environ.get("ELEVENLABS_API_KEY")
    if not cle:
        sys.exit("ELEVENLABS_API_KEY n'est pas définie.")

    voix = voix_du_compte(cle)

    if a.lister:
        for v in voix:
            marque = "grave" if v["_grave"] else ("homme" if v["_homme"] else "")
            print(f"{v['voice_id']}  {v['name']:<22} {marque:<6} {v['_desc']}")
        return

    if not a.texte:
        sys.exit("Donne le texte à dire (ou --lister).")

    vid = a.voix
    if not vid:
        candidates = [v for v in voix if v["_homme"]]
        if not candidates:
            sys.exit("Aucune voix d'homme dans le compte ; passe --voix explicitement.")
        choisie = candidates[0]
        vid = choisie["voice_id"]
        print(f"Voix retenue : {choisie['name']} ({vid}) — {choisie['_desc']}")

    audio = appel(
        f"/text-to-speech/{vid}",
        cle,
        {
            "text": a.texte,
            "model_id": MODELE,
            "voice_settings": {
                "stability": a.stabilite,
                "similarity_boost": a.ressemblance,
                "style": a.style,
                "use_speaker_boost": True,
            },
        },
        brut=True,
    )

    os.makedirs(os.path.dirname(a.sortie) or ".", exist_ok=True)
    with open(a.sortie, "wb") as f:
        f.write(audio)
    print(f"{a.sortie} — {len(audio) / 1024:.0f} Ko")


if __name__ == "__main__":
    main()
