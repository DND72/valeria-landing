import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function TarocchiEvolutiviPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Tarocchi Evolutivi e Crescita Personale: Il metodo di Valeria Di Pace</title>
        <meta name="description" content="Non una semplice lettura, ma un percorso di evoluzione. Scopri i tarocchi evolutivi per conoscerti nel profondo con Valeria Di Pace." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 brilliant-gold-text">Tarocchi Evolutivi</h1>
          <p className="text-xl text-white/50 tracking-[0.3em] uppercase">Conoscenza di sé e Sviluppo Interiore</p>
        </motion.div>

        <section className="space-y-16 mb-24">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-blue-400">Qual è la differenza tra tarocchi classici ed evolutivi?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Mentre il tarocco classico cerca di prevedere il futuro, quello <strong>evolutivo</strong> indaga il presente per capire perché certi schemi si ripetono. È un lavoro di archetipi che agisce sullo spirito e sulla mente per favorire la crescita dell'individuo.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-blue-400">Posso usare i tarocchi per la meditazione?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Assolutamente sì. Nel diario privato della nostra piattaforma, troverai ogni settimana spunti del <strong>Mentore Silente</strong> per meditare su un Arcano specifico, trasformando il consulto in un vero cammino di meditazione attiva.
            </p>
          </div>
        </section>

        <div className="bg-white/5 border border-blue-500/20 rounded-[48px] p-12 text-center text-left">
            <h3 className="text-3xl font-black mb-8">Evolvi verso la versione migliore di te</h3>
            <button onClick={() => navigate('/area-personale')} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">
                Inizia il tuo cammino evolutivo
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
