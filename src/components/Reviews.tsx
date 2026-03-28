import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../constants/api'
import StarsRating from './StarsRating'

interface LegacyReview {
  name: string
  platform: string
  rating: number
  text: string
  date: string
}

const legacyReviews: LegacyReview[] = [
  {
    name: 'Laura M.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: 'Valeria è straordinaria. Ha visto cose che non avevo detto a nessuno. La sua lettura mi ha dato una chiarezza incredibile sulla situazione lavorativa che stavo vivendo. Tornerò sicuramente.',
    date: 'Febbraio 2025',
  },
  {
    name: 'Serena T.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: 'Mai creduto molto nei tarocchi, ma una mia amica mi ha convinto a provare. Sono rimasta senza parole. Ha descritto la mia situazione sentimentale con una precisione che mi ha fatto venire i brividi.',
    date: 'Gennaio 2025',
  },
  {
    name: 'Claudia R.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: "La prima volta che l'ho chiamata non sapevo cosa aspettarmi. La sua voce calma e il suo approccio professionale mi hanno messa subito a mio agio. Le carte hanno parlato e io ho ascoltato.",
    date: 'Dicembre 2024',
  },
]

type ApiReview = {
  id: string
  authorDisplayName: string
  rating: number
  body: string
  staffResponse: string | null
  staffRespondedAt: string | null
  publishedAt: string | null
  createdAt: string
}

function formatAverage(n: number): string {
  if (n <= 0) return '—'
  return n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(6)
  const [apiStats, setApiStats] = useState<{ count: number; average: number } | null>(null)
  const [apiReviews, setApiReviews] = useState<ApiReview[]>([])
  const [apiLoaded, setApiLoaded] = useState(false)

  useEffect(() => {
    const base = getApiBaseUrl()
    if (!base) {
      setApiLoaded(true)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${base.replace(/\/$/, '')}/api/public/reviews`)
        if (!res.ok) throw new Error('fail')
        const data = (await res.json()) as {
          stats: { count: number; average: number }
          reviews: ApiReview[]
        }
        if (!cancelled) {
          setApiStats(data.stats)
          setApiReviews(data.reviews ?? [])
        }
      } catch {
        if (!cancelled) {
          setApiStats(null)
          setApiReviews([])
        }
      } finally {
        if (!cancelled) setApiLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const siteCount = apiStats?.count ?? 0
  const siteAvg = apiStats?.average ?? 0
  const showSiteCards = apiLoaded && siteCount > 0 && apiReviews.length > 0

  const cardsToShow = showSiteCards
    ? apiReviews.slice(0, visibleCount).map((r) => ({
        key: r.id,
        name: r.authorDisplayName,
        platform: 'Sul sito',
        rating: r.rating,
        text: r.body,
        date: r.publishedAt
          ? new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(r.publishedAt))
          : new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(r.createdAt)),
        staffResponse: r.staffResponse,
      }))
    : legacyReviews.slice(0, visibleCount).map((r, i) => ({
        key: `legacy-${i}`,
        name: r.name,
        platform: r.platform,
        rating: r.rating,
        text: r.text,
        date: r.date,
        staffResponse: null as string | null,
      }))

  const hasMore = showSiteCards ? visibleCount < apiReviews.length : visibleCount < legacyReviews.length

  return (
    <section id="recensioni" className="py-24 px-6 relative">
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Cosa dicono</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Le <span className="gold-text">testimonianze</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-2">
            Oltre 1.000 feedback raccolti sulle più rinomate piattaforme online. Sul sito pubblichiamo le recensioni
            verificate delle clienti registrate.
          </p>
        </motion.div>

        {/* Rating sito (dinamico) + legacy piattaforme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div className="font-serif text-5xl gold-number">
              {apiLoaded && siteCount > 0 ? formatAverage(siteAvg) : '—'}
            </div>
            <StarsRating value={siteCount > 0 ? Math.round(siteAvg) : 0} size="md" className="justify-center mt-1" />
            <p className="text-white/40 text-xs mt-1">
              {apiLoaded ? `${siteCount} recensioni sul sito` : '…'}
            </p>
          </div>
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="font-serif text-5xl gold-number">4,97</div>
            <StarsRating value={5} size="md" className="justify-center mt-1" />
            <p className="text-white/40 text-xs mt-1">261 recensioni certificate</p>
          </div>
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="font-serif text-5xl gold-number">776</div>
            <p className="text-white/60 text-sm font-medium mt-1">commenti positivi</p>
            <p className="text-white/40 text-xs mt-0.5">Piattaforma certificata</p>
          </div>
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="font-serif text-5xl gold-number">3.359</div>
            <p className="text-white/60 text-sm font-medium mt-1">consulti completati</p>
            <p className="text-white/40 text-xs mt-0.5">su piattaforme certificate</p>
          </div>
        </motion.div>

        {!showSiteCards && apiLoaded && (
          <p className="text-center text-white/35 text-sm mb-8 max-w-lg mx-auto">
            Le recensioni lasciate qui compariranno dopo la moderazione. Intanto ecco alcune voci dalle piattaforme
            esterne.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsToShow.map((review, i) => (
            <motion.div
              key={review.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="mystical-card flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white text-sm">{review.name}</div>
                  <div className="text-white/30 text-xs">
                    {review.date} · {review.platform}
                  </div>
                </div>
                <StarsRating value={review.rating} size="sm" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed italic flex-1">&ldquo;{review.text}&rdquo;</p>
              {'staffResponse' in review && review.staffResponse && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-gold-500/90 text-xs font-medium mb-1">Valeria</p>
                  <p className="text-white/55 text-xs leading-relaxed whitespace-pre-wrap">{review.staffResponse}</p>
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-white/20 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {review.platform === 'Sul sito' ? 'Recensione verificata sul sito' : `Esempio da ${review.platform}`}
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <button
              type="button"
              onClick={() =>
                setVisibleCount((v) =>
                  Math.min(v + 6, showSiteCards ? apiReviews.length : legacyReviews.length)
                )
              }
              className="btn-outline"
            >
              Leggi altre recensioni
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
