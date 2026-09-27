import { useCurrentFrame, useVideoConfig } from "remotion";
import { M } from "../Muscle/Plan";
import {
  AMBRE,
  corps,
  CX,
  CYAN,
  EnTete,
  Etiquette,
  faireTransition,
  Jauge,
  melange,
  NEON,
  Panneau,
  rd,
  SOCLE,
  Txt,
} from "../commun/Motion";
import { BEATS, CAMERA, FONDU, mappe } from "./reperes";

/**
 * Le motion design du reel Jour 5, en UN SEUL composant continu lisant le temps
 * ABSOLU du montage.
 *
 * Le brief impose un découpage strict : deux blocs caméra et deux blocs animés,
 * pas un de plus, et la vidéo se termine en motion design. Ce découpage est
 * respecté à la lettre — mais l'export livré n'a pas d'image, donc les quatre
 * blocs sont animés pour l'instant. `CAMERA`, dans reperes.ts, rend B1 et B3 à
 * la caméra en une ligne le jour du tournage.
 *
 * Le fil du montage est une seule courbe : celle de la progression. Elle
 * s'aplatit au beat 1 — c'est la stagnation — et c'est la tension mécanique,
 * puis le repos, qui la font repartir. Tout le reste s'y raccroche.
 *
 * Aucun bruitage : le montage ne porte que la voix.
 */

const transition = faireTransition(BEATS, FONDU);
const aLaCamera = (id: string) => CAMERA.includes(id);

// ── Repères internes, en secondes de l'export d'origine ──────────────────
const RUSH = {
  // ── B1 — 0 → 20,95 : le hook, le mythe, la tension mécanique
  stagner: 0.4, // « stagner, c'est ce qui attend ton programme » 0,4 → 1,7
  pousses: 2.0, // « tu ne pousses pas plus loin »        2,1 → 3,1
  meilleur: 5.0, // « même avec le meilleur programme »    3,7 → 5,9
  comment: 6.6, // « comment on fait pour progresser »     6,6 → 8,4
  volume: 9.2, // « il faut augmenter le volume »          9,2 → 11,2
  series1: 9.9, // les séries qui s'empilent, pendant qu'il le dit
  enRealite: 11.8, // « en réalité ton muscle grossit »    11,9 → 12,9
  tension: 14.0, // « grâce à la tension mécanique »       14,2 → 14,7
  sansTension: 15.3, // « sans augmenter cette tension »   15,3 → 16,2
  signal: 16.5, // « le signal reste le même »             16,5 → 17,4
  plusDeRaison: 17.8, // « plus de raison de construire »  17,8 → 20,4

  // ── B2 — 20,95 → 29,00 : les deux leviers qui marchent
  poids: 21.7, // « augmenter le poids sur ta barre »      21,8 → 23,7
  reps: 24.1, // « plus de répétitions à charge égale »    24,2 → 26,1
  lesDeux: 26.6, // « les 2 fonctionnent aussi bien »      26,7 → 28,6

  // ── B3 — 29,00 → 34,75 : ce qui n'est pas la solution
  series: 29.3, // « augmenter ton nombre de séries »      29,1 → 30,5
  repos: 31.3, // « réduire son temps de repos »           31,2 → 32,8
  pasIdeale: 33.2, // « n'est pas une solution idéale »    33,3 → 34,2

  // ── B4 — 34,75 → fin : l'étude, puis le CTA
  etude: 34.9, // « une étude a comparé »                  34,9 → 35,6
  uneMin: 36.0, // « 1 minute de temps de repos »          36,1 → 37,0
  troisMin: 37.5, // « contre 3 »                          37,6 → 37,8
  identique: 38.2, // « à l'entraînement identique »       38,2 → 39,9
  huitSem: 40.2, // « sur 8 semaines »                     40,3 → 40,8
  groupe: 41.2, // « le groupe qui se reposait le plus »   41,3 → 42,9
  gagne: 43.3, // « a gagné plus de force et de muscle »   43,4 → 45,0
  toiAussi: 45.8, // « si toi aussi tu veux progresser »   45,9 → 47,1
  envoie: 47.6, // « envoie-moi PROGRESSION en DM »        47,7 → 48,8
  profil: 49.1, // « on regardera ton profil ensemble »    49,2 → 50,2
};

/** Les mêmes repères, transposés dans le montage aux blancs resserrés. */
const T = Object.fromEntries(Object.entries(RUSH).map(([c, v]) => [c, mappe(v)])) as typeof RUSH;

/**
 * La courbe de progression, qui monte puis s'aplatit.
 *
 * `plafond` dit à quelle hauteur elle cesse de monter, `avance` la fait se
 * DESSINER de gauche à droite. C'est le seul dessin du beat 1 et il porte tout
 * le sujet : on voit l'aplatissement arriver avant que Robin ne le nomme.
 */
const progression = (avance: number) => {
  const x0 = 150;
  const l = 780;
  const base = 1240;
  const h = 380;
  const n = Math.max(2, Math.round(72 * avance));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = i / 72;
    pts.push(`${x0 + p * l},${base - h * (1 - Math.exp(-3.6 * p))}`);
  }
  return `M ${pts.join(" L ")}`;
};

export const Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b = Object.fromEntries(BEATS.map((x) => [x.id, transition(t, x.id)])) as Record<
    string,
    { e: number; dy: number; k: number }
  >;
  if (Math.max(...BEATS.map((x) => b[x.id].e)) <= 0) return null;

  const ouverture = (id: string) => {
    const d = BEATS.find((x) => x.id === id)!.debut;
    return rd(t, d - FONDU * 0.35, d + 0.3);
  };
  /** Un libellé de socle cède la place au suivant AVANT qu'il n'entre. */
  const cede = (quand: number) => 1 - rd(t, quand - 0.55, quand - 0.15);

  // ── B1 — quatre écrans ────────────────────────────────────────────────
  const stagner = rd(t, T.stagner, T.stagner + 0.7);
  const courbe = rd(t, T.pousses, T.pousses + 2.4);
  const meilleur = rd(t, T.meilleur, T.meilleur + 0.7);
  const e1b = rd(t, T.comment - 0.5, T.comment + 0.25);
  const comment = rd(t, T.comment, T.comment + 0.8);
  const e1c = rd(t, T.volume - 0.5, T.volume + 0.25);
  const volume = rd(t, T.volume, T.volume + 0.8);
  /** Les séries qui s'empilent sous l'encadré : c'est « plus de volume », et
      c'est ce qui occupe les deux secondes où Robin l'énonce. */
  const series1 = rd(t, T.series1, T.series1 + 1.5);
  const enRealite = rd(t, T.enRealite, T.enRealite + 0.7);
  const tension = rd(t, T.tension, T.tension + 0.9);
  const e1d = rd(t, T.sansTension - 0.5, T.sansTension + 0.25);
  const jTension = rd(t, T.sansTension, T.sansTension + 0.8) * 0.52;
  const jSignal = rd(t, T.signal, T.signal + 0.8) * 0.52;
  const jMuscle = rd(t, T.plusDeRaison + 0.6, T.plusDeRaison + 1.6) * 0.52;
  const plusDeRaison = rd(t, T.plusDeRaison, T.plusDeRaison + 0.8);

  // ── B2 ────────────────────────────────────────────────────────────────
  const poids = rd(t, T.poids, T.poids + 1.4) * 0.82;
  const reps = rd(t, T.reps, T.reps + 1.4) * 0.82;
  const lesDeux = rd(t, T.lesDeux, T.lesDeux + 0.9);

  // ── B3 ────────────────────────────────────────────────────────────────
  const series = rd(t, T.series, T.series + 0.7);
  const repos = rd(t, T.repos, T.repos + 0.7);
  const pasIdeale = rd(t, T.pasIdeale, T.pasIdeale + 0.7);

  // ── B4 — quatre écrans ────────────────────────────────────────────────
  const uneMin = rd(t, T.uneMin, T.uneMin + 0.7);
  const troisMin = rd(t, T.troisMin, T.troisMin + 0.7);
  const identique = rd(t, T.identique, T.identique + 0.7);
  const huitSem = rd(t, T.huitSem, T.huitSem + 0.6);
  const e4b = rd(t, T.groupe - 0.5, T.groupe + 0.25);
  const barres = rd(t, T.groupe, T.groupe + 1.5);
  const gagne = rd(t, T.gagne, T.gagne + 0.8);
  const e4c = rd(t, T.toiAussi - 0.5, T.toiAussi + 0.25);
  const toiAussi = rd(t, T.toiAussi, T.toiAussi + 0.8);
  const e4d = rd(t, T.envoie - 0.5, T.envoie + 0.25);
  const envoie = rd(t, T.envoie, T.envoie + 0.8);
  const profil = rd(t, T.profil, T.profil + 0.7);

  return (
    <>
      {/* ══ B1 — le hook, le mythe, la tension ═════════════════════════ */}
      {/* Le brief veut ce bloc en caméra d'un bout à l'autre. Faute de
          tournage il est animé en quatre écrans ; ajouter "B1" à CAMERA le
          fait disparaître d'un coup. */}
      {!aLaCamera("B1") && (
        <Panneau {...b.B1} t={t}>
          <EnTete opacity={ouverture("B1") * (1 - e1b)}>TON PROGRAMME</EnTete>
          <EnTete opacity={e1b * (1 - e1c)}>LA VRAIE QUESTION</EnTete>
          <EnTete opacity={e1c * (1 - e1d)}>CE QUI FAIT GROSSIR LE MUSCLE</EnTete>
          <EnTete opacity={e1d}>SANS AUGMENTER LA TENSION</EnTete>

          {/* Écran 1 — la courbe qui s'aplatit. */}
          {stagner > 0 && (
            <g opacity={1 - e1b}>
              <Txt
                x={CX}
                y={melange(780, 760, stagner)}
                taille={corps("STAGNER", 168, 8)}
                couleur={M.corail}
                espace={8}
                opacity={stagner}
              >
                STAGNER
              </Txt>
              {courbe > 0 && (
                <>
                  <line x1={150} y1={1240} x2={930} y2={1240} stroke={M.gris} strokeWidth={4} />
                  <path
                    d={progression(courbe)}
                    fill="none"
                    stroke={NEON}
                    strokeWidth={11}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {courbe > 0.72 && (
                    <line
                      x1={560}
                      y1={862}
                      x2={melange(560, 930, rd(courbe, 0.72, 1))}
                      y2={862}
                      stroke={M.corail}
                      strokeWidth={11}
                      strokeLinecap="round"
                    />
                  )}
                  <Txt x={CX} y={1320} taille={28} couleur={M.gris} espace={4}>
                    LE TEMPS
                  </Txt>
                </>
              )}
              {meilleur > 0 && (
                <Txt
                  x={CX}
                  y={melange(SOCLE + 10, SOCLE, meilleur)}
                  taille={corps("MÊME AVEC LE MEILLEUR PROGRAMME", 46, 3)}
                  couleur={M.texte}
                  espace={3}
                  opacity={meilleur}
                >
                  MÊME AVEC LE MEILLEUR PROGRAMME
                </Txt>
              )}
            </g>
          )}

          {/* Écran 2 — la question, seule. */}
          {comment > 0 && (
            <g opacity={comment * (1 - e1c)} transform={`translate(0 ${melange(20, 0, comment)})`}>
              <Txt x={CX} y={890} taille={corps("COMMENT", 136, 6)} couleur={M.texte} espace={6}>
                COMMENT
              </Txt>
              <Txt x={CX} y={1050} taille={corps("PROGRESSER ?", 136, 6)} couleur={NEON} espace={6}>
                PROGRESSER ?
              </Txt>
            </g>
          )}

          {/* Écran 3 — la réponse courante, puis la vraie. */}
          {volume > 0 && (
            <g opacity={(1 - e1d) * volume} transform={`translate(0 ${melange(-26, 0, volume)})`}>
              <Etiquette
                x={CX}
                y={720}
                l={720}
                h={156}
                couleur={AMBRE}
                vise={58}
                espace={3}
                opacity={melange(1, 0.3, enRealite)}
              >
                AUGMENTER LE VOLUME
              </Etiquette>
              <Txt x={CX} y={850} taille={30} couleur={M.gris} espace={4} opacity={melange(1, 0.3, enRealite)}>
                CE QU'ON ENTEND PARTOUT
              </Txt>
            </g>
          )}
          {series1 > 0 &&
            [0, 1, 2, 3, 4, 5].map((i) => {
              const e = rd(series1, i * 0.14, i * 0.14 + 0.4);
              return e <= 0 ? null : (
                <rect
                  key={i}
                  x={300 + i * 84}
                  y={melange(1000, 950, e)}
                  width={56}
                  height={melange(30, 80, e)}
                  fill={AMBRE}
                  opacity={e * (1 - e1d) * melange(0.9, 0.3, enRealite)}
                />
              );
            })}
          {enRealite > 0 && (
            <Txt
              x={CX}
              y={melange(1180, 1160, enRealite)}
              taille={corps("EN RÉALITÉ…", 76, 6)}
              couleur={M.gris}
              espace={6}
              opacity={enRealite * (1 - e1d) * (1 - tension)}
            >
              EN RÉALITÉ…
            </Txt>
          )}
          {tension > 0 && (
            <g opacity={(1 - e1d) * tension} transform={`translate(0 ${melange(26, 0, tension)})`}>
              <Txt x={CX} y={1120} taille={corps("LA TENSION", 118, 6)} couleur={M.texte} espace={6}>
                LA TENSION
              </Txt>
              <Txt x={CX} y={1270} taille={corps("MÉCANIQUE", 118, 6)} couleur={NEON} espace={6}>
                MÉCANIQUE
              </Txt>
            </g>
          )}

          {/* Écran 4 — même tension, même signal, donc rien de plus. */}
          {e1d > 0 && (
            <g opacity={e1d}>
              <Jauge x={240} l={190} haut={700} bas={1240} part={jTension} couleur={NEON} libelle="TENSION" />
              <Jauge x={CX} l={190} haut={700} bas={1240} part={jSignal} couleur={CYAN} libelle="SIGNAL" />
              <Jauge x={840} l={190} haut={700} bas={1240} part={jMuscle} couleur={M.gris} libelle="MUSCLE" />
              <Txt x={390} y={960} taille={52} couleur={M.gris} espace={5} opacity={jSignal}>
                =
              </Txt>
              <Txt x={690} y={960} taille={52} couleur={M.gris} espace={5} opacity={jMuscle}>
                =
              </Txt>
            </g>
          )}
          {plusDeRaison > 0 && (
            <Txt
              x={CX}
              y={melange(SOCLE + 100, SOCLE + 90, plusDeRaison)}
              taille={corps("PLUS DE RAISON DE CONSTRUIRE", 48, 3)}
              couleur={M.corail}
              espace={3}
              opacity={plusDeRaison}
            >
              PLUS DE RAISON DE CONSTRUIRE
            </Txt>
          )}
        </Panneau>
      )}

      {/* ══ B2 — les deux leviers ══════════════════════════════════════ */}
      {/* Le brief demande deux jauges qui montent en parallèle vers un résultat
          semblable. Elles montent donc à la même hauteur, à la même échelle, et
          c'est cette égalité qui est l'information. */}
      <Panneau {...b.B2} t={t}>
        <EnTete opacity={ouverture("B2")}>POUR PROGRESSER</EnTete>

        <Jauge x={320} l={250} haut={660} bas={1240} part={poids} couleur={NEON} libelle="PLUS DE POIDS" />
        <Jauge x={760} l={250} haut={660} bas={1240} part={reps} couleur={CYAN} libelle="PLUS DE RÉPÉTITIONS" />

        {/* L'accolade qui joint les deux sommets : elle dit « aussi bien l'un
            que l'autre » sans une ligne de texte de plus. */}
        {lesDeux > 0 && (
          <g opacity={lesDeux}>
            <path
              d={`M 320 ${1240 - 580 * 0.82 - 40} L 320 ${1240 - 580 * 0.82 - 74} L ${melange(320, 760, lesDeux)} ${1240 - 580 * 0.82 - 74} L ${melange(320, 760, lesDeux)} ${1240 - 580 * 0.82 - 40}`}
              fill="none"
              stroke={M.texte}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Txt x={CX} y={1240 - 580 * 0.82 - 128} taille={56} couleur={M.texte} espace={4} opacity={rd(lesDeux, 0.5, 1)}>
              =
            </Txt>
            <Txt
              x={CX}
              y={melange(SOCLE + 100, SOCLE + 90, lesDeux)}
              taille={corps("LES DEUX FONCTIONNENT AUSSI BIEN", 46, 3)}
              couleur={M.texte}
              espace={3}
            >
              LES DEUX FONCTIONNENT AUSSI BIEN
            </Txt>
          </g>
        )}
      </Panneau>

      {/* ══ B3 — ce qui n'est pas la solution ══════════════════════════ */}
      {/* Deuxième et dernier bloc caméra prévu par le brief, animé faute de
          tournage. */}
      {!aLaCamera("B3") && (
        <Panneau {...b.B3} t={t}>
          <EnTete opacity={ouverture("B3")}>CE QUI N'EST PAS IDÉAL</EnTete>

          {[
            { l: "PLUS DE SÉRIES", e: series, y: 820 },
            { l: "MOINS DE REPOS", e: repos, y: 1060 },
          ].map((c) =>
            c.e <= 0 ? null : (
              <g key={c.l} opacity={c.e} transform={`translate(0 ${melange(32, 0, c.e)})`}>
                <Etiquette x={CX} y={c.y} l={760} h={168} couleur={M.corail} vise={62} espace={3}>
                  {c.l}
                </Etiquette>
              </g>
            ),
          )}
          {pasIdeale > 0 && (
            <Txt
              x={CX}
              y={melange(SOCLE + 10, SOCLE, pasIdeale)}
              taille={corps("PAS LA SOLUTION IDÉALE", 52, 3)}
              couleur={M.texte}
              espace={3}
              opacity={pasIdeale}
            >
              PAS LA SOLUTION IDÉALE
            </Txt>
          )}
        </Panneau>
      )}

      {/* ══ B4 — l'étude, puis le CTA ══════════════════════════════════ */}
      {/* La vidéo se termine ici, en motion design : le brief interdit un retour
          caméra pour le CTA. Quatre écrans, sans changement de panneau. */}
      <Panneau {...b.B4} t={t}>
        <EnTete opacity={ouverture("B4") * (1 - e4b)}>UNE ÉTUDE A COMPARÉ</EnTete>
        <EnTete opacity={e4b * (1 - e4c)}>LE GROUPE À 3 MINUTES</EnTete>
        <EnTete opacity={e4c * (1 - e4d)}>SI TOI AUSSI</EnTete>
        <EnTete opacity={e4d}>ENVOIE-MOI</EnTete>

        {/* Écran 1 — les deux temps de repos, côte à côte. */}
        {uneMin > 0 && (
          <g opacity={1 - e4b}>
            {[
              { x: 300, l: "1 MIN", e: uneMin, c: M.texte },
              { x: 780, l: "3 MIN", e: troisMin, c: M.texte },
            ].map((g) => (
              <g key={g.l} opacity={g.e} transform={`translate(0 ${melange(30, 0, g.e)})`}>
                <Etiquette x={g.x} y={800} l={380} h={220} couleur={g.c} vise={110} espace={4}>
                  {g.l}
                </Etiquette>
              </g>
            ))}
            <Txt x={CX} y={1010} taille={30} couleur={M.gris} espace={4} opacity={troisMin}>
              DE REPOS
            </Txt>
            {identique > 0 && (
              <Txt
                x={CX}
                y={1180}
                taille={corps("ENTRAÎNEMENT IDENTIQUE AILLEURS", 44, 3)}
                couleur={M.texte}
                espace={3}
                opacity={identique}
              >
                ENTRAÎNEMENT IDENTIQUE AILLEURS
              </Txt>
            )}
            {huitSem > 0 && (
              <Txt
                x={CX}
                y={melange(SOCLE + 10, SOCLE, huitSem)}
                taille={corps("SUR 8 SEMAINES", 52, 3)}
                couleur={M.texte}
                espace={3}
                opacity={huitSem * cede(T.groupe)}
              >
                SUR 8 SEMAINES
              </Txt>
            )}
          </g>
        )}

        {/* Écran 2 — le résultat, deux barres qui ne se ressemblent pas. */}
        {e4b > 0 && (
          <g opacity={e4b * (1 - e4c)}>
            {[
              { x: 300, l: "1 MIN", h: 128, c: M.corail },
              { x: 780, l: "3 MIN", h: 330, c: NEON },
            ].map((g) => (
              <g key={g.l}>
                <rect x={g.x - 92} y={1240 - g.h * barres} width={184} height={g.h * barres} fill={g.c} opacity={0.9} />
                <Txt x={g.x} y={1316} taille={38} couleur={g.c} espace={3}>
                  {g.l}
                </Txt>
              </g>
            ))}
            <line x1={150} y1={1240} x2={930} y2={1240} stroke={M.noir} strokeWidth={4} opacity={barres} />
            {gagne > 0 && (
              <g opacity={gagne} transform={`translate(0 ${melange(20, 0, gagne)})`}>
                <Txt x={CX} y={660} taille={corps("PLUS DE FORCE", 92, 5)} couleur={M.texte} espace={5}>
                  PLUS DE FORCE
                </Txt>
                <Txt x={CX} y={790} taille={corps("PLUS DE MUSCLE", 92, 5)} couleur={NEON} espace={5}>
                  PLUS DE MUSCLE
                </Txt>
              </g>
            )}
          </g>
        )}

        {/* Écran 3 — l'adresse au spectateur. */}
        {toiAussi > 0 && (
          <g opacity={toiAussi * (1 - e4d)} transform={`translate(0 ${melange(20, 0, toiAussi)})`}>
            <Txt x={CX} y={890} taille={corps("TU VEUX CONTINUER", 104, 5)} couleur={M.texte} espace={5}>
              TU VEUX CONTINUER
            </Txt>
            <Txt x={CX} y={1040} taille={corps("À PROGRESSER ?", 104, 5)} couleur={NEON} espace={5}>
              À PROGRESSER ?
            </Txt>
          </g>
        )}

        {/* Écran 4 — le CTA, à l'écran et non en caméra, comme le brief l'exige. */}
        {envoie > 0 && (
          <g opacity={envoie} transform={`translate(0 ${melange(28, 0, envoie)})`}>
            <Etiquette x={CX} y={900} l={840} h={210} couleur={NEON} vise={92} espace={5}>
              PROGRESSION
            </Etiquette>
            <Txt x={CX} y={1120} taille={44} couleur={M.gris} espace={6}>
              EN DM
            </Txt>
          </g>
        )}
        {profil > 0 && (
          <Txt
            x={CX}
            y={melange(SOCLE + 10, SOCLE, profil)}
            taille={corps("ON REGARDE TON PROFIL ENSEMBLE", 46, 3)}
            couleur={M.texte}
            espace={3}
            opacity={profil}
          >
            ON REGARDE TON PROFIL ENSEMBLE
          </Txt>
        )}
      </Panneau>
    </>
  );
};
