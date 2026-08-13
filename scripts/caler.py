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

D'où la méthode retenue : PRÉDIRE puis CORROBORER.

1. Prédire. La durée d'une phrase est proportionnelle à son nombre de
   SYLLABES, mesuré sur le texte une fois les nombres écrits en toutes lettres.
   Le débit syllabique d'un locuteur est remarquablement stable.
2. Corroborer. Si un creux de l'enveloppe se trouve à portée de la position
   prédite, la borne s'y cale : un vrai silence est une meilleure frontière
   qu'une estimation. Sinon la prédiction est conservée telle quelle.

La sortie indique, pour chaque borne, si elle est CALÉE sur un silence mesuré
ou seulement PRÉDITE — les seules qui puissent demander un ajustement à
l'oreille.

Usage :  python3 scripts/caler.py <audio.wav> <module>
"""

import array
import math
import re
import sys
import wave

FENETRE = 0.01  # s
SEUIL_PIC = 0.05  # part du pic au-delà de laquelle on considère qu'on parle
CREUX_MIN = 0.07  # s ; en deçà, c'est une articulation, pas une frontière
PAROLE_MIN = 0.25  # s ; parole minimale d'une phrase, garde anti-dégénérescence
TOLERANCE = 0.40  # s ; portée de recherche autour d'une frontière de phrase
TOLERANCE_BEAT = 0.55  # s ; portée un peu élargie aux frontières de beats.
# Une version précédente y cherchait le silence LE PLUS LONG dans une fenêtre
# large. C'était un contresens : le plus long silence d'une prise est souvent
# une pause d'effet AVANT une chute, pas un changement de sujet. Le critère
# reste donc le même partout — le creux le plus proche, à durée comparable.

SCRIPTS = {
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


def creux_candidats(parle):
    out = []
    i = 0
    while i < len(parle):
        if not parle[i]:
            j = i
            while j < len(parle) and not parle[j]:
                j += 1
            if i > 0 and j < len(parle) and (j - i) * FENETRE >= CREUX_MIN:
                out.append(((i + j) / 2 * FENETRE, (j - i) * FENETRE))
            i = j
        else:
            i += 1
    return out


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    audio, module = sys.argv[1], sys.argv[2]
    phrases = SCRIPTS[module]

    env = enveloppe(audio)
    pic = max(env)
    parle = [e > SEUIL_PIC * pic for e in env]
    cumul = [0.0]
    for p in parle:
        cumul.append(cumul[-1] + (FENETRE if p else 0.0))
    fin = len(parle) * FENETRE
    total_parole = cumul[-1]

    # Passage temps de parole → temps horloge : un silence ne consomme pas de
    # syllabes, donc la prédiction se fait sur l'échelle de la parole seule.
    def horloge(p):
        lo, hi = 0, len(cumul) - 1
        while lo < hi:
            mi = (lo + hi) // 2
            if cumul[mi] < p:
                lo = mi + 1
            else:
                hi = mi
        return lo * FENETRE

    creux = creux_candidats(parle)
    syl = [compter(t) for _, t in phrases]
    total_syl = sum(syl)
    debit = total_syl / total_parole

    print(f"durée {fin:.2f} s | parole {total_parole:.2f} s | {len(creux)} creux")
    print(f"{total_syl} syllabes | débit {debit:.2f} syll/s\n")

    # Prédiction réancrée : après chaque borne calée sur un silence, le débit
    # est réestimé sur ce qui reste. Sans cela une borne corrigée de 0,7 s
    # laisse toutes les suivantes décalées d'autant, l'erreur ne se rattrapant
    # jamais.
    bornes = [0.0]
    origines = ["début"]
    restant = list(syl)
    curseur = 0.0
    for i in range(len(syl) - 1):
        reste_syl = sum(restant[i:])
        reste_parole = total_parole - cumul[min(len(cumul) - 1, int(curseur / FENETRE))]
        debit_local = reste_syl / max(0.01, reste_parole)
        cible = cumul[min(len(cumul) - 1, int(curseur / FENETRE))] + restant[i] / debit_local
        predit = horloge(cible)

        frontiere_beat = phrases[i][0] != phrases[i + 1][0]
        tol = TOLERANCE_BEAT if frontiere_beat else TOLERANCE
        # Le creux doit laisser de quoi prononcer la phrase : sans cette garde,
        # deux bornes pouvaient se caler sur le même silence et produire une
        # phrase de durée nulle.
        plancher = horloge(cumul[min(len(cumul) - 1, int(curseur / FENETRE))] + PAROLE_MIN)
        proches = [
            (abs(m - predit), m, d)
            for m, d in creux
            if abs(m - predit) <= tol and m >= plancher
        ]
        if proches:
            _, m, d = min(proches, key=lambda c: (c[0] / max(c[2], 0.07)))
            bornes.append(m)
            origines.append(f"calée sur {d * 1000:.0f} ms")
            curseur = m
        else:
            bornes.append(predit)
            origines.append("prédite")
            curseur = predit
    bornes.append(fin)
    origines.append("fin")

    print(f"{'beat':5} {'fenêtre':>17} {'syll':>5} {'débit':>10}  origine")
    for (beat, texte), a, b, o in zip(phrases, bornes[:-1], bornes[1:], origines[1:]):
        p = cumul[min(len(cumul) - 1, int(b / FENETRE))] - cumul[min(len(cumul) - 1, int(a / FENETRE))]
        d = compter(texte) / max(0.01, p)
        print(f"{beat:5} {a:7.2f} → {b:6.2f} {compter(texte):5} {d:7.2f} s/s  {o}")

    debits = []
    for (_, texte), a, b in zip(phrases, bornes[:-1], bornes[1:]):
        pa = cumul[min(len(cumul) - 1, int(b / FENETRE))] - cumul[min(len(cumul) - 1, int(a / FENETRE))]
        debits.append(compter(texte) / max(0.01, pa))
    moy = sum(math.log(d) for d in debits) / len(debits)
    ecart = math.sqrt(sum((math.log(d) - moy) ** 2 for d in debits) / len(debits))
    print(f"\ndispersion des débits : {ecart:.3f} (log) — plus c'est bas, plus")
    print("l'alignement est vraisemblable ; au-delà de 0,25 il est douteux.")

    print("\nBornes de beats (à reporter dans reperes.ts) :")
    precedent = None
    for (beat, _), a, o in zip(phrases, bornes[:-1], origines[:-1]):
        if precedent is not None and beat != precedent:
            print(f"  {precedent} → {beat} : {a:6.2f}   ({o})")
        precedent = beat
    print(f"  fin : {fin:.2f}")


if __name__ == "__main__":
    main()
