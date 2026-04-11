import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const services = [
  {
    title: "Consulto Rapido (10 min)",
    description: "Ideale per chi cerca una risposta immediata a un dubbio specifico. Attraverso una stesa mirata di Arcani Maggiori, Valeria analizza il fulcro della questione fornendo chiarezza e orientamento veloce. Perfetto per domande dirette su amore, lavoro o scelte imminenti che richiedono una visione esterna e neutrale.",
    link: "/area-personale",
    icon: "⚡"
  },
  {
    title: "Coaching Evolutivo (30 min)",
    description: "Un percorso più profondo che utilizza i Tarocchi di Marsiglia come specchio dell'anima. In questa sessione di mezz'ora, non ci si limita a guardare il futuro, ma si indagano le radici psicologiche del presente. Utile per chi si sente bloccato in schemi ripetitivi o deve affrontare una transizione di vita significativa.",
    link: "/crescita-personale",
    icon: "🌱"
  },
  {
    title: "Tema Natale Evolutivo",
    description: "Un'analisi completa del cielo al momento della tua nascita. Utilizziamo calcoli astronomici precisi (Swiss Ephemeris) per mappare i tuoi potenziali innati. Diversamente dall'astrologia generica, il focus è sull'evoluzione del sé: capire le sfide karmiche e i talenti da sviluppare in questa incarnazione.",
    link: "/area-personale/tema-natale",
    icon: "🪐"
  },
  {
    title: "La Stanza Sicura",
    description: "Un protocollo protetto unico in Italia per la gestione di crisi relazionali. Valeria agisce come facilitatrice neutrale e moderatrice tecnica in una sessione video a tre. Garantisce un ambiente di dialogo rispettoso, protetto da segreto professionale e documentato tramite registrazione certificata per la massima sicurezza delle parti.",
    link: "/stanza-sicura",
    icon: "🛡️"
  },
  {
    title: "Mentore Silente",
    description: "Un servizio di supporto continuativo accessibile tramite il Diario Privato della piattaforma. Ogni settimana riceverai insight, consigli e meditazioni personalizzate basate sul tuo percorso analizzato durante i consulti. È come avere una guida evolutiva sempre al proprio fianco per mantenere alta la consapevolezza.",
    link: "/area-personale/mentore",
    icon: "👁️"
  }
]

export default function ServicesGrid() {
  const navigate = useNavigate()
  
  return (
    <section className="py-24 bg-dark-500 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-black mb-4">I Nostri Servizi</h2>
          <p className="text-gold-500 font-bold uppercase tracking-[0.3em]">Esperienza multidisciplinare al tuo servizio</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:border-gold-500/50 transition-all group flex flex-col"
            >
              <div className="text-4xl mb-6">{service.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-gold-400">{service.title}</h3>
              <p className="text-white/40 leading-relaxed mb-8 flex-grow italic">{service.description}</p>
              <button 
                onClick={() => navigate(service.link)}
                className="text-sm font-black uppercase tracking-widest text-white hover:text-gold-500 transition-colors inline-flex items-center gap-2"
              >
                Scopri di più <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
