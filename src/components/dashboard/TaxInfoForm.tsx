import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../../constants/api'
import { apiJson, ApiError } from '../../lib/api'

interface TaxInfoFormProps {
  onSuccess: (data: { hasCodiceFiscale: boolean }) => void
  getToken: () => Promise<string | null>
  donePaidConsults: number
}

export default function TaxInfoForm({ onSuccess, getToken, donePaidConsults }: TaxInfoFormProps) {
  const [taxFirst, setTaxFirst] = useState('')
  const [taxLast, setTaxLast] = useState('')
  const [taxCf, setTaxCf] = useState('')
  const [taxSubmitting, setTaxSubmitting] = useState(false)
  const [taxLegalChecked, setTaxLegalChecked] = useState(false)
  const [taxMessage, setTaxMessage] = useState<string | null>(null)

  async function handleTaxSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTaxMessage(null)
    if (!getApiBaseUrl()) {
      setTaxMessage('Servizio dati non disponibile.')
      return
    }
    setTaxSubmitting(true)
    try {
      await apiJson(getToken, '/api/me/tax-code', {
        method: 'POST',
        body: JSON.stringify({
          firstName: taxFirst.trim(),
          lastName: taxLast.trim(),
          codiceFiscale: taxCf.trim(),
        }),
      })
      setTaxMessage('Grazie, i dati sono stati registrati.')
      onSuccess({ hasCodiceFiscale: true })
    } catch (err) {
      setTaxMessage(err instanceof ApiError ? String(err.message) : 'Impossibile salvare. Riprova più tardi.')
    } finally {
      setTaxSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 mystical-card border border-amber-600/30"
    >
      <h3 className="font-serif text-lg font-bold text-white mb-1">Dati per fatturazione</h3>
      <p className="text-white/50 text-sm mb-4">
        Dopo diversi consulti completati, per la contabilità servono nome, cognome e codice fiscale.
      </p>
      {donePaidConsults >= 3 && (
        <p className="text-amber-200/80 text-xs mb-4">
          Consulti pagati completati: <strong>{donePaidConsults}</strong>
        </p>
      )}
      <form onSubmit={(e) => void handleTaxSubmit(e)} className="grid gap-3 sm:grid-cols-2 max-w-lg">
        <label className="block">
          <span className="text-white/45 text-xs block mb-1">Nome</span>
          <input
            required
            value={taxFirst}
            onChange={(e) => setTaxFirst(e.target.value)}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            autoComplete="given-name"
          />
        </label>
        <label className="block">
          <span className="text-white/45 text-xs block mb-1">Cognome</span>
          <input
            required
            value={taxLast}
            onChange={(e) => setTaxLast(e.target.value)}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            autoComplete="family-name"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-white/45 text-xs block mb-1">Codice fiscale</span>
          <input
            required
            minLength={11}
            maxLength={16}
            value={taxCf}
            onChange={(e) => setTaxCf(e.target.value.toUpperCase())}
            className="w-full max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white font-mono tracking-wide"
            autoComplete="off"
          />
        </label>
        <label className="flex items-start gap-2 mb-2 sm:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            checked={taxLegalChecked}
            onChange={(e) => setTaxLegalChecked(e.target.checked)}
            className="mt-1 accent-gold-500"
          />
          <span className="text-white/40 text-[11px]">
            Accetto i{' '}
            <Link to="/termini" className="text-gold-500/70 hover:underline">
              Termini
            </Link>{' '}
            e confermo che i dati sono corretti.
          </span>
        </label>
        <button
          type="submit"
          className="btn-gold text-sm px-5 py-2.5 sm:col-span-2 w-fit"
          disabled={taxSubmitting || !taxLegalChecked}
        >
          {taxSubmitting ? 'Salvataggio…' : 'Salva dati'}
        </button>
      </form>
      {taxMessage && (
        <p
          className={`text-sm mt-3 ${
            taxMessage.startsWith('Grazie') ? 'text-emerald-400/90' : 'text-red-400/90'
          }`}
        >
          {taxMessage}
        </p>
      )}
    </motion.div>
  )
}
