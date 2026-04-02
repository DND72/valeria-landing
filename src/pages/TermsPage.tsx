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
            <p>
              Il Gestore si riserva il diritto di monitorare e rimuovere contenuti offensivi o contrari ai presenti Termini per garantire la sicurezza di tutti i Partecipanti.
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

          <Section title="Art. 5 — Pagamenti e Rimborsi">
            <p>
              Il pagamento avviene tramite <strong>Stripe (PCI-DSS)</strong>. Il pagamento è richiesto in anticipo per confermare la prenotazione.
            </p>
            <ul>
              <li><strong>Cancellazione &gt;24h</strong>: rimborso integrale.</li>
              <li><strong>Cancellazione &lt;24h</strong>: nessun rimborso (salvo forza maggiore).</li>
              <li><strong>No-show</strong>: la sessione è considerata erogata.</li>
            </ul>
            <p className="italic">
              Non è previsto alcun rimborso legato al contenuto della consulenza o all'avverarsi/mancato avverarsi di eventi previsti.
            </p>
          </Section>

          <Section title="Art. 6 — Natura dei servizi e DIVIETO SALUTE/GRAVIDANZE">
            <p>
              I consulti sono offerte a scopo di intrattenimento e crescita interiore. Ogni consulto avviene sotto la piena responsabilità dell'utente.
            </p>
            <div className="bg-red-500/10 border-l-4 border-red-500 p-5 my-6 backdrop-blur-sm">
              <p className="text-white font-bold mb-2 uppercase tracking-tight">DIVIETO ASSOLUTO DI CONSULTA:</p>
              <p className="text-white/85 leading-relaxed">
                È tassativamente vietato richiedere consulti riguardanti temi di <strong>salute, gravidanze, fertilità, interventi medici o psicologici clinici</strong>. Valeria Di Pace non effettua diagnosi né previsioni su decorsi medici di alcun tipo. Qualsiasi richiesta in tal senso comporterà l'<strong>interruzione immediata</strong> della sessione senza diritto di rimborso. Per tali questioni, l'utente è tenuto a rivolgersi esclusivamente a personale medico qualificato.
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
              È vietato pubblicare contenuti razzisti, violenti, pornografici o diffamatori. In caso di violazione, il Gestore si riserva di sospendere temporaneamente l'account o procedere alla cancellazione definitiva senza preavviso.
            </p>
            <p>
              Gli utenti si impegnano a non proporre o concordare transazioni al di fuori della Piattaforma per i servizi qui descritti.
            </p>
          </Section>

          <Section title="Art. 9 — Privacy e Proprietà Intellettuale">
            <p>
              Il marchio <strong>nonsolotarocchi.it</strong> e tutti i contenuti del sito (testi, grafiche, loghi) sono di proprietà esclusiva di Valeria Di Pace. Il trattamento dei dati avviene secondo il Regolamento (UE) 2016/679 (GDPR). L'autenticazione è affidata a <strong>Clerk</strong>.
            </p>
          </Section>

          <Section title="Art. 10 — Legge Applicabile e Foro Competente">
            <p>
              I presenti Termini sono regolati dalla <strong>legge italiana</strong>. Qualsiasi controversia sarà devoluta alla competenza del <strong>Foro di Napoli</strong>, fatti salvi i diritti dei consumatori secondo l'attuale normativa vigente.
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
