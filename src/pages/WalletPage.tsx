import { useUser, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { TOPUP_META, type TopUpKind } from '../constants/walletPrices'
import { apiJson } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'

type WalletInfo = {
  balanceAvailable: number
  balanceLocked: number
}

export default function WalletPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorLine, setErrorLine] = useState<string | null>(null)
  const [procTx, setProcTx] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false)
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
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, getToken])

  async function handleBuy(kind: TopUpKind) {
    setErrorLine(null)
    setProcTx(kind)
    try {
      const origin = window.location.origin
      const res = await apiJson<{ sessionId: string; url: string }>(getToken, '/api/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          topUpKind: kind,
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-gold-500/30 border-t-gold-400 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen px-6 py-24 relative isolate">
      {/* Background astrale */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Il Tuo <span className="gold-text">Wallet</span>
          </h1>
          <p className="text-white/50 text-sm mb-10 max-w-2xl">
            Acquista crediti per prenotare i tuoi consulti istantaneamente. I crediti "Impegnati" vengono bloccati quando fissi l'appuntamento su Calendly.
          </p>
          
          {loading ? (
             <div className="animate-pulse h-24 bg-white/5 rounded-lg border border-white/10 mb-8" />
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mb-14">
              <div className="mystical-card border-gold-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/10 blur-2xl rounded-full" />
                <h2 className="text-white/40 text-xs font-semibold tracking-wider uppercase mb-2">Crediti Disponibili</h2>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-bold text-gold-400">{wallet?.balanceAvailable ?? 0}</span>
                  <span className="text-white/30 text-sm">CR</span>
                </div>
                <p className="text-gold-500/60 text-xs mt-3">Pronti per essere incorsi in nuovi consulti</p>
              </div>

              <div className="mystical-card border-white/10 opacity-70">
                <h2 className="text-white/35 text-xs font-semibold tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <span aria-hidden>🔒</span> Crediti Impegnati
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl font-bold text-white/80">{wallet?.balanceLocked ?? 0}</span>
                  <span className="text-white/30 text-sm">CR</span>
                </div>
                <p className="text-white/40 text-xs mt-3">Temporaneamente bloccati per appuntamenti futuri</p>
              </div>
            </div>
          )}

          <h2 className="font-serif text-2xl font-bold text-white mb-6">Ricarica il saldo</h2>
          {errorLine && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
              {errorLine}
            </div>
          )}

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {(Object.entries(TOPUP_META) as [TopUpKind, typeof TOPUP_META[TopUpKind]][]).map(([kind, p]) => (
              <div
                key={kind}
                className={`mystical-card flex flex-col relative transition-all duration-300 ${
                  p.popular ? 'border-gold-500/40 shadow-[0_0_20px_rgba(212,160,23,0.15)] ring-1 ring-gold-500/20' : 'border-white/10 opacity-90 hover:opacity-100 hover:border-gold-500/30'
                }`}
              >
                {p.popular && (
                  <span className="absolute top-3 right-3 bg-gold-500 text-dark-500 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md">
                    Top
                  </span>
                )}
                
                <h3 className="font-serif text-lg text-white font-bold mb-1">{p.name}</h3>
                <p className="text-gold-400/80 text-[11px] mb-4 min-h-[30px] leading-tight">{p.description}</p>
                
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-white font-serif text-xl font-bold">
                     € {(p.amountCents / 100).toFixed(0)}
                  </span>
                  <button
                    disabled={procTx === kind || !getApiBaseUrl()}
                    onClick={() => handleBuy(kind)}
                    className="btn-gold text-[13px] px-4 py-1.5 opacity-90 hover:opacity-100 disabled:opacity-50"
                  >
                    {procTx === kind ? 'Carico...' : 'Paga'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-white/30 text-[11px] max-w-xl">
             I pagamenti sono processati in totale sicurezza da Stripe. Non conserviamo alcun dato relativo a carte di credito. Una volta effettuata una ricarica, i crediti verranno depositati istantaneamente e saranno pronti all'uso.
          </div>

        </motion.div>
      </div>
    </div>
  )
}
