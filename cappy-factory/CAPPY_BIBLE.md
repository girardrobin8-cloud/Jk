# Cappy — Character Bible

The reference for the series. Everything generated — lyrics, images, clips —
must be justifiable from this file. When an episode and the bible disagree, the
bible wins, or the bible gets changed on purpose.

Visual reference: [`reference/cappy_character_sheet.png`](reference/cappy_character_sheet.png)
— views, expressions, accessories and palette on one sheet. When a prompt and
the sheet disagree, the sheet wins.

## The pitch

Cappy is a small capybara with big dreams. Every episode is a 60-second sung
story about a gentle adventure: a river, a forest, a mountain, a new friend.
No dialogue, no villain, no peril. A kinder world, one minute at a time.

## Cappy

What never changes, from shot to shot and episode to episode:

- **Species** — a small capybara, chubby proportions, standing upright.
- **Fur** — warm caramel brown, soft and slightly fuzzy at the edges.
- **Eyes** — large, glossy, dark, wide apart. They carry every expression.
- **Muzzle** — rounded, dark brown nose, a few fine whiskers.
- **Ears** — small, rounded, set high.
- **Hoodie** — sage green, oversized, cream drawstrings. Iconic, always worn.
- **Backpack** — brown leather, worn on both shoulders, small tree emblem on
  the front pocket. Always there, even when it serves no purpose.

### The locked block

Paste this at the **start of every `image_prompt`**, word for word. It is what
holds the likeness together across shots; the rest of the prompt describes the
scene.

```
Cappy, a small chubby capybara character with warm caramel brown fur, large
glossy dark eyes, rounded muzzle, small ears, wearing an oversized sage green
hoodie with cream drawstrings and a brown leather backpack with a small tree
emblem; cinematic high-end 3D animated movie look, warm lighting, cute
expressive face, family friendly, rich environmental detail, shallow depth of
field, horizontal 16:9 composition
```

Negative prompt, every time: `no text, no logos, no humans, no scary imagery,
no dark or moody lighting, no photorealistic animal fur, no flat 2D cartoon,
no distorted anatomy`.

### Expressions

Eight, and no others. Named in the shot's `scene` field so the generation is
deliberate rather than accidental.

| Expression | When |
| --- | --- |
| Happy | The default. Most shots. |
| Surprised | A discovery, the start of a chorus. |
| Sad | Brief only, always resolved before the episode ends. |
| Mischievous | A small harmless trick. |
| Curious | Cappy looking at something new. Very common. |
| Determined | Climbing, walking uphill, setting off. |
| Amazed | The big reveal shot: a view, a mountain, a night sky. |
| Sleepy | The closing shot, almost always. |

### Accessories

- **Always** — the green hoodie and the leather backpack.
- **Optional** — the coffee cup, the brown cap. One per episode at most.
- **Story props** — a leaf (his favourite snack), a croissant (his weakness),
  a rubber duck (his best friend), a globe (he wants to travel), a camera (he
  explores the world). One props at a time, and it should be the reason the
  episode exists.

### Palette

Four colours, approximated from the sheet — confirm the exact values before the
first render.

| Role | Approx. |
| --- | --- |
| Fur, caramel brown | `#A9763F` |
| Hoodie, sage green | `#7C8F63` |
| Cream, drawstrings and highlights | `#EFDFB8` |
| Dark brown, nose, outlines, leather | `#4A3728` |

## The world

- **Themes** — nature, friendship, kindness, exploration, positive adventures,
  animals.
- **Places** — rivers, forests, mountains. A new location per episode is fine,
  as long as it belongs to those three families.
- **Other characters** — animals only, silent, passing through. No humans, ever.
- **Time** — one episode is one continuous stretch of time, moving forward. The
  light never goes backwards from evening to morning.

## Tone

Made for young children and families. What the series never does:

- no dialogue, no voice-over, no on-screen text;
- no villain, no danger, no conflict to resolve;
- no sarcasm, no adult jokes;
- no fast cuts, no whip pans, no music that swells for tension;
- no moral spelled out at the end.

## The song

- **Language** — English, simple vocabulary a five-year-old follows.
- **Style** — acoustic pop: ukulele, piano, bells, light drums.
- **Mood** — positive, warm, never frantic.
- **Chorus** — catchy, repeated, the one line a child sings back.
- **Length** — 60 seconds exactly.
- **Point of view** — second person, addressed to Cappy or to the listener.

## Visual grammar

- **Format** — 16:9 horizontal, for YouTube.
- **Look** — cinematic high-end 3D animated movie, the register of a feature
  film, not a game engine.
- **Light** — warm, natural, generous. Golden hour is the house default.
- **Depth** — shallow depth of field, soft background.
- **Detail** — rich environments: foliage, water, dust in the light, texture.
- **Camera** — one slow move per shot, and one only: push in, pan, or locked
  off. Nothing else.
- **Scale** — Cappy is small. Frame him from low angles, with tall grass, high
  ferns, big trees.

## The episode

60 seconds, **12 scenes of 5 seconds**, no exception.

| Scene | Time | Role |
| --- | --- | --- |
| 1 | 0–5 | Wake up, establish the place. Usually instrumental. |
| 2–3 | 5–15 | Set off. First verse. |
| 4–6 | 15–30 | The journey, the discovery. Chorus lands here. |
| 7–9 | 30–45 | The friend, the prop, the small event. Second verse. |
| 10–11 | 45–55 | Chorus back, the widest and most beautiful shot. |
| 12 | 55–60 | Home, sleepy, the music finishes alone. |

Shots are back to back, no gap and no overlap, from the first frame to the last
note.

## Continuity checklist

Before generating anything for an episode:

1. The locked block opens **every** `image_prompt`.
2. Hoodie, backpack and tree emblem are unchanged.
3. One accessory or prop at most, and it earns its place.
4. The expression of each shot is one of the eight, and it is written down.
5. Time moves in one direction across the twelve scenes.

## Where episodes live

The file layout of an episode — `brief.json`, `lyrics.txt`, `song_plan.json`,
`timeline.json` — is described in [`../episodes/README.md`](../episodes/README.md).
The bible says what to tell; that README says where to write it.

Two things there still assume the older, vertical format and will need updating
when the first Cappy episode is written: the 1080 × 1920 checks in
`scripts/episode.py`, and the French example episode `ep_001`.

## Open questions

- The channel name, and whether it differs from the character's name.
- Upload cadence, and how many episodes exist before the first one goes out.
- Whether the series lives in `cappy-factory/` or in `episodes/` alongside the
  existing videos.
- The exact palette values, to be read off the source file rather than eyeballed
  from the sheet.
