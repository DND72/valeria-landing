import { motion } from 'framer-motion'
import { ShieldCheck, Lock, CreditCard } from 'lucide-react'

export default function TrustPayments() {
  return (
    <section className="py-20 relative overflow-hidden bg-white/[0.02]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] uppercase tracking-widest font-bold">
              <ShieldCheck size={14} />
              100% Sicuro & Trasparente
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              I tuoi crediti, in <br />
              <span className="gold-text">totale sicurezza.</span>
            </h2>
            
            <p className="text-white/60 text-lg leading-relaxed">
              La gestione dei tuoi acquisti avviene esclusivamente tramite piattaforme leader indipendenti. 
              Nonsolotarocchi non memorizza mai i dati della tua carta: la transazione è gestita dai sistemi crittografati di <strong>PayPal</strong> e <strong>Stripe</strong>.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Crittografia End-to-End</h4>
                  <p className="text-xs text-white/40">Sia Stripe che PayPal utilizzano protocolli di sicurezza bancaria per proteggere ogni tuo centesimo.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 flex-shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Trasparenza Immediata</h4>
                  <p className="text-xs text-white/40">Ricevi una ricevuta immediata per ogni ricarica e puoi monitorare il tuo saldo in tempo reale nel Diario.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Banner / Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl overflow-hidden group">
              {/* Animated Accent */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/20 blur-3xl rounded-full group-hover:bg-gold-500/40 transition-all duration-700" />
              
              <h3 className="text-2xl font-serif font-bold text-white mb-8 text-center md:text-left">Circuiti Supportati</h3>
              
              <div className="flex flex-col gap-6">
                {/* Stripe Banner */}
                <div className="flex items-center justify-between p-8 rounded-3xl bg-white border border-white/20 shadow-xl shadow-purple-600/5 group/stripe">
                   <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                    alt="Stripe" 
                    className="h-10 w-auto"
                   />
                   <div className="flex gap-2">
                      <div className="w-8 h-5 rounded bg-slate-100" />
                      <div className="w-8 h-5 rounded bg-slate-100" />
                      <div className="w-8 h-5 rounded bg-slate-100" />
                   </div>
                </div>

                {/* PayPal Banner */}
                <div className="flex items-center justify-between p-8 rounded-3xl bg-white border border-white/20 shadow-xl shadow-blue-600/5 group/paypal">
                   <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
                    alt="PayPal" 
                    className="h-10 w-auto"
                   />
                   <div className="flex gap-2 text-slate-400">
                      <ShieldCheck size={24} />
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 vanish" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-dark-500 border border-gold-500/30 shadow-2xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <p className="text-[10px] uppercase font-bold text-white/40">Security Status</p>
                  <p className="text-xs font-bold text-white">Verified PCI-DSS</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
