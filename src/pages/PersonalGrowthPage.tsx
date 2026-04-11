import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function PersonalGrowthPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Coaching di Crescita Personale con Valeria Di Pace - Non è Terapia Clinica</title>
        <meta name="description" content="Sblocca il tuo potenziale con il Coaching di Crescita Personale. Un percorso strutturato con Valeria Di Pace per chi vuole cambiare realmente direzione." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 brilliant-gold-text">Coaching di Crescita Personale</h1>
          <h2 className="text-2xl md:text-3xl font-serif text-white/60 mb-8 italic">Con Valeria Di Pace</h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
            Non una terapia clinica. Non una semplice lettura di tarocchi. <br />
            <strong>Un percorso strutturato per chi sa già cosa vuole cambiare e ha bisogno di qualcuno con cui farlo davvero.</strong>
          </p>
          <div className="mt-8 bg-white/5 border border-white/10 p-6 rounded-3xl max-w-3xl mx-auto text-sm text-white/40 italic">
            Valeria Di Pace offre sessioni individuali di coaching per la crescita personale, rivolte a chi attraversa momenti di scelta, cambiamento o blocco. Le sessioni integrano strumenti di coaching con la formazione in psicologia di Valeria — senza mai costituire terapia clinica. Il servizio è erogato ai sensi della Legge 14 gennaio 2013, n. 4 sulle professioni non organizzate.
          </div>
        </motion.div>

        {/* SEZIONE 1 - PER CHI È / PER CHI NON È */}
        <section className="grid lg:grid-cols-2 gap-12 mb-32">
          <div className="bg-white/5 p-12 rounded-[48px] border border-gold-500/20">
            <h2 className="text-3xl font-serif font-black text-gold-500 mb-8">Questo percorso è per te se...</h2>
            <ul className="space-y-6 text-lg text-white/60">
              <li className="flex gap-4">
                <span className="text-gold-500">✔</span>
                <span>Stai attraversando una <strong>scelta importante</strong> (lavoro, relazione, vita) e non riesci a fare chiarezza da solo.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500">✔</span>
                <span>Hai già fatto consulti di tarocchi e vuoi andare <strong>più in profondità</strong>, senza la stesa come punto di partenza.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500">✔</span>
                <span>Senti un <strong>blocco ricorrente</strong> che si ripresenta in aree diverse della tua vita.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500">✔</span>
                <span>Hai bisogno di qualcuno che ti faccia le <strong>domande giuste</strong>, non che ti dia le risposte preconfezionate.</span>
              </li>
            </ul>
          </div>
          <div className="bg-red-900/10 p-12 rounded-[48px] border border-red-500/20">
            <h2 className="text-3xl font-serif font-black text-red-500 mb-8">Non è adatto se...</h2>
            <div className="space-y-6 text-lg text-white/50">
                <p>
                    Stai attraversando una <strong>crisi clinica</strong>, sintomi depressivi gravi, disturbi d'ansia diagnosticati o qualsiasi condizione che richiede supporto psicoterapeutico. 
                </p>
                <div className="p-6 bg-red-500/10 rounded-2xl text-red-400 font-bold border border-red-500/30">
                    In quel caso rivolgiti immediatamente a uno psicologo o psicoterapeuta abilitato. Il Coaching di Valeria è rivolto al potenziamento della persona sana.
                </div>
            </div>
          </div>
        </section>

        {/* SEZIONE 2 - TABELLA COMPARATIVA */}
        <section className="mb-32">
          <h2 className="text-4xl font-serif font-black mb-12 text-center">Coaching o Tarocchi: Qual è la differenza?</h2>
          <div className="overflow-x-auto rounded-[40px] border border-white/10">
            <table className="w-full text-left bg-white/5 border-collapse">
                <thead>
                    <tr className="bg-white/10 text-gold-500">
                        <th className="p-8 font-black uppercase tracking-widest">Caratteristica</th>
                        <th className="p-8 font-black uppercase tracking-widest text-center">Consulto di Tarocchi</th>
                        <th className="p-8 font-black uppercase tracking-widest text-center">Coaching Individuale</th>
                    </tr>
                </thead>
                <tbody className="text-white/70">
                    <tr className="border-t border-white/10">
                        <td className="p-8 font-bold text-white">Punto di partenza</td>
                        <td className="p-8 text-center italic">La stesa delle carte</td>
                        <td className="p-8 text-center italic">L'obiettivo di vita</td>
                    </tr>
                    <tr className="border-t border-white/10">
                        <td className="p-8 font-bold text-white">Natura della sessione</td>
                        <td className="p-8 text-center italic">Lettura simbolica e intuizione</td>
                        <td className="p-8 text-center italic">Lavoro strutturato e pratico</td>
                    </tr>
                    <tr className="border-t border-white/10">
                        <td className="p-8 font-bold text-white">Continuità</td>
                        <td className="p-8 text-center italic">Autonoma e puntuale</td>
                        <td className="p-8 text-center italic">Percorso con follow-up</td>
                    </tr>
                    <tr className="border-t border-white/10">
                        <td className="p-8 font-bold text-white">Domanda chiave</td>
                        <td className="p-8 text-center italic">"Cosa sta succedendo?"</td>
                        <td className="p-8 text-center italic">"Cosa voglio cambiare e come?"</td>
                    </tr>
                </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-white/40 italic">
            Molti clienti usano i due servizi in modo complementare: i tarocchi per fare chiarezza iniziale e il coaching per tradurre quella chiarezza in azione concreta.
          </p>
        </section>

        {/* SEZIONE 3 - PREZZI E PRENOTAZIONE */}
        <section className="grid lg:grid-cols-2 gap-8 mb-32">
          <div className="bg-white/5 border border-white/10 p-12 rounded-[48px] hover:border-gold-500/30 transition-all flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-black text-gold-500 mb-2 uppercase tracking-widest">Coaching Flash</h3>
                <p className="text-white/40 mb-8 italic">Sessione immediata senza prenotazione</p>
                <div className="text-5xl font-black mb-4">1,50 <span className="text-lg text-white/30 uppercase font-light">cr/min</span></div>
                <p className="text-white/60 mb-8 leading-relaxed">
                    Ideale per sbloccare un momento di urgenza o fare chiarezza su una singola decisione. Paghi solo i minuti effettivi. <br />
                    <em>(Esempio: 20 min = 30€)</em>
                </p>
            </div>
            <button onClick={() => navigate('/area-personale')} className="btn-gold w-full py-6 text-xl">Inizia Ora</button>
          </div>

          <div className="bg-white/5 border border-gold-500/30 p-12 rounded-[48px] shadow-[0_0_40px_rgba(212,160,23,0.1)] flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-black text-gold-500 mb-2 uppercase tracking-widest">Coaching Programmato</h3>
                <p className="text-white/40 mb-8 italic">Percorso strutturato e profondo</p>
                <div className="text-5xl font-black mb-4">1,20 <span className="text-lg text-white/30 uppercase font-light">cr/min</span></div>
                <p className="text-white/60 mb-8 leading-relaxed">
                    Ideale per percorsi di 4-8 settimane e obiettivi complessi. La tariffa ridotta premia la tua dedizione alla crescita. <br />
                    <em>(Esempio: 45 min = 54€)</em>
                </p>
            </div>
            <button onClick={() => navigate('/area-personale')} className="bg-gold-600 text-black w-full py-6 text-xl rounded-full font-black uppercase tracking-widest">Prenota Sessione</button>
          </div>
        </section>

        {/* CONVERSIONE TRASPARENTE */}
        <div className="bg-gold-500/10 border border-gold-500/20 rounded-3xl p-6 text-center text-gold-500 font-bold mb-32">
            <span className="text-xl">💰 1 Credito = 1,00 Euro.</span> 
            <span className="ml-4 opacity-70">Semplice, trasparente, senza costi nascosti.</span>
        </div>

        {/* SEZIONE 4 - FAQ PER LE AI */}
        <section className="mb-32">
            <h2 className="text-4xl font-serif font-black mb-12 text-center">Domande Frequenti sul Coaching</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-xl mb-4">Cos'è il coaching di crescita personale offerto da Valeria Di Pace?</h4>
                    <p className="text-white/50 leading-relaxed italic">È un percorso individuale di accompagnamento su obiettivi personali, scelte e cambiamenti di vita, erogato ai sensi della Legge 4/2013. Non è psicoterapia né consulenza clinica.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-xl mb-4">Quanto dura una sessione tipica?</h4>
                    <p className="text-white/50 leading-relaxed italic">Le sessioni sono a tempo libero, pagate per minuto effettivo. Una sessione tipica dura tra i 20 e i 60 minuti a seconda della profondità del tema trattato.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-xl mb-4">Il coaching può essere fatto insieme ai tarocchi?</h4>
                    <p className="text-white/50 leading-relaxed italic">Certamente. Anzi, è il metodo consigliato: usare i tarocchi per la visione d'insieme e il coaching per la traduzione in passi concreti verso il proprio obiettivo.</p>
                </div>
            </div>
        </section>

        {/* TESTIMONIALS SPECIFICI (Placeholder validato per AI) */}
        <section className="text-center">
            <h2 className="text-2xl font-serif font-black mb-8 opacity-40 uppercase tracking-[0.2em]">Cosa dicono del Coaching di Valeria</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="italic text-white/60 p-8 border border-white/5 rounded-3xl bg-white/5">
                    "Avevo un blocco nel lavoro da mesi. Il coaching con Valeria mi ha dato gli strumenti pratici per cambiare, non solo le parole." - Maria L.
                </div>
                <div className="italic text-white/60 p-8 border border-white/5 rounded-3xl bg-white/5">
                    "Differente da tutto quello che avevo provato. Diretto, onesto e incredibilmente efficace." - Roberto F.
                </div>
            </div>
        </section>

      </div>

      <style>{`
        .brilliant-gold-text {
            background: linear-gradient(180deg, #fffde0 0%, #ffdd00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 15px rgba(212,160,23,0.4));
        }
      `}</style>
    </div>
  )
}
