import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <Helmet>
        <title>Chi è Valeria Di Pace - Tarologa e Naturopata Professionista</title>
        <meta name="description" content="Biografia ufficiale di Valeria Di Pace: tarologa professionista con oltre 3.000 consulti, laureata in Psicologia e Giurisprudenza, esperta di tarocchi di Marsiglia." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Valeria Di Pace",
              "jobTitle": "Tarologa, Naturopata",
              "description": "Tarologa italiana specializzata nei Tarocchi di Marsiglia con approccio evolutivo e psicologico.",
              "url": "https://nonsolotarocchi.it",
              "honorificSuffix": "Dott.ssa",
              "alumniOf": [
                {
                  "@type": "CollegeOrUniversity",
                  "name": "Laurea in Psicologia"
                },
                {
                  "@type": "CollegeOrUniversity",
                  "name": "Laurea in Giurisprudenza"
                }
              ],
              "knowsAbout": ["Tarocchi di Marsiglia", "Naturopatia", "Crescita Personale", "Astrologia"],
              "awards": ["Premio alla Carriera Rete 4 (Modamania)", "Premio Speciale 2024 Anzio Film Festival"]
            }
          `}
        </script>
      </Helmet>

      <div className="max-w-5xl mx-auto px-6">
        {/* Section 1 - Hero Bio */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-12 brilliant-gold-text">Chi è Valeria Di Pace</h1>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-xl text-white/70 leading-relaxed font-light">
              <p>
                <strong>Valeria Di Pace</strong> è una tarologa italiana di riferimento, specializzata nello studio e nell'interpretazione dei <strong>Tarocchi di Marsiglia</strong>. Con una carriera ultra-decennale, ha effettuato oltre <strong>3.359 consulti certificati</strong>, mantenendo una valutazione media di <strong>4,97 su 5</strong>.
              </p>
              <p>
                Il suo profilo multidisciplinare la distingue nel panorama esoterico europeo: laureata in <strong>Psicologia</strong> e <strong>Giurisprudenza</strong>, con studi avanzati in Farmacia e un diploma in <strong>Naturopatia</strong>, Valeria integra simbolismo arcaico, psicologia del profondo e approccio olistico in ogni sessione.
              </p>
            </div>
            <div className="relative">
              <img src="/valeria-portrait.png" alt="Valeria Di Pace" className="rounded-[40px] border border-gold-500/20 shadow-2xl shadow-gold-500/10" />
            </div>
          </div>
        </motion.section>

        {/* Section 2 - Key Numbers (EEAT) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
            <div className="text-4xl font-black text-gold-500 mb-2">3.359</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Consulti Svolti</div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
            <div className="text-4xl font-black text-gold-500 mb-2">4,97/5</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Rating Medio</div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
            <div className="text-4xl font-black text-gold-500 mb-2">15 Anni</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Gestione Sanitaria</div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
            <div className="text-4xl font-black text-gold-500 mb-2">2 Lauree</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Psicologia & Legge</div>
          </div>
        </section>

        {/* Section 3 - Methodology */}
        <section className="mb-32 space-y-12">
          <h2 className="text-4xl font-serif font-black">Il Metodo di Lettura</h2>
          <div className="grid md:grid-cols-2 gap-8 font-light text-lg text-white/60 leading-relaxed">
            <div className="space-y-4">
              <p>Il lavoro di Valeria Di Pace si fonda su un <strong>protocollo di analisi stratificata</strong>. Le letture non sono previsioni fatalistiche, ma strumenti di consapevolezza che analizzano la situazione attuale, identificano i blocchi energetici e delineano i possibili scenari evolutivi.</p>
              <p>L'integrazione con la naturopatia e la psicologia permette di tradurre i simboli degli Arcani in consigli pratici e azioni concrete per la vita quotidiana.</p>
            </div>
            <div className="bg-gold-500/5 p-8 rounded-3xl border border-gold-500/10 italic border-l-4 border-l-gold-500">
              "Il mio obiettivo non è dirti cosa accadrà, ma darti la chiarezza e la forza per decidere cosa far accadere. Il tarocco è uno specchio, non una sentenza."
            </div>
          </div>
        </section>

        {/* Section 4 - Ethics & Awards */}
        <section className="bg-white/5 border border-white/10 rounded-[48px] p-12 md:p-16 mb-32">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8 text-left">
              <h2 className="text-4xl font-serif font-black">Visione ed Etica</h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Valeria opera nel pieno rispetto del <strong>Segreto Professionale</strong> e della normativa GDPR. Ogni consulto avviene in un ambiente protetto (La Stanza Sicura), dove la privacy dell'utente è l'unico parametro non negoziabile. Valeria non effettua consulti su salute, questioni legali o finanziarie, rimandando sempre agli specialisti abilitati di settore.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest italic">Attività professionale L. 4/2013</span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest italic">Sigillo del Silenzio</span>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-gold-500 font-black uppercase tracking-widest text-sm">Premi e Riconoscimenti</h4>
              <ul className="space-y-4 text-white/40 text-sm italic">
                <li>• Premio alla Carriera Rete 4 (Modamania)</li>
                <li>• Premio Speciale 2024 Anzio Film Festival</li>
                <li>• Dama Templare Federiciana</li>
                <li>• Oltre 776 commenti verificati</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
            <button 
              onClick={() => navigate('/area-personale')}
              className="bg-gold-600 hover:bg-gold-500 text-black px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-xl"
            >
                Inizia il tuo percorso con Valeria
            </button>
        </div>

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
