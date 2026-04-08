import { useUser, useAuth } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { TOPUP_META, type TopUpKind } from '../constants/walletPrices'
import { apiJson } from '../lib/api'
import ClientLayout from '../components/dashboard/ClientLayout'

declare global {
  interface Window {
    paypal?: any
  }
}

type WalletInfo = {
  balanceAvailable: number
  balanceLocked: number
}

export default function WalletPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [errorLine, setErrorLine] = useState<string | null>(null)
  const [procTx, setProcTx] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('paypal')
  const [selectedKind, setSelectedKind] = useState<TopUpKind>('topup_50')
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypalContainerRef = useRef<HTMLDivElement>(null)

  // Caricamento saldo wallet
  useEffect(() => {
    if (!isLoaded || !user) {
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson<WalletInfo>(getToken, '/api/wallet/me')
        if (!cancelled) {
          setWallet(data)
        }
      } catch (err) {
        if (!cancelled) setErrorLine('Errore nel contattare il server per leggere il saldo.')
      }
    })()

    return () => { cancelled = true }
  }, [isLoaded, user, getToken])

  // Iniezione PayPal SDK (Sandbox)
  useEffect(() => {
    const script = document.createElement('script')
    // Cambiare client-id qui quando si passa in produzione
    script.src = `https://www.paypal.com/sdk/js?client-id=Adqa31k26hBAtk7DDavQZ_7j-PT0GyS9LuA0eZNrQLJ6Zq_zxapC1CVr0ySlXdAcwxR2XkRb3JZP5CPG&currency=EUR&components=buttons`
    script.async = true
    script.onload = () => setPaypalLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Rendering Pulsanti PayPal dinamici
  useEffect(() => {
    if (paypalLoaded && paymentMethod === 'paypal' && paypalContainerRef.current) {
      // Puliamo il contenitore prima di fare il render
      paypalContainerRef.current.innerHTML = ''
      
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay'
          },
          createOrder: async () => {
            try {
              const res = await apiJson<any>(getToken, '/api/payments/paypal/create-order', {
                method: 'POST',
                body: JSON.stringify({ topUpKind: selectedKind })
              })
              return res.id
            } catch (e) {
              setErrorLine('Impossibile creare l\'ordine PayPal.')
            }
          },
          onApprove: async (data: any) => {
            setProcTx('processing')
            try {
              const res = await apiJson<any>(getToken, '/api/payments/paypal/capture-order', {
                method: 'POST',
                body: JSON.stringify({ orderID: data.orderID })
              })
              if (res.status === 'COMPLETED') {
                 // Ricarichiamo il wallet dopo successo
                 const w = await apiJson<WalletInfo>(getToken, '/api/wallet/me')
                 setWallet(w)
                 alert('Ricarica completata con successo! I tuoi crediti sono pronti.')
              }
            } catch (e) {
              setErrorLine('Errore durante la cattura del pagamento.')
            } finally {
              setProcTx(null)
            }
          }
        }).render(paypalContainerRef.current)
      }
    }
  }, [paypalLoaded, paymentMethod, selectedKind, getToken])

  // Gestione Stripe (Legacy)
  async function handleStripeBuy() {
    setErrorLine(null)
    setProcTx(selectedKind)
    try {
      const origin = window.location.origin
      const res = await apiJson<{ sessionId: string; url: string }>(getToken, '/api/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          topUpKind: selectedKind,
          successUrl: `${origin}/grazie?stripe_session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/wallet`,
        }),
      })
      if (res.url) {
        window.location.href = res.url
      }
    } catch (err: any) {
      setErrorLine(err.message || 'Errore di connessione a Stripe.')
      setProcTx(null)
    }
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-2 border-gold-500/30 border-t-gold-400 rounded-full" /></div>
  if (!user) return <Navigate to="/" replace />

  return (
    <ClientLayout title="Il Tuo Wallet" subtitle="Pacchetti Energetici">
      <div className="space-y-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-white/45 text-sm max-w-xl leading-relaxed">
                I crediti ti permettono di prenotare consulti istantaneamente. 
                Puoi scegliere di pagare con <strong className="text-white/60">PayPal (anche in 3 rate)</strong> o via <strong className="text-white/60">Carta di Credito</strong>.
              </p>
            </div>
            
            {/* Wallet Summary */}
            <div className="flex gap-4">
              <div className="mystical-card py-3 px-6 border-gold-500/20 bg-gold-400/5">
                <p className="text-[10px] uppercase tracking-tighter text-white/40 mb-1">Saldo Disponibile</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-serif font-bold text-gold-400">{wallet?.balanceAvailable ?? 0}</span>
                  <span className="text-xs text-gold-500/40">CR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1: Selection */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-white/80 font-serif text-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-gold-500">1</span>
                Scegli il tuo pacchetto energetico
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {(Object.entries(TOPUP_META) as [TopUpKind, typeof TOPUP_META[TopUpKind]][]).map(([kind, p]) => {
                  const isSelected = selectedKind === kind
                  const bonus = p.credits - (p.amountCents / 100)
                  return (
                    <button
                      key={kind}
                      onClick={() => setSelectedKind(kind)}
                      className={`mystical-card text-left p-6 transition-all duration-500 relative group ${
                        isSelected 
                          ? 'border-gold-500 bg-gold-500/5 shadow-[0_0_30px_rgba(212,160,23,0.1)] scale-[1.02]' 
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-gold-500 text-dark-500' : 'bg-white/5 text-white/40'}`}>
                          {kind === 'topup_30' && <span className="text-xl">🌌</span>}
                          {kind === 'topup_50' && <span className="text-xl">✨</span>}
                          {kind === 'topup_80' && <span className="text-xl">☄️</span>}
                          {kind === 'topup_150' && <span className="text-xl">☀️</span>}
                        </div>
                        {bonus > 0 && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                            +{bonus} CR OMAGGIO
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-white font-serif text-lg font-bold mb-1">{p.name}</h3>
                      <p className="text-white/40 text-xs mb-6 leading-tight h-8">{p.description}</p>
                      
                      <div className="flex items-end justify-between">
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-serif font-bold text-white">{p.credits}</span>
                            <span className="text-white/30 text-xs uppercase tracking-widest font-bold">Crediti</span>
                         </div>
                         <div className="text-gold-500 font-bold text-lg">€ {(p.amountCents / 100).toFixed(0)}</div>
                      </div>

                      {isSelected && (
                        <motion.div layoutId="aura" className="absolute inset-0 border-2 border-gold-500/50 rounded-2xl pointer-events-none" initial={false} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="space-y-6">
              <h2 className="text-white/80 font-serif text-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-gold-500">2</span>
                Metodo di pagamento
              </h2>
              
              <div className="mystical-card p-6 border-white/10 space-y-6">
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'paypal' ? 'bg-gold-500 text-dark-500 shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    PayPal / 3 Rate
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'stripe' ? 'bg-gold-500 text-dark-500 shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    Carta di Credito
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'paypal' ? (
                    <motion.div 
                      key="paypal-ui"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl text-center">
                        <p className="text-gold-400 text-xs font-bold mb-1">PACCHETTO SELEZIONATO</p>
                        <p className="text-white text-lg font-serif">{TOPUP_META[selectedKind].name}</p>
                        <p className="text-white/30 text-[10px] mt-1 italic leading-tight">PayPal garantisce transazioni sicure e possibilità di rateizzazione su acquisti idonei.</p>
                      </div>

                      {errorLine && (
                        <div className="text-red-400 text-[10px] bg-red-400/5 p-2 rounded border border-red-400/10 mb-2">
                           ⚠️ {errorLine}
                        </div>
                      )}

                      <div ref={paypalContainerRef} className="min-h-[150px] flex flex-col justify-center gap-2" />
                      {!paypalLoaded && (
                         <div className="py-10 flex flex-col items-center gap-3">
                            <div className="h-6 w-6 border-2 border-gold-500/20 border-t-gold-500 animate-spin rounded-full" />
                            <p className="text-white/30 text-[10px] uppercase tracking-widest">Inizializzazione Cassiere Astronomico...</p>
                         </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="stripe-ui"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6 text-center"
                    >
                      <div className="p-10 bg-white/[0.03] border border-white/5 rounded-2xl">
                          <div className="text-4xl mb-4 opacity-50">💳</div>
                          <p className="text-white text-sm font-bold mb-2">Check-out via Stripe</p>
                          <p className="text-white/30 text-[10px] mb-8 leading-relaxed">Verrai reindirizzato sulla pagina sicura di Stripe per completare l'acquisto con carta di credito, PostePay o Apple Pay.</p>
                          
                          <button
                            onClick={handleStripeBuy}
                            disabled={!!procTx}
                            className="btn-gold w-full py-3 text-sm font-bold tracking-widest uppercase disabled:opacity-50"
                          >
                            {procTx ? 'Reindirizzamento...' : `Paga € ${(TOPUP_META[selectedKind].amountCents / 100).toFixed(0)}`}
                          </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                 <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Garanzia di Fiducia</p>
                 <p className="text-white/40 text-[10px] leading-relaxed italic">
                    I tuoi dati finanziari non toccano mai i nostri server. Le transazioni sono protette da crittografia a 256-bit tramite i circuiti PayPal e Stripe.
                 </p>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-white/5 pt-10 grid md:grid-cols-3 gap-8">
             <div className="text-center">
                <div className="text-2xl mb-2">⚡️</div>
                <h4 className="text-white text-sm font-bold mb-1">Accredito Istantaneo</h4>
                <p className="text-white/30 text-xs">I crediti compaiono nel tuo saldo subito dopo la transazione.</p>
             </div>
             <div className="text-center">
                <div className="text-2xl mb-2">💎</div>
                <h4 className="text-white text-sm font-bold mb-1">Costo Trasparente</h4>
                <p className="text-white/30 text-xs">Nessun costo nascosto. Paghi solo ciò che ricarichi e usi.</p>
             </div>
             <div className="text-center">
                <div className="text-2xl mb-2">📜</div>
                <h4 className="text-white text-sm font-bold mb-1">Fatturazione Chiara</h4>
                <p className="text-white/30 text-xs">Ricevi la ricevuta fiscale via email per ogni ricarica effettuata.</p>
             </div>
          </div>

        </motion.div>
      </div>
    </ClientLayout>
  )
}
