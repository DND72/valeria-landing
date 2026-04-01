import { motion } from 'framer-motion'

export default function ComboLightBox() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-dark-400/80 border border-gold-500/30 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative"
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(212,160,23,0.06) 0%, transparent 60%)'
        }}
      />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1">
          <p className="text-gold-500 text-xs font-mono tracking-widest uppercase mb-2">
            Il tuo prossimo passo
          </p>
          <h3 className="font-serif text-2xl font-bold text-white mb-3">
            Combo Light <span className="text-gold-400">"Focus & Azione"</span>
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            Dalla lettura alla scelta concreta. Le Carte ti hanno mostrato un pezzo importante della tua storia.
            Ora il vero cambiamento nasce da ciò che decidi di fare con questa consapevolezza. 
            Questo percorso unisce <strong className="text-white">2 consulti di Tarocchi (30')</strong> per l'esplorazione e <strong className="text-white">1 sessione di Coaching (30')</strong> per trasformare ciò che è emerso in azioni chiare e concrete.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-white/50 text-xs">
              <span className="text-gold-500" aria-hidden>✨</span> Chiarezza profonda sulle tue dinamiche (Tarocchi)
            </li>
            <li className="flex items-center gap-2 text-white/50 text-xs">
              <span className="text-gold-500" aria-hidden>🎯</span> Passi concreti e definizioni chiare (Coaching)
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-dark-500/50 rounded-xl border border-white/5 min-w-[280px]">
          <p className="text-white/80 font-medium mb-4 text-center text-sm">Acquista la combo in sicurezza</p>
          
          <div className="w-full flex justify-center items-center">
            <form action="https://www.paypal.com/ncp/payment/CVAKH6MJ7N4L6" method="post" target="_blank" style={{display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem'}}>
              <input 
                type="submit" 
                value="Acquista ora" 
                className="bg-[#FFD140] hover:bg-[#e6bb39] text-black font-bold py-2 px-8 rounded cursor-pointer min-w-[11.625rem] h-[2.625rem] text-base transition-colors"
              />
              <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" />
              <section className="text-xs text-white/50 flex items-center justify-center mt-1"> 
                Con tecnologia <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style={{height: '0.875rem', marginLeft: '0.3rem', verticalAlign: 'middle'}}/>
              </section>
            </form>
          </div>
          
        </div>
      </div>
    </motion.div>
  )
}
