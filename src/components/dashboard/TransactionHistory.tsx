import { motion } from 'framer-motion'

interface TransactionHistoryProps {
  transactions: any[] | null
  loading: boolean
}

export default function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-serif text-xl font-bold text-white">Diario degli acquisti &amp; Crediti</h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
          <p className="text-white/40 text-xs tracking-widest uppercase">Recupero movimenti...</p>
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="mystical-card p-0 overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-white/40 font-bold">Evento</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-white/40 font-bold">Data/Ora</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Importo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const date = new Date(tx.created_at)
                  const isPositive = ['top_up', 'unlock_refund', 'bonus'].includes(tx.tx_type)
                  const txLabels: Record<string, string> = {
                    top_up: 'Ricarica Crediti',
                    consult_lock: 'Prenotazione Consulto',
                    consult_settle: 'Consulto Terminato',
                    natal_advanced: 'Analisi Evolutiva',
                    unlock_refund: 'Rimborso Crediti',
                    bonus: 'Bonus Omaggio',
                  }
                  return (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-white/90">{txLabels[tx.tx_type] || tx.tx_type}</p>
                        {tx.reference_id && tx.reference_id.startsWith('cs_') && (
                          <p className="text-[9px] text-white/20 font-mono mt-1">
                            Ref: {tx.reference_id.slice(0, 14)}...
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-white/50">
                          {date.toLocaleDateString('it-IT')}{' '}
                          <span className="text-[10px] ml-1.5 opacity-40 font-mono italic">
                            {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </td>
                      <td
                        className={`px-4 py-4 text-right text-sm font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {tx.amount} <span className="text-[10px] font-normal opacity-50 ml-0.5">CR</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mystical-card p-8 border border-white/5 bg-white/[0.01] text-center">
          <p className="text-white/30 text-sm italic">Nessun movimento registrato nel tuo diario astrale.</p>
        </div>
      )}
    </motion.section>
  )
}
