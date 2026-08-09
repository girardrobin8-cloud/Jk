# CLI

Tout ce qui se fait en ligne de commande sur ce dépôt : lancer le studio,
rendre une vidéo, régénérer les bruitages, fabriquer une voix off.

## Prérequis

- Node 18 ou plus récent, puis `npm i` (Remotion embarque son propre ffmpeg,
  rien d'autre à installer).
- Python 3 pour les scripts de `scripts/` — bibliothèque standard uniquement,
  aucune dépendance à installer.

## Studio

```console
npm run dev
```

Ouvre le studio Remotion sur <http://localhost:3000> : la liste des
compositions est dans la barre latérale, et chaque modification de `src/` est
rechargée à chaud. C'est là qu'on cale les animations, pas dans un rendu.

## Rendre une vidéo

```console
npx remotion render <id> out/<nom>.mp4
```

Sans chemin de sortie, le fichier atterrit dans `out/`, qui est hors dépôt.
`Config.setOverwriteOutput(true)` est déjà posé dans `remotion.config.ts` : un
rendu écrase le précédent sans poser de question.

Pour lister les identifiants disponibles sans ouvrir le studio :

```console
npx remotion compositions
```

| Identifiant             | Format      | Contenu                                                  |
| ----------------------- | ----------- | -------------------------------------------------------- |
| `Montre`                | 1080 × 1920 | « Ta montre surestime tes calories », montage complet     |
| `Proteines`             | 1080 × 1920 | « Seul le total quotidien compte »                        |
| `MemoireMusculaire`     | 1080 × 1920 | « La mémoire musculaire »                                 |
| `Metabolisme`           | 1080 × 1920 | « Pourquoi ta perte de poids stagne », rushes + animation |
| `MetabolismeAnimation`  | 1080 × 1920 | L'animation seule, pour la régler sans relire les rushes  |
| `Energisante`           | 1080 × 1920 | Étiquette de boisson énergisante                          |
| `CafeineTitreVertical`  | 1080 × 1920 | Scène d'ouverture seule, format TikTok / Reels            |
| `Cafeine`               | 1920 × 1080 | Le montage caféine complet                                |
| `HelloWorld`, `OnlyLogo`| 1920 × 1080 | Compositions d'exemple livrées avec Remotion              |

Toutes les compositions tournent à 30 images par seconde ; les durées sont
calculées dans le code (`MONTAGE_FRAMES`, `DUREE_TOTALE`) et non dans
`Root.tsx`, donc rallonger la voix off suffit à rallonger la vidéo.

### Options qui servent vraiment

```console
# Ne rendre qu'un passage, pour vérifier un raccord (bornes en images, incluses)
npx remotion render Montre out/extrait.mp4 --frames=120-260

# Rendu d'épreuve deux fois plus petit, donc bien plus rapide
npx remotion render Montre out/epreuve.mp4 --scale=0.5

# Limiter les rendus parallèles si la machine sature
npx remotion render Metabolisme --concurrency=2

# Une image fixe, par exemple pour la vignette
npx remotion still Montre out/vignette.png --frame=90

# Passer des props à une composition qui en accepte (schéma zod)
npx remotion render HelloWorld --props='{"titleText":"Salut"}'
```

## Médias

`public/` est la racine de `staticFile()`. Trois dossiers, trois régimes :

- `public/sfx/` — versionné, régénérable (voir ci-dessous).
- `public/voix/` — les voix off (`montre.mp4`, `proteines.mp4`, `memoire.mp4`),
  **hors dépôt**.
- `public/rushes/` — les rushes filmés (`rushA.mp4`, `rushB.mp4`),
  **hors dépôt**.

Les deux derniers sont ignorés par git : il faut les remettre à la main dans un
dépôt fraîchement cloné. Sans eux, le rendu des compositions concernées échoue
sur un fichier introuvable — `MetabolismeAnimation` reste rendable, puisqu'elle
n'utilise ni voix ni rushes.

### Bruitages

```console
python3 scripts/bruitages.py
```

Réécrit les sept fichiers de `public/sfx/`. Tout est synthétisé dans le script,
avec une graine fixe : deux exécutions donnent des fichiers identiques. À
relancer seulement après avoir touché au script.

### Voix off

```console
export ELEVENLABS_API_KEY=sk_...
python3 scripts/voixoff.py --lister
python3 scripts/voixoff.py "Ta montre surestime tes calories." \
    --voix <identifiant> --sortie public/voix/montre.mp3
```

`--lister` affiche les voix du compte, les voix d'homme les plus graves en
tête ; sans `--voix`, le script prend la première de ce classement. Les
réglages de rendu se poussent avec `--stabilite`, `--ressemblance` et
`--style` (au-delà de ~0,3, le style rend une phrase courte théâtrale).

## Vérifications

```console
npm run lint
```

Enchaîne ESLint sur `src` puis `tsc` — c'est le contrôle à passer avant de
committer. Le formatage suit `.prettierrc` :

```console
npx prettier --write .
```

## Maintenance

```console
npm run upgrade   # remotion upgrade : met à jour tous les paquets Remotion ensemble
npm run build     # remotion bundle : construit le bundle, pour un rendu côté serveur
```

## Dépannage

- **`Cannot find composition <id>`** — l'identifiant est sensible à la casse ;
  `npx remotion compositions` donne la liste exacte.
- **Le rendu échoue sur un fichier de `public/voix` ou `public/rushes`** — ces
  médias sont hors dépôt, voir *Médias* ci-dessus.
- **Rendu très lent ou machine qui rame** — baisser `--concurrency`, ou passer
  par `--scale=0.5` tant qu'on est en phase de réglage.
- **Le son des bruitages est inaudible sous la voix** — les volumes sont dans
  les tables de beats (`src/Montre/beats.ts`, `src/*/reperes.ts`), pas dans
  les fichiers WAV.
