export const SIGN_MEANINGS: Record<string, { keyword: string; description: string }> = {
  'Ariete': { keyword: 'Iniziativa', description: 'Vitalità, energia, coraggio e spirito pionieristico.' },
  'Toro': { keyword: 'Stabilità', description: 'Pragmatismo, amore per il comfort e determinazione.' },
  'Gemelli': { keyword: 'Comunicazione', description: 'Curiosità, agilità mentale e socievolezza.' },
  'Cancro': { keyword: 'Sentimento', description: 'Intuizione, legame con le radici e sensibilità.' },
  'Leone': { keyword: 'Espressione', description: 'Creatività, nobiltà d\'animo e carisma.' },
  'Vergine': { keyword: 'Analisi', description: 'Precisione, dedizione al lavoro e senso critico.' },
  'Bilancia': { keyword: 'Equilibrio', description: 'Armonia, diplomazia e ricerca della bellezza.' },
  'Scorpione': { keyword: 'Trasformazione', description: 'Profondità emotiva, mistero e potere interiore.' },
  'Sagittario': { keyword: 'Esplorazione', description: 'Ottimismo, filosofia e desiderio di libertà.' },
  'Capricorno': { keyword: 'Struttura', description: 'Senso del dovere, ambizione e perseveranza.' },
  'Acquario': { keyword: 'Innovazione', description: 'Originalità, idealismo e spirito comunitario.' },
  'Pesci': { keyword: 'Compassione', description: 'Empatia, spiritualità e immaginazione.' },
}

export const HOUSE_MEANINGS: Record<number, { title: string; keyword: string; description: string }> = {
  1: { title: 'Prima Casa', keyword: 'Identità', description: 'Personalità, l\'Io, l\'aspetto fisico e l\'inizio di tutto.' },
  2: { title: 'Seconda Casa', keyword: 'Risorse', description: 'Valori, possedimenti materiali e talenti personali.' },
  3: { title: 'Terza Casa', keyword: 'Scambio', description: 'Comunicazione, studi, viaggi brevi e fratelli.' },
  4: { title: 'Quarta Casa', keyword: 'Radici', description: 'Famiglia, casa, origini e intimità.' },
  5: { title: 'Quinta Casa', keyword: 'Creatività', description: 'Amore, figli, divertimento e auto-espressione.' },
  6: { title: 'Sesta Casa', keyword: 'Servizio', description: 'Lavoro quotidiano, salute, abitudini e utilità.' },
  7: { title: 'Settima Casa', keyword: 'Relazioni', description: 'Matrimonio, partnership e rapporti con gli altri.' },
  8: { title: 'Ottava Casa', keyword: 'Crisi', description: 'Mistero, trasformazione, eredità e beni condivisi.' },
  9: { title: 'Nona Casa', keyword: 'Saggezza', description: 'Lontano, filosofia, studi superiori e ideali.' },
  10: { title: 'Decima Casa', keyword: 'Realizzazione', description: 'Carriera, status sociale e ambizione pubblica.' },
  11: { title: 'Undicesima Casa', keyword: 'Visione', description: 'Amicizie, progetti collettivi e speranze.' },
  12: { title: 'Dodicesima Casa', keyword: 'Inconscio', description: 'Spiritualità, prove karmiche e ritiro interiore.' },
}
