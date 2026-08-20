#!/usr/bin/env python3
"""
Aligne le script d'une vidéo sur sa prise voix, et propose les bornes de beats.

Le problème : on connaît le texte dit, on veut savoir QUAND chaque phrase est
prononcée, sans reconnaissance vocale — aucun modèle n'est installable hors
ligne ici. Deux méthodes ont été essayées avant celle-ci.

La première plaçait les bornes au prorata des MOTS. Trop grossier : « 8h30 »
compte pour un mot et se dit en quatre syllabes, « de » compte pour un mot et
se dit en une.

La seconde forçait chaque frontière de phrase sur un creux de l'enveloppe, par
programmation dynamique. Elle échoue pour une raison de fond : toutes les
frontières ne sont pas audibles. Le locuteur enchaîne « le même poids et
pourtant » sans reprendre son souffle, et forcer une frontière là où il n'y a
pas de silence en déplace une autre, en cascade — les débits obtenus allaient
de 1 à 10 mots par seconde.

D'où la méthode retenue, à DEUX NIVEAUX — parce que les deux niveaux n'ont ni
les mêmes contraintes ni les mêmes conséquences en cas d'erreur.

Niveau 1, les BEATS. Une frontière de beat est l'instant où l'image change.
Se tromper de deux dixièmes s'y voit immédiatement : l'animation démarre alors
que la phrase n'est pas finie. Ces frontières sont donc placées EXACTEMENT sur
des silences mesurés, jamais interpolées. Le découpage est choisi globalement,
par programmation dynamique : parmi toutes les façons de répartir les groupes
de parole entre les beats, on retient celle qui rend les débits syllabiques des
beats les plus semblables entre eux. Un beat est ainsi toujours une suite
ENTIÈRE de groupes de parole, et l'image ne peut structurellement pas basculer
au milieu d'un mot.

Niveau 2, les PHRASES à l'intérieur d'un beat. Elles ne déclenchent aucune
coupe — l'animation est continue — et servent seulement à situer les repères
internes. Toutes les frontières de phrase ne sont d'ailleurs pas audibles : le
locuteur enchaîne « le même poids et pourtant » sans reprendre son souffle. On
les place donc au prorata des SYLLABES, en temps de PAROLE : le débit
syllabique d'un locuteur est remarquablement stable, et les silences, qui ne
consomment pas de syllabes, sont exclus du calcul avant d'être réintroduits.

C'est ce niveau 1 qui a manqué à une version précédente. Elle traitait toutes
les frontières de la même façon, cherchait un silence « à portée » de chaque
position prédite, et propageait ses erreurs : sur la prise « recomposition »,
où la parole est quasi continue et les silences nombreux, elle donnait des
débits allant de 2,9 à 16,7 syllabes par seconde. Le découpage global les
ramène dans une bande de 5,7 à 7,4.

La sortie donne la dispersion des débits, en écart-type des logarithmes.
Au-delà de 0,25 l'alignement est douteux ; en deçà de 0,15 il est fiable.

Usage :  python3 scripts/caler.py <audio.wav> <module>
"""

import array
import math
import re
import sys
import wave

FENETRE = 0.01  # s
SEUIL_PIC = 0.05  # part du pic au-delà de laquelle on considère qu'on parle
# Deux groupes séparés par moins de SOUDURE ne sont pas séparés par un silence
# mais par une occlusive — le blanc qui précède le [p] de « proche » dure trois
# centièmes et n'est pas une frontière. On les recolle avant toute analyse.
SOUDURE = 0.12  # s
# Nombre maximal de groupes de parole qu'un beat peut couvrir. Sert seulement à
# borner le coût de la programmation dynamique ; aucun beat réel n'approche
# cette valeur (le plus long de « recomposition » en couvre cinq).
GROUPES_MAX = 8

SCRIPTS = {
    # « Le sommeil décide si tu perds du gras ou du muscle ». Attention : les
    # bornes de src/Sommeil/reperes.ts ont été établies AVANT la méthode à deux
    # niveaux, puis vérifiées à l'œil sur le rendu et validées. Le découpage
    # global en redonne des valeurs voisines mais pas identiques (B3→B4 à 22,61
    # au lieu de 21,57). Le montage livré n'a pas été recalé dessus : il est
    # bon, et le rejouer pour un dixième de seconde ferait courir plus de
    # risques qu'il n'en écarterait.
    "sommeil": [
        ("B1", "Deux personnes peuvent perdre exactement le même poids"),
        ("B1", "et pourtant l'une perd surtout du gras"),
        ("B1", "l'autre perd surtout du muscle"),
        ("B1", "La différence tient en une seule variable"),
        ("B2", "Pendant quatorze jours"),
        ("B2", "des chercheurs ont mis les mêmes personnes en déficit calorique modéré"),
        ("B2", "avec deux conditions de sommeil différentes"),
        ("B3", "huit heures trente de sommeil pour le premier groupe"),
        ("B3", "cinq heures trente pour le second"),
        ("B3", "Même déficit calorique"),
        ("B3", "exactement les mêmes calories"),
        ("B4", "Le poids total perdu"),
        ("B4", "Quasi identique dans les deux groupes"),
        ("B4", "environ trois kilos"),
        ("B5", "Mais regarde ce qui compose cette perte"),
        ("B5", "avec huit heures trente de sommeil"),
        ("B5", "un virgule quatre kilo de gras perdu"),
        ("B5", "Avec seulement cinq heures trente"),
        ("B5", "à peine zéro virgule six kilo"),
        ("B6", "Et à l'inverse"),
        ("B6", "le groupe qui dort peu perd soixante pour cent de muscle en plus que l'autre"),
        ("B6", "pour la même perte de poids totale"),
        ("B7", "Le sommeil c'est pas un détail annexe"),
        ("B7", "C'est une variable qui décide si ton déficit tape dans ton gras"),
        ("B7", "ou dans ton muscle"),
        ("B8", "Avant d'optimiser ta diète au gramme près"),
        ("B8", "regarde d'abord combien tu dors"),
    ],
    # « Recomposition corporelle ». Le brief donne des timecodes lus sur les
    # sous-titres automatiques, fiables à la seconde près pour le DÉBUT de
    # chaque réplique, et le dit lui-même : le sous-découpage interne est à
    # affiner sur la piste. C'est ce que fait ce script — les valeurs du brief
    # servent de contrôle, pas de source.
    "recomp": [
        ("B1", "Perdre du gras et prendre du muscle en même temps"),
        ("B1", "on t'a dit que c'était un mythe"),
        ("B1", "Faux"),
        ("B1", "et je vais t'expliquer comment faire une vraie recomposition corporelle"),
        ("B2", "Voici les trois choses dont tu as besoin"),
        ("B2", "pour vraiment réussir ta recomposition corporelle"),
        ("B3", "En un c'est comment tu t'entraines"),
        ("B4", "Soulever lourd ça ne suffit pas"),
        ("B4", "ce qui compte c'est vraiment d'aller toujours proche de l'échec"),
        ("B4", "Pour cela tu dois garder une bonne technique d'exécution"),
        ("B4", "avec un maximum de tension mécanique"),
        ("B5", "Tu en as besoin pour construire du muscle"),
        ("B6", "En deux ton apport calorique"),
        ("B7", "En musculation et des années d'expérience"),
        ("B7", "tu devras ajuster un léger déficit calorique dans la plupart des cas"),
        ("B8", "En trois tes protéines"),
        ("B9", "Sans protéines tu peux perdre du gras"),
        ("B9", "mais tu auras sans doute beaucoup de mal à prendre du muscle"),
        ("B9", "Avec assez de protéines tu peux faire les deux en même temps"),
        ("B10", "un virgule six à deux virgule deux grammes de protéines"),
        ("B10", "par kilo de poids de corps"),
        ("B11", "Bien sûr une recomposition corporelle ça se fait sur le long terme"),
        ("B11", "donc ne vise pas à aller trop vite"),
        ("B11", "Étale ça sur le long terme"),
        ("B11", "et ne sois pas trop restrictif avec toi"),
        ("B11", "Niveau diète assure-toi d'avoir vraiment un plan"),
        ("B11", "qui te permet de durer sur le long terme"),
    ],
    # « Aspartame / Coca Zero ». La prise n'a PAS été fournie : les bornes de
    # src/Aspartame/reperes.ts sont reconstruites, pas mesurées. Ce script est
    # écrit d'avance pour qu'il n'y ait rien à rédiger le jour où la voix
    # arrive — il suffira de lancer la commande et de reporter les bornes.
    #
    # Une réserve à connaître avant de le lancer : le montage bascule du plan
    # filmé à l'animation À L'INTÉRIEUR d'une phrase continue, sur « j'oublie
    # souvent ce détail ». Le découpage en beats de niveau 1 impose ses
    # frontières sur des silences ; cette bascule-là n'en aura pas forcément.
    # B3 et B4 sont donc à traiter comme un seul beat au moment de lire la
    # sortie, la bascule interne se plaçant ensuite au prorata des syllabes.
    "aspartame": [
        ("B1", "Tu peux mourir en buvant trop d'eau"),
        ("B1", "Ça s'appelle littéralement l'intoxication à l'eau"),
        ("B2", "Le sel le café l'oxygène"),
        ("B2", "à trop forte dose tout devient dangereux"),
        ("B2", "C'est la dose qui fait le poison"),
        ("B3", "Quand les gens paniquent sur l'aspartame de leur boisson sans sucre"),
        ("B3", "parce que l'OMS l'a placé dans une catégorie qui s'appelle possiblement cancérogène"),
        ("B4", "j'oublie souvent ce détail"),
        ("B4", "c'est la même que l'aloe vera"),
        ("B4", "ou de certains légumes fermentés"),
        ("B5", "La dose journalière jugée sûre par l'OMS"),
        ("B5", "c'est quarante milligrammes par kilo de poids de corps"),
        ("B5", "Pour un adulte de soixante-dix kilos par exemple"),
        ("B5", "ça représente entre neuf et quatorze canettes par jour"),
        ("B6", "Donc non ta canette de midi ne va pas te tuer"),
        ("B6", "Elle va même plutôt t'aider en sèche par exemple"),
        ("B6", "car elle comporte très peu de calories"),
        ("B6", "Mais ce qui va vraiment nuire à ta santé se situe probablement ailleurs"),
    ],
}

VOYELLES = "aeiouyàâäéèêëîïôöùûü"


def syllabes(mot):
    """
    Compte les syllabes d'un mot français, par groupes de voyelles.

    Approximation assumée : on ne traite ni les diérèses ni les liaisons. Le
    « e » final muet est retiré, sauf s'il porte la seule voyelle du mot — sans
    quoi « le » et « de » compteraient pour zéro.
    """
    m = mot.lower()
    m = re.sub(r"[^a-zàâäéèêëîïôöùûüç']", "", m)
    if not m:
        return 0
    groupes = re.findall(f"[{VOYELLES}]+", m)
    n = len(groupes)
    if n > 1 and m.endswith("e"):
        n -= 1
    return max(1, n)


def compter(phrase):
    return sum(syllabes(m) for m in phrase.split())


def enveloppe(chemin):
    with wave.open(chemin) as w:
        sr = w.getframerate()
        ech = array.array("h", w.readframes(w.getnframes()))
    pas = int(sr * FENETRE)
    return [max(abs(v) for v in ech[i : i + pas]) for i in range(0, len(ech) - pas, pas)]


def groupes_parole(env):
    """
    Découpe l'enveloppe en groupes de parole, silences recollés.

    Renvoie une liste de (début, fin) en secondes. C'est la seule lecture du
    signal dont dépend tout le reste : les frontières de beats sont choisies
    parmi ces bornes, et nulle part ailleurs.
    """
    pic = max(env)
    parle = [e > SEUIL_PIC * pic for e in env]
    bruts = []
    i = 0
    while i < len(parle):
        if parle[i]:
            j = i
            while j < len(parle) and parle[j]:
                j += 1
            bruts.append((i * FENETRE, j * FENETRE))
            i = j
        else:
            i += 1
    if not bruts:
        return []
    out = [bruts[0]]
    for a, b in bruts[1:]:
        if a - out[-1][1] < SOUDURE:
            out[-1] = (out[-1][0], b)
        else:
            out.append((a, b))
    return out


def decouper_beats(syl_beat, durees, debit):
    """
    Répartit les groupes de parole entre les beats, par programmation dynamique.

    Chaque beat reçoit une suite ENTIÈRE et contiguë de groupes ; le coût d'un
    beat est l'écart de son débit au débit moyen, au carré, pondéré par son
    nombre de syllabes — un beat long pèse plus lourd qu'une incise de six
    syllabes, dont le débit apparent est de toute façon plus bruité.

    Renvoie la liste des (premier groupe, dernier groupe exclu) par beat.
    """
    nb, m = len(syl_beat), len(durees)
    if nb > m:
        print(
            f"{nb} beats pour {m} groupes de parole : le découpage est "
            "impossible, un beat au moins n'a pas de groupe à lui.",
            file=sys.stderr,
        )
        sys.exit(3)
    INF = float("inf")
    cout = [[INF] * (m + 1) for _ in range(nb + 1)]
    venant = [[None] * (m + 1) for _ in range(nb + 1)]
    cout[0][0] = 0.0
    for i in range(nb):
        for j in range(m):
            if cout[i][j] == INF:
                continue
            for l in range(1, min(GROUPES_MAX, m - j) + 1):
                # Il faut laisser au moins un groupe à chacun des beats suivants.
                if m - (j + l) < nb - (i + 1):
                    break
                d = sum(durees[j : j + l])
                c = cout[i][j] + syl_beat[i] * (math.log(syl_beat[i] / d) - math.log(debit)) ** 2
                if c < cout[i + 1][j + l]:
                    cout[i + 1][j + l] = c
                    venant[i + 1][j + l] = j
    tranches = []
    j = m
    for i in range(nb, 0, -1):
        pj = venant[i][j]
        tranches.append((pj, j))
        j = pj
    tranches.reverse()
    return tranches


def dispersion(debits):
    moy = sum(math.log(d) for d in debits) / len(debits)
    return math.sqrt(sum((math.log(d) - moy) ** 2 for d in debits) / len(debits))


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    audio, module = sys.argv[1], sys.argv[2]
    if module not in SCRIPTS:
        print(f"module inconnu ; connus : {', '.join(sorted(SCRIPTS))}", file=sys.stderr)
        sys.exit(3)
    phrases = SCRIPTS[module]

    env = enveloppe(audio)
    groupes = groupes_parole(env)
    durees = [b - a for a, b in groupes]
    fin = len(env) * FENETRE
    parole = sum(durees)

    # Regroupement des phrases par beat, dans l'ordre.
    beats = []
    for beat, texte in phrases:
        if not beats or beats[-1][0] != beat:
            beats.append((beat, []))
        beats[-1][1].append(texte)
    syl_beat = [sum(compter(t) for t in ts) for _, ts in beats]
    debit = sum(syl_beat) / parole

    print(f"durée {fin:.2f} s | parole {parole:.2f} s | {len(groupes)} groupes")
    print(f"{sum(syl_beat)} syllabes | débit {debit:.2f} syll/s")
    print(f"{len(beats)} beats, {len(phrases)} phrases\n")

    tranches = decouper_beats(syl_beat, durees, debit)

    print("NIVEAU 1 — beats, calés sur des silences mesurés")
    print(f"{'beat':5} {'fenêtre':>17} {'syll':>5} {'débit':>9}  groupes")
    debits = []
    for (beat, _), s_b, (j0, j1) in zip(beats, syl_beat, tranches):
        d = sum(durees[j0:j1])
        debits.append(s_b / d)
        a, b = groupes[j0][0], groupes[j1 - 1][1]
        print(f"{beat:5} {a:7.2f} → {b:6.2f} {s_b:5} {s_b / d:6.2f} s/s  {j1 - j0}")
    print(f"\ndispersion des débits de beats : {dispersion(debits):.3f} (log)")
    print("au-delà de 0,25 l'alignement est douteux ; en deçà de 0,15 il est fiable.\n")

    print("NIVEAU 2 — phrases, au prorata des syllabes en temps de parole")
    bornes_phrases = []
    for (beat, textes), (j0, j1) in zip(beats, tranches):
        seg = groupes[j0:j1]
        duree = sum(durees[j0:j1])
        total = sum(compter(t) for t in textes)

        def horloge(p):
            """Temps de parole → temps horloge, en réinjectant les silences."""
            cumul = 0.0
            for a, b in seg:
                if cumul + (b - a) >= p:
                    return a + (p - cumul)
                cumul += b - a
            return seg[-1][1]

        acc = 0
        precedent = seg[0][0]
        for texte in textes:
            acc += compter(texte)
            x = horloge(duree * acc / total)
            bornes_phrases.append((beat, precedent, x, texte))
            precedent = x
    for beat, a, b, texte in bornes_phrases:
        print(f"{beat:5} {a:7.2f} → {b:6.2f}  {texte}")

    print("\nBornes de beats (à reporter dans reperes.ts) :")
    for (beat, _), (j0, j1) in zip(beats, tranches):
        print(f"  {beat:4} {groupes[j0][0]:6.2f} → {groupes[j1 - 1][1]:6.2f}")
    print(f"  fin de piste : {fin:.2f}")


if __name__ == "__main__":
    main()
