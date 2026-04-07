import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

type FaqItem = { q: string; a: string | React.ReactNode }
type FaqSection = { title: string; emoji: string; items: FaqItem[] }

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Come funziona il sito',
    emoji: '🌐',
    items: [
      {
        q: 'Cosa posso fare su questo sito?',
        a: "Puoi registrarti gratuitamente, accedere al tuo Diario privato, scegliere il tipo di consulto con Valeria (tarocchi, coaching o percorsi combo), prenotare tramite il sito e ricevere i dettagli per l'accesso alla videochiamata o telefonata. I servizi sono riservati ai maggiorenni (18+). Hai anche a disposizione 7 minuti di consulto omaggio per il tuo primo incontro.",
      },
      {
        q: 'Devo registrarmi per prenotare?',
        a: "Si. La registrazione e necessaria per accedere al Diario privato, gestire i tuoi appuntamenti e usufruire del consulto omaggio. La registrazione e gratuita e richiede solo email e password.",
      },
      {
        q: 'Come funziona il consulto omaggio da 7 minuti?',
        a: "Al primo accesso trovi nel tuo Diario il consulto omaggio da 7 minuti. Puoi prenotarlo selezionando Tarocchi & letture, poi la card Consulto omaggio. L'orario si sceglie dal tuo Diario, scalando i tuoi crediti gratuiti senza alcun pagamento esterno.",
      },
      {
        q: "Il sito e sicuro? Come vengono protetti i miei dati?",
        a: (
          <>
            Si. L&apos;autenticazione e gestita da{' '}
            <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
              Clerk
            </a>{' '}
            (standard enterprise). I tuoi dati personali sono trattati in conformita al GDPR. Leggi la nostra{' '}
            <Link to="/termini" className="text-gold-400 hover:underline">
              pagina Termini di servizio
            </Link>{' '}
            per i dettagli.
          </>
        ),
      },
    ],
  },
  {
    title: 'Prenotazioni',
    emoji: '📅',
    items: [
      {
        q: 'Come prenoto una sessione?',
        a: "Nel tuo Diario (dopo il login) scegli il settore (Tarocchi, Coaching o Combo), poi il tipo di consulto preferito. Cliccando per prenotare accederai al tuo Wallet a Crediti (CR). Se sei sprovvisto di saldo, potrai ricaricarlo tramite Stripe. L'importo in crediti verrà quindi impegnato e potrai selezionare orario e giorno liberi dal calendario.",
      },
      {
        q: 'Posso cambiare o cancellare un appuntamento?',
        a: "Si. Direttamente dal tuo Diario potrai cliccare 'Sposta Data' (te ne è concesso spontaneamente solo uno) o 'Disdici' finchè mancano più di 24 ore al tuo consulto: l'appuntamento salterà e i tuoi crediti verranno istantaneamente ri-versati nel tuo Wallet disponibili per una nuova data. Sotto la rigidità delle 24 ore il consulto non è sbloccabile e dunque non è rimborsabile.",
      },
      {
        q: 'In che modalita si svolge la sessione?',
        a: "Le sessioni si svolgono per telefono o videochiamata (a seconda del tipo scelto o delle tue preferenze di contatto nel profilo). Il link per entrare nella videochiamata compare nel tuo Diario privato nella sezione I tuoi consulti.",
      },
      {
        q: 'Quante volte posso prenotare?',
        a: "Non ci sono limiti. Puoi prenotare piu consulti nel tempo. Il consulto omaggio e disponibile una sola volta per account.",
      },
    ],
  },
  {
    title: 'Pagamenti e rimborsi',
    emoji: '💳',
    items: [
      {
        q: 'Come funziona il pagamento?',
        a: "Il sito utilizza un sistema interno a Crediti virtuali (CR). Al momento della prenotazione, se il tuo conto è vuoto, ti verrà chiesto di ricaricarlo pagando con la moneta reale tramite un circuito sicuro (Stripe). Non è necessario possedere un conto Stripe, ma bastano le carte di debito e credito in comune. A quel punto i tuoi Crediti pagheranno i consulti.",
      },
      {
        q: 'I miei dati di pagamento sono al sicuro?',
        a: "Si. I portafogli di ricarica sono interamente elaborati da Stripe che decritta le tue carte. Valeria non archivia sul database né vede null'altro che il tuo saldo crediti.",
      },
      {
        q: 'Posso chiedere un rimborso?',
        a: "A meno di 24 ore non è ammessa alcuna disdetta. Cancellando e disdicendo autonomamente dal tuo Diario entro e scostandoti oltre le 24 ore dall'evento prenotato, verrai liquidato integralmente (ti torneranno i Crediti completi da ri-spendere). In caso tu non ti presenti al minuto fissato della chiamata, scatta legalmente la clausola No-Show: 5 dei tuoi Crediti per il consulto verranno annullati e rubati da Valeria per il danno d'agenda provocato, mentre il resto dei crediti ti tornerà disponibile in tasca.",
      },
      {
        q: "Ricevero una fattura o ricevuta?",
        a: "Stripe invia automaticamente la conferma di pagamento via email. Se hai bisogno di documentazione fiscale, puoi richiederla a Valeria indicando i tuoi dati di fatturazione.",
      },
    ],
  },
  {
    title: 'Tarocchi e Coaching',
    emoji: '🔮',
    items: [
      {
        q: "Qual e la differenza tra i consulti di Tarocchi e il Coaching?",
        a: "I consulti di Tarocchi usano le carte come strumento simbolico di riflessione per fare chiarezza su una situazione, capire le dinamiche in corso o esplorare possibili scenari. Il Coaching e orientato all'azione concreta: obiettivi, abitudini, blocchi e strategie per il cambiamento. I Percorsi Combo uniscono entrambi gli approcci.",
      },
      {
        q: 'I Tarocchi sono una forma di previsione del futuro?',
        a: "No. Le letture di Valeria con i Tarocchi di Marsiglia sono strumenti di orientamento, crescita personale e consapevolezza. Non costituiscono divinazione, ne sostituiscono il parere di medici, psicologi, avvocati o consulenti finanziari.",
      },
      {
        q: 'Il Coaching offerto e psicoterapia?',
        a: "No. Valeria ha una formazione in psicologia e offre percorsi di accompagnamento e crescita personale. Il servizio non e psicoterapia ne consulenza psicologica riservata agli iscritti all'Albo degli Psicologi. Se stai attraversando un momento di difficolta clinica, ti invitiamo a rivolgerti a un professionista abilitato.",
      },
      {
        q: 'Cosa sono i Percorsi Combo?',
        a: "I Percorsi Combo uniscono consulti di Tarocchi e sessioni di Coaching in un unico pacchetto. La Combo Light include 2 consulti brevi di Tarocchi (30 min) + 1 sessione di Coaching (30 min). La Combo Full include 2 consulti completi (60 min) + 1 sessione di Coaching (60 min). Sono ideali per chi vuole sia riflessione profonda che un piano d'azione concreto.",
      },
    ],
  },
  {
    title: 'Account e Privacy',
    emoji: '🔐',
    items: [
      {
        q: 'Come posso cambiare la mia password?',
        a: (
          <>
            Accedi al tuo{' '}
            <Link to="/profilo" className="text-gold-400 hover:underline">
              Profilo
            </Link>{' '}
            (link in alto nel Diario) e usa la sezione &quot;Sicurezza&quot; per cambiare la password. Puoi anche usare il link &quot;Password dimenticata&quot; nella pagina di accesso.
          </>
        ),
      },
      {
        q: "Come posso cancellare il mio account?",
        a: "Dalla pagina Profilo trovi l'opzione per richiedere la cancellazione dell'account. Tutti i tuoi dati verranno eliminati in conformita al GDPR.",
      },
      {
        q: 'Le mie note e il mio Diario sono privati?',
        a: "Si. Il tuo Diario e visibile solo a te. Le note interne di Valeria sui consulti sono separate e non sono visibili ai clienti. I tuoi dati non vengono venduti ne ceduti a terzi.",
      },
      {
        q: 'Posso usare un indirizzo email diverso da quello con cui prenoto su Calendly?',
        a: "Ti consigliamo di usare la stessa email sia per l'account sul sito che per le prenotazioni su Calendly. In questo modo lo storico dei tuoi consulti appare automaticamente nel Diario privato.",
      },
    ],
  },
]

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-white/85 text-sm font-medium group-hover:text-white transition-colors leading-snug">
          {item.q}
        </span>
        <span
          className={`shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full border transition-all ${
            isOpen ? 'border-gold-500/60 bg-gold-600/15 text-gold-400' : 'border-white/15 text-white/35'
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-white/60 text-sm leading-relaxed">{item.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  function toggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key))
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 10%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-3">Domande frequenti</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">FAQ</h1>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Risposte alle domande piu comuni su come funziona il sito, le prenotazioni, i pagamenti e i
            servizi di Valeria.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/" className="btn-outline text-sm px-4 py-2">
              &larr; Home
            </Link>
            <Link to="/termini" className="text-white/40 text-sm hover:text-white/70 transition-colors underline underline-offset-4 px-4 py-2">
              Termini di servizio
            </Link>
          </div>
        </motion.div>

        <div className="space-y-8">
          {FAQ_SECTIONS.map((section, si) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + si * 0.06 }}
              className="mystical-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl" aria-hidden>
                  {section.emoji}
                </span>
                <h2 className="font-serif text-xl font-bold text-white">{section.title}</h2>
              </div>

              <div>
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  )
                })}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-14 mystical-card border border-gold-600/20"
        >
          <p className="text-gold-500 text-sm font-medium mb-2">Non hai trovato risposta?</p>
          <p className="text-white/55 text-sm mb-5">
            Puoi registrarti e accedere al tuo Diario dove trovi il consulto omaggio gratuito da 7 minuti.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/registrati" className="btn-gold text-sm px-6 py-2.5">
              Crea il tuo account
            </Link>
            <Link to="/accedi" className="btn-outline text-sm px-6 py-2.5">
              Accedi
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
