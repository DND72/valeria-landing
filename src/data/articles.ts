export interface Article {
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  category: string
  excerpt: string
  sections: Section[]
}

interface Section {
  heading?: string
  paragraphs: string[]
  quote?: string
}

export const articles: Article[] = [
  {
    slug: 'visione-jungiana-tarocchi',
    title: 'La visione Jungiana dei Tarocchi',
    subtitle: 'Come la psicologia del profondo trasforma una lettura delle carte in uno specchio dell\'anima',
    date: '24 Marzo 2026',
    readTime: '7 min',
    category: 'Psicologia & Tarocchi',
    excerpt: 'Jung non ha mai letto i tarocchi. Eppure la sua intera opera — gli archetipi, l\'inconscio collettivo, il processo di individuazione — sembra scritta per spiegare perché funzionano.',
    sections: [
      {
        paragraphs: [
          'Jung non ha mai letto i tarocchi. Eppure la sua intera opera — gli archetipi, l\'inconscio collettivo, il processo di individuazione — sembra scritta per spiegare perché funzionano.',
          'Non è una coincidenza. Le carte dei tarocchi e la psicologia junghiana attingono alla stessa sorgente: l\'immaginario simbolico che l\'umanità porta con sé da millenni, inciso nel profondo di ogni psiche.',
        ],
      },
      {
        heading: 'Gli Archetipi negli Arcani Maggiori',
        paragraphs: [
          'Jung identificò negli archetipi le strutture fondamentali della psiche umana — pattern universali di esperienza che emergono nei sogni, nei miti, nelle fiabe di ogni cultura. Il Saggio, l\'Eroe, la Grande Madre, il Trickster: figure che riconosciamo istintivamente perché appartengono a tutti.',
          'Guardate gli Arcani Maggiori dei Tarocchi di Marsiglia con questo occhio. Il Matto è il Fool junghiano — l\'inizio del viaggio, la purezza prima del condizionamento. L\'Imperatore è l\'Animus, il principio maschile strutturante. La Papessa è l\'Anima, il femminile interiore portatore di intuizione e mistero. La Torre è l\'enantiodromia — il ribaltamento improvviso che Jung descrive come necessario quando un lato della psiche ha dominato troppo a lungo.',
          'Ogni carta è un archetipo. Ogni archetipo è una parte di noi.',
        ],
        quote: '"Gli dei sono diventati malattie. Zeus non regna più sull\'Olimpo, ma nel plesso solare." — C.G. Jung',
      },
      {
        heading: 'L\'Inconscio Collettivo e il Simbolo',
        paragraphs: [
          'Per Jung, al di sotto dell\'inconscio personale — i ricordi rimossi, le ferite non elaborate — esiste uno strato più profondo, condiviso da tutta l\'umanità: l\'inconscio collettivo. È il substrato simbolico comune che spiega perché il sole rappresenta la coscienza in ogni cultura, perché il serpente è sempre ambivalente (guarigione e pericolo), perché il numero tre ha una potenza universale.',
          'I tarocchi parlano esattamente questa lingua. I simboli delle carte non sono arbitrari — sono stati selezionati e raffinati nel corso di secoli perché risuonano con quella struttura profonda. Quando durante una lettura una carta "colpisce" il consultante in modo inaspettato, non è magia: è riconoscimento. Quella parte di sé che non aveva parole trova finalmente un\'immagine.',
          'Questo è il motivo per cui una buona lettura non "prevede" il futuro — lo rivela. Rivela la struttura psichica del momento, i conflitti irrisolti, le energie che premono per emergere.',
        ],
      },
      {
        heading: 'La Sincronicità: quando il caso non è un caso',
        paragraphs: [
          'Jung coniò il termine sincronicità per descrivere coincidenze significative — eventi apparentemente casuali che portano un senso troppo preciso per essere ignorato. Non causalità, ma coincidenza di significato.',
          'Nel 1952, in collaborazione con il fisico Wolfgang Pauli, elaborò l\'idea che esistesse un principio acausale di connessione tra eventi psichici ed eventi fisici. Le carte che escono durante una lettura non "causano" nulla — ma la loro configurazione coincide con una struttura psichica reale. Il consultante non estrae a caso: estrae ciò che in quel momento la sua psiche vuole osservare.',
          'Jung stesso, pur non praticando la divinazione, scrisse nella prefazione al I Ching che l\'oracolo funziona come specchio della situazione interiore di chi lo consulta. Lo stesso vale per i tarocchi.',
        ],
        quote: '"La sincronicità è la coincidenza nel tempo di due o più eventi non correlati causalmente, che hanno lo stesso o analogo significato." — C.G. Jung',
      },
      {
        heading: 'Il Processo di Individuazione nelle 22 Carte',
        paragraphs: [
          'Il processo di individuazione è il cammino verso la totalità psichica — l\'integrazione progressiva delle parti di sé negate, proiettate, sconosciute. È il viaggio dall\'Io al Sé, dalla persona (la maschera sociale) all\'essere autentico.',
          'Gli Arcani Maggiori, letti in sequenza, raccontano esattamente questo viaggio. Dal Matto (inconsapevolezza originaria) attraverso le strutture del mondo esterno (Imperatore, Imperatrice, Papa), le crisi trasformative (Ruota della Fortuna, l\'Appeso, la Morte), la purificazione (Temperanza, il Diavolo, la Torre) fino all\'integrazione finale (la Stella, la Luna, il Sole, il Giudizio, il Mondo).',
          'Non è un caso che questo schema rispecchi fedelmente le fasi del percorso analitico junghiano. Quando lavoro con le carte, tengo sempre presente questa mappa: in quale fase del suo processo di individuazione si trova il consultante? Quale archetipo sta integrando? Quale Ombra sta cercando di farsi riconoscere?',
        ],
      },
      {
        heading: 'Come questo cambia una lettura',
        paragraphs: [
          'Una lettura che incorpora la visione junghiana non è una previsione — è un dialogo tra la psiche cosciente del consultante e le sue strutture più profonde. Le carte non dicono cosa accadrà: mostrano cosa sta accadendo nell\'interiorità, e da quella struttura emergono naturalmente le probabilità del futuro.',
          'Non chiedo alle carte "cosa succederà". Chiedo "qual è la struttura psichica di questo momento?" e "quali forze sono in movimento?". La risposta emerge dal simbolo — e il simbolo parla direttamente all\'inconscio, saltando le resistenze della mente razionale.',
          'Jung diceva che il simbolo è sempre più di quanto possiamo comprendere razionalmente. I tarocchi sono simboli. Una lettura profonda è sempre, in qualche modo, un atto junghiano.',
        ],
      },
    ],
  },
  {
    slug: 'sillogismo-scacchistico-disciplina-interiore',
    title: 'Sillogismo Scacchistico e Disciplina Interiore',
    subtitle: 'La visione a lungo termine: come la logica della scacchiera diventa una filosofia di vita',
    date: '24 Marzo 2026',
    readTime: '8 min',
    category: 'Scacchi & Filosofia',
    excerpt: 'Un sillogismo è una catena di premesse che conduce inevitabilmente a una conclusione. La scacchiera è un sistema di sillogismi in movimento — e chi impara a pensarci sopra impara a pensare alla vita in modo radicalmente diverso.',
    sections: [
      {
        paragraphs: [
          'Un sillogismo è una catena di premesse che conduce inevitabilmente a una conclusione. La scacchiera è un sistema di sillogismi in movimento — e chi impara a pensarci sopra impara a pensare alla vita in modo radicalmente diverso.',
          'Questa non è metafora. È letteralmente quello che succede quando si gioca a scacchi ad alto livello: il pensiero si ristruttura. Si impara a vedere il presente come una catena di cause future, a valutare non la mossa immediata ma la posizione che essa genera, a sacrificare il vantaggio di oggi per la vittoria di domani.',
        ],
      },
      {
        heading: 'Il Sillogismo come struttura del pensiero strategico',
        paragraphs: [
          'Aristotele costruì la logica formale sul sillogismo: "Tutti gli uomini sono mortali. Socrate è un uomo. Quindi Socrate è mortale." Una struttura deduttiva inattaccabile.',
          'Sulla scacchiera, ogni decisione ha la stessa struttura, ma applicata a un sistema vivo e mutevole: "Se avanzo il pedone, controllo il centro. Se controllo il centro, limito la mobilità avversaria. Se limito la mobilità, creo pressione strutturale. Se mantengo la pressione, il finale sarà favorevole." Una catena di se-allora che si estende a volte su 15, 20, 30 mosse.',
          'Questo modo di pensare — deduttivo, strutturato, a lungo termine — è una disciplina interiore prima che una tecnica scacchistica. Allena la mente a non reagire agli stimoli immediati ma a valutare le conseguenze. A non fare la mossa "ovvia" senza prima chiedersi: dove porta?',
        ],
        quote: '"Gli scacchi sono la palestra della mente." — Blaise Pascal',
      },
      {
        heading: 'La Teoria del Finale: quando conta solo la struttura',
        paragraphs: [
          'I principianti amano gli attacchi spettacolari. I maestri amano i finali. Perché nei finali — quando rimangono pochi pezzi sulla scacchiera — scompaiono le distrazioni e resta solo la struttura profonda della posizione.',
          'Un pedone in più, nel finale, può essere decisivo. Non perché sia potente adesso — è ancora solo un pedone — ma perché porta in sé la possibilità della promozione: la trasformazione in regina, la rivoluzione della posizione intera. Il finale insegna che il valore di un elemento non è il suo potere attuale, ma il suo potenziale futuro.',
          'Questa è una delle lezioni più difficili da interiorizzare — e una delle più liberatorie. Nella vita, come nella scacchiera, le situazioni che sembrano deboli o stagnanti portano spesso in sé semi di trasformazione radicale. Il pedone che avanza lentamente verso la promozione non è una posizione perduta — è una posizione con un piano.',
        ],
      },
      {
        heading: 'L\'Analisi del Momento Critico',
        paragraphs: [
          'Ogni partita di scacchi ha pochi "momenti critici" — svolte in cui una scelta cambia tutto. Il giocatore che li riconosce vince; quello che li attraversa inconsapevolmente perde anche partite che aveva in mano.',
          'L\'allenamento serio consiste in gran parte nell\'analisi post-partita: trovare quei momenti, capire perché si è scelto in un modo o nell\'altro, identificare non solo la mossa migliore ma il meccanismo psicologico che ha portato all\'errore. Fretta? Paura? Arroganza? La stanchezza? L\'abitudine?',
          'Questo approccio trasforma la sconfitta in materiale di crescita. Non "ho perso" — ma "ho trovato un\'informazione preziosa su come funziono sotto pressione". La disciplina interiore degli scacchi è anche questo: trasformare l\'errore in conoscenza, il fallimento in dati.',
        ],
        quote: '"Non è importante quante volte cadi. È importante quante volte ti rialzi — e perché sei caduto." — Tarrasch',
      },
      {
        heading: 'Visione a lungo termine come pratica spirituale',
        paragraphs: [
          'Le tradizioni spirituali di ogni cultura — dal Buddhismo allo Stoicismo, dalla Cabala all\'esoterismo occidentale — convergono su un punto: la sofferenza nasce dall\'attaccamento al breve termine. La mente che reagisce all\'immediato, che valuta le situazioni solo per come si presentano adesso, è una mente non libera.',
          'Gli scacchi insegnano questa liberazione in modo concreto, verificabile, misurabile. Non attraverso parole o precetti — attraverso la pratica ripetuta di sedersi davanti a un problema, resistere alla mossa impulsiva e cercare la struttura profonda.',
          'Quando mi siedo davanti alle carte di un consultante, porto con me questa disciplina. Non cerco la risposta immediata — cerco la struttura. Qual è la posizione vera di questa situazione? Quale "finale" sta emergendo? Quale pedone si sta avvicinando alla promozione, silenziosamente, in un angolo della scacchiera della vita di questa persona?',
        ],
      },
      {
        heading: 'Scacchi, Tarocchi e il pensiero sistemico',
        paragraphs: [
          'C\'è un\'ultima analogia che mi sembra fondamentale. Negli scacchi, non si valutano i pezzi isolatamente — si valuta la posizione come sistema. Un alfiere può valere più di una torre in una certa struttura, e meno in un\'altra. Il contesto determina il valore.',
          'I tarocchi funzionano esattamente così. Una carta non ha un significato fisso — ha un potenziale di significato che si attualizza in relazione alle altre carte, alla domanda, al momento, alla persona. L\'Eremita in una stesa d\'amore non dice la stessa cosa che in una stesa professionale. La Luna accanto al Sole dice qualcosa di diverso dalla Luna accanto alla Torre.',
          'Pensiero sistemico. Visione relazionale. Rifiuto del significato isolato. Scacchi e tarocchi insegnano la stessa cosa — da direzioni opposte, con gli stessi strumenti.',
        ],
        quote: '"La scacchiera è il mondo. I pezzi sono i fenomeni dell\'universo. Le regole del gioco sono quelle che chiamiamo leggi di natura." — Thomas Huxley',
      },
    ],
  },
]
