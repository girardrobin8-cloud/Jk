# Modèle unique de Reel

Un Reel = **un fichier JSON** dans `src/ReelAuto/reels/` + **une voix off** dans `public/reels/<date>/voix.mp3`. Aucune ligne de code à écrire par vidéo.

## Fabriquer un Reel

1. Écrire le texte (structure en 5 temps, 20 à 40 s).
2. Générer la voix off avec ElevenLabs et la poser dans `public/reels/<date>/voix.mp3`.
3. Transcrire la voix (ElevenLabs Scribe) pour avoir le moment de chaque mot : c'est la liste `mots` du JSON.
4. Écrire les `scenes` : chacune a un `debut` (en secondes) et un `type`. Elle dure jusqu'à la suivante.
5. Déclarer la composition dans `src/Root.tsx` (copier le bloc `Reel-2026-10-19`).
6. Rendre : `npx remotion render Reel-<date>`.

## Les types de scène

| Type | À quoi ça sert | Champs |
|---|---|---|
| `accroche` | La phrase choc des 3 premières secondes | `texte`, `motsCles`, `video` (ton plan face caméra, optionnel) |
| `titre` | Une idée en gros | `texte`, `sousTexte`, `motsCles` |
| `point` | Point numéroté 1, 2, 3 | `numero`, `texte`, `sousTexte` |
| `chiffre` | Un chiffre qui compte | `valeur`, `prefixe`, `unite`, `legende` |
| `etude` | Carte « Étude », source à l'écran | `resultat`, `source`, `detail` |
| `barres` | Comparaison en barres | `titre`, `barres[]` (`label`, `valeur`, `affichage`, `ton`) |
| `classement` | Du pire au meilleur, en paliers S/A/B/C/D | `titre`, `lignes[]` (`palier`, `texte`) |
| `cta` | Écran de fin « Écris PROGRAMME » | `mot`, `texte`, `sousTexte` |

## Ce que le modèle fait tout seul

- La charte (`charte.ts`) : fond noir, vert `#2FBF71`, polices Anton et Inter, embarquées dans le projet.
- Les sous-titres mot par mot, le mot prononcé en vert.
- Les zones sûres : rien sous `y = 1500`, marge à droite pour les boutons.
- Un bruitage à chaque nouvelle scène, un léger zoom continu, une barre de progression en haut.
- La durée de la vidéo, calée sur la voix.

Une vidéo de fond (`fond`) est possible : elle passe dessous, assombrie.
