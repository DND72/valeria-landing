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
            
            <div className="relative h-[500px] md:h-[650px] flex items-center justify-center perspective-1000">
                {/* Glow effetto */}
                <div className="absolute w-72 h-72 bg-gold-600/20 blur-[100px] rounded-full" />
                
                {/* Ventaglio di carte */}
                {[
                    { src: '/assets/tarot/ruota.png', rotate: -15, x: -110, z: 10, name: 'La Ruota della Fortuna' },
                    { src: '/assets/tarot/forza.png', rotate: -5, x: -55, z: 20, name: 'La Forza' },
                    { src: '/assets/tarot/stella.png', rotate: 5, x: 0, z: 30, name: 'La Stella' },
                    { src: '/assets/tarot/sole.png', rotate: 15, x: 55, z: 40, name: 'Il Sole' },
                    { src: '/assets/tarot/mondo.png', rotate: 25, x: 110, z: 50, name: 'Il Mondo' },
                ].map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.5, x: 0, rotate: 0 }}
                        whileInView={{ 
                            opacity: 1, 
                            scale: 1, 
                            x: card.x, 
                            rotate: card.rotate,
                        }}
                        viewport={{ once: true }}
                        transition={{ 
                            delay: idx * 0.1,
                            type: "spring",
                            stiffness: 50,
                            damping: 15
                        }}
                        style={{ zIndex: card.z }}
                        className="absolute w-44 md:w-60 rounded-xl md:rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-gold-500/30 overflow-hidden bg-[#0c0c0d]"
                    >
                        <motion.img 
                            animate={{ 
                                y: [0, -12, 0],
                            }}
                            transition={{
                                duration: 4 + idx,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            src={card.src} 
                            alt={card.name} 
                            className="w-full h-auto object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                ))}
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
