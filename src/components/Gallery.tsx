import { motion } from 'framer-motion'
import { useState } from 'react'

interface GalleryItem {
  src: string
  caption: string
  category: 'templare' | 'onorificenze' | 'parafarmacia' | 'altro'
}

// Inserisci qui i percorsi delle foto reali.
// Metti i file nella cartella public/gallery/ e usa il nome file come src.
// Es: { src: '/gallery/templare-1.jpg', caption: 'Cerimonia Templare', category: 'templare' }
const galleryItems: GalleryItem[] = [
  {
    src: '',
    caption: 'Cerimonia Templare',
    category: 'templare',
  },
  {
    src: '',
    caption: 'Onorificenza Ambasciatrice di Pace',
    category: 'onorificenze',
  },
  {
    src: '',
    caption: 'Investitura Commander Regionale',
    category: 'templare',
  },
  {
    src: '',
    caption: 'Parafarmacia Energia & Benessere',
    category: 'parafarmacia',
  },
  {
    src: '',
    caption: 'Manuale Heel Guna - Eccellenza Olistica',
    category: 'parafarmacia', // Inserito qui perché legato al benessere
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  const hasRealPhotos = galleryItems.some((item) => item.src !== '')

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
            Cerimonie templari, onorificenze, momenti di un percorso che pochi hanno il privilegio di vivere.
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
              className="group relative cursor-pointer overflow-hidden rounded-lg"
              onClick={() => item.src && setLightbox(item)}
            >
              {item.src ? (
                <>
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                    <p className="text-white text-sm font-medium">{item.caption}</p>
                  </div>
                  <div className="absolute inset-0 border border-gold-600/0 group-hover:border-gold-600/40 rounded-lg transition-all duration-300" />
                </>
              ) : (
                <PlaceholderCard caption={item.caption} />
              )}
            </motion.div>
          ))}
        </div>

        {!hasRealPhotos && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/25 text-sm mt-8 italic"
          >
            Le foto saranno aggiunte a breve — inseriscile in <code className="text-gold-600/50">public/gallery/</code>
          </motion.p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.caption} className="w-full rounded-lg shadow-2xl" />
            <p className="text-center text-white/60 text-sm mt-4">{lightbox.caption}</p>
            <button
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </section>
  )
}
