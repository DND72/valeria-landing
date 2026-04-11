import { motion } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  {
    question: "Qual è la differenza tra un consulto di Tarocchi di Marsiglia e un oroscopo?",
    answer: "L'oroscopo analizza i transiti planetari generali, mentre i Tarocchi di Marsiglia offrono una fotografia simbolica precisa della tua situazione personale attuale. Il metodo di Valeria Di Pace unisce l'archetipo delle carte alla psicologia, permettendo di identificare blocchi e potenzialità in tempo reale, offrendo una guida più dinamica e interattiva rispetto all'astrologia previsionale classica."
  },
  {
    question: "Quanto costano i consulti di Valeria Di Pace e come funziona il pagamento?",
    answer: "La trasparenza è uno dei nostri valori cardine. I consulti avvengono tramite un sistema di crediti (wallet) ricaricabile. Il costo è di 1,80 cr/min per il Protocollo Protetto e per i consulti standard. Non usiamo numeri 899 o a sovrapprezzo: paghi solo i minuti effettivi di conversazione che decidi di svolgere, con la possibilità di interrompere la sessione in qualsiasi istante senza costi aggiuntivi."
  },
  {
    question: "I tarocchi possono prevedere eventi negativi sulla salute o questioni legali?",
    answer: "Assolutamente no. Valeria osserva un rigido codice etico: i tarocchi sono percorsi di orientamento e crescita. Per legge (e per etica), Valeria non risponde a domande su salute, decessi o sentenze legali imminenti, invitando sempre gli utenti a consultare i rispettivi professionisti iscritti agli albi (medici, avvocati, consulenti finanziari)."
  },
  {
    question: "Posso registrare i consulti con Valeria?",
    answer: "Se utilizzi il Protocollo 'La Stanza Sicura', la registrazione è integrata e server-side (Daily.co) per garantire protezione e tracciabilità. In ogni caso, i tuoi dati e le note del consulto restano salvati nel tuo Diario Personale crittografato, permettendoti di rileggere i consigli del Mentore Silente in qualsiasi momento successivo alla sessione."
  }
]

export default function HomeFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-24 bg-[#0a0a0b]">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-serif font-black mb-12 text-center brilliant-gold-text underline decoration-gold-600/30 underline-offset-8">Domande Frequenti</h2>
        
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": ${JSON.stringify(faqs.map(f => ({
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
          {faqs.map((faq, idx) => (
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
