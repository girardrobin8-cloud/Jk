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
import unicodedata

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "episodes")

# Les fichiers versionnés, dans l'ordre de fabrication. Ce sont eux qui doivent
# exister pour qu'un épisode soit relisible.
TEXTES = ["brief.json", "lyrics.txt", "song_plan.json", "timeline.json", "metadata.json"]

# Les médias : régénérables, hors dépôt, absents tant que l'étape n'est pas
# faite. Leur absence n'est jamais une erreur.
MEDIAS = ["song.mp3", "images", "clips", "final.mp4", "thumbnail.png"]

# Les clés d'un plan de timeline.json, dans l'ordre.
CLES_PLAN = ("start", "end", "lyrics", "scene", "image_prompt", "video_prompt")

FPS = 30

# Tolérance sur les raccords : un demi-centième de seconde, de quoi absorber
# les arrondis d'écriture sans laisser passer un vrai trou.
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


def normaliser(texte):
    """Réduit un texte à ce qui compte pour le comparer : minuscules, sans
    accents ni ponctuation, espaces et retours à la ligne écrasés."""
    plat = unicodedata.normalize("NFD", texte.lower())
    plat = "".join(c for c in plat if unicodedata.category(c) != "Mn")
    return " ".join(re.sub(r"[^a-z0-9]+", " ", plat).split())


def lignes_des_paroles(episode):
    """Le contenu de lyrics.txt, sans les notes : (sections, texte suivi)."""
    try:
        with open(chemin(episode, "lyrics.txt"), encoding="utf-8") as f:
            lignes = [l for l in f.read().splitlines() if not l.startswith("#")]
    except FileNotFoundError:
        return None, None
    sections, chante = [], []
    for l in lignes:
        m = re.match(r"^\[(.+)\]\s*$", l)
        if m:
            sections.append(m.group(1).strip())
        else:
            chante.append(l)
    return sections, normaliser(" ".join(chante))


def verifier_timeline(episode, plans, brief, chante, erreurs, restes):
    """Cohérence du montage : format des plans, enchaînement, paroles, médias."""
    if not isinstance(plans, list):
        erreurs.append("timeline.json : le fichier doit être une liste de plans")
        return
    if not plans:
        # État normal d'un épisode qui vient d'être créé : le montage s'écrit
        # après la chanson, pas avant.
        restes.append("timeline.json : le découpage en plans reste à écrire")
        return

    curseur = 0.0
    for i, p in enumerate(plans, 1):
        nom = f"plan {i:02d}"
        if not isinstance(p, dict):
            erreurs.append(f"{nom} : ce n'est pas un objet")
            continue

        manquantes = [c for c in CLES_PLAN if c not in p]
        if manquantes:
            erreurs.append(f"{nom} : clés manquantes — {', '.join(manquantes)}")
        for c in ("scene", "image_prompt", "video_prompt"):
            if c in p and not str(p[c]).strip():
                erreurs.append(f"{nom} : « {c} » est vide")

        debut, fin = p.get("start"), p.get("end")
        if not isinstance(debut, (int, float)) or not isinstance(fin, (int, float)):
            erreurs.append(f"{nom} : start et end doivent être des nombres")
            continue
        if fin <= debut:
            erreurs.append(f"{nom} : end ({fin}) n'est pas après start ({debut})")
        if abs(debut - curseur) > EPSILON:
            manque = "trou" if debut > curseur else "recouvrement"
            erreurs.append(f"{nom} : {manque} de {abs(debut - curseur):.2f}s avant le plan")
        curseur = max(curseur, fin)

        # Les paroles affichées sont un extrait de lyrics.txt : si l'un des deux
        # bouge sans l'autre, c'est ici que ça se voit.
        paroles = str(p.get("lyrics", ""))
        if paroles.strip() and chante and normaliser(paroles) not in chante:
            erreurs.append(f"{nom} : « {paroles} » ne se retrouve pas dans lyrics.txt")

        # Le nom des médias se déduit du rang du plan, il ne s'écrit nulle part.
        for dossier, ext in (("images", "png"), ("clips", "mp4")):
            ref = f"{dossier}/p{i:02d}.{ext}"
            if not os.path.exists(chemin(episode, ref)):
                restes.append(f"{nom} : {ref} reste à produire")

    visee = (brief or {}).get("duree_visee_s")
    if isinstance(visee, (int, float)) and visee > 0:
        # Un écart franc veut dire qu'un des deux fichiers n'a pas suivi ; un
        # petit écart est normal, la chanson ne tombe jamais juste.
        marge = max(2.0, 0.1 * visee)
        if abs(curseur - visee) > marge:
            erreurs.append(
                f"timeline.json : les plans couvrent {curseur:.1f}s "
                f"pour une durée visée de {visee:.1f}s dans brief.json"
            )


def produit(episode, nom):
    """Une étape est faite quand son fichier existe — et, pour un dossier de
    médias, quand il contient autre chose que son .gitkeep."""
    c = chemin(episode, nom)
    if os.path.isdir(c):
        return any(f != ".gitkeep" for f in os.listdir(c))
    return os.path.exists(c)


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
        ("metadata.json", meta, "episode"),
    ):
        if isinstance(doc, dict) and doc.get(cle) != episode:
            erreurs.append(f"{nom} : « {cle} » vaut {doc.get(cle)!r} au lieu de {episode!r}")

    sections, chante = lignes_des_paroles(episode)
    if sections is not None and isinstance(plan, dict):
        attendues = [s.get("section") for s in plan.get("structure", [])]
        if not sections or not attendues:
            # Les paroles s'écrivent avant le plan de la chanson : tant que l'un
            # des deux est vide, il reste du travail, pas une incohérence.
            restes.append("les sections restent à écrire dans lyrics.txt et song_plan.json")
        elif sections != attendues:
            erreurs.append(
                "les sections ne coïncident pas — "
                f"lyrics.txt : {sections} ; song_plan.json : {attendues}"
            )

    if timeline is not None:
        verifier_timeline(episode, timeline, brief, chante, erreurs, restes)

    return erreurs, restes


def squelette(episode, titre):
    """Les fichiers versionnés, vides mais complets, prêts à remplir."""
    return {
        "brief.json": {
            "id": episode,
            "titre": titre,
            "sujet": "",
            "angle": "",
            "public": "",
            "ton": "",
            "format": {"largeur": 1080, "hauteur": 1920, "fps": FPS},
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
        "timeline.json": [],
        "metadata.json": {
            "episode": episode,
            "titre": titre,
            "description": "",
            "mots_cles": [],
            "hashtags": [],
            "format": "1080x1920",
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
