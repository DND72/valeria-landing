import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ComboFullBox() {
  const paypalContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // @ts-ignore
    const win = window as any
    if (win.paypal && win.paypal.HostedButtons && paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = ''
      win.paypal.HostedButtons({
        hostedButtonId: "BANPY4Q3ZEJUN",
      }).render(paypalContainerRef.current)
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-emerald-900/10 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative"
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(16,185,129,0.06) 0%, transparent 60%)'
        }}
      />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1">
          <p className="text-emerald-500/90 text-xs font-mono tracking-widest uppercase mb-2">
            Il percorso intensivo
          </p>
          <h3 className="font-serif text-2xl font-bold text-white mb-3">
            Combo Full <span className="text-emerald-400">"Trasformazione"</span>
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            Un percorso combinato per chi sente la necessità di andare più in profondità e farsi affiancare più da vicino. 
            Combina <strong className="text-white">lettura estesa e dettagliata con i Tarocchi</strong> e <strong className="text-white">sessioni di Coaching avanzate</strong> per definire obiettivi, superare blocchi e misurare i progressi nel tempo.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-white/50 text-xs">
              <span className="text-emerald-500" aria-hidden>✨</span> Letture ampie per massima chiarezza (Tarocchi)
            </li>
            <li className="flex items-center gap-2 text-white/50 text-xs">
              <span className="text-emerald-500" aria-hidden>🎯</span> Piano d'azione continuativo (Coaching)
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-dark-500/50 rounded-xl border border-white/5 min-w-[280px]">
          <p className="text-white/80 font-medium mb-4 text-center text-sm">Acquista la combo full</p>
          <div ref={paypalContainerRef} id="paypal-container-BANPY4Q3ZEJUN" className="w-full flex justify-center items-center min-h-[50px]">
            {/* Il bottone PayPal verrà renderizzato qui */}
          </div>
          <p className="text-white/30 text-[10px] mt-4 text-center max-w-[200px]">
            Pagamento tramite circuito sicuro PayPal. Riceverai le istruzioni dopo l'acquisto.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
