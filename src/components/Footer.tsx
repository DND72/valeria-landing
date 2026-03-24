import { motion } from 'framer-motion'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative pt-16 pb-8 px-6 border-t border-white/5">
      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }}
      />

      <div className="max-w-6xl mx-auto">
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
                { label: 'Recensioni', href: '#recensioni' },
                { label: 'Prenota', href: '#prenota' },
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
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Prenota ora</h4>
            <p className="text-white/40 text-sm mb-5">
              Pronta ad ascoltarti. Scegli il tuo momento e prenota la tua lettura.
            </p>
            <a href="#prenota" className="btn-gold text-sm px-6 py-3">
              Prenota la lettura
            </a>

            <div className="mt-6 space-y-2">
              <a
                href="https://www.kang.it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/30 text-xs hover:text-gold-400 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
                Kang — "Stella" · 4,97/5
              </a>
              <a
                href="https://www.wengo.it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/30 text-xs hover:text-gold-400 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
                Wengo — "Valeria" · 776 commenti
              </a>
            </div>
          </div>
        </div>

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
            nonsolotarocchi.it · P.IVA disponibile su richiesta
          </p>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-white/15 text-xs mt-6 max-w-2xl mx-auto leading-relaxed">
          Le letture dei tarocchi sono offerte a scopo di intrattenimento, riflessione personale e crescita interiore.
          Non costituiscono consulenza medica, legale o finanziaria.
        </p>
      </div>
    </footer>
  )
}
