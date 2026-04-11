import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function TarocchiOnlinePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Tarocchi di Marsiglia Online: Consulti Video e Chat con Valeria Di Pace</title>
        <meta name="description" content="Cerchi un consulto di tarocchi serio online o al telefono? Parla con Valeria Di Pace tramite Meet o Chat protetta." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 brilliant-gold-text">Tarocchi Online</h1>
          <p className="text-xl text-white/50 tracking-[0.3em] uppercase">Digital Professional Reading</p>
        </motion.div>

        <section className="space-y-16 mb-24">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-gold-500">Meglio il consulto telefonico o online in video?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              Su Nonsolotarocchi.it privilegiamo la <strong>videochiamata</strong> tramite sistemi sicuri (Meet/Zoom) perché permette di vedere le carte estratte e il volto di Valeria, creando una connessione empatica reale. È come essere nello stesso studio fisico, ma ovunque tu sia.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-gold-500">I consulti sono anonimi e sicuri?</h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              La piattaforma è costruita sulla <strong>privacy totale</strong>. Non usiamo numeri a pagamento né call anonime: tutto è gestito dal tuo Diario personale crittografato. La tua identità è protetta dal segreto professionale e dal Sigillo del Silenzio di Valeria.
            </p>
          </div>
        </section>

        <div className="bg-white/5 border border-gold-500/20 rounded-[48px] p-12 text-center text-left">
            <h3 className="text-3xl font-black mb-8">Accedi al tuo Studio Digitale Riservato</h3>
            <button onClick={() => navigate('/area-personale')} className="btn-gold px-12 py-6 text-xl">
                Registrati per 7 Minuti Gratis
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
