import { SignUp } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full flex flex-col items-center gap-8"
      >
        <div className="text-center">
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-2">Benvenuta</p>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">
            Crea il tuo <span className="gold-text">Diario</span>
          </h1>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Registrati e ricevi subito un{' '}
            <strong className="text-gold-400">consulto gratuito di 7 minuti</strong> con Valeria
          </p>
          <p className="text-white/30 text-xs max-w-xs mx-auto mt-2">
            🔒 Scegli una password di almeno 8 caratteri. Riceverai un codice via email per confermare il tuo account.
          </p>
          <p className="text-white/25 text-[11px] max-w-sm mx-auto mt-4 leading-relaxed bg-white/5 p-3 rounded border border-white/10">
            Accetto i <Link to="/termini" className="text-gold-500/70 hover:text-gold-400 underline underline-offset-2">Termini di Servizio</Link> 
            {' '}e confermo di aver letto la <Link to="/privacy" className="text-gold-500/70 hover:text-gold-400 underline underline-offset-2">Privacy Policy</Link>. 
            Dichiaro di essere maggiorenne. 
            <br />
            <span className="text-[10px] opacity-60">
              Registrandoti, i tuoi dati saranno trattati da Valeria Di Pace secondo le norme vigenti.
            </span>
          </p>
        </div>

        <SignUp
          routing="path"
          path="/registrati"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#d4a017',
              colorBackground: '#0d1b2a',
              colorText: '#f5f0e8',
              colorTextSecondary: '#a0a0a0',
              colorInputBackground: '#0a1628',
              colorInputText: '#f5f0e8',
              borderRadius: '8px',
            },
            elements: {
              card: 'shadow-2xl border border-gold-600/20',
              headerTitle: 'font-serif text-white',
              socialButtonsBlockButton: 'border-gold-600/30 text-white hover:bg-gold-600/10',
              formButtonPrimary: 'bg-gradient-to-r from-gold-600 to-gold-300 text-dark-500 font-semibold',
              footerActionLink: 'text-gold-400 hover:text-gold-300',
              formFieldErrorText: 'text-red-400 text-sm',
              alertText: 'text-red-300 text-sm',
            },
          }}
          signInUrl="/accedi"
        />
      </motion.div>
    </div>
  )
}
