import { Link } from 'react-router-dom'

type Props = {
  className?: string
}

/** Messaggio di riservatezza per footer e aree prenotazione/pagamento. */
export default function PrivacySealNote({ className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-gold-600/25 bg-[rgba(8,10,14,0.55)] px-4 py-3.5 backdrop-blur-sm ${className}`}
    >
      <p className="text-center text-sm leading-relaxed text-white/55">
        Ogni consulto ed ogni consulenza sono protette dal{' '}
        <strong className="font-medium text-gold-400/90">segreto professionale</strong> e dalla tecnologia più avanzata.
        La tua privacy è il nostro{' '}
        <span className="font-serif italic text-gold-400/95">Sigillo del Silenzio</span>.
        <span className="block mt-2 text-[11px] text-white/35">
          Dati gestiti secondo GDPR. Consulta la nostra{' '}
          <Link to="/termini" className="text-gold-500/60 hover:text-gold-400 underline underline-offset-2">
            Privacy Policy & Termini
          </Link>.
          <span className="hidden sm:inline"> | </span>
          <br className="sm:hidden" />Le letture dei tarocchi sono ad esclusivo scopo di orientamento e intrattenimento.
        </span>
      </p>
    </div>
  )
}
