import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import PrivacySealNote from './PrivacySealNote'

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
              ? 'Vai al tuo Spazio privato per prenotare una lettura con Valeria.'
              : 'Per prenotare una lettura con Valeria e accedere ai servizi riservati è necessario registrarsi.'}
          </p>
        </motion.div>

        {isLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mystical-card text-center p-8 md:p-12 mb-6"
          >
            {user ? (
               <div className="flex flex-col items-center justify-center">
                 <p className="text-white/70 text-lg mb-6 max-w-lg mx-auto leading-relaxed">
                   Hai già effettuato l'accesso. Visita la tua Dashboard per vedere le disponibilità di Valeria e prenotare il tuo prossimo consulto in pochi click.
                 </p>
                 <Link to="/dashboard" className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-dark-500 font-medium rounded-full transition-colors flex items-center justify-center gap-2">
                   Vai allo Spazio privato
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                 </Link>
               </div>
            ) : (
              <>
                <p className="text-white/70 text-lg mb-4 max-w-lg mx-auto leading-relaxed">
                  L'iscrizione è il primo passo ed è la nostra porta di ingresso.
                </p>
                <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                  Per prenotare una lettura serve un account: così Valeria sa dove contattarti, 
                  puoi usare i minuti gratuiti e gestire i consulti in sicurezza dal tuo Diario privato.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/registrati" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-dark-500 font-medium rounded-full transition-colors order-1 sm:order-2">
                    Crea il tuo account
                  </Link>
                  <Link to="/accedi" className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-medium rounded-full transition-colors order-2 sm:order-1">
                    Accedi
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}

        <PrivacySealNote className="mb-6" />

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
            Pagamento sicuro dal profilo
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
