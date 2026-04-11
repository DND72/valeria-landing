import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import TarotAppPromo from '../components/TarotAppPromo'
import HowItWorks from '../components/HowItWorks'
import Reviews from '../components/Reviews'
import BookingSection from '../components/BookingSection'

export default function TarocchiPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24">
      <Helmet>
        <title>Il Santuario dei Tarocchi di Marsiglia - Valeria Di Pace</title>
        <meta name="description" content="Esplora il mondo della tarologia evolutiva con Valeria Di Pace. Consulti professionali, l'App gratuita e il metodo antico degli Arcani di Marsiglia." />
      </Helmet>

      {/* Hero Tarocchi */}
      <section className="py-24 px-6 text-center bg-gradient-to-b from-gold-900/10 to-transparent">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
          <p className="text-gold-500 font-bold uppercase tracking-[0.4em] mb-4 text-sm">Tradizione e Simbolo</p>
          <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 brilliant-gold-text">Il Mondo dei Tarocchi</h1>
          <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light italic">
            "I Tarocchi non sono fatti per leggere il futuro, ma per costruire il presente attraverso la saggezza millenaria degli Arcani."
          </p>
        </motion.div>
      </section>

      {/* Spiegazione Metodo (Spostata da Home se necessario) */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-4xl font-serif font-bold text-gold-400">Il Codice di Marsiglia</h2>
                <p className="text-lg text-white/50 leading-relaxed">
                    Valeria utilizza esclusivamente i Tarocchi di Marsiglia, considerati la base pura di tutta la tarologia occidentale. Il suo approccio non è divinatorio, ma induttivo e psicologico: ogni carta è uno specchio che rivela ciò che la mente conscia nasconde.
                </p>
                <ul className="space-y-4 text-gold-500/70 italic text-sm">
                    <li>• Studio dei 22 Arcani Maggiori come tappe evolutive</li>
                    <li>• Analisi delle interazioni cromatiche e spaziali</li>
                    <li>• Decodifica dei simboli arcaici per la vita moderna</li>
                </ul>
            </div>
            <div className="relative rounded-[40px] overflow-hidden border border-gold-500/20">
                <img src="/assets/tarot-detail.jpg" alt="Dettaglio Tarocchi" className="w-full h-auto" />
            </div>
        </div>
      </section>

      {/* Componenti Spostati */}
      <TarotAppPromo />
      <HowItWorks />
      <Reviews />
      <BookingSection />

      <style>{`
        .brilliant-gold-text {
            background: linear-gradient(180deg, #fffde0 0%, #ffdd00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}
