import { motion } from 'framer-motion'
import { useState } from 'react'

interface GalleryItem {
  src: string
  caption: string
  category: 'templare' | 'onorificenze' | 'parafarmacia' | 'altro'
}

const galleryItems: GalleryItem[] = [
  {
    src: '/valeria-tarots-glass.jpg',
    caption: 'La Visione: Consulto Professionale',
    category: 'altro',
  },
  {
    src: '/valeria-chess.jpg',
    caption: 'La Strategia: Arena International Master (FIDE)',
    category: 'onorificenze',
  },
  {
    src: '/valeria-fide.jpg',
    caption: 'Arena International Master (FIDE)',
    category: 'onorificenze',
  },
  {
    src: '/valeria-sanremo.jpg',
    caption: 'Collaborazione a Casa Sanremo',
    category: 'altro',
  },
  {
    src: '/valeria-award-1.jpg',
    caption: 'Premio alla Carriera - Rete Quattro',
    category: 'onorificenze',
  },
  {
    src: '/valeria-award-2.jpg',
    caption: 'Premio Speciale 2024 - Anzio Film Festival',
    category: 'onorificenze',
  },
  {
    src: '/valeria-giornalista.jpg',
    caption: 'Dott.ssa Valeria Di Pace - Attrice',
    category: 'onorificenze',
  },
  {
    src: '/valeria-templare-1.jpg',
    caption: 'Tradizione e Lignaggio Templare',
    category: 'templare',
  },
  {
    src: '/valeria-templare-2.jpg',
    caption: 'Investitura e Firma del Vessillo',
    category: 'templare',
  },
  {
    src: '/valeria-templare-3.jpg',
    caption: 'Cerimonia Solenne',
    category: 'templare',
  },
  {
    src: '/valeria-templare-5.jpg',
    caption: 'Custode della Tradizione',
    category: 'templare',
  },
  {
    src: '/valeria-specchio.jpg',
    caption: 'Introspezione e Simboli',
    category: 'altro',
  },
  {
    src: '/valeria-social.jpg',
    caption: 'Impegno Sociale e Civile',
    category: 'onorificenze',
  },
  {
    src: '/valeria-hero.jpg',
    caption: 'Consulenza Professionale',
    category: 'altro',
  },
  {
    src: '/valeria-seminario.jpg',
    caption: 'Leadership e Formazione',
    category: 'altro',
  },
]

const categories = [
  { id: 'tutti', label: 'Tutti' },
  { id: 'templare', label: 'Ordine Templare' },
  { id: 'onorificenze', label: 'Onorificenze' },
  { id: 'parafarmacia', label: 'Energia & Benessere' },
]

function PlaceholderCard({ caption }: { caption: string }) {
  return (
    <div
      className="w-full aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-2"
      style={{
        background: 'linear-gradient(135deg, rgba(212,160,23,0.08), rgba(13,27,42,0.9))',
        border: '1px dashed rgba(212,160,23,0.25)',
      }}
    >
      <svg className="w-8 h-8 text-gold-600/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="L4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-white/20 text-xs text-center px-4">{caption}</span>
    </div>
  )
}

export default function Gallery() {
  const [filter, setFilter] = useState<string>('tutti')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  const filtered = filter === 'tutti'
    ? galleryItems
    : galleryItems.filter((item) => item.category === filter)

  return (
    <section id="galleria" className="py-24 px-6 relative">
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Il percorso</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Un cammino di <span className="gold-text">luce</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Testimonianze di una vita trascorsa tra arte, impegno sociale e ricerca spirituale.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === cat.id
                  ? 'text-dark-500'
                  : 'text-white/50 border border-white/10 hover:border-gold-600/30 hover:text-gold-400'
              }`}
              style={filter === cat.id ? {
                background: 'linear-gradient(135deg, #d4a017, #fcd34d)',
              } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group relative cursor-pointer overflow-hidden rounded-lg bg-black/40"
              onClick={() => item.src && setLightbox(item)}
            >
              {item.src ? (
                <>
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[11px] font-medium">{item.caption}</p>
                  </div>
                  <div className="absolute inset-0 border border-gold-600/0 group-hover:border-gold-600/30 rounded-lg transition-all duration-300" />
                </>
              ) : (
                <PlaceholderCard caption={item.caption} />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest"
              onClick={() => setLightbox(null)}
            >
              Chiudi ✕
            </button>
            
            <div className="rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10">
              <img src={lightbox.src} alt={lightbox.caption} className="w-full max-h-[80vh] object-contain" />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{lightbox.category}</p>
              <h3 className="text-white text-lg font-serif">{lightbox.caption}</h3>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
