import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { articles } from '../data/articles'

export default function BlogPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Riflessioni</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Il <span className="gold-text">Blog</span> di Valeria
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Psicologia, esoterismo, scacchi e tarocchi. Un filo unico che attraversa mondi apparentemente distanti.
          </p>
        </motion.div>

        <div className="space-y-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => navigate(`/blog/${article.slug}`)}
              className="mystical-card cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold-600/10 text-gold-400 border border-gold-600/20">
                      {article.category}
                    </span>
                    <span className="text-white/30 text-xs">{article.readTime} di lettura</span>
                    <span className="text-white/20 text-xs">{article.date}</span>
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-gold-500 text-sm font-medium">
                  Leggi
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 p-8 rounded-lg border border-gold-600/10 bg-gold-600/5"
        >
          <p className="text-white/40 text-sm mb-2">Nuovi articoli in arrivo</p>
          <p className="text-white/25 text-xs">Temi: Luna nei segni · Arcani Maggiori · Tarocchi e Psicologia</p>
        </motion.div>
      </div>
    </div>
  )
}
