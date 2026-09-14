#!/usr/bin/env python3
"""
Vérifie qu'une clé API ElevenLabs est active, et ce qu'elle autorise.

Une clé ElevenLabs porte des permissions par périmètre : elle peut être
parfaitement valide et répondre malgré tout 401 sur un appel précis, faute du
bon périmètre. Un simple oui/non serait donc trompeur — le script interroge
plusieurs points d'entrée et rapporte le détail.

Rien n'est synthétisé ici : les sondes sont toutes en lecture seule, elles ne
consomment aucun crédit. Un vrai appel de synthèse vocale, lui, en consomme.

La clé est lue dans la variable d'environnement ELEVENLABS_API_KEY, à défaut
dans le fichier .env à la racine. Elle n'est jamais affichée en entier.

Usage :  python3 scripts/verif_elevenlabs.py

Codes de sortie : 0 clé active, 1 clé refusée, 2 clé absente, 3 API injoignable
"""

import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.elevenlabs.io"
VARIABLE = "ELEVENLABS_API_KEY"
RACINE = os.path.join(os.path.dirname(__file__), "..")

# (chemin, libellé, périmètre requis sur la clé)
SONDES = [
    ("/v1/user", "compte", "user_read"),
    ("/v1/voices", "voix", "voices_read"),
    ("/v1/models", "modèles", "models_read"),
]


def lire_cle():
    """Renvoie (clé, provenance), ou (None, None) si introuvable."""
    cle = os.environ.get(VARIABLE, "").strip()
    if cle:
        return cle, f"la variable d'environnement {VARIABLE}"

    chemin = os.path.join(RACINE, ".env")
    if os.path.exists(chemin):
        with open(chemin, encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if ligne.startswith(VARIABLE + "="):
                    valeur = ligne.split("=", 1)[1].strip().strip("\"'")
                    if valeur:
                        return valeur, "le fichier .env"
    return None, None


def appeler(chemin, cle):
    """Renvoie (code HTTP, corps décodé ou None). Sort en 3 si l'API est injoignable."""
    requete = urllib.request.Request(API + chemin, headers={"xi-api-key": cle})
    try:
        with urllib.request.urlopen(requete, timeout=15) as reponse:
            return reponse.status, json.load(reponse)
    except urllib.error.HTTPError as erreur:
        try:
            return erreur.code, json.load(erreur)
        except ValueError:  # corps vide ou non-JSON
            return erreur.code, None
    except urllib.error.URLError as erreur:
        print(f"API injoignable : {erreur.reason}", file=sys.stderr)
        sys.exit(3)


def milliers(valeur):
    return f"{valeur:,}".replace(",", " ")


def detail(chemin, corps):
    """Une précision utile tirée de la réponse, quand il y en a une."""
    if corps is None:
        return ""
    if chemin == "/v1/voices":
        return f"{len(corps.get('voices', []))} voix disponibles"
    if chemin == "/v1/models":
        return f"{len(corps)} modèles disponibles" if isinstance(corps, list) else ""
    return ""


def message_erreur(code, corps):
    """Traduit un échec en cause probable."""
    if code == 401:
        return "refusée — clé invalide, révoquée, ou périmètre manquant"
    if code == 403:
        return "interdite — périmètre manquant sur la clé"
    if code == 429:
        return "quota ou cadence dépassés"
    if isinstance(corps, dict):
        message = corps.get("detail")
        if isinstance(message, dict):
            message = message.get("message")
        if message:
            return str(message)
    return "échec"


def afficher_quota(corps):
    abonnement = (corps or {}).get("subscription") or {}
    tier = abonnement.get("tier")
    utilises = abonnement.get("character_count")
    plafond = abonnement.get("character_limit")

    if tier:
        print(f"\nAbonnement : {tier}")
    if isinstance(utilises, int) and isinstance(plafond, int) and plafond > 0:
        part = 100 * utilises / plafond
        restants = plafond - utilises
        print(
            f"Quota      : {milliers(utilises)} / {milliers(plafond)} caractères "
            f"({part:.0f} %), {milliers(restants)} restants"
        )


def main():
    cle, provenance = lire_cle()
    if not cle:
        print(f"Aucune clé trouvée : ni {VARIABLE}, ni .env à la racine.", file=sys.stderr)
        print("\n  export ELEVENLABS_API_KEY='sk_...'", file=sys.stderr)
        print("  python3 scripts/verif_elevenlabs.py", file=sys.stderr)
        return 2

    print(f"Clé lue depuis {provenance} (…{cle[-4:]}).\n")

    corps_compte = None
    acceptee = False
    for chemin, libelle, perimetre in SONDES:
        code, corps = appeler(chemin, cle)
        if code == 200:
            acceptee = True
            if chemin == "/v1/user":
                corps_compte = corps
            print(f"  {libelle:10s} 200  OK  {detail(chemin, corps)}".rstrip())
        else:
            print(f"  {libelle:10s} {code}  {message_erreur(code, corps)}  [{perimetre}]")

    if not acceptee:
        print("\nClé refusée partout : elle est invalide ou révoquée.")
        return 1

    afficher_quota(corps_compte)
    print("\nClé active.")
    if corps_compte is None:
        print("Le périmètre user_read manque : quota et abonnement restent invisibles.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
