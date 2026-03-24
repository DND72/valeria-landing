import { motion } from 'framer-motion'

export default function TarotAppPromo() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="section-divider" />

      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">
              Prova prima di chiamare
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Le carte di Stella,{' '}
              <span className="gold-text italic">gratuite.</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Non sei sicuro? Prima di prenotare un consulto, esplora le carte con l'app gratuita creata da Valeria stessa.
              Un modo per sentire il suo metodo, capire il linguaggio dei tarocchi e prepararti alla lettura vera.
            </p>
            <p className="text-white/40 text-sm mb-8 italic">
              "Ogni carta ha una storia. L'app ti aiuta a scoprire la tua."
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://stese.nonsolotarocchi.it"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Apri l'app gratuita
              </a>
              <a href="#prenota" className="btn-outline">
                Prenota il consulto
              </a>
            </div>
          </motion.div>

          {/* Visual mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(212,160,23,0.1) 0%, rgba(13,27,42,0.9) 100%)',
                border: '1px solid rgba(212,160,23,0.25)',
                padding: '2rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(212,160,23,0.1)',
              }}
            >
              {/* Browser bar mock */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-3 rounded px-3 py-1 text-xs text-white/30 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  stese.nonsolotarocchi.it
                </div>
              </div>

              {/* Fake app content */}
              <div className="text-center">
                <p className="text-gold-400 text-xs uppercase tracking-widest mb-4">Le Stese di Stella</p>

                {/* Fake tarot cards */}
                <div className="flex justify-center gap-3 mb-6">
                  {['🌙', '☀️', '⭐'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                      className="w-16 h-24 rounded-lg flex items-center justify-center text-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(13,27,42,0.8))',
                        border: '1px solid rgba(212,160,23,0.3)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>

                <p className="text-white/40 text-xs mb-4">Scegli la tua stesa · 100% gratuito</p>
                <div
                  className="px-4 py-2 rounded-full text-xs font-medium text-dark-500"
                  style={{ background: 'linear-gradient(135deg, #d4a017, #fcd34d)' }}
                >
                  Estrai le tue carte →
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-20 blur-2xl"
              style={{ background: 'linear-gradient(135deg, #d4a017, #fcd34d)' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
