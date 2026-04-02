import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LAST_UPDATED = '2 aprile 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 35% at 50% 10%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link to="/" className="text-gold-500/80 text-sm hover:text-gold-400 transition-colors mb-6 inline-block">
            ← Torna alla home
          </Link>
          <p className="text-gold-500 text-xs font-medium tracking-widest uppercase mb-2">Legale</p>
          <h1 className="font-serif text-4xl font-bold text-white mb-2">Termini di servizio</h1>
          <p className="text-white/35 text-xs">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mystical-card space-y-8 prose-custom"
        >
          <Section title="1. Titolare del servizio">
            <p>
              Il presente sito è gestito da <strong>Valeria Di Pace</strong>, con sede in Italia. P.IVA IT08578101217.
              Per qualsiasi comunicazione: vedi i contatti nel footer del sito.
            </p>
          </Section>

          <Section title="2. Descrizione del servizio">
            <p>
              Il sito offre la possibilità di prenotare e acquistare sessioni di consulenza con Valeria Di Pace nelle
              seguenti tipologie:
            </p>
            <ul>
              <li>
                <strong>Consulti con i Tarocchi di Marsiglia</strong> — letture simboliche a scopo di riflessione
                personale e orientamento (breve 30 min, online 30 min in videochiamata, completo 60 min).
              </li>
              <li>
                <strong>Coaching e Crescita personale</strong> — sessioni di accompagnamento orientate all'azione e
                allo sviluppo personale (sessione introduttiva, sessione singola, pacchetto 5 sedute).
              </li>
              <li>
                <strong>Percorsi Combo</strong> — pacchetti che uniscono consulti di tarocchi e sessioni di coaching.
              </li>
              <li>
                <strong>Consulto omaggio Tarocchi (7 min)</strong> — disponibile una sola volta per ogni account
                registrato, riservato ai nuovi utenti.
              </li>
              <li>
                <strong>Consulto omaggio Coaching (10 min)</strong> — disponibile una sola volta per ogni account
                registrato, riservato ai nuovi utenti per provare il servizio di crescita personale.
              </li>
            </ul>
          </Section>

          <Section title="3. Modalità di erogazione">
            <p>
              Le sessioni si svolgono a distanza, tramite telefono o videochiamata, agli orari concordati al momento
              della prenotazione tramite la piattaforma Calendly. Il link di accesso alla sessione viene inviato
              automaticamente via email e reso disponibile nell'area personale del sito.
            </p>
            <p>
              Valeria si impegna a essere disponibile all'orario prenotato. In caso di imprevisti da parte della
              consulente, la sessione viene riprogrammata senza costi aggiuntivi, con priorità all'utente.
            </p>
          </Section>

          <Section title="4. Pagamenti">
            <p>
              Il pagamento dei consulti a titolo oneroso avviene tramite <strong>Stripe</strong> al momento della
              prenotazione su Calendly. Il sito non archivia dati di pagamento: la transazione è gestita
              interamente dalla piattaforma Stripe, certificata PCI-DSS Livello 1 e soggetta ai propri termini
              di servizio.
            </p>
            <p>
              Il pagamento è richiesto in anticipo per confermare l'appuntamento. In assenza di pagamento, la
              prenotazione non è considerata confermata.
            </p>
          </Section>

          <Section title="5. Politica di cancellazione e rimborsi">
            <p>
              L'utente può cancellare o riprogrammare l'appuntamento usando il link contenuto nell'email di conferma
              Calendly, entro i seguenti termini:
            </p>
            <ul>
              <li>
                <strong>Cancellazione con più di 24 ore di anticipo:</strong> rimborso integrale tramite Stripe
                (3–5 giorni lavorativi, secondo i tempi dell'istituto bancario).
              </li>
              <li>
                <strong>Cancellazione con meno di 24 ore di anticipo:</strong> nessun rimborso, salvo casi di
                forza maggiore documentati e valutati singolarmente.
              </li>
              <li>
                <strong>Mancata presentazione (no-show):</strong> la sessione è considerata erogata e non rimborsata.
              </li>
            </ul>
            <p>
              Per richieste di rimborso eccezionali o situazioni particolari, l'utente può contattare direttamente
              Valeria tramite i riferimenti nel footer.
            </p>
          </Section>

          <Section title="6. Natura dei servizi e DIVIETO SALUTE/GRAVIDANZE">
            <p>
              I consulti con i Tarocchi sono offerte a <strong>scopo di intrattenimento, riflessione personale e
              crescita interiore</strong>. Ogni consulto avviene sotto la piena responsabilità dell'utente.
              Valeria Di Pace non è responsabile delle decisioni prese dall'utente in seguito
              a una sessione.
            </p>
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-4">
              <p className="text-white font-bold mb-2">DIVIETO ASSOLUTO DI CONSULTA:</p>
              <p className="text-white/80">
                È tassativamente vietato richiedere consulti riguardanti temi di **salute, gravidanze, fertilità, 
                interventi medici o psicologici clinici**. Valeria Di Pace non effettua diagnosi né previsioni
                su decorsi medici di alcun tipo. Qualsiasi richiesta in tal senso comporterà l'interruzione 
                immediata della sessione senza diritto di rimborso. Per tali questioni, l'utente è tenuto a 
                rivolgersi esclusivamente a personale medico o specialisti qualificati.
              </p>
            </div>
            <p>
              Il servizio di Coaching e Crescita personale è un accompagnamento orientato alla crescita personale.{' '}
              <strong>Non costituisce psicoterapia</strong>, né consulenza psicologica riservata ai sensi della
              Legge 56/89. Se l'utente necessita di supporto clinico, è tenuto a rivolgersi a uno psicologo o
              psicoterapeuta iscritto all'Albo.
            </p>
          </Section>

          <Section title="7. Registrazione e account">
            <p>
              Per accedere ai servizi è necessario creare un account fornendo un indirizzo email valido e una
              password. L'utente è responsabile della riservatezza delle proprie credenziali. Si impegna a
              comunicare dati veritieri e a non condividere l'accesso con terzi.
            </p>
            <p>
              Valeria Di Pace si riserva il diritto di sospendere o cancellare account che violino i presenti
              termini, facciano uso abusivo del consulto omaggio o tengano comportamenti inappropriati durante
              le sessioni.
            </p>
          </Section>

          <Section title="7bis. Accesso riservato ai maggiorenni — Responsabilità dell'utente">
            <p>
              I servizi offerti da Valeria Di Pace sono <strong>riservati esclusivamente a persone che abbiano
              compiuto 18 anni di età</strong>. L'accesso al sito e la prenotazione di qualsiasi consulto o sessione
              costituiscono <strong>dichiarazione implicita e irrevocabile</strong> da parte dell'utente di essere
              maggiorenne al momento della fruizione del servizio.
            </p>
            <p>
              Ai sensi dell'art. 76 del D.P.R. 445/2000, <strong>l'utente si assume piena responsabilità
              della veridicità dei dati personali forniti</strong>, incluso il requisito della maggiore età.
              Dichiarazioni false, mendaci o reticenti espongono l'utente alle sanzioni penali previste dalla
              legge italiana.
            </p>
            <p>
              Valeria Di Pace adotta ogni ragionevole misura per informare gli utenti di tale restrizione e
              non è responsabile per l'accesso di minori che abbiano fornito dati falsi o fuorvianti.
              Il log digitale dell'accettazione dei presenti termini (timestamp, IP) costituisce prova della
              buona fede del titolare del servizio in caso di contestazione.
            </p>
          </Section>

          <Section title="8. Proprietà intellettuale">
            <p>
              Tutti i contenuti del sito (testi, immagini, grafica, design) sono di proprietà di Valeria Di Pace e
              protetti dal diritto d'autore. È vietata la riproduzione, distribuzione o utilizzo commerciale dei
              contenuti senza autorizzazione scritta.
            </p>
          </Section>

          <Section title="9. Privacy e trattamento dei dati">
            <p>
              Il trattamento dei dati personali avviene in conformità al Regolamento (UE) 2016/679 (GDPR). I dati
              forniti in fase di registrazione (nome, email) vengono utilizzati esclusivamente per la gestione del
              servizio e non vengono ceduti a terzi per scopi commerciali.
            </p>
            <p>
              L'autenticazione è affidata a{' '}
              <a
                href="https://clerk.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:underline"
              >
                Clerk
              </a>
              , che tratta i dati di accesso secondo la propria Privacy Policy. La politica cookie completa è
              disponibile nel footer del sito.
            </p>
            <p>
              L'utente ha diritto di accesso, rettifica, cancellazione, limitazione e portabilità dei propri dati.
              Può esercitare tali diritti contattando Valeria tramite i riferimenti nel footer.
            </p>
          </Section>

          <Section title="10. Modifiche ai termini">
            <p>
              Valeria Di Pace si riserva di aggiornare i presenti termini in qualsiasi momento. Le modifiche
              rilevanti saranno comunicate via email agli utenti registrati o con avviso sul sito. L'utilizzo
              continuato del servizio dopo la pubblicazione delle modifiche costituisce accettazione dei nuovi
              termini.
            </p>
          </Section>

          <Section title="11. Legge applicabile e foro competente">
            <p>
              I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia relativa all'uso
              del sito o dei servizi, è competente il Foro di Napoli, fatti salvi i diritti dei consumatori ai
              sensi della normativa europea vigente.
            </p>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10 flex flex-wrap gap-3 justify-center"
        >
          <Link to="/faq" className="btn-outline text-sm px-5 py-2">
            Domande frequenti
          </Link>
          <Link to="/" className="text-white/35 text-sm hover:text-white/60 transition-colors px-5 py-2">
            Torna alla home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-bold text-white mb-3 pb-2 border-b border-white/8">{title}</h2>
      <div className="text-white/60 text-sm leading-relaxed space-y-3 [&_strong]:text-white/85 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}
