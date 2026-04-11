import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function StanzaSicuraPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black mb-4">La Stanza Sicura</h1>
            <p className="text-xl text-red-400 font-bold tracking-widest uppercase text-[12px] mb-6">Protocollo Protetto: L'Ultimo Incontro</p>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Un ambiente digitale neutrale, mediato e registrato, pensato per gestire le dinamiche di fine relazione o le separazioni ad alta tensione in totale sicurezza.
            </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
                <h3 className="text-xl font-serif font-bold mb-4 text-emerald-400">Protezione e Distanza</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                    La fine di un amore tossico o un confronto definitivo nascondono spesso rischi di escalation. Incontrare il partner fisicamente per un "ultimo chiarimento" può rivelarsi un errore fatale.
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                    La Stanza Sicura offre la <strong className="text-white">distanza vitale</strong> necessaria per chiudere una storia, permettendo il dialogo in un ambiente che disinnesca il rischio di violenza fisica immediata.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
                <h3 className="text-xl font-serif font-bold mb-4 text-gold-500">Valeria: Garante Incorruttibile</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                    Non sarai sola. Valeria interverrà nella videochiamata non come astrologa, ma come <strong>Coach e Moderatrice professionista</strong>. 
                </p>
                <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">▪</span>
                        <span className="text-sm text-white/80"><strong>Silenziamento (Mute):</strong> Al primo segno di abuso verbale, il microfono del partner verrà spento.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">▪</span>
                        <span className="text-sm text-white/80"><strong>Interruzione Istantanea:</strong> Valeria può chiudere forzatamente il collegamento del partner in 1 secondo (Kick) in caso di aggressioni incontrollabili.</span>
                    </li>
                </ul>
            </motion.div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl mb-16 text-center"
        >
            <h3 className="text-lg font-bold text-red-500 mb-2 uppercase tracking-widest text-[11px]">Avvertenza Legale, Consenso e Privacy</h3>
            <h4 className="text-2xl font-serif text-white mb-4">Gestione Trasparente delle Registrazioni</h4>
            <p className="text-white/60 text-sm max-w-3xl mx-auto leading-relaxed mb-6">
                Per la tutela di chi prenota e di chi viene invitato, ogni secondo passato nella Stanza Sicura viene **registrato in automatico in alta qualità**. Le registrazioni sono criptate e disponibili come prova inibitoria in caso di necessità o comportamenti illeciti. <br/><br/>
                <strong>Regole di Trattamento:</strong><br/>
                1. <strong>Accesso Paritario:</strong> Le registrazioni saranno fruibili e rilasciate su richiesta esplicita ad <strong>entrambi</strong> gli interessati coinvolti nella seduta.<br/>
                2. <strong>Cancellazione Automatica:</strong> A tutela della privacy (GDPR), il file video verrà <strong>distrutto irreversibilmente dopo 24 ore</strong> dal termine della sessione, se non ne viene fatta richiesta da una delle parti o dalle autorità.<br/>
                3. <strong>Consenso:</strong> L'accesso alla stanza video costituisce implicita ed irrevocabile accettazione di tali termini di registrazione.
            </p>
        </motion.div>

        <div className="text-center">
            <h3 className="text-2xl font-serif font-bold mb-6">Prenota il Protocollo Protetto</h3>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                Acquistando il consulto, riceverai un link sicuro da inviare al partner. Valeria ti accoglierà all'orario prestabilito.
            </p>
            <button 
                onClick={() => navigate('/area-personale?consult=protocollo_protetto')}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
                Accedi alla Prenotazione
            </button>
        </div>

      </div>
    </div>
  )
}
