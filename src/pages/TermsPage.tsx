import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LAST_UPDATED = '11 aprile 2026'

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <Link to="/" className="text-gold-500/80 text-sm hover:text-gold-400 transition-colors mb-6 inline-block">
            ← Torna alla home
          </Link>
          <p className="text-gold-500 text-xs font-medium tracking-widest uppercase mb-2">Area Legale</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 uppercase">Termini e Condizioni d'Uso</h1>
          <p className="text-white/35 text-xs">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mystical-card space-y-10 prose-custom"
        >
          <div className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-5 mb-8 italic text-white/70 text-sm leading-relaxed">
            Il presente documento regola l'accesso e l'utilizzo della piattaforma <strong>nonsolotarocchi.it</strong> (di seguito "Piattaforma"), amministrata da <strong>Valeria Di Pace</strong>, P.IVA IT08578101217 (di seguito "Gestore"). Il rapporto contrattuale si instaura tra il Gestore e l'utente finale (di seguito "Utente").
          </div>

          <Section title="Art. 1 — Natura del Servizio e Ruolo del Gestore">
            <p>La Piattaforma agisce come intermediario tecnico e fornitore di servizi di consulenza olistica, cartomanzia e coaching.</p>
            <ul>
              <li><strong>Finalità:</strong> I servizi hanno finalità di intrattenimento e supporto alla crescita personale; non sostituiscono in alcun modo consulenze mediche, legali o finanziarie.</li>
              <li><strong>Obbligo di Mezzi:</strong> Il Gestore garantisce la massima diligenza professionale, ma non garantisce l'esattezza delle previsioni né il verificarsi di eventi futuri (Obbligo di mezzi, non di risultato).</li>
            </ul>
          </Section>

          <Section title="Art. 2 — Iscrizione, Account e Tutela dei Minori">
            <p>L'utilizzo della Piattaforma è tassativamente riservato a persone fisiche che abbiano compiuto il <strong>18° anno di età</strong>.</p>
            <ul>
              <li><strong>Autocertificazione:</strong> Al momento della registrazione e dell'acquisto, l'Utente dichiara sotto la propria responsabilità penale e civile di essere maggiorenne.</li>
              <li><strong>Manleva:</strong> Il Gestore è esonerato da ogni responsabilità per dichiarazioni mendaci fornite dall'Utente per eludere i blocchi di accesso ai minori.</li>
            </ul>
          </Section>

          <Section title="Art. 3 — Prevenzione della Dipendenza e Consumo Responsabile">
            <p>Il Gestore promuove un uso sano dei servizi. L'Utente riconosce i rischi di dipendenza legati a consulti eccessivi.</p>
            <div className="bg-gold-500/5 p-4 rounded border border-gold-500/20 my-4 italic">
              <strong>Questionario di Autovalutazione:</strong> La risposta positiva a due o più delle seguenti domande presuppone uno stato di dipendenza:<br /><br />
              1. Consulti Valeria per più tempo del previsto?<br />
              2. Utilizzi denaro necessario per pagamenti di prima necessità?<br />
              3. Non prendi decisioni senza il supporto dei consulti?<br />
              4. L'uso dei servizi ha un impatto negativo sulla tua vita familiare o lavorativa?
            </div>
            <p><strong>Sospensione Etica:</strong> Il Gestore ha il dovere deontologico di sospendere il servizio in caso di evidente vulnerabilità psicologica o dipendenza patologica dell'Utente.</p>
          </Section>

          <Section title="Art. 4 — Modalità di Erogazione">
            <p>Le sessioni si svolgono in forma digitale (audio o video) tramite il sistema di prenotazione e la stanza di consulto privata interna alla Piattaforma.</p>
            <p className="bg-gold-500/5 p-3 border-l-2 border-gold-500/30">
              <strong>Gestione Sessioni:</strong> Il Gestore garantisce la disponibilità esclusivamente negli orari concordati e prenotati tramite il calendario del Diario. Al di fuori di tali finestre, i sistemi non sono presidiati.
            </p>
          </Section>

          <Section title="Art. 5 — Sistema Wallet, Tariffe e Trasparenza">
            <p>La Piattaforma utilizza un sistema di ricarica prepagata (Wallet) basato su crediti nominali interni, acquistabili tramite circuiti sicuri quali <strong>Stripe</strong> o <strong>PayPal</strong>.</p>
            <ul>
              <li><strong>Tariffazione Variabile:</strong> Il costo del servizio varia in base alla tipologia di consulto scelto, con una forbice compresa tra <strong>€ 1,20 e € 1,80 al minuto</strong>. La tariffa applicata è chiaramente indicata prima di ogni sessione.</li>
              <li><strong>Calcolo al Secondo:</strong> Il sistema calcola il costo basandosi sui <strong>secondi effettivi di conversazione</strong>. In caso di interruzione anticipata della sessione decisa dall'Utente, i crediti non consumati rimangono immediatamente disponibili nel Wallet.</li>
              <li><strong>Assenza di Numerazioni Speciali:</strong> Il Gestore non utilizza numeri a tariffazione specifica (es. 899, 800 o sovrapprezzi telefonici). L'intero servizio avviene via web, garantendo che non vi siano addebiti inattesi in bolletta telefonica.</li>
              <li><strong>Diritto di Recesso:</strong> Ai sensi del Codice del Consumo, l'Utente può richiedere il rimborso del saldo Wallet non ancora utilizzato entro 14 giorni dall'acquisto. Una volta iniziato un consulto, l'importo relativo viene consumato in tempo reale e non è rimborsabile.</li>
              <li><strong>Penale di No-Show:</strong> In caso di mancata presentazione all'appuntamento prenotato senza preavviso di almeno 24 ore, verrà trattenuta una penale di € 10,00 (pari a 10 Crediti) per il disturbo arrecato alla gestione dell'agenda professionale.</li>
            </ul>
          </Section>

          <Section title="Art. 6 — Divieti Tassativi (Salute / Occultismo / Stalking)">
            <p>È tassativamente vietato:</p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Richiedere consulti su salute, gravidanze, malattie o diagnosi mediche.</li>
              <li>Richiedere rituali di magia nera, malocchi o coercizione del libero arbitrio.</li>
            </ol>
            <div className="mt-4 p-3 border border-red-500/20 bg-red-500/5 rounded-md text-red-100 font-medium">
              <strong>Contatto Extra-Consulto:</strong> È vietato contattare il Gestore su numeri privati o social (WhatsApp/SMS) al di fuori della Piattaforma. Ogni tentativo abusivo comporterà il ban immediato.
            </div>
          </Section>

          <Section title="Art. 7 — Limitazione di Responsabilità">
            <p className="bg-white/5 p-4 rounded border border-white/10 text-gold-400 font-medium italic">
              La responsabilità civile del Gestore è limitata ai danni diretti e prevedibili, per un importo massimo di € 150,00 per singolo evento.
            </p>
            <p>Il Gestore non è responsabile per perdita di guadagno, mancato profitto o decisioni personali prese dall'Utente a seguito del consulto.</p>
          </Section>

          <Section title="Art. 8 — Convenzione di Prova e Valore Probatorio">
            <p>L'Utente riconosce che i <strong>Documenti Elettronici</strong> (log di connessione, registri della piattaforma interna, registrazioni di transazione Stripe, durata della sessione rilevata dal sistema) costituiscono piena e definitiva prova legale dell'avvenuta prestazione del servizio e del relativo pagamento in qualsiasi sede di controversia.</p>
          </Section>

          <Section title="Art. 9 — Proprietà Intellettuale">
            <p>Il marchio <strong>nonsolotarocchi.it</strong>, i loghi e i contenuti sono di proprietà esclusiva di Valeria Di Pace. È vietata qualsiasi riproduzione senza consenso scritto.</p>
          </Section>

          <Section title="Art. 10 — Legge Applicabile e Foro Competente">
            <p>I presenti Termini sono regolati dalla <strong>Legge Italiana</strong>. Qualsiasi controversia sarà devoluta alla competenza esclusiva del <strong>Foro di Napoli</strong>.</p>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 flex flex-wrap gap-4 justify-center"
        >
          <Link to="/faq" className="btn-outline text-sm px-6 py-2.5">
            Domande frequenti
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
