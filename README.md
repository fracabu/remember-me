# Remember Me - Voice Reminders

Un'applicazione web moderna che trasforma i tuoi promemoria vocali in reminders strutturati utilizzando l'intelligenza artificiale di Google Gemini.

## 🚀 Caratteristiche

- **Voice-to-Text**: Registra promemoria vocali usando il Web Speech API del browser
- **AI Processing**: Gemini AI estrae automaticamente titolo, descrizione, data e ora dai tuoi promemoria
- **Interfaccia Intuitiva**: Design pulito e moderno con Tailwind CSS
- **Privacy-First**: La chiave API non viene mai salvata, solo mantenuta in memoria per la sessione
- **Persistenza Locale**: I reminders vengono salvati nel localStorage del browser

## 🛠️ Tecnologie

- **React 19** con TypeScript
- **Vite** per build e development
- **Google Gemini AI** per il processing del linguaggio naturale
- **Tailwind CSS** per lo styling
- **Web Speech API** per il riconoscimento vocale

## 📋 Prerequisiti

- Node.js (versione 16 o superiore)
- Una chiave API di Google Gemini (gratuita da [Google AI Studio](https://aistudio.google.com/app/apikey))
- Un browser moderno che supporta il Web Speech API

## 🚀 Installazione e Avvio

1. **Clona il repository**
   ```bash
   git clone <your-repo-url>
   cd remember-me
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura la chiave API**
   
   Hai tre opzioni per impostare la chiave API:
   
   - **Metodo 1 (Raccomandato per sviluppatori)**: Crea un file `.env.local` nella root del progetto:
     ```
     VITE_GEMINI_API_KEY=la_tua_chiave_api_qui
     ```
     Con questo metodo l'app funziona immediatamente senza richiedere la chiave.
   
   - **Metodo 2 (Compatibilità)**: Usa la variabile originale:
     ```
     GEMINI_API_KEY=la_tua_chiave_api_qui
     ```
   
   - **Metodo 3 (Utenti finali)**: Se non hai configurato il `.env.local`, l'app mostrerà una sidebar a sinistra per inserire la chiave

4. **Avvia l'applicazione**
   ```bash
   npm run dev
   ```

5. **Apri il browser** su `http://localhost:5173` (o la porta indicata nel terminale)

## 📖 Come Usare

1. **Configura la chiave API**: 
   - Se hai il file `.env.local` configurato → l'app è pronta all'uso
   - Altrimenti → usa la sidebar a sinistra per inserire la chiave
2. **Clicca il pulsante microfono** per iniziare a registrare
3. **Parla chiaramente** il tuo promemoria (es: "Ricordami di chiamare il dottore domani alle 3 del pomeriggio")
4. **L'AI processerà** automaticamente il testo e creerà un reminder strutturato
5. **Visualizza e gestisci** i tuoi reminders organizzati cronologicamente
6. **Aggiungi al calendario** cliccando l'icona calendario sulle card

## 🏗️ Struttura del Progetto

```
src/
├── components/          # Componenti React
│   ├── Header.tsx       # Header dell'applicazione
│   ├── Recorder.tsx     # Componente per registrazione vocale
│   ├── ReminderCard.tsx # Card singolo reminder
│   ├── ReminderList.tsx # Lista dei reminders
│   ├── SettingsModal.tsx# Modal per configurazione API
│   └── icons.tsx        # Icone SVG
├── services/            # Servizi e API
│   └── geminiService.ts # Integrazione con Gemini AI
├── types/               # Definizioni TypeScript
│   └── index.ts         # Tipi dell'applicazione
├── App.tsx              # Componente principale
└── index.tsx            # Entry point
```

## 🔧 Scripts Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run preview` - Anteprima della build di produzione

## 🔒 Privacy e Sicurezza

- **La chiave API non viene mai salvata permanentemente** - rimane solo in memoria durante la sessione
- **I reminders vengono salvati solo localmente** nel tuo browser
- **Nessun dato viene inviato a server esterni** eccetto le richieste API a Google Gemini
- **Codice open source** - puoi verificare esattamente cosa fa l'applicazione

## 🤝 Contribuire

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa i tuoi cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Pusha il branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🐛 Segnalazione Bug

Se trovi un bug o hai un suggerimento, apri una [issue](https://github.com/your-username/remember-me/issues) su GitHub.

---

**Remember Me** - Trasforma le tue parole in azioni organizzate! 🎯