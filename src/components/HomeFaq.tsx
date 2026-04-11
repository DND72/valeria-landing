import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const HOME_FAQS = [
  {
    question: "Qual è la differenza tra un consulto di Tarocchi di Marsiglia e un oroscopo?",
    answer: "L'oroscopo analizza i transiti planetari generali, mentre i Tarocchi di Marsiglia offrono una fotografia simbolica precisa della tua situazione personale attuale. Il metodo di Valeria Di Pace unisce l'archetipo delle carte alla psicologia, permettendo di identificare blocchi e potenzialità in tempo reale."
  },
  {
    question: "Quanto costano i consulti e come funziona la tariffazione?",
    answer: "La trasparenza è il nostro valore cardine. I prezzi variano in base alla complessità del consulto, con una forbice che va da 1,20€ a 1,80€ al minuto. Non usiamo numeri a tariffazione speciale (899, 800, ecc.): il sistema calcola i secondi effettivi di conversazione e scala i crediti corrispondenti dal tuo wallet. Puoi interrompere la sessione in qualsiasi istante senza alcun costo aggiuntivo oltre i secondi consumati."
  },
  {
    question: "I miei dati e i consulti sono protetti?",
    answer: "Sì. Utilizziamo crittografia end-to-end e standard di sicurezza bancaria (HIPAA/SOC2 via Daily) per le videochiamate. Ogni dialogo è strettamente confidenziale e protetto dal segreto professionale. I dettagli della transazione sono gestiti in sicurezza dai circuiti Stripe e PayPal."
  }
]

export default function HomeFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-24 bg-[#0a0a0b]">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-serif font-bold mb-12 text-center brilliant-gold-text">Alcune Domande Frequenti</h2>
        
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": ${JSON.stringify(HOME_FAQS.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.answer
                }
              })))}
            }
          `}
        </script>

        <div className="space-y-4">
          {HOME_FAQS.map((faq, idx) => (
            <div key={idx} className="border border-white/10 rounded-3xl overflow-hidden bg-white/5">
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-all"
              >
                <span className="text-lg font-bold text-white/80">{faq.question}</span>
                <span className={`text-gold-500 transform transition-transform ${openIdx === idx ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIdx === idx && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="px-6 pb-6 text-white/50 leading-relaxed italic"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/faq" 
            className="text-gold-500 font-medium hover:text-gold-400 transition-colors inline-flex items-center gap-2 group"
          >
            Consulta le Domande Frequenti complete
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
      <style>{`
        .brilliant-gold-text {
            background: linear-gradient(180deg, #fffde0 0%, #ffdd00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  )
}
