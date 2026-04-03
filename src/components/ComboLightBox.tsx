import { motion } from 'framer-motion'

export default function ComboLightBox({ onSelect }: { onSelect: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-amber-900/10 border border-gold-500/30 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative"
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
          <p className="text-white/80 font-medium mb-1 text-center text-sm">Prenota la tua combo</p>
          <p
            className="font-serif text-3xl font-bold mb-4 text-center"
            style={{ background: 'linear-gradient(135deg, #ffe066, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            90 CR
          </p>
          <p className="text-white/35 text-[10px] mb-4 text-center">
            2× Conulto breve (30') · 1× Coaching (30')
          </p>
          
          <div className="w-full flex justify-center items-center">
            <button 
              onClick={onSelect}
              className="bg-[#FFD140] hover:bg-[#e6bb39] text-black font-bold py-2.5 px-8 rounded cursor-pointer min-w-[11.625rem] text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2"
            >
              <span>Scegli data e ora</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          
          <p className="text-white/40 text-[10px] mt-4 text-center max-w-[200px]">
            L'acquisto si completa <strong className="text-white/70">su Calendly</strong> dopo aver sceto il giorno e l'orario del tuo primo consulto.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
