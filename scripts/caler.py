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

Le SEUIL de silence, lui, n'est pas fixé d'avance : il est choisi par la
cohérence de l'alignement qu'il produit. Voir choisir_seuil().

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
# Longueur de la moyenne glissante qui sert de passe-bas. À 16 kHz, K = 20 place
# son premier zéro vers 800 Hz : de quoi garder le voisement et écarter le
# souffle. Voir enveloppe().
PASSE_BAS = 20  # échantillons
# Deux groupes séparés par moins de SOUDURE ne sont pas séparés par un silence
# mais par une occlusive — le blanc qui précède le [p] de « proche » dure trois
# centièmes et n'est pas une frontière. On les recolle avant toute analyse.
SOUDURE = 0.12  # s
# En deçà, un « groupe » n'est pas un groupe de parole mais un accident du
# seuillage : une reprise de souffle, un claquement de langue.
GROUPE_MIN = 0.10  # s
# Plage balayée pour le seuil de silence, en part du maximum de l'enveloppe de
# voisement. Voir choisir_seuil().
SEUILS = [x / 100 for x in range(3, 26)]
# Bornes de vraisemblance du débit, en syllabes par seconde de PAROLE détectée.
#
# Elles ne servent pas à deviner le débit mais à écarter les seuils qui mentent
# sur ce qu'est la parole. Un seuil trop haut ne retient que les voyelles les
# plus sonores : il « voit » deux fois moins de parole qu'il n'y en a, et le
# débit apparent double. Sur le reel « jour 1 », le seuil de 0,25 ne déclarait
# que 44 % de la piste comme parlée et sortait 10,96 syll/s — avec une
# dispersion de 0,023, la meilleure de tout le balayage. C'était un mirage :
# soixante-trois fragments laissent au découpage assez de liberté pour égaliser
# les débits par accident.
#
# La fenêtre est resserrée sur ce que ce dépôt a MESURÉ, et non sur ce qu'un
# humain peut physiquement produire. Les prises calées ici — sommeil,
# recomposition, aspartame — tombent toutes entre 6,1 et 6,5 syllabes par
# seconde de parole. Une fenêtre large de 4 à 9 laissait encore passer les
# seuils sur-fragmentants : sur le reel « jour 1 », toutes les valeurs de 0,03
# à 0,21 donnaient une dispersion « fiable » entre 0,042 et 0,106, si bien que
# le critère de régularité ne départageait plus rien et que le minimum tombait
# systématiquement du côté fragmenté.
#
# Ces bornes ne servent donc pas à deviner le débit : elles écartent les seuils
# qui mentent sur ce qu'est la parole. Un seuil trop haut ne retient que les
# voyelles les plus sonores, « voit » deux fois moins de parole qu'il n'y en a,
# et double le débit apparent. À élargir si un jour une autre voix est montée
# ici — ce sont les bornes d'un locuteur connu, pas une loi de la phonétique.
DEBIT_MIN = 5.0
DEBIT_MAX = 7.0
# Nombre maximal de groupes de parole qu'un beat peut couvrir. Sert seulement à
# borner le coût de la programmation dynamique.
GROUPES_MAX = 16

SCRIPTS = {
    # « Le sommeil décide si tu perds du gras ou du muscle ». Attention : les
    # bornes de src/Sommeil/reperes.ts ont été établies AVANT la méthode à deux
    # niveaux, puis vérifiées à l'œil sur le rendu et validées. Le découpage
    # global en redonne des valeurs voisines mais pas identiques (B3→B4 à 22,61
    # au lieu de 21,57). Le montage livré n'a pas été recalé dessus : il est
    # bon, et le rejouer pour un dixième de seconde ferait courir plus de
    # risques qu'il n'en écarterait.
    #
    # Même remarque depuis le passage au détecteur de voisement. Il fait baisser
    # la dispersion sur les deux prises déjà montées — 0,160 → 0,067 ici, 0,095
    # → 0,061 sur « recomposition » — mais une dispersion plus basse ne suffit
    # pas à trancher : sur « recomposition » il déplace B8, B9 et B11 d'environ
    # une seconde, et les ÉLOIGNE des timecodes relevés sur les sous-titres,
    # que l'ancien alignement retrouvait au dixième près. Les deux montages
    # livrés restent donc sur leurs bornes d'origine, validées à l'écran. Le
    # détecteur de voisement était en revanche INDISPENSABLE sur « aspartame »,
    # où l'ancien échouait franchement : onze groupes pour six beats, et une
    # dispersion de 0,292.
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
    # « NEAT / la dépense calorique cachée ». Script original, prise pas encore
    # enregistrée : les bornes de src/Neat/reperes.ts sont PRÉDITES à partir du
    # débit horloge moyen des trois prises mesurées (5,385 syll/s), et non
    # relevées. Écrit d'avance pour n'avoir qu'à mesurer le jour où la voix
    # arrive.
    "neat": [
        ("B1", "Ton entraînement c'est probablement la plus petite partie des calories que tu brûles dans ta journée"),
        ("B2", "Ce que ton corps dépense chaque jour se divise en plusieurs parts"),
        ("B2", "ton métabolisme de base la digestion et ton activité physique"),
        ("B3", "Rien qu'en existant"),
        ("B3", "respirer faire circuler ton sang réguler ta température"),
        ("B3", "ça représente environ soixante à soixante-dix pour cent de tes calories brûlées"),
        ("B4", "Digérer ce que tu manges ça en prend encore dix pour cent"),
        ("B5", "Et ta séance de sport"),
        ("B5", "Pour la plupart des gens qui s'entraînent quelques heures par semaine"),
        ("B5", "ça représente en moyenne moins de cent calories par jour"),
        ("B6", "Le vrai facteur qui varie le plus d'une personne à l'autre c'est tout le reste"),
        ("B6", "marcher monter des escaliers rester debout gigoter"),
        ("B6", "Ça s'appelle le NEAT"),
        ("B6", "et ça peut représenter jusqu'à deux mille calories de différence par jour entre deux personnes de la même taille"),
        ("B7", "Dans une étude des chercheurs ont suralimenté des volontaires de mille calories par jour pendant huit semaines"),
        ("B7", "Résultat les deux tiers de l'énergie supplémentaire brûlée venaient de l'augmentation spontanée du NEAT"),
        ("B7", "et ça expliquait une différence de prise de graisse allant jusqu'à dix fois d'une personne à l'autre"),
        ("B8", "Donc avant de rajouter une séance de cardio regarde d'abord combien tu bouges le reste de la journée"),
        ("B8", "Parfois huit mille pas de plus valent plus qu'une heure de sport en plus"),
    ],
    # « Reel Jour 1 — glucides ». Particularité : ce brief-ci exige une
    # TRANSCRIPTION par reconnaissance vocale, impossible dans cet
    # environnement — les paquets ASR s'installent depuis PyPI mais leurs poids
    # viennent d'openaipublic, HuggingFace ou alphacephei, tous bloqués. Ce
    # script est donc le texte PRÉVU, et l'alignement le corrobore plutôt qu'il
    # ne le découvre : si les débits obtenus restent réguliers, c'est que Robin
    # a bien dit ce texte ; s'ils partent dans tous les sens, c'est qu'il a
    # improvisé et qu'il faudra sa transcription.
    #
    # À faire tourner sur la piste NETTOYÉE (silences resserrés), pas sur le
    # rush d'origine : les bornes doivent être celles du montage final.
    "jour1": [
        ("B1", "On m'a dit d'arrêter le riz et les pâtes pour sécher"),
        ("B1", "Grosse erreur et je vais te montrer pourquoi"),
        ("B1", "chiffres à l'appui"),
        ("B2", "Manger des glucides fait grimper ta glycémie"),
        ("B2", "et ton corps sécrète de l'insuline pour la faire redescendre"),
        ("B2", "notamment en stockant cette énergie"),
        ("B3", "Sauf que l'insuline stocke aussi bien du glycogène que du gras"),
        ("B3", "Le vrai facteur c'est ton bilan calorique global"),
        ("B3", "peu importe la source de tes calories"),
        ("B4", "Tes glucides remplissent d'abord ton glycogène"),
        ("B4", "ton carburant à l'entraînement"),
        ("B4", "Ce n'est qu'une fois ces réserves pleines que l'excès peut en théorie se transformer en graisse"),
        ("B4", "un processus marginal chez la plupart des gens"),
        ("B5", "Une méta-analyse a réuni dix-neuf essais"),
        ("B5", "plus de trois mille deux cents personnes"),
        ("B5", "régime pauvre en glucides contre régime équilibré"),
        ("B5", "à calories strictement égales"),
        ("B5", "Résultat quasi identique"),
        ("B5", "que ce soit après six mois ou après deux ans"),
        ("B6", "Par contre les couper à l'excès baisse ton intensité à l'entraînement"),
        ("B6", "donc tes résultats sur la durée"),
        ("B7", "Envoie-moi GLUCIDES en DM"),
        ("B7", "si tu veux qu'on regarde ton dosage"),
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
    """
    Enveloppe de VOISEMENT : énergie de la bande grave, fenêtre par fenêtre.

    Une première version mesurait l'amplitude crête, toutes bandes confondues,
    et seuillait à 5 % du pic. Cela marche sur un son brut, pas sur une prise
    compressée. La prise « aspartame » arrive écrêtée — son pic vaut exactement
    32768, le maximum d'un entier 16 bits — et son compresseur remonte le
    souffle de salle entre les mots jusqu'au niveau de la parole. Au seuil de
    5 % du pic, 94 % de la piste passait pour de la parole : il ne restait que
    onze groupes pour six beats, et le découpage n'avait plus aucune latitude.
    Le même seuil poussé à 25 % ne récupérait toujours que 87 %.

    La bande grave sépare ce que l'amplitude ne sépare plus. La voix voisée
    porte l'essentiel de son énergie sous 400 Hz ; le souffle qu'un compresseur
    remonte, non — il est large bande. Une moyenne glissante sur PASSE_BAS
    échantillons suffit à faire ce filtre, et la même mesure marche aussi bien
    sur les prises non compressées : sur « sommeil » et « recomposition », elle
    donne un alignement au moins aussi cohérent que l'ancienne.
    """
    with wave.open(chemin) as w:
        sr = w.getframerate()
        ech = array.array("h", w.readframes(w.getnframes()))
    pas = int(sr * FENETRE)
    cumul = [0] * (len(ech) + 1)
    for i, v in enumerate(ech):
        cumul[i + 1] = cumul[i] + v
    grave = [
        (cumul[min(len(ech), i + PASSE_BAS)] - cumul[i]) / PASSE_BAS for i in range(len(ech))
    ]
    return [
        math.sqrt(sum(v * v for v in grave[i : i + pas]) / pas)
        for i in range(0, len(ech) - pas, pas)
    ]


def groupes_parole(env, seuil):
    """
    Découpe l'enveloppe en groupes de parole, silences recollés.

    `seuil` est une part du maximum de l'enveloppe ; il est choisi par
    choisir_seuil(), pas fixé d'avance.

    Renvoie une liste de (début, fin) en secondes. C'est la seule lecture du
    signal dont dépend tout le reste : les frontières de beats sont choisies
    parmi ces bornes, et nulle part ailleurs.
    """
    pic = max(env)
    parle = [e > seuil * pic for e in env]
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
    return [(a, b) for a, b in out if b - a >= GROUPE_MIN]


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
    # Aucun découpage ne couvre les m groupes avec nb beats d'au plus
    # GROUPES_MAX groupes chacun : le seuil testé fragmente trop la parole.
    # C'est un cas normal du balayage de seuils, pas une erreur — on le signale
    # par None et l'appelant passe au seuil suivant.
    if cout[nb][m] == INF:
        return None
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


def choisir_seuil(env, syl_beat, trace=False):
    """
    Choisit le seuil de silence par la COHÉRENCE de l'alignement qu'il produit.

    Le seuil ne peut pas être fixé une fois pour toutes : il dépend du bruit de
    fond et de la compression, qui changent d'une prise à l'autre. Le régler
    jusqu'à obtenir un débit « qui semble juste » serait circulaire — le débit
    est précisément ce qu'on cherche à établir.

    Le critère retenu est indépendant du signal. Pour chaque seuil, on découpe
    les beats et on mesure la dispersion de leurs débits. Les nombres de
    syllabes, eux, viennent du TEXTE : un seuil qui fait tomber juste les
    frontières entre parole et silence ne peut pas y arriver par hasard, et un
    seuil trop bas comme un seuil trop haut se paient tous deux en dispersion.

    Le minimum brut ne peut PAS être pris tel quel, et c'est le piège de cette
    méthode. Plus le seuil monte, plus il y a de groupes, et plus le découpage a
    de latitude pour égaliser les débits par chance : la dispersion se met à
    plonger ponctuellement sans que l'alignement soit meilleur. Sur
    « aspartame », le minimum brut tombe à 0,070 pour un seuil de 0,19, entre
    deux voisins à 0,151 et 0,140 — un accident, pas un signal. Le vrai plateau
    est ailleurs, entre 0,07 et 0,14, où la dispersion reste à 0,105–0,129 sur
    huit seuils consécutifs.

    D'où le filtre MÉDIAN sur trois seuils voisins avant de comparer : un creux
    isolé est écrasé par ses voisins, un bassin large survit. On cherche un
    seuil autour duquel l'alignement est stable, pas un seuil qui gagne seul.

    Renvoie (seuil, groupes, tranches).
    """
    essais = []
    for seuil in SEUILS:
        groupes = groupes_parole(env, seuil)
        if len(groupes) < len(syl_beat):
            continue
        durees = [b - a for a, b in groupes]
        debit = sum(syl_beat) / sum(durees)
        tranches = decouper_beats(syl_beat, durees, debit)
        if tranches is None:
            continue
        debits = [s / sum(durees[j0:j1]) for s, (j0, j1) in zip(syl_beat, tranches)]
        essais.append((seuil, dispersion(debits), groupes, tranches, debit))
    if not essais:
        print(
            "aucun seuil ne laisse assez de groupes de parole pour ce script : "
            "la piste est-elle bien la bonne ?",
            file=sys.stderr,
        )
        sys.exit(3)

    # On écarte d'abord les seuils dont le débit global est invraisemblable.
    # Ce filtre passe AVANT la comparaison des dispersions : sans lui, un seuil
    # qui fragmente la parole gagne le concours de régularité tout en décrivant
    # une élocution que personne ne pourrait produire.
    plausibles = [e for e in essais if DEBIT_MIN <= e[4] <= DEBIT_MAX]
    if plausibles:
        essais = plausibles
    else:
        print(
            f"  aucun seuil ne donne un débit entre {DEBIT_MIN} et {DEBIT_MAX} "
            "syll/s — le script ne correspond peut-être pas à cette piste.",
            file=sys.stderr,
        )

    meilleur = None
    for k, (seuil, brute, groupes, tranches, debit_g) in enumerate(essais):
        voisins = [e[1] for e in essais[max(0, k - 1) : k + 2]]
        lisse = sorted(voisins)[len(voisins) // 2]
        if trace:
            print(
                f"  seuil {seuil:.2f} → {len(groupes):3} groupes, "
                f"{debit_g:5.2f} syll/s, dispersion {brute:.3f} (lissée {lisse:.3f})"
            )
        # À égalité de valeur lissée, on départage sur la dispersion brute.
        if meilleur is None or (lisse, brute) < (meilleur[0], meilleur[1]):
            meilleur = (lisse, brute, seuil, groupes, tranches)
    return meilleur[2], meilleur[3], meilleur[4]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    audio, module = sys.argv[1], sys.argv[2]
    if module not in SCRIPTS:
        print(f"module inconnu ; connus : {', '.join(sorted(SCRIPTS))}", file=sys.stderr)
        sys.exit(3)
    phrases = SCRIPTS[module]

    env = enveloppe(audio)
    fin = len(env) * FENETRE

    # Regroupement des phrases par beat, dans l'ordre.
    beats = []
    for beat, texte in phrases:
        if not beats or beats[-1][0] != beat:
            beats.append((beat, []))
        beats[-1][1].append(texte)
    syl_beat = [sum(compter(t) for t in ts) for _, ts in beats]

    print("Choix du seuil de silence, par cohérence de l'alignement :")
    seuil, groupes, tranches = choisir_seuil(env, syl_beat, trace=True)
    durees = [b - a for a, b in groupes]
    parole = sum(durees)
    debit = sum(syl_beat) / parole

    print(f"\nseuil retenu {seuil:.2f}")
    print(f"durée {fin:.2f} s | parole {parole:.2f} s | {len(groupes)} groupes")
    print(f"{sum(syl_beat)} syllabes | débit {debit:.2f} syll/s")
    print(f"{len(beats)} beats, {len(phrases)} phrases\n")

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
