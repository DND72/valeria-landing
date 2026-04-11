import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function TarocchiAmorePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Tarocchi Amore: Consulti di Coppia e Affinità con Valeria Di Pace</title>
        <meta name="description" content="Scopri la verità sul tuo futuro sentimentale. Consulti di tarocchi amore, affinità di coppia e stese evolutive con Valeria Di Pace." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 brilliant-gold-text">Tarocchi Amore</h1>
          <p className="text-xl text-white/50 tracking-[0.3em] uppercase">Chiarezza ne i legami di cuore</p>
        </motion.div>

        <section className="space-y-16 mb-24 text-left">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-gold-500">Come funziona un consulto sui Tarocchi Amore?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Un consulto dedicato ai sentimenti con Valeria Di Pace non è una semplice predizione, ma un'analisi energetica del legame. Attraverso gli Arcani di Marsiglia, viene visualizzata la dinamica tra i partner, i blocchi comunicativi e le potenzialità di evoluzione della relazione.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-gold-500">Quanto dura e cosa posso chiedere?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Puoi scegliere tra un <strong>Consulto Lampo</strong> per una domanda secca o una <strong>Analisi Evolutiva Profonda</strong> per una visione d'insieme. Il pagamento avviene sempre sul tempo effettivo, permettendoti di gestire la sessione in totale libertà.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-gold-500">Il Segreto della Stanza Sicura per le Coppie</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              In casi di alta tensione relazionale, Valeria mette a disposizione il <strong>Protocollo Stanza Sicura</strong>: un incontro video a tre dove lei agisce come facilitatrice neutrale del dialogo per prevenire escalation e garantire rispetto reciproco.
            </p>
          </div>
        </section>

        <div className="bg-white/5 border border-gold-500/20 rounded-[48px] p-12 text-center">
            <h3 className="text-3xl font-black mb-8">Vuoi conoscere la verità sui tuoi sentimenti?</h3>
            <button 
              onClick={() => navigate('/area-personale')}
              className="btn-gold px-12 py-6 text-xl"
            >
                Inizia ora: 7 Minuti Gratis
            </button>
        </div>
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
