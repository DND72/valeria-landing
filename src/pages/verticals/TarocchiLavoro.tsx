import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function TarocchiLavoroPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Tarocchi Lavoro e Denaro: Orientamento Professionale con Valeria Di Pace</title>
        <meta name="description" content="Dubbi sulla carriera o sugli investimenti? Scopri come i tarocchi di Marsiglia possono guidarti nelle decisioni professionali con Valeria Di Pace." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 brilliant-gold-text">Tarocchi Lavoro</h1>
          <p className="text-xl text-white/50 tracking-[0.3em] uppercase">Strategia e Decisioni nel Business</p>
        </motion.div>

        <section className="space-y-16 mb-24">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-emerald-400">Come possono aiutarmi i tarocchi nel lavoro?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              I tarocchi di Marsiglia sono uno strumento straordinario di <strong>analisi strategica</strong>. Non "indovinano" il futuro successo, ma mappano le opportunità, le intenzioni dei collaboratori e i momenti migliori per lanciare nuovi progetti o cambiare rotta professionale.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-emerald-400">Quanto dura e come si svolge?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Puoi scegliere tra un <strong>Focus Strategico</strong> per una questione urgente o una <strong>Analisi Professionale Profonda</strong>. In ogni caso, gestisci il tuo tempo in autonomia, pagando solo i minuti effettivi di consulto.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-emerald-400">Cosa fare in caso di crisi finanziaria?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Attraverso il consulto, Valeria identifica i flussi di energia legati al denaro e al valore personale. Spesso i problemi economici nascono da blocchi psicologici o eredità familiari: i tarocchi aiutano a sbloccare queste dinamiche.
            </p>
          </div>
        </section>

        <div className="bg-white/5 border border-emerald-500/20 rounded-[48px] p-12 text-center text-left">
            <h3 className="text-3xl font-black mb-8">Sblocca la tua carriera professionale</h3>
            <button onClick={() => navigate('/area-personale')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-6 rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20">
                Ottieni il tuo consulto gratuito
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
