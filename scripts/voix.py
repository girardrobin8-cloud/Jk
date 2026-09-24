#!/usr/bin/env python3
"""
Génère une piste voix via l'API ElevenLabs, dans public/voix/.

Contrairement aux bruitages, la voix ne peut pas être synthétisée hors ligne :
elle passe par l'API, et chaque génération consomme des caractères du quota.
Le texte est donc figé dans TEXTE plutôt que saisi à la volée, pour qu'une
relance ne coûte que si le texte a réellement changé.

La clé est lue comme dans verif_elevenlabs.py : ELEVENLABS_API_KEY, à défaut
le .env à la racine. Elle n'est jamais affichée en entier.

Usage :  python3 scripts/voix.py
         python3 scripts/voix.py --voix Charlotte --sortie public/voix/intro.mp3
         python3 scripts/voix.py --lister        (voix disponibles, sans générer)

Codes de sortie : 0 succès, 1 refus de l'API, 2 clé absente, 3 API injoignable
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

from verif_elevenlabs import API, RACINE, appeler, lire_cle

TEXTE = (
    "Bonjour, je m'appelle Robin, j'ai vingt-trois ans. "
    "J'habite à Saint-Barthélemy et je suis heureux dans la vie."
)

# eleven_multilingual_v2 prononce correctement le français, y compris les
# liaisons et les nombres écrits en toutes lettres.
MODELE = "eleven_multilingual_v2"
SORTIE = os.path.join(RACINE, "public", "voix", "presentation.mp3")

# MP3 à débit constant : la durée se déduit exactement de la taille.
FORMAT = "mp3_44100_128"
DEBIT = 128_000


def lister_voix(cle):
    code, corps = appeler("/v1/voices", cle)
    if code != 200:
        return None, code
    return corps.get("voices", []), 200


def choisir_voix(voix, demandee):
    """Résout un nom ou un identifiant vers (identifiant, nom)."""
    if demandee:
        for v in voix:
            if demandee in (v.get("voice_id"), v.get("name")):
                return v["voice_id"], v.get("name", demandee)
        # Pas dans la bibliothèque : peut rester un identifiant valide.
        return demandee, demandee
    if not voix:
        return None, None
    premiere = voix[0]
    return premiere["voice_id"], premiere.get("name", "?")


def synthetiser(cle, voix_id, texte):
    """Renvoie les octets audio. Sort en 1 ou 3 en cas d'échec."""
    url = f"{API}/v1/text-to-speech/{voix_id}?output_format={FORMAT}"
    charge = json.dumps({"text": texte, "model_id": MODELE}).encode("utf-8")
    requete = urllib.request.Request(
        url,
        data=charge,
        headers={
            "xi-api-key": cle,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    try:
        with urllib.request.urlopen(requete, timeout=120) as reponse:
            return reponse.read()
    except urllib.error.HTTPError as erreur:
        corps = erreur.read().decode("utf-8", "replace")[:400]
        print(f"Synthèse refusée (HTTP {erreur.code}) : {corps}", file=sys.stderr)
        if erreur.code in (401, 403):
            print(
                "Le périmètre text_to_speech manque peut-être sur la clé.",
                file=sys.stderr,
            )
        sys.exit(1)
    except urllib.error.URLError as erreur:
        print(f"API injoignable : {erreur.reason}", file=sys.stderr)
        sys.exit(3)


def main():
    analyseur = argparse.ArgumentParser(description="Génère la voix via ElevenLabs.")
    analyseur.add_argument("--voix", help="nom ou identifiant de la voix")
    analyseur.add_argument("--texte", default=TEXTE, help="texte à dire")
    analyseur.add_argument("--sortie", default=SORTIE, help="fichier .mp3 à écrire")
    analyseur.add_argument(
        "--lister", action="store_true", help="liste les voix et s'arrête"
    )
    args = analyseur.parse_args()

    cle, provenance = lire_cle()
    if not cle:
        print("Aucune clé trouvée : ni ELEVENLABS_API_KEY, ni .env.", file=sys.stderr)
        return 2
    print(f"Clé lue depuis {provenance} (…{cle[-4:]}).")

    voix, code = lister_voix(cle)
    if voix is None:
        print(f"Lecture des voix impossible (HTTP {code}).", file=sys.stderr)
        return 1

    if args.lister:
        print(f"\n{len(voix)} voix disponibles :")
        for v in voix:
            print(f"  {v.get('name', '?'):24s} {v.get('voice_id', '')}")
        return 0

    voix_id, nom = choisir_voix(voix, args.voix)
    if not voix_id:
        print("Aucune voix dans la bibliothèque du compte.", file=sys.stderr)
        return 1

    print(f"Voix       : {nom}")
    print(f"Modèle     : {MODELE}")
    print(f"Caractères : {len(args.texte)} (décomptés du quota)")

    audio = synthetiser(cle, voix_id, args.texte)

    os.makedirs(os.path.dirname(args.sortie) or ".", exist_ok=True)
    with open(args.sortie, "wb") as f:
        f.write(audio)

    secondes = len(audio) * 8 / DEBIT
    print(f"\nÉcrit      : {args.sortie}")
    print(f"Durée      : {secondes:.1f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
