import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function StanzaSicuraPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Hero */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
        >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                <span className="text-4xl">🛡️</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 tracking-tight">La Stanza Sicura</h1>
            <p className="text-2xl text-red-400 font-bold tracking-[0.3em] uppercase mb-8">Protocollo Protetto: L'Ultimo Incontro</p>
            <p className="text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed font-light">
                Uno spazio digitale invalicabile, progettato per proteggere la tua integrità fisica ed emotiva durante i confronti più difficili.
            </p>
        </motion.div>

        {/* Section 1: Ambiente Neutro */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative group"
            >
                <div className="absolute -inset-4 bg-emerald-500/5 rounded-[40px] blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                <img 
                    src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/safety_room_minimal_1775903232838.png" 
                    alt="Ambiente Protetto" 
                    className="relative rounded-[32px] border border-white/10 shadow-2xl z-10"
                />
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
            >
                <h2 className="text-4xl font-serif font-bold text-emerald-400">Protezione e Distanza Vitale</h2>
                <p className="text-xl text-white/70 leading-relaxed">
                    L'ultimo "chiarimento" fisico con un partner tossico o aggressivo è spesso il momento di massimo pericolo. La cronaca ci insegna che la vicinanza può diventare una trappola.
                </p>
                <p className="text-xl text-white/70 leading-relaxed">
                    La Stanza Sicura garantisce la **distanza geografica assoluta**, pur mantenendo la possibilità di un dialogo franco. Puoi dire ciò che devi dire, sapendo che nessuna mano potrà raggiungerti.
                </p>
            </motion.div>
        </div>

        {/* Section 2: Valeria e Moderazione */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32 md:flex-row-reverse">
            <div className="order-2 lg:order-1 space-y-6 text-right">
                <h2 className="text-4xl font-serif font-bold text-gold-500">Valeria: Garante della Pace</h2>
                <p className="text-xl text-white/70 leading-relaxed">
                    In questa modalità, Valeria opera come **Coach e Moderatrice professionista**. Non è una spettatrice: è il supervisore attivo del tuo spazio protetto.
                </p>
                <div className="space-y-4 pt-4">
                    <div className="bg-white/5 border-r-4 border-gold-500 p-6 rounded-l-2xl">
                        <h4 className="text-lg font-black uppercase text-gold-500 mb-2">Silenziamento (Mute)</h4>
                        <p className="text-white/60">Al primo accenno di prevaricazione o violenza verbale, Valeria toglie la parola al partner.</p>
                    </div>
                    <div className="bg-white/5 border-r-4 border-red-500 p-6 rounded-l-2xl">
                        <h4 className="text-lg font-black uppercase text-red-500 mb-2">Espulsione (Kick)</h4>
                        <p className="text-white/60">Se il confronto diventa pericoloso, il collegamento del partner viene interrotto istantaneamente.</p>
                    </div>
                </div>
            </div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
            >
                <img 
                    src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/mediation_guidance_1775903268835.png" 
                    alt="Mediazione Professionale" 
                    className="rounded-[32px] border border-white/10 shadow-2xl"
                />
            </motion.div>
        </div>

        {/* Section 3: Registrazioni e GDPR */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-500/5 border border-red-500/20 rounded-[48px] overflow-hidden mb-32"
        >
            <div className="grid md:grid-cols-3">
                <div className="p-8 md:p-12 md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 mb-4">Sicurezza Legale e Privacy</h3>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Tracciabilità e Tutela</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <span className="text-2xl">📸</span>
                            <p className="text-xl text-white/70"><strong>Registrazione Totale:</strong> Ogni istante è salvato in cloud come prova inconfutabile per eventuali fini legali.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-2xl">⚖️</span>
                            <p className="text-xl text-white/70"><strong>Accesso Paritario:</strong> Il file video è a disposizione di entrambe le parti su richiesta formale.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-2xl">🗑️</span>
                            <p className="text-xl text-white/70"><strong>Eliminazione a 24h:</strong> Per massimizzare la privacy, se non richiesto, il video viene cancellato definitivamente dopo 24 ore.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-black/40 flex items-center justify-center p-8">
                    <img 
                        src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/secure_vault_digital_1775903295591.png" 
                        alt="Security Vault" 
                        className="max-w-full h-auto drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                    />
                </div>
            </div>
        </motion.div>

        {/* CTA Finale */}
        <div className="text-center bg-white/5 border border-white/10 rounded-[48px] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent opacity-30" />
            <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-serif font-bold mb-8">Esercita il tuo diritto alla sicurezza.</h3>
                <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Prenotando il Protocollo Protetto, riceverai un link sicuro da inviare come invito formale. Valeria ti accoglierà all'orario stabilito.
                </p>
                <button 
                    onClick={() => navigate('/area-personale?consult=protocollo_protetto')}
                    className="bg-red-600 hover:bg-red-500 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-lg transition-all shadow-[0_20px_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95"
                >
                    Prenota L'Ultimo Incontro
                </button>
            </div>
        </div>

      </div>
    </div>
  )
}
