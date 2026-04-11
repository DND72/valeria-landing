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
            className="text-center mb-32"
        >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                <span className="text-4xl">🛡️</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 tracking-tight">La Stanza Sicura</h1>
            <p className="text-2xl text-red-500 font-bold tracking-[0.4em] uppercase mb-8">Protocollo Protetto</p>
        </motion.div>

        {/* 1) Ambiente Protetto: TESTO SINISTRA - IMMAGINE DESTRA */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4">Ambiente Protetto</h2>
                <h3 className="text-2xl font-serif font-bold text-emerald-400 uppercase tracking-widest">Protezione e Distanza Vitale</h3>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light">
                    Nessun "ultimo chiarimento" fisico potrà mai trasformarsi in una trappola. La Stanza Sicura garantisce la <strong className="text-white">distanza geografica assoluta</strong>, cancellando il rischio di violenza fisica immediata pur mantenendo un dialogo sincero e senza barriere digitali.
                </p>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative group h-full"
            >
                <div className="absolute inset-x-0 bottom-[-20%] h-1/2 bg-emerald-500/10 blur-3xl opacity-30 mt-auto" />
                <img 
                    src="/assets/stanza-sicura/ambiente-protetto.png" 
                    alt="Ambiente Protetto" 
                    className="relative w-full h-auto rounded-[40px] border border-white/10 shadow-2xl z-10"
                />
            </motion.div>
        </section>

        {/* 2) Mediazione Professionale: IMMAGINE SINISTRA - TESTO DESTRA */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
            >
                <img 
                    src="/assets/stanza-sicura/mediazione.png" 
                    alt="Mediazione Professionale" 
                    className="w-full h-auto rounded-[40px] border border-white/10 shadow-2xl"
                />
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8 order-1 lg:order-2"
            >
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4">Mediazione Professionale</h2>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light">
                    Valeria Di Pace interverrà nella videocall non come astrologa, ma come <strong>Coach e Moderatrice professionista</strong>. Uno scudo invisibile che garantisce il rispetto delle parti tramite poteri di moderazione attiva che non ha nessuno nel settore.
                </p>
                <div className="space-y-4 pt-4">
                    <div className="bg-white/5 border-l-4 border-gold-500 p-6 rounded-r-2xl">
                        <h4 className="text-lg font-black uppercase text-gold-500 mb-2">Silenziamento</h4>
                        <p className="text-white/60 text-base">Al primo accenno di prevaricazione sessista o violenza verbale, il partner viene silenziato istantaneamente.</p>
                    </div>
                    <div className="bg-white/5 border-l-4 border-red-500 p-6 rounded-r-2xl">
                        <h4 className="text-lg font-black uppercase text-red-500 mb-2">Espulsione</h4>
                        <p className="text-white/60 text-base">In caso di aggressioni fuori controllo, il collegamento viene interrotto forzatamente in meno di un secondo.</p>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* 3) Security Vault: TESTO SINISTRA - IMMAGINE DESTRA */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4">Security Vault</h2>
                <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest">Tracciabilità e Tutela</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <span className="text-2xl">📸</span>
                        <p className="text-xl text-white/60"><strong>Registrazione Blindata:</strong> Ogni istante è salvato in cloud come prova inconfutabile.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-2xl">⚖️</span>
                        <p className="text-xl text-white/60"><strong>Accesso Paritario:</strong> File video a disposizione di entrambe le parti su richiesta.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-2xl">🗑️</span>
                        <p className="text-xl text-white/60"><strong>Cancellazione 24h:</strong> Distruzione automatica della registrazione per massimizzare la privacy.</p>
                    </div>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <img 
                    src="/assets/stanza-sicura/vault.png" 
                    alt="Security Vault" 
                    className="w-full h-auto rounded-[40px] border border-white/10 shadow-2xl drop-shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                />
            </motion.div>
        </section>

        {/* CTA Finale */}
        <div className="text-center bg-white/5 border border-white/10 rounded-[64px] p-16 md:p-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-20" />
            <div className="relative z-10">
                <h3 className="text-4xl md:text-6xl font-serif font-black mb-12">Torna alla sicurezza assoluta.</h3>
                <p className="text-2xl text-white/50 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
                    Prenotando il Protocollo Protetto, riceverai il link sicuro. La presenza di Valeria garantisce che questo incontro sia libero da ombre.
                </p>
                <button 
                    onClick={() => navigate('/area-personale?consult=protocollo_protetto')}
                    className="bg-red-600 hover:bg-red-500 text-white px-16 py-8 rounded-[32px] font-black uppercase tracking-[0.3em] text-2xl transition-all shadow-[0_30px_60px_rgba(220,38,38,0.5)]"
                >
                    Prenota L'Ultimo Incontro
                </button>
            </div>
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
