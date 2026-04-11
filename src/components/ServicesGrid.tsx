import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const services = [
  {
    title: "Consulto Evolutivo (Video)",
    description: "Un'analisi profonda dello specchio del presente attraverso i Tarocchi di Marsiglia. Avviene in sessioni live di videocall sulla piattaforma Nonsolotarocchi, con connessione protetta e certificata secondo gli standard HIPAA e SOC2 (infrastruttura Daily), garantendo la massima privacy e qualità video HD.",
    link: "/tarocchi",
    icon: "🔮"
  },
  {
    title: "Consulto via Chat",
    description: "Ideale per chi cerca risposte rapide o preferisce la scrittura. Il servizio avviene tramite messaggistica istantanea criptata direttamente sulla nostra piattaforma. Non usiamo app esterne: ogni dialogo resta protetto nel tuo Diario personale riservato.",
    link: "/area-personale",
    icon: "💬"
  },
  {
    title: "Coaching Personale",
    description: "Un percorso strutturato di crescita che trasforma la consapevolezza in azione. Attraverso sessioni mirate (Video o Chat), Valeria ti accompagna nel raggiungimento di obiettivi concreti, superando ostacoli ricorrenti e potenziando la tua visione strategica.",
    link: "/crescita-personale",
    icon: "🌱"
  },
  {
    title: "Tema Natale Evolutivo",
    description: "Un'analisi completa del cielo al momento della tua nascita con calcoli astronomici precisi (Swiss Ephemeris). Il focus è sull'evoluzione del sé: capire le sfide karmiche e i talenti da sviluppare in questa incarnazione attraverso la mappa astrale.",
    link: "/area-personale/tema-natale",
    icon: "🪐"
  },
  {
    title: "La Stanza Sicura",
    description: "Protocollo protetto unico in Italia per crisi relazionali. Valeria agisce come facilitatrice neutrale in sessione video a tre su connessione criptata certificata. Ambiente di dialogo protetto da segreto professionale e documentato per la massima sicurezza delle parti.",
    link: "/stanza-sicura",
    icon: "🛡️"
  },
  {
    title: "Mentore Silente",
    description: "Supporto continuativo tramite il Diario Privato della piattaforma. Ogni settimana riceverai insight, consigli e meditazioni personalizzate basate sul tuo percorso analizzato durante i consulti, per mantenere alta la consapevolezza nel quotidiano.",
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
