import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import CalendlyEmbed from './CalendlyEmbed'
import { CALENDLY_BOOKING_URL } from '../constants/calendly'

export default function BookingSection() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

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
              : 'Il calendario è riservato agli iscritti. Un passo e sei dentro.'}
          </p>
        </motion.div>

        {!isLoaded ? (
          <div className="mystical-card text-center py-16 text-white/40 text-sm">Caricamento…</div>
        ) : user ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mystical-card p-0 overflow-hidden rounded-lg"
          >
            <CalendlyEmbed url={CALENDLY_BOOKING_URL} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mystical-card text-center p-8 md:p-12"
          >
            <p className="text-white/70 text-lg mb-2 max-w-lg mx-auto leading-relaxed">
              Per prenotare una lettura serve un account: così Valeria sa dove contattarti,
              puoi usare i minuti gratuiti e pagare i consulti in sicurezza dal tuo spazio personale.
            </p>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
              Anche se non vuoi il consulto omaggio, l’iscrizione resta il primo passo — è la nostra porta di ingresso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button type="button" onClick={() => navigate('/registrati')} className="btn-gold">
                ✨ Crea il tuo account
              </button>
              <button
                type="button"
                onClick={() => navigate('/accedi')}
                className="btn-outline"
              >
                Ho già un account
              </button>
            </div>
          </motion.div>
        )}

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
