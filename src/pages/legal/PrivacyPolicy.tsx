import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LAST_UPDATED = '2 aprile 2026'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 35% at 50% 10%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <Link to="/" className="text-gold-500/80 text-sm hover:text-gold-400 transition-colors mb-6 inline-block">
            ← Torna alla home
          </Link>
          <p className="text-gold-500 text-xs font-medium tracking-widest uppercase mb-2">Sicurezza Dati</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 uppercase">Informativa Privacy</h1>
          <p className="text-white/35 text-xs italic text-center mx-auto max-w-md">
            Ai sensi del Regolamento (UE) 2016/679 (GDPR)
          </p>
          <p className="text-white/35 text-[10px] mt-2">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mystical-card space-y-10 prose-custom"
        >
          <Section title="1. Titolare del Trattamento">
            <p>
              Il Titolare del trattamento è <strong>Valeria Di Pace</strong>, con sede legale in Italia, P.IVA IT08578101217. 
              Per qualsiasi richiesta relativa alla protezione dei dati, è possibile scrivere all'indirizzo email: 
              <span className="text-gold-400 ml-1">info@nonsolotarocchi.it</span>.
            </p>
          </Section>

          <Section title="2. Tipologia di Dati Raccolti">
            <p>La Piattaforma raccoglie le seguenti categorie di dati:</p>
            <ul>
              <li><strong>Dati Identificativi e di Contatto:</strong> Nome, cognome, luogo e data di nascita (per verifica maggiore età), codice fiscale (per fatturazione), indirizzo di residenza, numero di telefono e indirizzo email.</li>
              <li><strong>Dati di Navigazione:</strong> Indirizzi IP, log di sistema, orari delle richieste e metadati relativi all'utilizzo del sito raccolti tramite cookie.</li>
              <li><strong>Dati delle Sessioni:</strong> Metadati relativi alla durata e all'orario delle consulenze effettuate tramite Calendly/Stripe.</li>
            </ul>
          </Section>

          <Section title="3. Finalità e Base Giuridica del Trattamento">
            <p>Il trattamento dei dati è effettuato per le seguenti finalità:</p>
            <ul>
              <li><strong>Esecuzione del Contratto:</strong> Per l'erogazione dei servizi di consulenza richiesti e la gestione delle prenotazioni (Base giuridica: Adempimento contrattuale).</li>
              <li><strong>Obblighi di Legge:</strong> Per l'emissione di fatture/ricevute fiscali e per la verifica della maggiore età degli utenti (Base giuridica: Obbligo legale).</li>
              <li><strong>Sicurezza e Difesa:</strong> Per monitorare il corretto funzionamento della piattaforma e difendere un diritto del Titolare in sede giudiziaria (Base giuridica: Legittimo interesse).</li>
              <li><strong>Marketing (Previo Consenso):</strong> Per l'invio di comunicazioni promozionali relative ai servizi di Valeria Di Pace (Base giuridica: Consenso dell'interessato).</li>
            </ul>
          </Section>

          <Section title="4. Conservazione dei Dati">
            <p>I dati saranno conservati per il tempo strettamente necessario alle finalità elencate:</p>
            <ul>
              <li><strong>Dati Fiscali:</strong> 10 anni come previsto dalla normativa italiana.</li>
              <li><strong>Dati contrattuali/Log:</strong> Per tutta la durata del rapporto e fino a 10 anni dalla cessazione per finalità di tutela legale.</li>
              <li><strong>Dati per Marketing:</strong> Fino alla revoca del consenso o per un massimo di 24 mesi dall'ultimo contatto.</li>
            </ul>
          </Section>

          <Section title="5. Condivisione dei Dati (Fornitori Terzi)">
            <p>I dati personali potranno essere comunicati a soggetti esterni che operano in qualità di Responsabili del Trattamento (Data Processors), quali:</p>
            <ul>
              <li>
                <strong>Clerk:</strong> Per la gestione dell&apos;autenticazione e del profilo utente. 
                <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-500/80 hover:underline ml-1">[Privacy Policy]</a>
              </li>
              <li>
                <strong>Stripe:</strong> Per la gestione sicura dei pagamenti e prevenzione frodi. 
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-500/80 hover:underline ml-1">[Privacy Policy]</a>
              </li>
              <li>
                <strong>Calendly:</strong> Per la gestione delle prenotazioni e dell&apos;agenda. 
                <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-500/80 hover:underline ml-1">[Privacy Policy]</a>
              </li>
              <li>
                <strong>Consulenti Fiscali/Informatici:</strong> Per la gestione della contabilità e dell&apos;infrastruttura web (es. Railway, Vercel).
              </li>
            </ul>
            <p className="mt-4 text-xs italic">
              Nota: Alcuni di questi fornitori potrebbero trattare i dati in server situati al di fuori dello Spazio Economico Europeo (extra-UE), garantendo comunque standard di protezione adeguati (es. Data Privacy Framework).
            </p>
          </Section>

          <Section title="6. Sicurezza dei Dati">
            <p>
              Il Titolare adotta misure di sicurezza tecniche e organizzative adeguate (crittografia SSL, autenticazione sicura tramite 
              <strong> Clerk</strong>) per prevenire la perdita, l'uso illecito o l'accesso non autorizzato ai dati.
            </p>
          </Section>

          <Section title="7. Diritti dell'Interessato">
            <p>L'Utente ha il diritto di chiedere in ogni momento:</p>
            <ul>
              <li>L'accesso ai propri dati e la loro portabilità.</li>
              <li>La rettifica o la cancellazione (oblio).</li>
              <li>La limitazione o l'opposizione al trattamento.</li>
              <li>La revoca del consenso marketing senza pregiudicare il rapporto contrattuale.</li>
            </ul>
            <p className="mt-4 italic">
              Le richieste vanno inviate a: <span className="text-gold-400">info@nonsolotarocchi.it</span>. 
              L'interessato ha inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.
            </p>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 flex flex-wrap gap-4 justify-center"
        >
          <Link to="/termini" className="btn-outline text-sm px-6 py-2.5">
            Termini di servizio
          </Link>
          <Link to="/" className="text-white/35 text-sm hover:text-white/60 transition-colors px-6 py-2.5">
            Torna alla home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-serif text-xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-3">
        <span className="w-1 h-6 bg-gold-600 rounded-full" />
        {title}
      </h2>
      <div className="text-white/60 text-sm leading-relaxed space-y-4 [&_strong]:text-white/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul_li::marker]:text-gold-500">
        {children}
      </div>
    </section>
  )
}
