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
          className="mb-10 text-center"
        >
          <Link to="/" className="text-gold-500/80 text-sm hover:text-gold-400 transition-colors mb-6 inline-block">
            ← Torna alla home
          </Link>
          <p className="text-gold-500 text-xs font-medium tracking-widest uppercase mb-2">Area Legale</p>
          <h1 className="font-serif text-4xl font-bold text-white mb-2">Termini e Condizioni d'Uso</h1>
          <p className="text-white/35 text-xs">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mystical-card space-y-10 prose-custom"
        >
          <div className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-5 mb-8 italic text-white/70 text-sm leading-relaxed">
            Il presente documento regola l'accesso e l'utilizzo della piattaforma <strong>nonsolotarocchi.it</strong>, che mette in contatto utenti e consulenti esperti in cartomanzia, tarocchi e discipline affini. Leggilo attentamente prima di registrarti o utilizzare i servizi.
          </div>

          <Section title="Art. 1 — Il Gestore e la Piattaforma">
            <p>
              <strong>nonsolotarocchi.it</strong> (di seguito "Piattaforma") è un servizio gestito da <strong>Valeria Di Pace</strong>, con sede in Italia, P.IVA <strong>IT08578101217</strong> (di seguito "Gestore").
            </p>
            <p>
              La Piattaforma mette in contatto utenti che desiderano usufruire di servizi di consulenza ("Utenti") con esperti ("Consulenti"). La Piattaforma agisce come intermediario tecnico. I servizi sono resi attraverso strumenti di comunicazione elettronica messi a disposizione dal Gestore.
            </p>
            <p className="text-gold-500/90 font-medium">
              Nota: I servizi offerti hanno finalità di intrattenimento e di supporto alla crescita personale; non sostituiscono consulenze professionali di tipo medico, legale o finanziario.
            </p>
          </Section>

          <Section title="Art. 2 — Iscrizione e Account">
            <p>
              L'utilizzo della Piattaforma è riservato alle persone fisiche che abbiano compiuto il <strong>18° anno di età</strong>.
            </p>
            <ul>
              <li>Fornire informazioni esatte, veritiere e complete durante la registrazione.</li>
              <li>Mantenere la riservatezza delle credenziali di accesso.</li>
              <li>L'utente è l'unico responsabile di qualsiasi utilizzo effettuato tramite il proprio account.</li>
            </ul>
            <p className="text-red-400/80 text-xs mt-2 italic">
              Attenzione: La fornitura di informazioni false può comportare la sospensione immediata dell'account.
            </p>
          </Section>

          <Section title="Art. 3 — Modalità di erogazione e Ruolo della Piattaforma">
            <p>
              Le sessioni si svolgono a distanza via telefono o videochiamata tramite <strong>Calendly</strong>. Il Gestore facilita l'incontro tecnico ma non garantisce l'esattezza o la veridicità delle previsioni fornite.
            </p>
            <p className="bg-gold-500/5 p-3 border-l-2 border-gold-500/30">
              <strong>Gestione Telefonica:</strong> Per i consulti telefonici, Valeria Di Pace risponde esclusivamente al numero fornito durante la prenotazione e <strong>unicamente negli orari concordati</strong>. Al di fuori delle finestre di prenotazione, il numero è dirottato a sistemi di segreteria automatica non presidiata.
            </p>
          </Section>

          <Section title="Art. 4 — Descrizione dei Servizi">
            <p>Le tipologie di consulenza disponibili includono:</p>
            <ul className="space-y-2">
              <li><strong>Consulti Tarocchi di Marsiglia</strong>: letture simboliche (30-60 min).</li>
              <li><strong>Coaching e Crescita Personale</strong>: sessioni orientate all'azione.</li>
              <li><strong>Percorsi Combo</strong>: pacchetti integrati di tarocchi e coaching.</li>
              <li><strong>Consulto omaggio Tarocchi (7 min)</strong>: riservato ai nuovi utenti registrati.</li>
              <li><strong>Consulto omaggio Coaching (10 min)</strong>: per la prova dei percorsi di crescita personale.</li>
            </ul>
          </Section>

          <Section title="Art. 5 — Pagamenti, Recesso e Fatturazione">
            <p>
              Il pagamento avviene tramite <strong>Stripe (PCI-DSS)</strong>. Il contratto di servizio si perfeziona nel momento in cui l'Esperto riceve e conferma la Richiesta di Contatto.
            </p>
            <p className="bg-gold-500/5 p-4 rounded border border-gold-500/20">
              <strong>Fatturazione:</strong> Ai fini dell'emissione della regolare fattura, l'Utente è <strong>obbligato a fornire dati fiscali esatti</strong> (Nome, Cognome/Ragione Sociale, Indirizzo di residenza/sede, Codice Fiscale e, se applicabile, Partita IVA). Il Gestore non è responsabile per errori di fatturazione derivanti da dati errati o incompleti forniti dall'Utente.
            </p>
            <ul>
              <li><strong>Cancellazione &gt;24h</strong>: rimborso integrale.</li>
              <li><strong>Cancellazione &lt;24h</strong>: nessun rimborso (salvo forza maggiore).</li>
              <li><strong>No-show</strong>: la sessione è considerata erogata.</li>
              <li><strong>Diritto di Recesso:</strong> Ai sensi dell'Art. 59 del Codice del Consumo lettera o), essendo il consulto un servizio digitale fornito immediatamente su richiesta, l'Utente <strong>rinuncia espressamente al diritto di recesso</strong> una volta che l'esecuzione del servizio è iniziata.</li>
              <li><strong>Cancellazione Profilo</strong>: il credito residuo o i consulti non goduti non sono rimborsabili in caso di cancellazione volontaria del profilo.</li>
            </ul>
          </Section>

          <Section title="Art. 6 — Natura dei servizi e DIVIETI (Salute/Occultismo)">
            <p>
              I consulti sono offerte a scopo di intrattenimento e crescita interiore. <strong>Obbligo di Mezzi, non di Risultato:</strong> Valeria Di Pace garantisce la massima diligenza e professionalità nello svolgimento del consulto, ma non può garantire la realizzazione delle previsioni né il verificarsi di eventi futuri.
            </p>
            <div className="bg-red-500/10 border-l-4 border-red-500 p-5 my-6 backdrop-blur-sm space-y-4">
              <div>
                <p className="text-white font-bold mb-1 uppercase tracking-tight text-xs">Divieto Salute e Medicina:</p>
                <p className="text-white/85 text-sm leading-relaxed">
                  È tassativamente vietato richiedere consulti su salute, gravidanze, fertilità o interventi medici. Valeria Di Pace non effettua diagnosi né previsioni su decorsi medici.
                </p>
              </div>
              <div className="pt-3 border-t border-red-500/20">
                <p className="text-white font-bold mb-1 uppercase tracking-tight text-xs">Divieto Pratiche Occulte:</p>
                <p className="text-white/85 text-sm leading-relaxed">
                  È vietato richiedere o eseguire rituali di <strong>magia nera, malocchi, stregoneria</strong> o qualsiasi pratica volta a danneggiare terzi o influenzare il libero arbitrio altrui.
                </p>
              </div>
              <p className="text-red-400 text-xs font-bold italic pt-2">
                La violazione comporta l'interruzione immediata della sessione senza diritto di rimborso.
              </p>
            </div>
          </Section>

          <Section title="Art. 7 — Limitazione di Responsabilità">
            <p>
              Il Gestore non potrà essere ritenuto responsabile per perdita di guadagno, mancato profitto o perdita di opportunità derivanti dai consulti.
            </p>
            <p className="bg-white/5 p-4 rounded border border-white/10 text-gold-400/90 font-medium italic">
              In ogni caso, la responsabilità civile del Gestore è limitata ai danni diretti e prevedibili, per un importo massimo di € 150,00 per utente per singolo evento.
            </p>
          </Section>

          <Section title="Art. 8 — Obblighi e Sanzioni">
            <p>
              È vietato pubblicare contenuti razzisti, violenti o diffamatori. È espressamente vietato molestare, minacciare o ledere la privacy di altri Partecipanti.
            </p>
            <p className="border border-white/10 p-3 bg-white/5 rounded-md">
              <strong>DIVIETO DI CONTATTO EXTRA-CONSULTO:</strong> È tassativamente vietato tentare di chiamare, inviare messaggi o contattare Valeria Di Pace su numeri privati o canali social al di fuori degli orari e delle modalità previste dalla prenotazione. Ogni tentativo di contatto abusivo comporterà la segnalazione e il ban immediato.
            </p>
            <p>
              In caso di violazione, il Gestore invierà un <strong>avvertimento formale</strong> con richiesta di sanare l'inadempienza entro 48 ore. In assenza di rettifica, si procederà alla sospensione o cancellazione definitiva dell'account.
            </p>
          </Section>

          <Section title="Art. 9 — Privacy e Proprietà Intellettuale">
            <p>
              Il marchio <strong>nonsolotarocchi.it</strong> e tutti i contenuti del sito (testi, grafiche, loghi) sono di proprietà esclusiva di Valeria Di Pace. Il trattamento dei dati avviene secondo il Regolamento (UE) 2016/679 (GDPR). L'autenticazione è affidata a <strong>Clerk</strong>.
            </p>
          </Section>

          <Section title="Art. 10 — Deontologia e Valore Probatorio">
            <p>
              La Piattaforma è governata da principi di correttezza e buona fede. Valeria Di Pace ha il dovere deontologico di sospendere il servizio in caso di evidente vulnerabilità psicologica dell'Utente.
            </p>
            <p className="bg-white/5 p-4 rounded border border-white/10 text-xs italic text-white/50">
              <strong>Valore Probatorio:</strong> In caso di controversia, i log di connessione, i tabulati telefonici e i metadati della sessione (durata, orario) registrati dai sistemi del Gestore sono considerati <strong>piena e definitiva prova legale</strong> dell'avvenuta prestazione del servizio.
            </p>
            <p>
              I presenti Termini sono regolati dalla <strong>legge italiana</strong>. Qualsiasi controversia sarà devoluta alla competenza del <strong>Foro di Napoli</strong>.
            </p>
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
