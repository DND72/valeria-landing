import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import PrivacySealNote from './PrivacySealNote'

export default function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const coachingFooter = pathname === '/crescita-personale'

  return (
    <footer
      className={`relative pt-16 pb-8 px-6 border-t ${coachingFooter ? 'border-white/15' : 'border-white/5'}`}
    >
      {coachingFooter && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[rgba(10,14,26,0.45)] via-[rgba(10,14,26,0.82)] to-[#0a0e1a]"
        />
      )}

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 z-[2] h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }}
      />

      <div className="relative z-[2] max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold gold-text mb-3">Valeria Di Pace</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
          Tarologa · Tarocchi di Marsiglia<br />
          Attrice TV · Psicologa · Dama Templare
            </p>
            <p className="text-white/30 text-xs italic">
              "Ogni carta è uno specchio.<br />Valeria ti aiuta a guardare."
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Navigazione</h4>
            <ul className="space-y-2">
              {[
              { label: 'Chi sono', href: '#chi-sono' },
              { label: 'I numeri', href: '#numeri' },
              { label: 'Come funziona', href: '#come-funziona' },
              { label: 'Crescita personale', href: '/crescita-personale' },
              { label: 'Blog', href: '/blog' },
              { label: 'Recensioni', href: '#recensioni' },
              { label: 'App tarocchi gratuita', href: 'https://stese.nonsolotarocchi.it' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-white/40 text-sm hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/faq" className="text-white/40 text-sm hover:text-gold-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/termini" className="text-white/40 text-sm hover:text-gold-400 transition-colors">
                  Termini di servizio
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Perché fidarsi</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
                Piattaforma certificata · 4,97/5 · 261 recensioni
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
                Piattaforma certificata · 776 commenti positivi
              </div>
            </div>
          </div>
        </div>

        <PrivacySealNote className="mb-10 max-w-3xl mx-auto" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5"
        >
          <p className="text-white/20 text-xs">
            © {year} Valeria Di Pace. Tutti i diritti riservati.
          </p>
          <p className="text-white/20 text-xs">
            nonsolotarocchi.it · P.IVA IT08578101217
          </p>
        </motion.div>

        {/* Legal — link testuali */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-white/20 text-xs">
          <a
            href="https://www.iubenda.com/privacy-policy/XXXXXXXX"
            className="hover:text-white/40 transition-colors underline-offset-2 hover:underline"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
          <span className="text-white/10">·</span>
          <a
            href="https://www.iubenda.com/privacy-policy/XXXXXXXX/cookie-policy"
            className="hover:text-white/40 transition-colors underline-offset-2 hover:underline"
            title="Cookie Policy"
          >
            Cookie Policy
          </a>
          <span className="text-white/10">·</span>
          <Link
            to="/termini"
            className="hover:text-white/40 transition-colors underline-offset-2 hover:underline"
          >
            Termini di servizio
          </Link>
          <span className="text-white/10">·</span>
          <Link
            to="/faq"
            className="hover:text-white/40 transition-colors underline-offset-2 hover:underline"
          >
            FAQ
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-white/15 text-xs mt-4 max-w-2xl mx-auto leading-relaxed">
          Le letture dei tarocchi sono offerte a scopo di intrattenimento, riflessione personale e crescita interiore.
          Non costituiscono consulenza medica, legale o finanziaria.
        </p>
      </div>
    </footer>
  )
}
