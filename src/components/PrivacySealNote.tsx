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
        <span className="block mt-2 text-xs text-white/40">
          Dati gestiti secondo GDPR, privacy policy Iubenda. <span className="hidden sm:inline">| </span>
          <br className="sm:hidden" />Le letture dei tarocchi sono offerte a scopo di orientamento e intrattenimento.
        </span>
      </p>
    </div>
  )
}
