# Documento Tecnico-Legale: Protocollo "La Stanza Sicura"
**Progetto:** Piattaforma Nonsolotarocchi.it (Valeria Di Pace)
**Oggetto:** Architettura, Sicurezza e Tutela Legale del servizio "Protocollo Protetto"

## 1. Visione del Servizio
"La Stanza Sicura" è un ambiente digitale protetto progettato per la gestione di crisi relazionali ad alto rischio. Il servizio mira a fornire uno spazio di confronto neutro dove la presenza di una figura terza (Facilitatrice/Moderatrice) garantisce l'incolumità verbale e la tracciabilità dell'incontro, scoraggiando comportamenti abusivi tramite sorveglianza attiva e tecnologica.

## 2. Architettura Tecnologica
*   **Motore Video:** Integrazione con **Daily.co** (WebRTC a bassa latenza).
*   **Modalità Immersiva:** La stanza video è programmata per attivare una "Security Mode" quando il tipo di consulto è `protocollo_protetto`. Questa modalità rimuove ogni elemento esoterico o mistico, offrendo un'interfaccia sobria, istituzionale e professionale.
*   **Infrastruttura di Registrazione:** La registrazione avviene **server-side** (non locale nel browser) per garantire l'impossibilità di manomissione e la massima qualità audio/video.

## 3. Dinamica della Sessione a Tre
La sessione prevede tre partecipanti: **Prenotatario (Vittima/Soggetto fragile)**, **Invitato (Partner/Controparte)** e **Valeria Di Pace (Facilitatrice)**.

### Strumenti di Moderazione Attiva:
Valeria dispone di una "Console di Controllo" proprietaria con poteri esecutivi immediati:
*   **Mute Selettivo:** Possibilità di silenziare istantaneamente il microfono di un partecipante in caso di prevaricazione o violenza verbale.
*   **Kick (Espulsione):** Potere di espellere immediatamente la controparte dalla stanza video, interrompendo il collegamento in meno di un secondo.
*   **Emergency Closing:** Chiusura totale della stanza con salvataggio immediato della traccia.

## 4. Paracadute Legali e Terminologia
Per tutelare Valeria Di Pace (formata in Legge e Psicologia ma operante come libera professionista/coach), il protocollo adotta una terminologia specifica per evitare l'esercizio abusivo di professioni regolamentate:
*   **Ruolo Dichiarato:** Facilitatrice del Dialogo e Moderatrice Tecnica (non Mediatrice Civile, non Psicologa).
*   **Natura del Servizio:** Accompagnamento al confronto privato e testimonianza neutrale.
*   **Disclaimer Espliciti:** Inclusione di clausole di esclusione della responsabilità per eventi occorsi al di fuori della sessione video.

## 5. Protocollo di Consenso e Privacy (3 Livelli)
Per blindare la legalità delle registrazioni, il sistema implementa un funnel di consenso a "tripla blindatura":
1.  **Livello 1 (Prenotazione):** 6 Checkbox obbligatori e separati che definiscono la natura del servizio e il consenso irrevocabile alla registrazione.
2.  **Livello 2 (Email):** Notifica di conferma che ribadisce gli obblighi informativi verso la controparte.
3.  **Livello 3 (Verbale):** Script di apertura obbligatorio letto da Valeria all'avvio della call per ottenere il consenso audio-visivo registrato di entrambi i partecipanti.

## 6. Policy di Conservazione Dati (GDPR)
*   **Cancellazione Automatica:** Il sistema è configurato per la **distruzione irreversibile** delle registrazioni dopo **24 ore** dal termine della sessione.
*   **Accesso Paritario:** La registrazione è considerata bene comune delle parti. Entrambi i partecipanti possono richiederne copia entro le 24 ore per fini di tutela legale o prova inibitoria.
*   **Criptazione:** I file sono criptati a riposo (AES-256) sui server della piattaforma prima della cancellazione.

## 7. Integrazione Operativa
*   **Tariffazione:** Servizio Premium (`1,80 cr/min`) per riflettere l'alto rischio e l'impegno tecnico.
*   **Tracciabilità:** Ogni accesso alla stanza e ogni azione di moderazione (mute/kick) viene loggata nel database della piattaforma come metadato della sessione.
*   **Landing Page:** Sezione indipendente (`/stanza-sicura`) con estetica "Brilliant Gold" e linguaggi rassicuranti ma fermi.

---
*Documento generato per analisi Deep Research e Audit Legale.*
