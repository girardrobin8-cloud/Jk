/**
 * Repères de montage — « Aspartame / Coca Zero » (39 s).
 *
 * ATTENTION, ces bornes ne sont PAS mesurées.
 *
 * Les autres montages du dépôt sont calés sur la prise réelle, relevée sur
 * l'enveloppe sonore par `scripts/caler.py`. Ici la prise n'a pas été fournie :
 * seul le brief est arrivé. Les valeurs ci-dessous sont donc une RECONSTRUCTION,
 * et la première chose à faire quand la voix sera livrée est de les remplacer :
 *
 *     python3 scripts/caler.py <prise.wav> aspartame
 *
 * Le script « aspartame » est déjà écrit dans SCRIPTS, prêt à tourner.
 *
 * Comment ces valeurs ont été obtenues, et pourquoi pas simplement celles du
 * brief. Le brief donne des timecodes lus sur les sous-titres automatiques,
 * « fiables à la seconde près ». Rapportés au nombre de syllabes de chaque
 * réplique, ils donnent des débits intenables : 7,60 syllabes par seconde en
 * temps horloge sur le pivot, contre 4,11 sur la comparaison. Or Robin tient
 * 6,1 et 6,7 syllabes par seconde de PAROLE sur les deux prises qui ont été
 * mesurées, soit environ 5,3 à 5,4 en temps horloge une fois les silences
 * comptés. 7,60 en temps horloge est hors de portée ; 4,11 supposerait des
 * silences énormes.
 *
 * Le total, lui, est juste : 216 syllabes sur 39 s font 5,54 syll/s, en plein
 * dans sa fourchette. Ce sont donc les bornes INTERNES qui dérivent, pas la
 * durée — exactement ce qu'on avait constaté sur « recomposition », où deux
 * bornes du brief étaient en retard d'une seconde et demie sur la mesure.
 *
 * Les valeurs retenues sont la moyenne entre les bornes du brief et un
 * découpage à débit horloge constant. Elles restent à moins d'une seconde des
 * unes comme de l'autre — donc dans la tolérance que le brief s'accorde
 * lui-même — et ramènent les débits de la plage 4,1–7,6 à la plage 4,7–6,4.
 * Les deux valeurs basses qui subsistent tombent sur les deux énumérations
 * (« le sel, le café, l'oxygène » et « l'aloe vera, ou certains légumes
 * fermentés »), qui se disent justement en marquant les temps.
 *
 * Ce montage a une particularité : le bloc 0:10–0:20 est dit d'un seul tenant
 * mais bascule du plan filmé à l'animation en son milieu, sur « j'oublie
 * souvent ce détail ». La bascule est donc INTERNE à une phrase continue. Elle
 * est le seul point du montage qui ne pourra pas être vérifié sans la prise :
 * partout ailleurs une bascule tombe entre deux répliques.
 *
 * Règle du brief : la voix est enregistrée d'un seul tenant et n'est JAMAIS
 * recoupée ni resynchronisée. Tout se pose PAR-DESSUS.
 *
 * Ni palette ni police ici : le montage reprend la charte du dépôt, définie
 * dans src/Muscle/Plan.tsx.
 *
 * Chiffres : OMS/CIRC, juillet 2023 — aspartame en groupe 2B. DJA maintenue à
 * 40 mg/kg par le JECFA. Soit 9 à 14 canettes par jour pour un adulte de 70 kg.
 */

export const FPS = 30;
/** Durée retenue. À remplacer par la durée exacte de la prise. */
export const DUREE = 39.0;

export type Beat = {
  id: string;
  type: "visage" | "anim";
  debut: number;
  fin: number;
  dit: string;
  /**
   * Le mot d'action à faire ressortir en couleur accent dans la légende, sur
   * les fenêtres tête caméra. Le brief relève ce principe sur la prise de
   * Robin — un mot-clé mis en avant par phrase — et demande de le garder.
   */
  motCle?: string;
};

export const BEATS: Beat[] = [
  {
    id: "B1",
    type: "visage",
    debut: 0,
    fin: 4.15,
    dit: "Tu peux mourir en buvant trop d'eau. Ça s'appelle littéralement l'intoxication à l'eau.",
    motCle: "buvant",
  },
  {
    id: "B2",
    type: "anim",
    debut: 4.15,
    fin: 9.5,
    dit: "Le sel, le café, l'oxygène — à trop forte dose, tout devient dangereux. C'est la dose qui fait le poison.",
  },
  {
    id: "B3",
    type: "visage",
    debut: 9.5,
    fin: 15.45,
    dit: "Quand les gens paniquent sur l'aspartame de leur boisson sans sucre, parce que l'OMS l'a placé dans une catégorie qui s'appelle « possiblement cancérogène »,",
    motCle: "possiblement cancérogène",
  },
  {
    id: "B4",
    type: "anim",
    debut: 15.45,
    fin: 20.3,
    dit: "j'oublie souvent ce détail : c'est la même que l'aloe vera, ou de certains légumes fermentés.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 20.3,
    fin: 29.4,
    dit: "La dose journalière jugée sûre par l'OMS, c'est 40 milligrammes par kilo de poids de corps. Pour un adulte de 70 kilos par exemple, ça représente entre 9 et 14 canettes par jour.",
  },
  {
    id: "B6",
    type: "visage",
    debut: 29.4,
    fin: DUREE,
    dit: "Donc non, ta canette de midi ne va pas te tuer. Elle va même plutôt t'aider en sèche par exemple, car elle comporte très peu de calories. Mais ce qui va vraiment nuire à ta santé se situe probablement ailleurs.",
    motCle: "ailleurs",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
