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
          ✨
        </motion.div>

        {/* Heading */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          La Magia è <span className="gold-text">pronta!</span>
        </h1>

        <p className="text-white/60 text-lg mb-8 leading-relaxed">
          Grazie della tua fiducia, ricarica andata a buon fine.
          <br />
          I tuoi Crediti (CR) sono stati versati istantaneamente nel tuo Wallet.
        </p>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mystical-card text-left mb-8 space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">⏳</span>
            <p className="text-white/60 text-sm">
              I tuoi crediti <strong className="text-white/80 font-medium">non hanno una data di scadenza</strong>. Conservali nel Diario e utilizzali non appena il tuo intuito ti chiamerà per un consulto.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">📅</span>
            <p className="text-white/60 text-sm">
              Dalla Dashboard, ora potrai scegliere con un clic il giorno e l'ora che preferisci e bloccare l'appuntamento <strong className="text-white/80 font-medium">senza doverlo pagare una seconda volta</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold-400 text-lg">🛡️</span>
            <p className="text-white/60 text-sm">
              Il nostro sistema tutela te e Valeria: puoi disdire o spostare il consulto autonomamente <strong className="text-white/80 font-medium">se mancano almeno 24 ore</strong>, e i crediti ti torneranno sempre in tasca.
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard" className="btn-gold">
            Torna al tuo Diario
          </Link>
          <Link to="/wallet" className="btn-outline">
            Rivedi il tuo saldo
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
