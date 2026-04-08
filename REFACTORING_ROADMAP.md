# 🗺️ Roadmap di Ristrutturazione Valeria Landing

L'obiettivo è trasformare il progetto da un monolite a un'architettura modulare, separando nettamente l'ambiente **Staff** dall'ambiente **Cliente**.

---

- [x] **Fase 1: Separazione Fisica degli Ambienti** (Completata ✅)
  - [x] Creazione cartella `src/pages/dashboard/`
  - [x] Estrazione `StaffDashboard.tsx` e `ClientDashboard.tsx`
  - [x] Semplificazione `Dashboard.tsx` come router puro

- [x] **Fase 2: Componetizzazione (Pulizia ClientDashboard)** (Completata ✅)
  - [x] Estrarre **Rango Astrale** (`AstralRankCard.tsx`)
  - [x] Estrarre **Dati Fiscali** (`TaxInfoForm.tsx`)
  - [x] Estrarre **Storico Transazioni** (`TransactionHistory.tsx`)
  - [x] Estrarre **Flusso Prenotazione** (`BookingFlow.tsx`)

- [x] **Fase 3: Navigazione Professionale** (Completata ✅)
  - [x] Creazione di una Navbar dinamica (Context-aware)
  - [x] Standardizzazione dei link nel footer per utenti loggati
  - [x] Implementazione Breadcrumbs globali

- [x] **Fase 4: Ottimizzazione Backend & SEO** (Completata ✅)
  - [x] Ridenominazione rotte sotto namespace `/area-personale/`
  - [x] Allineamento di tutti i link interni (Navbar, Footer, App.tsx)
  - [x] Chiarificazione distinzione tra pagine pubbliche e private

- [x] **Fase 5: Unificazione Navigazione Staff** (Completata ✅)
  - [x] Creazione `StaffSidebar` con switcher stato (Online/Offline).
  - [x] Creazione `StaffLayout` per unificare tutte le pagine di gestione.
  - [x] Rimozione Navbar/Footer globali nell'ambiente Staff.
  - [x] Refactoring `Control Room`, `Gestione Clienti`, `Recensioni` e `Commenti`.

---

### 🛡️ Regole d'Oro
1. **Zero Placeholder**: Ogni componente deve essere funzionante.
2. **Aesthetics First**: Mantenere il design "Flat Gold" su nero.
3. **Safety First**: Verificare il build dopo ogni estrazione di componente.
