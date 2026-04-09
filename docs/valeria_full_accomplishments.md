# Rapporto Integrale: Progetto Valeria (Landing & Astro)
**Cronologia Tecnica e Funzionale delle Implementazioni**

Questo documento serve come "stato dell'arte" definitivo per il passaggio della gestione ad un'ambiente locale. Copre ogni aspetto sviluppato, dalla logica backend all'estetica frontend.

---

## 1. Il Motore Astronomico (Python Engine)
È il "cervello" calcolatore nascosto nel backend.
- **Implementazione**: Integrazione della libreria **Swiss Ephemeris (pyswisseph)**.
- **Precisione**: Calcolo sub-arcosecondo delle posizioni planetarie e delle cuspidi delle case (Placidus).
- **Logica**: Gestione fusi orari tramite `pytz` e conversione dinamica coordinate geografiche.
- **Integrazione**: Script Python invocati tramite `execFile` dal controller Node.js, con output JSON strutturato.

## 2. Visualizzazione: Zodiac Wheel & UI Premium
Abbiamo trasformato dati freddi in arte interattiva.
- **ZodiacWheel Component**: Un sistema SVG complesso e reattivo che:
    - Disegna la ruota dei 12 segni.
    - Posiziona i pianeti con i loro simboli originali.
    - Traccia le cuspidi delle case personalizzate.
    - Supporta temi circadiani (cambia colore in base all'ora del giorno).
- **Estetica "Galactic Night"**: Sfondi radiali profondi, blur galattici, animazioni Framer Motion per un look di fascia altissima.

## 3. Il Funnel di Conversione (Guest → Member)
La strategia per trasformare i visitatori in utenti registrati.
- **Guest Calculation**: Permette agli ospiti di inserire i dati e vedere l'Ascendente e la ruota (con gli altri pianeti oscurati/spoiler).
- **LocalStorage Sync**: I dati di nascita degli ospiti vengono salvati nel browser.
- **Auto-Sync post-Login**: Una volta che l'utente si registra tramite Clerk, i dati pendenti vengono inviati al server e associati al profilo automaticamente.
- **Permanent Profiles**: Una volta salvati, i dati di nascita diventano inalterabili per garantire la serietà della consulenza (Blocco 403 Forbidden).

## 4. Wallet & Sistema Crediti (Economia Interna)
Implementazione del sistema di pagamento e fruizione servizi.
- **Wallet UI**: Design premium con gradienti "Gold & Yellow" per riflettere il valore dei crediti.
- **Logica Transazionale**: Scalabilità dei crediti (es. 30 crediti per l'Analisi Evolutiva) salvata nel database PostgreSQL.
- **Piani di Ricarica**: Widget pre-impostati per l'acquisto di pacchetti crediti.

## 5. L'Anima di Valeria (AI Mentorship)
Integrazione dell'intelligenza artificiale per il mentoring spirituale.
- **Gemini 2.0 Flash Integration**: Utilizzato per generare sintesi profonde e personalizzate.
- **Interpretazione Basic**: Focalizzata sulla "Triade dell'Anima" (Sole, Luna, Ascendente) per tutti gli utenti loggati.
- **Interpretazione Evolutiva (Paid)**: Analisi completa di 1000+ parole che integra Case, Aspetti e Pianeti Sociali.
- **Synthesis Recovery**: Pulsante "Genera Sintesi" per recuperare analisi fallite o mancanti in passato.

## 6. Infrastruttura & Database (Robustezza)
Tutto ciò che rende il sistema affidabile.
- **Node.js Migration**: Passaggio forzato a Node 20/22 per compatibilità con le ultime Clerk SDK.
- **Postgres Schema**: 
    - `client_billing_profiles`: Dati anagrafici e fiscali fissi.
    - `natal_charts`: Database storico dei temi calcolati con interpretazioni salvate in formato Markdown.
    - `user_wallets`: Saldo crediti in tempo reale.
- **Railway/Nixpacks Logic**: Configurazione dichiarativa per ignorare i lockfile corrotti e forzare build puliti.

---

## 7. Stato delle Consegne per il Locale
Per far girare tutto questo sul tuo Windows Host:
1.  **Repository**: Assicurati di scaricare l'ultima versione (`git pull`).
2.  **Environment**: Il file `.env` deve contenere la `DATABASE_URL` del tuo Postgres locale e le API Key di Clerk e Gemini.
3.  **Python**: Installa le dipendenze (`pip install pyswisseph pytz`) sul Python di Windows.
4.  **Versioni**: Usa `nvm` o simili per impostare **Node 22** in locale.

> [!IMPORTANT]
> Il progetto è ora "Stato Solido". Ogni bug di deployment è stato documentato e risolto. La migrazione al locale ti libererà definitivamente dai rallentamenti di Railway.

**Valeria è pronta per essere lanciata. ✦**
