import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    number: '01',
    icon: '✨',
    title: 'Iscriviti gratis',
    desc: 'Crea il tuo Diario in pochi secondi. Ricevi subito 7 minuti di consulto gratuito con Valeria.',
  },
  {
    number: '02',
    icon: '🔮',
    title: 'Il tuo consulto gratuito',
    desc: 'Valeria ti contatta per i tuoi 7 minuti gratuiti via Meet o Zoom — il nostro standard per qualità e privacy.',
  },
  {
    number: '03',
    icon: '💳',
    title: 'Continua dal tuo profilo',
    desc: 'Se ti sei trovata bene, dal tuo Diario scegli di nuovo il tipo di consulto e poi il calendario — come la prima volta.',
  },
]

const services = [
  {
    name: 'Consulto breve Tarocchi',
    duration: '30 minuti · Sessione Digitale',
    price: '42 CR',
    ideal: 'Una domanda specifica · Una situazione da chiarire',
    icon: '🌙',
  },
  {
    name: 'Coaching 30 min',
    duration: '30 minuti · Sessione Digitale',
    price: '48 CR',
    ideal: 'Crescita personale e obiettivi brevi',
    icon: '🍃',
  },
  {
    name: 'Combo Light',
    duration: '2x Tarocchi + 1x Coaching',
    price: '112 CR',
    ideal: 'Focus & Azione combinati per la massima resa',
    icon: '✨',
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()
  return (
    <section id="come-funziona" className="py-24 px-6 relative">
      <div className="section-divider" />
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,160,23,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Il processo</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Come <span className="gold-text">funziona</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Semplice, sicuro, professionale. Tre passi per la tua lettura.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))',
                  border: '1px solid rgba(212,160,23,0.3)',
                }}
              >
                <span className="text-3xl">{step.icon}</span>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-dark-500"
                  style={{ background: 'linear-gradient(135deg, #d4a017, #fcd34d)' }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="mystical-card text-center group"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">
                {service.name}
              </h3>
              <p className="text-gold-500 font-medium text-sm mb-1">{service.duration}</p>
              <p className="font-serif text-2xl font-bold mb-3" style={{
                background: 'linear-gradient(135deg, #ffe066, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{service.price}</p>
              <p className="text-white/40 text-xs mb-4">{service.ideal}</p>
              <span className="text-white/25 text-xs italic">Acquistabile dal tuo profilo</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <button onClick={() => navigate('/registrati')} className="btn-gold">
            ✨ Inizia gratis — 7 minuti in omaggio
          </button>
        </motion.div>
      </div>
    </section>
  )
}
