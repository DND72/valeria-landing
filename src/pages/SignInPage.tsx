import { SignIn } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

export default function SignInPage() {
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
          <h1 className="font-serif text-3xl font-bold gold-text mb-2">Bentornata</h1>
          <p className="text-white/50 text-sm">Accedi al tuo Diario d&apos;Evoluzione</p>
        </div>
        <SignIn
          routing="path"
          path="/accedi"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            layout: {
              socialButtonsVariant: 'blockButton',
              socialButtonsPlacement: 'top',
            },
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
              socialButtonsBlockButton: 'bg-white border-none text-black hover:bg-white/90 font-medium',
              formButtonPrimary: 'clerk-button-reset bg-[#d4a017] hover:bg-[#b8860b] text-dark-500 font-bold uppercase transition-colors',
              footerActionLink: 'text-gold-400 hover:text-gold-300',
              formFieldErrorText: 'text-red-400 text-sm',
              alertText: 'text-red-300 text-sm',
            },
          }}
          signUpUrl="/registrati"
        />
      </motion.div>
    </div>
  )
}
