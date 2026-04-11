import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Chi è Valeria Di Pace - Attrice, Tarologa e Ricercatrice dell'Anima</title>
        <meta name="description" content="Scopri la storia di Valeria Di Pace: una formazione multidisciplinare tra Giurisprudenza, Psicologia e scacchi di alto livello per una tarologia d'eccellenza." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <p className="text-gold-500 font-bold uppercase tracking-[0.4em] mb-4 text-sm">Biografia Autorizzata</p>
          <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 brilliant-gold-text text-center">Valeria Di Pace</h1>
          <h2 className="text-2xl md:text-3xl font-serif text-white/50 italic max-w-3xl mx-auto leading-relaxed">
            "La complessità dell'anima richiede strumenti precisi. Unisco legge, psicologia e simbolo per rivelare l'invisibile."
          </h2>
        </motion.div>

        {/* MAIN BIOGRAPHY CONTENT */}
        <div className="grid lg:grid-cols-12 gap-16 mb-32 items-start">
          
          {/* Sidebar: Credenziali Rapide */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] sticky top-32">
              <h3 className="text-gold-500 font-bold uppercase tracking-widest mb-6 text-xs">Formazione & Titoli</h3>
              <ul className="space-y-6 text-sm">
                <li className="flex flex-col gap-1">
                  <span className="text-white font-bold">Laurea in Giurisprudenza</span>
                  <span className="text-white/40 italic">Università degli Studi di Genova</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-bold">Laurea in Psicologia</span>
                  <span className="text-white/40 italic">Focus in dinamiche relazionali e simbolismo</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-bold">Arena International Master (FIDE)</span>
                  <span className="text-white/40 italic">Eccellenza internazionale negli scacchi</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-bold">Diplomata in Naturopatia</span>
                  <span className="text-white/40 italic">Master in Fiori di Bach e riequilibrio energetico</span>
                </li>
                 <li className="flex flex-col gap-1">
                  <span className="text-white font-bold">15 Anni di Esperienza Sanitaria</span>
                  <span className="text-white/40 italic">Gestione e consulenza legale/professionale</span>
                </li>
              </ul>
              
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="text-3xl font-serif font-black text-gold-500 mb-1">3.359</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">Consulti Certificati online</div>
              </div>
            </div>
          </motion.div>

          {/* Text Content: La Narrazione Profonda */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 space-y-12 text-lg text-white/70 leading-relaxed font-light"
          >
            <section className="space-y-6">
                <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Un'Anima Multidisciplinare</h3>
                <p>
                    Valeria Di Pace non è solo una ricercatrice dell'anima, ma una mente forgiata dal rigore accademico e dalla sfida intellettuale. La sua storia parla di una curiosità inesauribile verso l'essere umano, analizzato da ogni angolazione: quella **legale**, quella **psicologica** e quella **energetica**.
                </p>
                <p>
                    Con una doppia laurea in Giurisprudenza e Psicologia, Valeria ha trascorso oltre quindici anni all'interno del sistema sanitario, maturando una profonda conoscenza delle dinamiche del benessere e della tutela della persona. Questa solida base istituzionale è ciò che oggi le permette di offrire servizi come **La Stanza Sicura**, dove la facilitazione del dialogo è supportata da una competenza normativa e tecnica senza pari nel settore della tarologia.
                </p>
            </section>

            <section className="space-y-6">
                <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">La Mente dello Scacchista, il Cuore dell'Artista</h3>
                <p>
                    Parallelamente al suo percorso accademico, Valeria ha coltivato due grandi passioni che definiscono il suo metodo unico: gli **scacchi** e la **recitazione**. 
                </p>
                <p>
                    Come *Arena International Master (FIDE)*, applica al tavolo dei tarocchi la stessa lucidità tattica necessaria per vincere una partita lampo. Per lei, una "stesa" non è mai frutto del caso, ma una mappa di varianti e possibilità che richiede una mente capace di calcolare flussi, intenzioni e momenti di svolta critici. Questa precisione chirurgica si fonde con la sensibilità di attrice (premiata a livello nazionale), capace di entrare in risonanza empatica con il vissuto del consultante, decodificando non solo le carte, ma il linguaggio silenzioso dell'anima.
                </p>
            </section>

            <section className="space-y-6">
                <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Oltre 3.000 Storie di Cambiamento</h3>
                <p>
                    Oggi, con una media eccezionale di **4,97/5 stelle** e migliaia di consulti alle spalle sulle più importanti piattaforme digitali, Valeria ha scelto di creare un proprio spazio indipendente. Nonsolotarocchi.it non è solo un sito, ma il culmine di un percorso di vita dedicato a chi cerca una guida seria, onesta e priva di misticismi vaghi.
                </p>
                <p>
                    Diplomata in Naturopatia e Master esperta in Fiori di Bach, Valeria vede l'individuo come un sistema integrale dove mente, corpo e spirito devono tornare a vibrare in armonia. Che sia attraverso un consulto evolutivo o un percorso di coaching, il suo obiettivo rimane lo stesso: fornire gli strumenti per **comprendere il presente e costruire il proprio futuro**.
                </p>
            </section>

            <div className="pt-12">
                <button 
                  onClick={() => navigate('/tarocchi')}
                  className="btn-gold px-12 py-6 text-xl"
                >
                    Inizia il tuo percorso con Valeria
                </button>
            </div>
          </motion.div>
        </div>

        {/* PREMI E RICONOSCIMENTI (VISUAL SECTION) */}
        <section className="mb-32">
            <h2 className="text-center text-gold-500 font-bold uppercase tracking-[0.4em] mb-16 text-sm">Carriera e Iconografia</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="group relative rounded-3xl overflow-hidden border border-white/10 aspect-video md:aspect-[4/5]">
                    <img src="/valeria-award-1.jpg" alt="Rete 4 Award" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6">
                        <p className="text-gold-400 font-bold text-xs uppercase">Premio alla Carriera</p>
                        <p className="text-white text-lg font-serif italic">Rete Quattro, Modamania</p>
                    </div>
                </div>
                <div className="group relative rounded-3xl overflow-hidden border border-white/10 aspect-video md:aspect-[4/5]">
                    <img src="/valeria-chess.jpg" alt="Valeria Scacchi" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6">
                        <p className="text-gold-400 font-bold text-xs uppercase">Eccellenza Sportiva</p>
                        <p className="text-white text-lg font-serif italic">Arena International Master FIDE</p>
                    </div>
                </div>
                <div className="group relative rounded-3xl overflow-hidden border border-white/10 aspect-video md:aspect-[4/5]">
                    <img src="/valeria-carriera.jpg" alt="Anzio Film Festival" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6">
                        <p className="text-gold-400 font-bold text-xs uppercase">Premi Cinema</p>
                        <p className="text-white text-lg font-serif italic">Anzio Film Festival 2024</p>
                    </div>
                </div>
            </div>
        </section>

      </div>

      <style>{`
        .brilliant-gold-text {
            background: linear-gradient(180deg, #fffde0 0%, #ffdd00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 15px rgba(212,160,23,0.4));
        }
      `}</style>
    </div>
  )
}
