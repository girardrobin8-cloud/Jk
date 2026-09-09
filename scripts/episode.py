#!/usr/bin/env python3
"""
Crée et vérifie les dossiers d'épisode de episodes/.

    python3 scripts/episode.py nouveau ep_002 --titre "Le sucre du soir"
    python3 scripts/episode.py verifier ep_001
    python3 scripts/episode.py lister

La structure d'un épisode et l'ordre de fabrication sont décrits dans
episodes/README.md ; ce script ne fait que la poser et la relire.

Rien à installer : uniquement la bibliothèque standard, comme les autres
scripts du dépôt.
"""

import argparse
import json
import os
import re
import sys

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "episodes")

# Les fichiers versionnés, dans l'ordre de fabrication. Ce sont eux qui doivent
# exister pour qu'un épisode soit relisible.
TEXTES = ["brief.json", "lyrics.txt", "song_plan.json", "timeline.json", "metadata.json"]

# Les médias : régénérables, hors dépôt, absents tant que l'étape n'est pas
# faite. Leur absence n'est jamais une erreur.
MEDIAS = ["song.mp3", "images", "clips", "final.mp4", "thumbnail.png"]

FPS = 30
LARGEUR, HAUTEUR = 1080, 1920

# Tolérance sur les raccords : un dixième d'image, de quoi absorber les
# arrondis d'écriture sans laisser passer un vrai trou.
EPSILON = 0.5 / FPS


def chemin(episode, *suite):
    return os.path.normpath(os.path.join(RACINE, episode, *suite))


def lire_json(episode, nom, erreurs):
    try:
        with open(chemin(episode, nom), encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        erreurs.append(f"{nom} manque")
    except json.JSONDecodeError as e:
        erreurs.append(f"{nom} n'est pas du JSON valide : ligne {e.lineno}, {e.msg}")
    return None


def sections_des_paroles(episode):
    """Les balises [ ] de lyrics.txt, dans l'ordre."""
    try:
        with open(chemin(episode, "lyrics.txt"), encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except FileNotFoundError:
        return None
    return [
        m.group(1).strip()
        for m in (re.match(r"^\[(.+)\]\s*$", l) for l in lignes if not l.startswith("#"))
        if m
    ]


def verifier_timeline(episode, timeline, erreurs, restes):
    """Cohérence interne du montage : bornes, enchaînement, médias attendus."""
    plans = timeline.get("plans")
    if not isinstance(plans, list):
        erreurs.append("timeline.json : « plans » doit être une liste")
        return
    if not plans:
        # État normal d'un épisode qui vient d'être créé : le montage s'écrit
        # après la chanson, pas avant.
        restes.append("timeline.json : le découpage en plans reste à écrire")
        return

    if timeline.get("fps", FPS) != FPS:
        erreurs.append(f"timeline.json : le dépôt tourne à {FPS} i/s")
    if (timeline.get("largeur"), timeline.get("hauteur")) != (LARGEUR, HAUTEUR):
        erreurs.append(f"timeline.json : le format attendu est {LARGEUR}×{HAUTEUR}")

    curseur = 0.0
    for i, p in enumerate(plans, 1):
        nom = p.get("id", f"plan {i}")
        debut, fin = p.get("debut_s"), p.get("fin_s")
        if not isinstance(debut, (int, float)) or not isinstance(fin, (int, float)):
            erreurs.append(f"{nom} : debut_s et fin_s doivent être des nombres")
            continue
        if fin <= debut:
            erreurs.append(f"{nom} : fin_s ({fin}) n'est pas après debut_s ({debut})")
        if abs(debut - curseur) > EPSILON:
            manque = "trou" if debut > curseur else "recouvrement"
            erreurs.append(f"{nom} : {manque} de {abs(debut - curseur):.2f}s avant le plan")
        curseur = max(curseur, fin)

        for cle in ("image", "clip"):
            ref = p.get(cle)
            if not ref:
                erreurs.append(f"{nom} : « {cle} » manque")
            elif not os.path.exists(chemin(episode, ref)):
                restes.append(f"{nom} : {ref} reste à produire")

    duree = timeline.get("duree_s")
    if isinstance(duree, (int, float)) and abs(curseur - duree) > EPSILON:
        erreurs.append(
            f"timeline.json : les plans couvrent {curseur:.2f}s "
            f"pour une durée annoncée de {duree:.2f}s"
        )


def verifier(episode):
    """Renvoie (erreurs, restes) : ce qui est cassé, puis ce qui est à produire."""
    erreurs, restes = [], []

    if not os.path.isdir(chemin(episode)):
        return [f"episodes/{episode}/ n'existe pas"], []
    if not re.fullmatch(r"ep_\d{3}", episode):
        erreurs.append("l'identifiant attendu est ep_ suivi de trois chiffres")

    for nom in TEXTES:
        if not os.path.exists(chemin(episode, nom)):
            erreurs.append(f"{nom} manque")
    for nom in MEDIAS:
        if not produit(episode, nom):
            restes.append(f"{nom} reste à produire")

    brief = lire_json(episode, "brief.json", erreurs)
    plan = lire_json(episode, "song_plan.json", erreurs)
    timeline = lire_json(episode, "timeline.json", erreurs)
    meta = lire_json(episode, "metadata.json", erreurs)

    # Un dossier renommé sans toucher aux JSON casse tout le reste en silence.
    for nom, doc, cle in (
        ("brief.json", brief, "id"),
        ("song_plan.json", plan, "episode"),
        ("timeline.json", timeline, "episode"),
        ("metadata.json", meta, "episode"),
    ):
        if doc is not None and doc.get(cle) != episode:
            erreurs.append(f"{nom} : « {cle} » vaut {doc.get(cle)!r} au lieu de {episode!r}")

    paroles = sections_des_paroles(episode)
    if paroles is not None and plan is not None:
        attendues = [s.get("section") for s in plan.get("structure", [])]
        if not paroles or not attendues:
            # Les paroles s'écrivent avant le plan de la chanson : tant que l'un
            # des deux est vide, il reste du travail, pas une incohérence.
            restes.append("les sections restent à écrire dans lyrics.txt et song_plan.json")
        elif paroles != attendues:
            erreurs.append(
                "les sections ne coïncident pas — "
                f"lyrics.txt : {paroles} ; song_plan.json : {attendues}"
            )

    if timeline is not None:
        verifier_timeline(episode, timeline, erreurs, restes)

    return erreurs, restes


def squelette(episode, titre):
    """Les cinq fichiers versionnés, vides mais complets, prêts à remplir."""
    return {
        "brief.json": {
            "id": episode,
            "titre": titre,
            "sujet": "",
            "angle": "",
            "public": "",
            "ton": "",
            "format": {"largeur": LARGEUR, "hauteur": HAUTEUR, "fps": FPS},
            "duree_visee_s": 60,
            "points_cles": [],
            "sources": [],
            "cree_le": "",
        },
        "song_plan.json": {
            "episode": episode,
            "titre": titre,
            "style": "",
            "bpm": 96,
            "tonalite": "",
            "langue": "fr",
            "duree_visee_s": 60,
            "prompt": "",
            "structure": [],
            "sortie": "song.mp3",
        },
        "timeline.json": {
            "episode": episode,
            "fps": FPS,
            "largeur": LARGEUR,
            "hauteur": HAUTEUR,
            "audio": "song.mp3",
            "duree_s": 0.0,
            "plans": [],
        },
        "metadata.json": {
            "episode": episode,
            "titre": titre,
            "description": "",
            "mots_cles": [],
            "hashtags": [],
            "format": f"{LARGEUR}x{HAUTEUR}",
            "duree_s": 0.0,
            "miniature": "thumbnail.png",
            "video": "final.mp4",
            "plateformes": [
                {"nom": n, "statut": "brouillon", "url": None}
                for n in ("tiktok", "instagram", "youtube")
            ],
            "publie_le": None,
        },
    }


def nouveau(episode, titre):
    if not re.fullmatch(r"ep_\d{3}", episode):
        sys.exit("L'identifiant attendu est ep_ suivi de trois chiffres, par exemple ep_002.")
    if os.path.isdir(chemin(episode)):
        sys.exit(f"episodes/{episode}/ existe déjà ; rien n'a été touché.")

    for dossier in ("images", "clips"):
        os.makedirs(chemin(episode, dossier))
        open(chemin(episode, dossier, ".gitkeep"), "w").close()

    for nom, contenu in squelette(episode, titre).items():
        with open(chemin(episode, nom), "w", encoding="utf-8") as f:
            json.dump(contenu, f, ensure_ascii=False, indent=2)
            f.write("\n")

    with open(chemin(episode, "lyrics.txt"), "w", encoding="utf-8") as f:
        f.write(
            f"# Paroles de {episode} — « {titre} »\n"
            "# Une section par balise [ ] ; les balises et leur ordre doivent coller à\n"
            '# "structure" dans song_plan.json. Les lignes commençant par # sont des\n'
            "# notes et ne sont pas chantées.\n\n[intro]\n\n"
        )

    print(f"episodes/{episode}/ créé. À remplir dans l'ordre : {', '.join(TEXTES)}.")


def episodes():
    if not os.path.isdir(RACINE):
        return []
    return sorted(d for d in os.listdir(RACINE) if re.fullmatch(r"ep_\d{3}", d))


def produit(episode, nom):
    """Une étape est faite quand son fichier existe — et, pour un dossier de
    médias, quand il contient autre chose que son .gitkeep."""
    c = chemin(episode, nom)
    if os.path.isdir(c):
        return any(f != ".gitkeep" for f in os.listdir(c))
    return os.path.exists(c)


def lister():
    connus = episodes()
    if not connus:
        print("Aucun épisode. Commence par : python3 scripts/episode.py nouveau ep_001")
        return
    for e in connus:
        erreurs, restes = verifier(e)
        etat = "cassé" if erreurs else ("complet" if not restes else "en cours")
        etapes = TEXTES + MEDIAS
        faits = [n for n in etapes if produit(e, n)]
        print(f"{e}  {etat:<8} {len(faits)}/{len(etapes)} étapes")
        for m in erreurs:
            print(f"    ✗ {m}")


def main():
    p = argparse.ArgumentParser(description="Gère les dossiers d'épisode.")
    sous = p.add_subparsers(dest="commande", required=True)

    n = sous.add_parser("nouveau", help="créer le squelette d'un épisode")
    n.add_argument("episode", help="identifiant, par exemple ep_002")
    n.add_argument("--titre", default="", help="titre de travail")

    v = sous.add_parser("verifier", help="relire un épisode")
    v.add_argument("episode", nargs="?", help="par défaut, tous les épisodes")

    sous.add_parser("lister", help="l'état de tous les épisodes")

    a = p.parse_args()

    if a.commande == "nouveau":
        nouveau(a.episode, a.titre)
        return
    if a.commande == "lister":
        lister()
        return

    cibles = [a.episode] if a.episode else episodes()
    if not cibles:
        sys.exit("Aucun épisode à vérifier.")

    casse = False
    for e in cibles:
        erreurs, restes = verifier(e)
        casse = casse or bool(erreurs)
        print(f"{e} — {'à corriger' if erreurs else 'cohérent'}")
        for m in erreurs:
            print(f"    ✗ {m}")
        for m in restes:
            print(f"    · {m}")

    sys.exit(1 if casse else 0)


if __name__ == "__main__":
    main()
