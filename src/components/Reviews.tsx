import { motion } from 'framer-motion'
import { useState } from 'react'

interface Review {
  name: string
  platform: string
  rating: number
  text: string
  date: string
}

const reviews: Review[] = [
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
    text: 'La prima volta che l\'ho chiamata non sapevo cosa aspettarmi. La sua voce calma e il suo approccio professionale mi hanno messa subito a mio agio. Le carte hanno parlato e io ho ascoltato.',
    date: 'Dicembre 2024',
  },
  {
    name: 'Monica F.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: 'Stella (Valeria) ha un dono autentico. Collegandomi ho trovato subito conforto e chiarezza. Mi ha parlato con il cuore, ha capito esattamente cosa mi pesava. Un grande abbraccio di luce!',
    date: 'Marzo 2025',
  },
  {
    name: 'Antonella B.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: 'Ho fatto decine di consulti con tante tarologhe. Valeria è in un\'altra categoria. La profondità della sua lettura, la precisione, l\'empatia — difficile trovare qualcuno così.',
    date: 'Novembre 2024',
  },
  {
    name: 'Patrizia G.',
    platform: 'Piattaforma certificata',
    rating: 5,
    text: 'Tesoro mio, questa donna vede davvero! Ha indicato una data precisa per un cambiamento lavorativo e si è avverata. 4,97 su 5 è persino troppo basso per quello che offre.',
    date: 'Aprile 2025',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-gold-400' : 'text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(3)

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
            Oltre 1.000 feedback raccolti sulle più rinomate piattaforme online. Queste sono le voci di chi ha già scelto Valeria.
          </p>
        </motion.div>

        {/* Rating summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div className="font-serif text-5xl gold-number">4,97</div>
            <Stars count={5} />
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

        {/* Review cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, visibleCount).map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="mystical-card flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white text-sm">{review.name}</div>
                  <div className="text-white/30 text-xs">{review.date} · {review.platform}</div>
                </div>
                <Stars count={review.rating} />
              </div>
              <p className="text-white/60 text-sm leading-relaxed italic flex-1">
                "{review.text}"
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-white/20 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recensione verificata su {review.platform}
              </div>
            </motion.div>
          ))}
        </div>

        {visibleCount < reviews.length && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setVisibleCount(reviews.length)}
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
