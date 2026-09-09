# Cappy — la bible

Le document de référence de la série : qui est Cappy, à quoi ressemble son
monde, ce qu'un épisode a le droit de faire. Tout ce qui se génère — paroles,
images, clips — doit pouvoir se justifier ici. Quand un épisode et la bible se
contredisent, c'est la bible qui gagne, ou c'est la bible qu'on change
sciemment.

## Le pitch

Un petit personnage à chapeau de champignon vit seul dans une cabane en bois,
au bord d'un ruisseau. Chaque épisode est une journée sans histoire : il se
réveille, il marche, il regarde, il rentre. Une chanson douce porte le tout.
Format vertical, une minute, aucune parole dite — seulement chantée.

Ce n'est pas une série d'aventures. Il ne se passe presque rien, et c'est le
sujet.

## Cappy

Ce qui ne change jamais, d'un plan à l'autre comme d'un épisode à l'autre :

- **Taille** — trente centimètres. Le monde est vu d'en bas : les fougères sont
  hautes, les marches de la cabane sont des obstacles.
- **Corps** — rond, beige crème, lisse, sans poils. Bras courts, jambes
  courtes, pieds nus et larges.
- **Chapeau** — un chapeau de champignon rouge-orangé mat, un peu trop grand
  pour lui, six taches crème irrégulières, bords souples qui bougent quand il
  marche. Il ne l'enlève jamais, il ne tombe jamais.
- **Yeux** — deux points noirs ronds, très écartés. **Pas de bouche.** Tout
  passe par la posture et l'inclinaison du chapeau.
- **Besace** — une petite besace en toile écrue, portée en bandoulière. Elle est
  toujours là, même quand elle ne sert à rien.
- **Démarche** — lente, un léger dandinement. Il ne court pas. Il ne saute pas.

### Le bloc verrouillé

À coller **au début de chaque `image_prompt`**, mot pour mot. C'est ce qui tient
la ressemblance d'un plan à l'autre ; le reste du prompt décrit la scène.

```
Cappy, a small round mushroom character 30 cm tall, cream-beige smooth body,
short arms and wide bare feet, oversized soft red-orange mushroom cap with six
irregular cream spots, two small round black eyes, no mouth, tiny woven satchel
across the chest; hand-painted gouache storybook style, warm natural light,
soft grain, vertical 9:16 composition
```

Et ce qu'on refuse, à passer en négatif : `no text, no logos, no other people,
no modern objects, no glossy 3D render, no harsh contrast, no motion blur`.

## Le monde

- **La cabane** — une seule pièce en rondins, un lit bas, une fenêtre carrée à
  l'est, une table, une théière. Identique dans tous les épisodes : c'est le
  décor le plus reconnaissable de la série, il ne se réaménage pas.
- **Le ruisseau** — peu profond, à dix pas de la porte, des galets ronds, on y
  marche pieds nus.
- **La clairière, les fougères, la colline** — le reste du monde tient en trois
  lieux. On n'en ajoute pas un quatrième sans l'écrire ici.
- **Les saisons** — un épisode se passe dans une seule saison, décidée dans le
  brief. L'été est la saison par défaut.
- **Les autres** — pas d'humains, jamais. Des animaux muets, de passage : une
  grenouille, un héron, des lucioles. Ils ne parlent pas et ne deviennent pas
  des personnages.

## Le ton

Ce que la série fait : regarder, attendre, refaire les mêmes gestes.

Ce qu'elle ne fait pas, et c'est ferme :

- pas de dialogue, pas de voix off, pas de texte à l'écran ;
- pas de méchant, pas de danger, pas de tension à résoudre ;
- pas de gag, pas de chute comique ;
- pas de coupe rapide, pas de zoom brusque, pas de musique qui monte ;
- pas de morale à la fin.

Si un épisode a besoin d'un conflit pour tenir, c'est que la chanson n'est pas
assez bonne.

## La chanson

- **Langue** — anglais. C'est la seule chose qui parle dans la série.
- **Style** — folk douce, guitare nylon, voix proche et basse en volume, un peu
  de souffle. Tempo entre 70 et 80 BPM.
- **Durée** — une minute, jamais plus.
- **Structure** — intro instrumentale, couplet, refrain, couplet, sortie. Le
  refrain revient une seule fois : c'est ce qui garde la minute calme.
- **Sujet** — ce que Cappy fait ce jour-là, à la deuxième personne. Pas de
  narration à la troisième personne, pas de « je ».

## La grammaire visuelle

- **Format** — 1080 × 1920, 30 images par seconde.
- **Style** — gouache peinte à la main, grain visible, contours doux. Jamais de
  rendu 3D lisse.
- **Lumière** — l'heure de la journée est décidée par plan et avance dans le
  sens de la journée : on ne repasse pas du soir au matin.
- **Caméra** — **un seul mouvement par plan**, lent : travelling avant,
  panoramique, ou fixe. Rien d'autre.
- **Échelle** — un plan large pour ouvrir, un plan large pour fermer. Entre les
  deux, des plans moyens à hauteur de Cappy.

## L'épisode

- Entre 55 et 65 secondes, dix à douze plans, de trois à huit secondes chacun.
- **Le premier plan est instrumental** : `lyrics` vide, on installe le lieu
  avant que la voix arrive.
- Le dernier plan s'éloigne et laisse la musique finir seule.
- Les plans sont bout à bout, sans trou ni recouvrement, du début à la fin de
  la chanson.

Le détail des fichiers — `brief.json`, `lyrics.txt`, `song_plan.json`,
`timeline.json` — est décrit dans `episodes/README.md`. La bible dit quoi
raconter, `episodes/README.md` dit où l'écrire.

## Continuité

Trois choses se vérifient à la relecture d'un épisode, avant de générer quoi
que ce soit :

1. Le bloc verrouillé est en tête de **chaque** `image_prompt`.
2. La cabane, le chapeau et la besace sont ceux d'hier.
3. La journée avance dans un seul sens, du matin vers le soir.

## Ce qui reste à trancher

À décider avant le deuxième épisode, parce que chaque épisode produit rend le
changement plus cher :

- Le nom de la série, et s'il est différent du nom du personnage.
- La plateforme visée en premier, et donc la cadence de publication.
- Un cycle fermé — quatre saisons, quatre épisodes — ou une série ouverte.
- Si `cappy-factory` est un projet à part ou si la série vit dans `episodes/`
  du dépôt `Jk`, à côté des vidéos existantes.
