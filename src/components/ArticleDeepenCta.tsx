import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ConsultKind } from '../constants/consultations'

export type DeepenCtaConfig = {
  /** Domanda in stile “esca dottrinale” */
  question: string
  /** Tipo di consulto pre-selezionato in dashboard */
  consultKind: ConsultKind
  /** Tarocchi: tono oro/scuro; coaching: salvia/chiarezza */
  track: 'tarocchi' | 'coaching'
}

type Props = {
  config: DeepenCtaConfig
}

export default function ArticleDeepenCta({ config }: Props) {
  const { question, consultKind, track } = config
  const href = `/dashboard?consult=${consultKind}`
  const isCoaching = track === 'coaching'

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className={
        isCoaching
          ? 'rounded-xl border border-emerald-800/35 bg-gradient-to-br from-[#f4f1ea]/[0.07] via-[#1a1f1c]/90 to-[#0d100e]/95 px-5 py-5'
          : 'rounded-xl border border-gold-600/25 bg-gold-600/[0.06] px-5 py-5'
      }
    >
      <p
        className={
          isCoaching
            ? 'font-serif text-lg text-[#e8ebe9] leading-snug mb-4'
            : 'font-serif text-lg text-white/90 leading-snug mb-4'
        }
      >
        {question}
      </p>
      <Link
        to={href}
        className={
          isCoaching
            ? 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors bg-emerald-900/50 text-emerald-100/95 border border-emerald-700/40 hover:bg-emerald-800/55 hover:border-emerald-600/45'
            : 'btn-gold text-sm px-5 py-2.5 inline-flex'
        }
      >
        {isCoaching ? 'Evoluzione strategica — prenota' : 'Apri il calendario — Metodo'}
      </Link>
      <p className={isCoaching ? 'mt-3 text-[11px] text-[#9ca89a]' : 'mt-3 text-[11px] text-white/35'}>
        {isCoaching
          ? 'Coaching / crescita personale: scegli data e ora dal tuo diario.'
          : 'Letture Tarocchi: dal tuo diario scegli il settore e il tipo di consulto.'}
      </p>
    </motion.aside>
  )
}
