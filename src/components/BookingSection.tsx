import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import CalendlyEmbed from './CalendlyEmbed'
import { CALENDLY_BOOKING_URL } from '../constants/calendly'

export default function BookingSection() {
  const { user, isLoaded } = useUser()

  return (
    <section id="prenota" className="py-24 px-6 relative overflow-hidden">
      <div className="section-divider" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Inizia ora</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Prenota la tua <span className="gold-text">lettura</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            {user
              ? 'Scegli giorno e ora dal calendario. Valeria ti aspetta.'
              : isLoaded
                ? 'Qui sotto vedi le disponibilità in tempo reale. Per completare la prenotazione e il pagamento dal profilo serve un account.'
                : 'Qui sotto trovi il calendario con le disponibilità aggiornate.'}
          </p>
        </motion.div>

        {!user && isLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mystical-card text-center p-6 md:p-8 mb-6"
          >
            <p className="text-white/70 text-lg mb-2 max-w-lg mx-auto leading-relaxed">
              Per prenotare una lettura serve un account: così Valeria sa dove contattarti,
              puoi usare i minuti gratuiti e pagare i consulti in sicurezza dal tuo spazio personale.
            </p>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Anche se non vuoi il consulto omaggio, l’iscrizione resta il primo passo — è la nostra porta di ingresso.
            </p>
            <p className="text-white/50 text-sm">
              <Link to="/registrati" className="text-gold-400 hover:text-gold-300 underline underline-offset-4 font-medium">
                Crea il tuo account
              </Link>
              <span className="text-white/25 mx-2">·</span>
              <Link to="/accedi" className="text-white/55 hover:text-white/75 underline underline-offset-4">
                Ho già un account
              </Link>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`mystical-card p-0 overflow-hidden rounded-lg ${isLoaded && !user ? 'ring-1 ring-white/10' : ''}`}
        >
          <CalendlyEmbed url={CALENDLY_BOOKING_URL} minHeight={680} />
          {isLoaded && !user && (
            <p className="text-center text-white/35 text-xs px-4 py-2 border-t border-white/5 bg-dark-500/50">
              Non sei ancora dentro? Puoi comunque sfogliare date e orari; per confermare lo slot usa i link sopra quando sei pronta.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/30 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagamento sicuro via PayPal (dal tuo profilo)
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Consulto garantito
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Telefono o videochiamata
          </span>
        </motion.div>
      </div>
    </section>
  )
}
