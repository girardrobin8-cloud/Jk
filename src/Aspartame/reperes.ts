/**
 * Repères de montage — « Aspartame / Coca Zero » (39,82 s).
 *
 * Bornes MESURÉES sur la prise, par `python3 scripts/caler.py <wav> aspartame`.
 * Dispersion des débits de beats : 0,105 — l'alignement est fiable. Le débit
 * global ressort à 6,34 syllabes par seconde de parole, ce qui tombe entre les
 * 6,1 de « sommeil » et les 6,7 de « recomposition ».
 *
 * Cette prise a demandé un détecteur de silence différent des autres. Elle
 * arrive ÉCRÊTÉE — son pic vaut exactement 32768, le maximum d'un entier 16
 * bits — et son compresseur remonte le souffle de salle entre les mots. Le
 * seuillage en amplitude, qui suffisait ailleurs, y voyait 94 % de parole et ne
 * trouvait que onze groupes pour six beats. Le détecteur mesure désormais
 * l'énergie de la bande grave, où la voix voisée porte et où le souffle ne
 * porte pas ; voir enveloppe() et choisir_seuil() dans le script.
 *
 * Où le brief se trompe, et de combien. Quatre de ses cinq bornes tombent à
 * moins d'une seconde de la mesure — 0:04, 0:10, 0:20, 0:30. La cinquième est
 * à 2,5 s : le brief place à 0:15 la bascule du plan filmé vers l'animation,
 * elle est en réalité à 17,53.
 *
 * Cette borne-là méritait d'être vérifiée plutôt que crue, pour deux raisons.
 * C'est la seule du montage qui tombe À L'INTÉRIEUR d'une phrase continue —
 * partout ailleurs une bascule tombe entre deux répliques — et c'est justement
 * le cas que le brief donne pour approximatif. La mesure tranche nettement :
 * le silence de 17,42 → 17,65 est le plus franc de toute la zone et sort
 * identique à tous les seuils testés, là où le creux de 15,00 → 15,14
 * n'apparaît qu'au-dessus de 0,10. Surtout, « j'oublie souvent ce détail, c'est
 * la même que l'aloe vera, ou de certains légumes fermentés » fait 23
 * syllabes : les dire à partir de 15,14 supposerait 3,9 syllabes par seconde,
 * très en dessous de son débit. À partir de 17,65 il en tient 6,7, soit son
 * régime habituel.
 *
 * Pour mémoire, les bornes RECONSTRUITES avant la livraison de la prise —
 * moyenne entre le brief et un découpage à débit constant — étaient 4,15 /
 * 9,50 / 15,45 / 20,30 / 29,40. Elles tombent à moins d'un tiers de seconde de
 * la mesure partout, sauf sur cette bascule interne, où elles héritaient de
 * l'erreur du brief.
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
/** Durée exacte de la prise. */
export const DUREE = 39.82;

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
    fin: 4.46,
    dit: "Tu peux mourir en buvant trop d'eau. Ça s'appelle littéralement l'intoxication à l'eau.",
    motCle: "buvant",
  },
  {
    id: "B2",
    type: "anim",
    debut: 4.46,
    fin: 9.70,
    dit: "Le sel, le café, l'oxygène — à trop forte dose, tout devient dangereux. C'est la dose qui fait le poison.",
  },
  {
    id: "B3",
    type: "visage",
    debut: 9.70,
    fin: 17.53,
    dit: "Quand les gens paniquent sur l'aspartame de leur boisson sans sucre, parce que l'OMS l'a placé dans une catégorie qui s'appelle « possiblement cancérogène »,",
    motCle: "possiblement cancérogène",
  },
  {
    id: "B4",
    type: "anim",
    debut: 17.53,
    fin: 21.30,
    dit: "j'oublie souvent ce détail : c'est la même que l'aloe vera, ou de certains légumes fermentés.",
  },
  {
    id: "B5",
    type: "anim",
    debut: 21.30,
    fin: 30.29,
    dit: "La dose journalière jugée sûre par l'OMS, c'est 40 milligrammes par kilo de poids de corps. Pour un adulte de 70 kilos par exemple, ça représente entre 9 et 14 canettes par jour.",
  },
  {
    id: "B6",
    type: "visage",
    debut: 30.29,
    fin: DUREE,
    dit: "Donc non, ta canette de midi ne va pas te tuer. Elle va même plutôt t'aider en sèche par exemple, car elle comporte très peu de calories. Mais ce qui va vraiment nuire à ta santé se situe probablement ailleurs.",
    motCle: "ailleurs",
  },
];

export const s = (secondes: number) => Math.round(secondes * FPS);
