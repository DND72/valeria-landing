import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FEATURES_FREE = [
  'Ruota Zodiacale interattiva',
  'Posizioni di tutti i pianeti',
  'Segno Ascendente calcolato',
  'Griglia degli aspetti',
]

export default function AstrologyPromo() {
  return (
    <section id="astrologia" className="relative py-28 px-6 overflow-hidden">
      <div className="section-divider" />

      {/* Stelle decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-950/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-950/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Titlebox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            Planetario in Tempo Reale · Swiss Ephemeris
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-5">
            Il Cielo al momento{' '}
            <span className="gold-text italic">della tua nascita</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto leading-relaxed text-base">
            Calcola gratuitamente il tuo Ascendente e scopri dove erano i pianeti nel tuo cielo natale.
            Per un'analisi evolutiva profonda, scegli il Tema Natale Base o Evolutivo.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Gratuito */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden p-8"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium tracking-widest">Base</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-bold text-white">0 €</span>
              </div>
              <p className="text-gold-400/70 text-sm font-serif italic">Calcolo Ascendente Rapido</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {FEATURES_FREE.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                  <span className="text-emerald-400 mt-1 flex-shrink-0 text-xs">✓</span>
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-white/40">
                <span className="text-white/20 mt-1 flex-shrink-0 text-xs">✓</span>
                Analisi posizioni planetarie
              </li>
            </ul>

            <Link
              to="/tema-natale"
              id="cta-ascendente-gratis"
              className="w-full text-center border border-gold-500/30 text-gold-400/80 hover:text-gold-400 hover:bg-gold-500/10 py-4 rounded-xl text-sm font-medium uppercase tracking-widest transition-all"
            >
              Prova il Calcolatore →
            </Link>
          </motion.div>

          {/* Card 2: Tema Natale Evolutivo Integrale */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col rounded-3xl overflow-hidden p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(212,160,23,0.15) 0%, rgba(8,4,20,0.98) 100%)',
              border: '1px solid rgba(212,160,23,0.4)',
              boxShadow: '0 0 60px rgba(212,160,23,0.1)',
            }}
          >
            {/* Badge */}
            <div className="absolute top-6 right-6 bg-gold-500/20 border border-gold-500/40 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest text-gold-400 font-bold">
              Consigliato
            </div>
            
            <div className="mb-6 relative">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-medium tracking-widest leading-none">Esperienza Premium</span>
              <h3 className="text-2xl font-serif font-bold text-white mt-3 mb-1">Tema Evolutivo Integrale</h3>
              <p className="text-gold-400/80 text-sm font-serif italic">Interpretazione Professionale di Valeria</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative">
              {[
                'Analisi psicologica ed evolutiva profonda',
                'Ruota Zodiacale Integrata (The Wheel)',
                'Dinamiche delle 12 Case e Nodi Lunari',
                'Saggezza degli Asteroidi e Chirone',
                'Griglia degli Aspetti e Punti Fittizi',
                'Il dono interpretativo unico di Valeria'
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                  <span className="text-gold-500 mt-1 flex-shrink-0">✦</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/sign-up"
              id="cta-tema-consulenza"
              className="btn-gold w-full text-center py-4 rounded-xl text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(212,160,23,0.25)] hover:shadow-[0_0_50px_rgba(212,160,23,0.45)] transition-all"
            >
              Prenota il tuo Tema Natale →
            </Link>
          </motion.div>
        </div>

        {/* Nota sotto */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/30 text-[11px] mt-12 tracking-widest uppercase"
        >
          L'Analisi Evolutiva e la Ruota Integrata sono disponibili nel tuo Diario dopo l'iscrizione.
        </motion.p>
      </div>
    </section>
  )
}
