import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FEATURES_FREE = [
  'Ruota Zodiacale interattiva',
  'Posizioni di tutti i pianeti',
  'Segno Ascendente calcolato',
  'Griglia degli aspetti',
]

const TIER_BASE = [
  'Tutto il gratuito',
  'Le 12 Case Astrologiche',
  'Pianeti lenti e Chirone',
  'Nodi Lunari e Lilith',
  'Vertex e Parte della Fortuna',
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
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Gratuito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden p-7"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Gratis</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-bold text-white">0 €</span>
              </div>
              <p className="text-gold-400/70 text-sm font-serif italic">Calcolo Ascendente</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES_FREE.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/tema-natale"
              id="cta-ascendente-gratis"
              className="w-full text-center border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-all"
            >
              Calcola Gratis →
            </Link>
          </motion.div>

          {/* Card 2: Base — EVIDENZIATA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col rounded-3xl overflow-hidden p-7"
            style={{
              background: 'linear-gradient(145deg, rgba(212,160,23,0.12) 0%, rgba(8,4,20,0.95) 100%)',
              border: '1px solid rgba(212,160,23,0.35)',
              boxShadow: '0 0 50px rgba(212,160,23,0.08)',
            }}
          >
            {/* Badge */}
            <div className="absolute top-5 right-5 bg-gold-500/20 border border-gold-500/40 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
              Più Popolare
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold-500/5 to-transparent pointer-events-none" />

            <div className="mb-6 relative">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400/60 font-medium">Tema Base</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-bold text-white">15</span>
                <span className="text-gold-400/70 text-lg font-serif">CR</span>
              </div>
              <p className="text-gold-400/70 text-sm font-serif italic">Tema Natale Completo</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 relative">
              {TIER_BASE.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-gold-400 mt-0.5 flex-shrink-0">✦</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/sign-up"
              id="cta-tema-base"
              className="btn-gold w-full text-center py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(212,160,23,0.2)] hover:shadow-[0_0_40px_rgba(212,160,23,0.4)] transition-shadow"
            >
              Iscriviti e Inizia →
            </Link>
          </motion.div>

          {/* Card 3: Evolutivo — solo in app */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col rounded-3xl border border-white/8 bg-black/30 backdrop-blur-sm overflow-hidden p-7"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

            <div className="mb-6 relative">
              <span className="text-[10px] uppercase tracking-[0.2em] text-purple-300/50 font-medium">Tema Evolutivo</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-bold text-white">30</span>
                <span className="text-purple-300/60 text-lg font-serif">CR</span>
              </div>
              <p className="text-purple-300/60 text-sm font-serif italic">Analisi Evolutiva Profonda</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 relative">
              {['Tutto del Base', 'Asteroidi: Cerere, Pallade, Giunone, Vesta', 'Griglia Aspetti avanzata', "Saggezza interpretativa di Valeria"].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/50">
                  <span className="text-purple-400/60 mt-0.5 flex-shrink-0">✦</span>
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm text-white/30 italic">
                <span className="text-white/20 mt-0.5 flex-shrink-0">🔒</span>
                Disponibile solo nel Diario
              </li>
            </ul>

            <Link
              to="/sign-up"
              id="cta-tema-evolutivo"
              className="w-full text-center border border-purple-500/25 text-purple-300/60 hover:text-purple-300 hover:border-purple-500/50 py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-all"
            >
              Iscriviti per Accedere
            </Link>
          </motion.div>
        </div>

        {/* Nota sotto */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/25 text-xs mt-10 tracking-wide"
        >
          I crediti si acquistano nel Wallet. Il piano Evolutivo e le analisi di Valeria sono disponibili solo una volta iscritti.
        </motion.p>
      </div>
    </section>
  )
}
