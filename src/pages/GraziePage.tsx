import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function GraziePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="text-7xl mb-6"
        >
          🔮
        </motion.div>

        {/* Heading */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Pagamento <span className="gold-text">ricevuto!</span>
        </h1>

        <p className="text-white/60 text-lg mb-8 leading-relaxed">
          Grazie per aver prenotato il tuo consulto con Valeria.
          <br />
          Riceverai una conferma via email entro pochi minuti.
        </p>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mystical-card text-left mb-8 space-y-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">📅</span>
            <p className="text-white/60 text-sm">
              Valeria ti contatterà al numero che hai indicato per confermare data e orario.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">📞</span>
            <p className="text-white/60 text-sm">
              Il consulto avverrà via telefono o videochiamata — a tua scelta.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">✉️</span>
            <p className="text-white/60 text-sm">
              Per qualsiasi necessità scrivi a{' '}
              <a href="mailto:info@nonsolotarocchi.it" className="text-gold-400 hover:underline">
                info@nonsolotarocchi.it
              </a>
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-gold">
            Torna alla homepage
          </Link>
          <Link to="/registrati" className="btn-outline">
            Crea il tuo Diario
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
