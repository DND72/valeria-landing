import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function BookingSection() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <section id="prenota" className="py-24 px-6 relative overflow-hidden">
      <div className="section-divider" />

      {/* Gold glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Inizia ora</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Prenota la tua <span className="gold-text">lettura</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Scegli il giorno, l'ora e la modalità. Valeria ti aspetta.
          </p>
        </motion.div>

        {/* Calendly inline widget */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mystical-card p-0 overflow-hidden rounded-lg"
        >
          <div
            className="calendly-inline-widget w-full"
            data-url="https://calendly.com/valeriadipace?hide_gdpr_banner=1&background_color=060608&text_color=f5f0e8&primary_color=d4a017"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </motion.div>


        {/* Payment security note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/30 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagamento sicuro via PayPal
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Consulto garantito
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Telefono o videochiamata
          </span>
        </motion.div>
      </div>
    </section>
  )
}
