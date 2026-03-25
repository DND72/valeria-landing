import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articles } from '../data/articles'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-white/40 text-lg mb-4">Articolo non trovato.</p>
          <button onClick={() => navigate('/blog')} className="btn-gold">
            Torna al blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 15%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-white/40 hover:text-gold-400 transition-colors text-sm mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tutti gli articoli
        </motion.button>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold-600/10 text-gold-400 border border-gold-600/20">
              {article.category}
            </span>
            <span className="text-white/30 text-xs">{article.readTime} di lettura</span>
            <span className="text-white/20 text-xs">{article.date}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-white/50 text-lg leading-relaxed italic">
            {article.subtitle}
          </p>
          <div
            className="mt-8 h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }}
          />
        </motion.header>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-10"
        >
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="font-serif text-xl md:text-2xl font-bold text-gold-400 mb-4">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-white/70 leading-relaxed mb-4 text-[1.05rem]">
                  {p}
                </p>
              ))}
              {section.quote && (
                <blockquote
                  className="my-6 pl-5 border-l-2 border-gold-600/40"
                >
                  <p className="text-gold-300/70 italic font-serif text-lg leading-relaxed">
                    {section.quote}
                  </p>
                </blockquote>
              )}
            </section>
          ))}
        </motion.div>

        {/* Author box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-6 rounded-lg border border-gold-600/20 bg-gold-600/5"
        >
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-2">L\'autrice</p>
          <p className="text-white font-semibold mb-1">Valeria Di Pace</p>
          <p className="text-white/40 text-sm leading-relaxed">
            Tarologa, psicologa, attrice. Arena International Master (FIDE). Dama Templare.
            Oltre 3.000 consulti con metodo iniziatico dei Tarocchi di Marsiglia.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/#prenota" className="btn-gold text-sm px-5 py-2.5">
              Prenota un consulto
            </a>
            <button
              onClick={() => navigate('/blog')}
              className="btn-outline text-sm px-5 py-2.5"
            >
              Altri articoli
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
