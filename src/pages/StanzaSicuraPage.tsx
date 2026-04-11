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
            <p className="text-2xl text-red-500 font-bold tracking-[0.4em] uppercase mb-8">Protocollo di Dialogo Facilitato</p>
            <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed">
                Un servizio di moderazione tecnica e facilitazione privata per incontri online che richiedono equilibrio, rispetto e documentazione.
            </p>
        </motion.div>

        {/* 1) Ambiente Digitale: TESTO SINISTRA - IMMAGINE DESTRA */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4 text-left">Distanza Digitale</h2>
                <h3 className="text-2xl font-serif font-bold text-emerald-400 uppercase tracking-widest text-left">Sicurezza tramite la De-escalation</h3>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light text-left">
                    La Stanza Sicura è uno spazio virtuale che garantisce la <strong className="text-white">distanza geografica assoluta</strong> tra i partecipanti. Questo elimina alla radice il rischio di aggressione fisica, permettendo un confronto verbale che in presenza risulterebbe impossibile o pericoloso.
                </p>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative group h-full"
            >
                <img 
                    src="/assets/stanza-sicura/ambiente-protetto.png" 
                    alt="Ambiente Digitale" 
                    className="relative w-full h-auto rounded-[40px] border border-white/10 shadow-2xl z-10"
                />
            </motion.div>
        </section>

        {/* 2) Facilitazione: IMMAGINE SINISTRA - TESTO DESTRA */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
            >
                <img 
                    src="/assets/stanza-sicura/mediazione.png" 
                    alt="Facilitazione del Dialogo" 
                    className="w-full h-auto rounded-[40px] border border-white/10 shadow-2xl"
                />
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8 order-1 lg:order-2"
            >
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4 text-left">Facilitazione del Dialogo</h2>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light text-left">
                    Valeria Di Pace interverrà nella videochiamata in qualità di <strong>Moderatrice Tecnica</strong> e <strong>Testimone Neutrale</strong>. Il suo ruolo non è dare giudizi legali o psicologici, ma assicurare che le regole del dialogo siano rispettate da tutti i partecipanti attraverso strumenti attivi.
                </p>
                <div className="space-y-4 pt-4">
                    <div className="bg-white/5 border-l-4 border-gold-500 p-6 rounded-r-2xl text-left">
                        <h4 className="text-lg font-black uppercase text-gold-500 mb-2">Silenziamento (Mute)</h4>
                        <p className="text-white/60 text-base">In caso di interruzioni costanti o toni aggressivi, la moderatrice può silenziare temporaneamente il microfono di chi prevarica.</p>
                    </div>
                    <div className="bg-white/5 border-l-4 border-red-500 p-6 rounded-r-2xl text-left">
                        <h4 className="text-lg font-black uppercase text-red-500 mb-2">Interruzione della Sessione</h4>
                        <p className="text-white/60 text-base">Se il clima degenera in violenza verbale fuori controllo, la moderatrice ha il potere di chiudere la stanza istantaneamente.</p>
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
                <h2 className="text-5xl md:text-6xl font-serif font-black brilliant-gold-text mb-4 text-left">Security Vault</h2>
                <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest text-left">Tracciabilità e Documentazione</h3>
                <div className="space-y-6 text-left">
                    <div className="flex gap-4">
                        <span className="text-2xl">📸</span>
                        <p className="text-xl text-white/60 text-left"><strong>Registrazione Certificata:</strong> Ogni istante è salvato in cloud come documentazione dell'incontro.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-2xl">⚖️</span>
                        <p className="text-xl text-white/60 text-left"><strong>Accesso Paritario:</strong> Il file video è a disposizione di entrambe le parti su richiesta formale.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-2xl">🗑️</span>
                        <p className="text-xl text-white/60 text-left"><strong>Privacy GDPR:</strong> Il video viene rimosso definitivamente dopo 24 ore, tutelando la riservatezza delle parti.</p>
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
                    className="w-full h-auto rounded-[40px] border border-white/10 shadow-2xl"
                />
            </motion.div>
        </section>

        {/* Disclaimer Legale Obbligatorio */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-40">
            <h4 className="text-red-500 font-black uppercase tracking-widest text-sm mb-4">Note Legali Indispensabili</h4>
            <div className="text-white/40 text-sm space-y-4 leading-relaxed italic">
                <p>La Stanza Sicura è un servizio di facilitazione del dialogo e moderazione tecnica di videochiamata. Non costituisce mediazione civile ai sensi del D.Lgs. 28/2010, né attività di supporto psicologico o legale riservata agli iscritti agli albi professionali. Valeria Di Pace agisce in qualità di moderatrice tecnica e testimone neutrale privata.</p>
                <p>Il servizio non è un pronto intervento per emergenze fisiche o imminenti. In caso di pericolo, contattare immediatamente le autorità competenti (112) o il servizio nazionale antiviolenza (1522).</p>
            </div>
        </div>

        {/* CTA Finale */}
        <div className="text-center bg-white/5 border border-white/10 rounded-[64px] p-16 md:p-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-20" />
            <div className="relative z-10">
                <h3 className="text-4xl md:text-6xl font-serif font-black mb-12">Richiedi l'accompagnamento al dialogo.</h3>
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
