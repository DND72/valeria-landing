import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen px-6 py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 10%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-3">Trasparenza</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Cookie Policy</h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xl mx-auto">
            In questa sezione puoi scoprire come utilizziamo le informazioni di navigazione raccolte 
            durante la tua visita e quali sono i tuoi diritti.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mystical-card p-8 md:p-10 space-y-10 text-white/70 leading-relaxed"
        >
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">1. Cosa sono i Cookie</h2>
            <p>
              Durante la navigazione sul sito Nonsolotarocchi.it, alcune informazioni riguardo il dispositivo 
              da te utilizzato (computer, tablet, smartphone, etc.) possono essere registrate in piccoli file 
              chiamati &ldquo;cookie&rdquo;, installati sul tuo terminale. 
              Solo l&apos;emittente del cookie può leggere o modificare le informazioni in esso contenute.
            </p>
            <p>
              Questa informativa è importante per te, che desideri un&apos;esperienza positiva e fiduciosa, e per noi, 
              che abbiamo a cuore la protezione dei tuoi diritti e la chiarezza sulle tecnologie utilizzate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">2. I Cookie emessi da questo Sito</h2>
            <p>
              Quando ti connetti al sito, possiamo installare dei cookie che ci permettono di riconoscere il 
              browser del tuo dispositivo per tutta la durata di validità del cookie stesso.
            </p>
            <p>Tali Cookie ci permettono di:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Statistiche e Frequentazione:</strong> Stilare volumi di traffico e dati sull&apos;utilizzo degli elementi 
                del sito (sezioni visitate, percorsi di navigazione) per migliorarne l&apos;ergonomia e l&apos;utilità.
              </li>
              <li>
                <strong>Adattamento Display:</strong> Adattare la visualizzazione del sito alle preferenze del tuo dispositivo 
                (lingua, risoluzione, sistema operativo) secondo i programmi di visualizzazione che utilizzi.
              </li>
              <li>
                <strong>Memorizzazione Form:</strong> Memorizzare informazioni relative a moduli compilati 
                (registrazione, accesso all&apos;account, preferenze espresse) per semplificare la tua esperienza.
              </li>
              <li>
                <strong>Sicurezza:</strong> Applicare misure di sicurezza, come la richiesta di riconnessione a un 
                servizio o contenuto dopo un certo lasso di tempo di inattività.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">3. Cookie di Terze Parti</h2>
            <p>
              Il portale integra servizi esterni che utilizzano i propri cookie per il corretto funzionamento delle 
              relative funzionalità. In particolare:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clerk:</strong> Per la gestione sicura dell&apos;accesso al tuo Diario e dell&apos;autenticazione.</li>
              <li><strong>Stripe:</strong> Per la gestione dei pagamenti crittografati e la prevenzione delle frodi.</li>
              <li><strong>Calendly:</strong> Per permetterti di scegliere l&apos;orario e prenotare il tuo consulto.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">4. La tua scelta riguardo ai Cookie</h2>
            <p>
              Hai diverse possibilità per gestire i cookie. Qualsiasi impostazione tu scelga potrebbe modificare la tua 
              navigazione e le condizioni di accesso a determinati servizi che necessitano l&apos;uso di queste tecnologie. 
              Puoi esprimere o modificare le tue preferenze in qualsiasi momento.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h3 className="font-bold text-white mb-2 italic">Il consenso sui Cookie</h3>
              <p className="text-sm">
                La registrazione di un cookie è subordinata alla tua volontà. Se hai accettato nel browser la registrazione, 
                i contenuti consultati saranno salvati temporaneamente in uno spazio dedicato del tuo dispositivo, 
                leggibili solo dall&apos;emittente.
              </p>
            </div>
            <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-5">
              <h3 className="font-bold text-white mb-2 italic">Il rifiuto dei Cookie</h3>
              <p className="text-sm">
                Se rifiuti i cookie da noi emessi o cancelli quelli registrati, non avrai più accesso a una serie di 
                funzionalità necessarie alla navigazione (es. contenuti che richiedono identificazione). 
                Decliniamo ogni responsabilità per malfunzionamenti derivanti dall&apos;impossibilità di registrare 
                cookie necessari che siano stati rifiutati o cancellati.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">5. Come configurare il tuo Browser</h2>
            <p>
              La configurazione varia da navigatore a navigatore. Di seguito le istruzioni per i principali browser:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border border-white/5 p-4 rounded-lg">
                <span className="text-gold-400 font-bold block mb-1">Chrome™</span>
                Impostazioni &gt; Privacy e sicurezza &gt; Impostazioni contenuti &gt; Cookie.
              </div>
              <div className="border border-white/5 p-4 rounded-lg">
                <span className="text-gold-400 font-bold block mb-1">Firefox™</span>
                Opzioni &gt; Privacy e sicurezza &gt; Cookie e dati dei siti.
              </div>
              <div className="border border-white/5 p-4 rounded-lg">
                <span className="text-gold-400 font-bold block mb-1">Safari™</span>
                Preferenze &gt; Privacy &gt; Cookie e dati di siti web.
              </div>
              <div className="border border-white/5 p-4 rounded-lg">
                <span className="text-gold-400 font-bold block mb-1">Internet Explorer™</span>
                Strumenti &gt; Opzioni Internet &gt; Privacy &gt; Impostazioni.
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center">
            <Link to="/privacy" className="text-gold-400 hover:text-gold-300 transition-colors text-sm underline">
              Consulta l&apos;Informativa Privacy completa
            </Link>
            <Link to="/" className="btn-outline text-xs px-4 py-2">
              Tornal alla Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
