# Handover Report: Progetto Valeria (Landing & Astro)

Questo documento riassume lo stato del progetto, l'architettura tecnica e le istruzioni per il passaggio della gestione ad un'istanza locale di Antigravity su Windows Host.

## 1. Stato del Progetto
Il progetto è ora in una fase di **maturità funzionale**. Il cuore del sistema (Calcolo Natatale, Wallet, e Visualizzazione) è completo e testato.

### Funzionalità Implementate:
- **Motore Astronomico (Python)**: Utilizza la libreria `pyswisseph` (Swiss Ephemeris) per calcoli con precisione sub-arcosecondo.
- **Zodiac Wheel (SVG/React)**: Sistema di visualizzazione dinamico che disegna pianeti, case e aspetti in base ai calcoli astronomici.
- **Wallet & Crediti**: Sistema integrato con Clerk per la gestione dei crediti (Gold/Yellow gradient UI) per richiedere analisi evolutive.
- **AI Mentorship (Valeria)**: Integrazione con Gemini 2.0 Flash per generare interpretazioni olistiche e naturopatiche dei temi natali.
- **Natal Funnel (Guest-to-User)**: Processo fluido che permette agli ospiti di calcolare l'ascendente e sincronizzare i dati al proprio profilo dopo la registrazione.

## 2. Architettura Tecnica (Local Windows Setup)

Per far girare il progetto in locale sulla tua macchina Windows, segui questi requisiti:

### Requisiti Software:
- **Node.js**: **Versione 22+** (necessaria per le dipendenze recenti di React Router 7 e Clerk).
- **PostgreSQL**: Installato localmente o accessibile via rete.
- **Python 3.10+**: Con le librerie `pyswisseph`, `pytz` installate (`pip install pyswisseph pytz`).
- **Nixpacks (Opzionale)**: Se vuoi simulare il build di Railway, ma non è necessario per lo sviluppo locale (`npm run dev`).

### Variabili d'Ambiente (`.env` nel backend):
```env
DATABASE_URL=postgres://user:password@localhost:5432/valeria_db
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
GEMINI_API_KEY=vostra_chiave_gemini
VITE_API_URL=http://localhost:8787
```

## 3. Modifiche Critiche Recenti (Build Fixes)
- **Node 20+**: Abbiamo forzato il build ad usare Node 20+ in `package.json` (`engines`) e `nixpacks.toml` per evitare errori con le librerie Clerk.
- **Lockfile Regeneration**: Abbiamo rinominato `package-lock.json` in `.bak` per forzare `npm install` sul server, risolvendo i conflitti di dipendenze.
- **Unalterable Profiles**: I dati di nascita degli utenti sono ora bloccati dopo il primo salvataggio. Modifiche solo tramite DB o email.

## 4. Prossimi Passi (Consigliati)
- **Local Testing**: Verifica che il file `astrology.py` (nel folder `python_engine`) trovi correttamente le librerie swisseph sul tuo Python locale.
- **Database Migration**: Esegui tutti i file in `backend/migrations` (dallo 001 allo 014) sul tuo Postgres locale per avere lo schema allineato.
- **Test Funnel**: Simula un'iscrizione da zero per verificare che la sincronizzazione automatica dei dati "Ospite" funzioni correttamente.

> [!TIP]
> Su Windows Host, usa sempre PowerShell o Bash (tramite Git Bash o WSL) per lanciare i comandi. Assicurati che `python` sia nel PATH del sistema.

Buona continuazione dello sviluppo in locale! ✦
