import { motion } from 'framer-motion'

const ShiningStella = () => (
  <span className="relative inline-block">
    {/* Sparkle particles around "Stella" */}
    {[
      { top: '-18px', left: '10%',  delay: 0,    size: 'w-1.5 h-1.5' },
      { top: '-14px', left: '75%',  delay: 0.4,  size: 'w-1 h-1' },
      { top: '0px',   left: '-8%',  delay: 0.8,  size: 'w-1 h-1' },
      { top: '0px',   left: '105%', delay: 0.2,  size: 'w-1.5 h-1.5' },
      { top: '80%',   left: '5%',   delay: 0.6,  size: 'w-1 h-1' },
      { top: '70%',   left: '90%',  delay: 1.0,  size: 'w-1 h-1' },
    ].map((s, i) => (
      <motion.span
        key={i}
        className={`absolute ${s.size} rounded-full bg-gold-300 pointer-events-none`}
        style={{ top: s.top, left: s.left }}
        animate={{
          opacity: [0, 1, 0],
          scale:   [0.5, 1.4, 0.5],
        }}
        transition={{
          duration: 2,
          delay: s.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
    {/* The word itself with shimmering gold */}
    <motion.span
      className="gold-text italic"
      animate={{
        filter: [
          'drop-shadow(0 0 6px rgba(212,160,23,0.4))',
          'drop-shadow(0 0 18px rgba(252,211,77,0.9))',
          'drop-shadow(0 0 6px rgba(212,160,23,0.4))',
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      Stella
    </motion.span>
  </span>
)

const TarotCardIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="44" height="60" rx="4" stroke="#d4a017" strokeWidth="2" fill="none" />
    <circle cx="24" cy="26" r="10" stroke="#d4a017" strokeWidth="1.5" fill="none" />
    <path d="M24 16v20M14 26h20" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 50h32" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M12 55h24" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
  </svg>
)

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,160,23,0.08) 0%, transparent 70%)',
        }}
      />


      {/* Decorative arc lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-5"
          viewBox="0 0 900 900"
        >
          <circle cx="450" cy="450" r="400" stroke="#d4a017" strokeWidth="1" fill="none" />
          <circle cx="450" cy="450" r="300" stroke="#d4a017" strokeWidth="1" fill="none" />
          <circle cx="450" cy="450" r="200" stroke="#d4a017" strokeWidth="1" fill="none" />
          <line x1="50" y1="450" x2="850" y2="450" stroke="#d4a017" strokeWidth="0.5" />
          <line x1="450" y1="50" x2="450" y2="850" stroke="#d4a017" strokeWidth="0.5" />
          <line x1="167" y1="167" x2="733" y2="733" stroke="#d4a017" strokeWidth="0.5" />
          <line x1="733" y1="167" x2="167" y2="733" stroke="#d4a017" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Valeria photo — centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div
            className="mx-auto rounded-2xl overflow-hidden border border-gold-500/30 ring-1 ring-gold-500/20"
            style={{
              width: '160px',
              aspectRatio: '1/1',
              boxShadow: '0 0 40px rgba(212,160,23,0.15), 0 10px 40px rgba(0,0,0,0.8)',
            }}
          >
            <img
              src="/valeria-navbar.png"
              alt="Valeria Di Pace"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 15%' }}
            />
          </div>
        </motion.div>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-600/30 bg-gold-600/10 text-gold-400 text-sm font-medium mb-8"
        >
          <TarotCardIcon />
          <span>Tarologa · Tarocchi di Marsiglia</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          Le carte non mentono.
          <br />
          Valeria è la tua <ShiningStella />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed text-justify hyphens-auto"
        >
          Oltre <strong className="text-gold-400">3.000 consulti</strong> sulle più rinomate piattaforme online — ora puoi
          trovarla direttamente qui.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-white/40 text-base md:text-lg mb-12 italic font-serif max-w-2xl mx-auto leading-relaxed text-justify hyphens-auto"
        >
          <span className="not-italic text-gold-400/95 font-medium tracking-wide">Esperienza, precisione e visione.</span>{' '}
          Valeria applica un{' '}
          <span className="not-italic text-gold-400/90">protocollo di analisi profonda</span> che va oltre la semplice
          lettura, offrendo uno <span className="not-italic text-gold-400/90">strumento antico</span> per comprendere le{' '}
          <span className="not-italic text-gold-400/90">dinamiche reali</span> della tua esistenza.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="https://stese.nonsolotarocchi.it" target="_blank" rel="noopener noreferrer" className="btn-outline text-base">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prova gratis le carte
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-white/30 text-xs"
          >
            <span className="tracking-widest uppercase text-[10px]">Scopri</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
