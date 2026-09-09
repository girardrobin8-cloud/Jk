# Épisodes

Un épisode = un dossier `ep_XXX`, et tout ce qu'il faut pour le refabriquer.
Le texte et les plans sont versionnés ; les médias, non — ils se régénèrent
depuis les fichiers versionnés (voir `.gitignore` à la racine).

```
episodes/
  ep_001/
    brief.json      Ce qu'on raconte et pourquoi          versionné
    lyrics.txt      Les paroles, par section              versionné
    song_plan.json  Comment la chanson est commandée      versionné
    song.mp3        La chanson générée                    hors dépôt
    timeline.json   Le montage : un plan par intervalle   versionné
    images/         Une image fixe par plan               hors dépôt
    clips/          Chaque image animée en clip           hors dépôt
    thumbnail.png   La miniature                          hors dépôt
    metadata.json   Titre, description, publication       versionné
    final.mp4       Le rendu                              hors dépôt
```

`ep_001` sert de référence : c'est l'épisode complet dont on copie la forme.

## L'ordre de fabrication

Chaque étape ne lit que les précédentes, donc on peut reprendre au milieu sans
tout refaire.

1. **`brief.json`** — le sujet, l'angle, les points à tenir, les sources. Écrit
   à la main. Rien ne commence avant.
2. **`lyrics.txt`** — les paroles, écrites depuis le brief. Une balise `[ ]` par
   section, dans l'ordre ; les lignes `#` sont des notes, pas du chant.
3. **`song_plan.json`** — le style, le tempo, la tonalité, le prompt du modèle
   et la structure en sections. Les sections doivent reprendre, dans le même
   ordre, les balises de `lyrics.txt`.
4. **`song.mp3`** — la chanson générée depuis `song_plan.json` et `lyrics.txt`.
   C'est elle qui fixe la durée réelle : si elle diffère du plan, c'est
   `timeline.json` qui s'aligne sur l'audio, jamais l'inverse.
5. **`timeline.json`** — le montage : une liste de plans, bout à bout, sans trou
   ni recouvrement, du début à la fin de la chanson (voir le format plus bas).
6. **`images/`** — une image fixe par plan, générée depuis `image_prompt`.
7. **`clips/`** — chaque image animée en clip, selon `video_prompt`.
8. **`final.mp4`** — le rendu Remotion : les clips posés sur la chanson.
9. **`thumbnail.png`** et **`metadata.json`** — la miniature et de quoi publier.

## Le format de `timeline.json`

Une liste, un objet par plan, six clés dans cet ordre :

```json
[
  {
    "start": 0,
    "end": 3,
    "lyrics": "",
    "scene": "Cuisine sombre au petit matin, une tasse vide",
    "image_prompt": "Cuisine sombre au petit matin, tasse vide sur un plan de travail...",
    "video_prompt": "Lent travelling avant sur la tasse, poussière dans la lumière"
  }
]
```

- `start` et `end` — en secondes, bornes du plan. Le premier plan part de 0,
  chaque plan reprend exactement là où le précédent s'arrête, le dernier finit
  avec la chanson.
- `lyrics` — les paroles chantées pendant ce plan, **copiées de `lyrics.txt`**.
  Vide pour un passage instrumental. `verifier` retrouve chaque extrait dans
  `lyrics.txt` : c'est ce qui empêche les deux fichiers de diverger.
- `scene` — ce qu'on voit, en une ligne. Sert à relire le montage sans lire les
  prompts.
- `image_prompt` — le prompt de l'image fixe.
- `video_prompt` — comment cette image s'anime : mouvement de caméra, action.

Les noms de fichiers ne sont écrits nulle part, ils se déduisent du rang du
plan : le troisième plan, c'est `images/p03.png` et `clips/p03.mp4`.

## Conventions

- **Identifiants** : `ep_` suivi de trois chiffres, incrémenté sans trou.
- **Plans** : numérotés `pNN` dans l'ordre du montage ; l'image et le clip d'un
  plan portent son numéro, c'est ce qui permet de vérifier le dossier sans
  ouvrir les médias.
- **Temps** : en secondes dans les JSON. Le nombre d'images se déduit du `fps`
  du brief (30 partout), il ne s'écrit pas à la main.
- **Format** : 1080 × 1920 à 30 i/s, comme le reste du dépôt.
- **Chemins** : relatifs au dossier de l'épisode, jamais absolus.

## Commandes

```console
# Créer le squelette d'un nouvel épisode
python3 scripts/episode.py nouveau ep_002 --titre "Le sucre du soir"

# Vérifier un épisode : fichiers, JSON, cohérence de la timeline
python3 scripts/episode.py verifier ep_001

# L'état de tous les épisodes, étape par étape
python3 scripts/episode.py lister
```

`verifier` distingue deux choses : ce qui est **cassé** (JSON illisible, plans
qui se chevauchent, identifiant qui ne correspond pas au dossier) et ce qui est
seulement **à produire** (les médias absents). Seul le premier cas fait échouer
la commande.

Ce que `verifier` refuse : un JSON illisible, un identifiant qui ne correspond
pas au dossier, des sections de `lyrics.txt` et de `song_plan.json` qui
divergent, un plan sans ses six clés, des plans qui laissent un trou ou se
recouvrent, un extrait de `lyrics` introuvable dans `lyrics.txt`, une durée
totale trop loin de celle visée par le brief.
