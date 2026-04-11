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

        {/* Section 1: Ambiente Protetto */}
        <div className="mb-40 flex flex-col items-center">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-serif font-black mb-12 text-center brilliant-gold-text"
            >
                Ambiente Protetto
            </motion.h2>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full mb-12 relative group"
            >
                <div className="absolute -inset-6 bg-emerald-500/5 rounded-[48px] blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                <img 
                    src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/safety_room_minimal_1775903232838.png" 
                    alt="Ambiente Protetto" 
                    className="relative w-full h-auto rounded-[40px] border border-white/10 shadow-2xl z-10 hover:border-emerald-500/30 transition-all"
                />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl text-center space-y-6"
            >
                <h3 className="text-3xl font-serif font-bold text-emerald-400 uppercase tracking-widest">Protezione e Distanza Vitale</h3>
                <p className="text-2xl text-white/60 leading-relaxed font-light">
                    Nessun "ultimo chiarimento" fisico potrà mai trasformarsi in una trappola. La Stanza Sicura garantisce la <strong className="text-white">distanza geografica assoluta</strong>, cancellando il rischio di violenza fisica immediata pur mantenendo un dialogo sincero e senza barriere digitali.
                </p>
            </motion.div>
        </div>

        {/* Section 2: Mediazione Professionale */}
        <div className="mb-40 flex flex-col items-center">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-serif font-black mb-12 text-center brilliant-gold-text"
            >
                Mediazione Professionale
            </motion.h2>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full mb-12 relative group"
            >
                <div className="absolute -inset-6 bg-gold-500/5 rounded-[48px] blur-3xl group-hover:bg-gold-500/10 transition-all duration-700" />
                <img 
                    src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/mediation_guidance_1775903268835.png" 
                    alt="Mediazione Professionale" 
                    className="relative w-full h-auto rounded-[40px] border border-white/10 shadow-2xl z-10 hover:border-gold-500/30 transition-all"
                />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl text-center space-y-8"
            >
                <p className="text-2xl text-white/60 leading-relaxed font-light">
                    Valeria Di Pace interverrà nella videocall non come astrologa, ma come <strong>Coach e Moderatrice professionista</strong>. Uno scudo invisibile che garantisce il rispetto delle parti tramite poteri di moderazione attiva.
                </p>
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="bg-white/5 border-l-4 border-gold-500 p-8 rounded-r-2xl text-left">
                        <h4 className="text-xl font-black uppercase text-gold-500 mb-3 tracking-widest">Silenziamento</h4>
                        <p className="text-white/60 text-lg">Al primo accenno di prevaricazione sessista o violenza verbale, Valeria toglie istantaneamente la parola all'ospite.</p>
                    </div>
                    <div className="bg-white/5 border-l-4 border-red-500 p-8 rounded-r-2xl text-left">
                        <h4 className="text-xl font-black uppercase text-red-500 mb-3 tracking-widest">Espulsione</h4>
                        <p className="text-white/60 text-lg">In caso di aggressioni fuori controllo, il collegamento del partner viene interrotto forzatamente in meno di un secondo.</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Section 3: Security Vault Invertito */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-500/5 border border-red-500/20 rounded-[64px] overflow-hidden mb-40 shadow-[0_0_60px_rgba(220,38,38,0.1)]"
        >
            <div className="grid md:grid-cols-5 items-center">
                <div className="md:col-span-2 bg-black/40 flex items-center justify-center p-12 lg:p-20 order-2 md:order-1">
                    <img 
                        src="/brain/934bf848-0e88-49ac-a9e9-23d276bacdce/secure_vault_digital_1775903295591.png" 
                        alt="Security Vault" 
                        className="max-w-full h-auto drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]"
                    />
                </div>
                <div className="p-12 lg:p-20 md:col-span-3 space-y-12 order-1 md:order-2">
                    <div>
                        <h3 className="text-4xl md:text-6xl font-serif font-black mb-6 brilliant-gold-text">Security Vault</h3>
                        <h4 className="text-2xl font-serif font-bold text-white mb-8 tracking-widest uppercase">Tracciabilità e Tutela</h4>
                    </div>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <span className="text-3xl">📸</span>
                            <p className="text-2xl text-white/70 leading-relaxed italic">
                                <strong>Registrazione Blindata:</strong> Ogni frame salvato è una prova inconfutabile certificata.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <span className="text-3xl">⚖️</span>
                            <p className="text-2xl text-white/70 leading-relaxed italic">
                                <strong>Accesso Paritario:</strong> File rilasciato ad entrambe le parti su richiesta formale.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <span className="text-3xl">🗑️</span>
                            <p className="text-2xl text-white/70 leading-relaxed italic">
                                <strong>Cancellazione 24h:</strong> Privacy totale con distruzione irreversibile del video.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* CTA Finale */}
        <div className="text-center bg-white/5 border border-white/10 rounded-[64px] p-16 md:p-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-20" />
            <div className="relative z-10">
                <h3 className="text-5xl md:text-7xl font-serif font-black mb-12">Ritorna alla sicurezza.</h3>
                <p className="text-2xl text-white/50 mb-16 max-w-3xl mx-auto leading-relaxed">
                    Prenotando l'appuntamento, riceverai il link sicuro. La presenza di Valeria garantisce che questo incontro sia, finalmente, privo di ombre.
                </p>
                <button 
                    onClick={() => navigate('/area-personale?consult=protocollo_protetto')}
                    className="bg-red-600 hover:bg-red-500 text-white px-16 py-8 rounded-[32px] font-black uppercase tracking-[0.3em] text-2xl transition-all shadow-[0_30px_60px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95"
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
