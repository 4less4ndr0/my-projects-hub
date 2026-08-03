# Prompt Engineer

File di supporto: non fa parte del sito, non viene letto da `index.html`. Contiene un unico prompt pronto da copiare e incollare in una **nuova** conversazione Claude per rigenerare da zero l'intera struttura di questa Projects Hub — stessa architettura, stessi meccanismi, ma con contenuti placeholder al posto dei miei, pronti per essere personalizzati in chat.

**Come si usa**: apri una nuova conversazione Claude, collega la repo (vuota o nuova) dove vuoi creare il tuo Projects Hub, incolla tutto il blocco qui sotto in un unico messaggio e lascia lavorare Claude.

---

````
Crea da zero una landing page statica chiamata "Projects Hub": uno strumento personale per tracciare lo stato di più progetti/idee lungo un percorso a fasi, con la metafora del volo. Nessun framework, nessun build step, nessun backend: solo file piatti servibili staticamente (deve funzionare anche su GitHub Pages).

## File da creare

- `index.html` — markup della pagina
- `style.css` — stile
- `script.js` — tutta la logica (rendering, dialog, filtri, localStorage)
- `data.json` — tutti i contenuti (progetti, idee)
- `README.md` — spiega lo schema dati e come si pubblica

## Architettura e comportamento

**Fonte dati**: tutto il contenuto vive in `data.json`. `index.html` fa fetch di quel file e disegna le card via JS: non c'è build né backend.

**Le 4 fasi + hangar**, etichette in italiano ma chiavi in inglese nel JSON (per compatibilità col codice):

- `ideation` → "Imbarco": si sta validando l'idea (segmento cliente, valore, competitor, assunzioni chiave)
- `wip` → "Decollo": si sta costruendo l'MVP
- `shipment` → "Quota di crociera": il prodotto è in mano a utenti reali
- `revenue` → "Atterraggio": si scala, si guadagna
- più un **hangar**, PRIMA di Imbarco: idee grezze non ancora validate, senza struttura fissa (solo titolo + nota libera)

**Header**: titolo "Projects Hub" + tagline tipo "Il piano di volo di ogni progetto, dall'imbarco all'atterraggio", icona/brand a piacere.

**Barra filtri**: bottoni "Tutti i voli" + uno per fase (Imbarco/Decollo/Quota di crociera/Atterraggio), filtrano le card progetto per `stage`. Bottone "+" separato che apre un dialog "Piano di volo" con le domande di intake (vedi sotto), da rispondere in chat con Claude prima di creare una card vera.

**Griglia progetti**: una card per progetto con:
- titolo, descrizione breve
- uno stepper orizzontale a 4 segmenti colorati (uno per fase): quelli prima della fase corrente "fatti", quello corrente evidenziato, i successivi spenti
- una riga di stato revenue (se diverso da "nessuna revenue")
- un "ultimo stato in una frase" (campo `summary`)
- badge della fase corrente + data ultimo check-in
- eventuali link (repo, sito, ecc.)
- cliccabile con mouse e tastiera (`tabindex`, `role="button"`) → apre un dialog di dettaglio

**Dialog di dettaglio progetto**: overlay con fade, contenuto centrato con scale-in, chiudibile con la X, click fuori overlay, o Esc. Dentro: badge fase, titolo, descrizione, stepper, e un **accordion con una sezione per ciascuna delle 4 fasi**:
- fasi già raggiunte: mostrano le risposte alle domande di intake di quella fase (in ordine) + una checklist di "deliverable" cliccabile (stato spuntato/non spuntato salvato in `localStorage`, non nel JSON)
- fasi non ancora raggiunte: mostrano solo le domande di riferimento (senza risposta), con un badge tipo "Prossima tappa" e un'icona lucchetto

Più eventuali link, in fondo al dialog.

**Domande di intake per fase** (usale identiche: è un framework di validazione startup generico, non contenuto personale):

- Imbarco (`ideation`):
  1. "Chi è il tuo segmento di mercato iniziale (beachhead) e perché proprio quello?"
  2. "Qual è il valore critico che risolvi per questo cliente, e in quale momento del suo ciclo di vita lo usa?"
  3. "Chi è il tuo competitor più vicino e perché il cliente sceglierebbe te?"
  4. "Quali sono le assunzioni chiave su cui si regge l'idea, e le hai già testate?"
- Decollo (`wip`):
  1. "Cos'è il tuo MVP, cosa include e a che punto sei nel costruirlo?"
  2. "Come il cliente scopre, decide e acquista la tua soluzione?"
  3. "Come pensi di guadagnare (modello di business, prezzo, LTV vs costo di acquisizione)?"
- Quota di crociera (`shipment`):
  1. "Hai una prova concreta che il prodotto funziona — utenti reali che lo usano/pagano?"
- Atterraggio (`revenue`):
  1. "Qual è il potenziale sui mercati successivi e come pensi di scalare il business?"

Ogni domanda ha anche un piccolo riferimento al framework da cui viene, mostralo in corsivo/piccolo sotto la domanda (es. "Market Segmentation, Select Beachhead Market"); inventa riferimenti coerenti se non li conosci con precisione.

**Sezione Hangar**: sotto la griglia progetti. Titolo "Hangar" + sottotitolo tipo "Idee grezze, parcheggiate in hangar. Un giorno decollano." Card con bordo tratteggiato (per distinguerle dalle card progetto "vere"), contenente solo titolo + nota libera + data di aggiunta. Il testo della nota va troncato visivamente a 3 righe con ellissi nella card; cliccando la card (mouse o tastiera) si apre lo stesso overlay di dialog con titolo, nota per intero e data — riusa lo stesso meccanismo di dialog dei progetti, non crearne uno separato.

**Persistenza checklist**: lo stato spuntato/non spuntato dei deliverable non sta nel JSON ma in `localStorage` (chiave per progetto + fase + testo voce), così sopravvive ai redeploy del sito ma resta locale al browser di chi guarda.

**Schema dati (`data.json`)**:

```json
{
  "updated": "YYYY-MM-DD",
  "projects": [
    {
      "id": "slug-univoco",
      "name": "Nome progetto",
      "description": "Una riga di descrizione",
      "stage": "ideation | wip | shipment | revenue",
      "updated": "YYYY-MM-DD",
      "summary": "Ultimo stato in una frase, mostrato sulla card",
      "stages": {
        "ideation": { "updated": "YYYY-MM-DD", "answers": ["...", "...", "...", "..."], "deliverables": [{ "text": "...", "done": false }] },
        "wip": { "updated": "YYYY-MM-DD", "answers": ["...", "...", "..."], "deliverables": [{ "text": "...", "done": false }] },
        "shipment": { "updated": "YYYY-MM-DD", "answers": ["..."], "deliverables": [{ "text": "...", "done": false }] },
        "revenue": { "updated": "YYYY-MM-DD", "answers": ["..."], "deliverables": [{ "text": "...", "done": false }] }
      },
      "revenue": { "status": "none | early | growing", "amount": "", "notes": "" },
      "links": [{ "label": "Repo", "url": "https://..." }]
    }
  ],
  "ideas": [
    { "id": "slug", "title": "Titolo idea", "note": "Nota grezza", "added": "YYYY-MM-DD" }
  ]
}
```

`stages` ha una chiave solo per le fasi effettivamente raggiunte; quelle non ancora raggiunte si omettono (il dialog mostra comunque le domande di riferimento, senza risposta).

## Stile visivo

Palette calda, chiara, minimal: sfondo crema/panna, testo blu scuro/petrolio per i titoli, accenti caldi (giallo/senape/rosso mattone) per bottoni attivi e badge. Card con bordo sottile, angoli arrotondati generosi, ombra leggera, leggero sollevamento e bordo colorato all'hover/focus. Stepper a fasi come segmenti colorati diversi per fase. Card idea con bordo tratteggiato. Dialog centrato in overlay scuro semi-trasparente, con animazione di apertura leggera (fade + scale). Font display per i titoli leggermente diverso dal font body. Sei libero sui dettagli estetici esatti (colori precisi, font) purché il risultato sia coerente, leggibile e con questo mood.

## Contenuti di esempio da inserire

**Un progetto di esempio completo, con tutte e 4 le fasi valorizzate** (non solo le prime due), per mostrare a chi copia questo prompt com'è un progetto arrivato in fondo al percorso:
- `id`: "esempio-progetto", `stage` attuale: "revenue" (il più avanzato, per mostrare lo stepper pieno)
- risposte plausibili e concrete per ciascuna delle 4 fasi (frasi vere, non placeholder tipo "risposta 1", come se qualcuno avesse davvero risposto)
- deliverable con un mix di spuntati/non spuntati per ogni fase
- `revenue.status`: "early", con un importo e una nota plausibili
- un paio di link plausibili (repo, sito)

**Una idea in hangar**, semplice, placeholder onesto: `id` "esempio-idea", nota tipo "Un'idea grezza, non ancora validata. Butta qui qualsiasi cosa ti venga in mente."

## Onboarding (obbligatorio, visibile sulla pagina)

Subito sotto l'header, PRIMA della barra filtri, inserisci un blocco di onboarding ben visibile (stile banner/card, coerente col resto), che copra tutti questi punti (adatta il tono, ma non tagliare contenuti):

1. Cos'è questo strumento: una landing personale per tenere sotto controllo lo stato di ogni progetto/idea, senza rincorrere note sparse.
2. Cosa sono le fasi, spiegate con la metafora del volo: Hangar (idea grezza, non ancora validata) → Imbarco (si valida l'idea) → Decollo (si costruisce l'MVP) → Quota di crociera (prodotto in mano a utenti reali) → Atterraggio (si scala, si guadagna).
3. Cosa fa ogni elemento dell'interfaccia: i filtri per fase, le card progetto (e cosa significa lo stepper), il dialog di dettaglio con le domande/risposte per fase e la checklist deliverable, il bottone "+" con le domande di intake, la sezione hangar per le idee grezze.
4. **Come si modifica questa pagina**: è un sito statico, senza pannello di amministrazione né database. L'unico modo per aggiungere o modificare progetti, idee, checklist o testo è collegare questa repo GitHub a Claude (Claude Code o claude.ai con accesso alla repo) e chiedere le modifiche in chat — è Claude che edita `data.json` (e se serve `script.js`/`style.css`) e fa commit/push. Non è pensato per essere editato a mano dall'utente finale.
5. In fondo al blocco, un disclaimer esplicito rivolto a chi legge: qualcosa come "Appena mi chiederai la tua prima modifica reale (sostituire il progetto di esempio, aggiungere la tua prima idea vera, ecc.), rimuoverò automaticamente questa guida dalla pagina: non ti serve più una volta che sai come funziona."

Subito dopo questo blocco visibile, aggiungi anche una nota SOLO nel codice (non visibile sulla pagina — va bene un commento HTML in cima a `index.html`, sopra il blocco di onboarding) rivolta esplicitamente a Claude nelle sessioni future, con questo contenuto:

"ISTRUZIONE PER CLAUDE: quando l'utente chiede la prima modifica reale ai contenuti (es. sostituire il progetto di esempio con un progetto vero, sostituire l'idea di esempio in hangar, aggiungere il primo progetto reale), rimuovi il blocco di onboarding da index.html — e questo stesso commento — come parte di quella modifica. Non aspettare che l'utente lo chieda esplicitamente: è una pulizia implicita nella prima modifica di contenuto reale, va fatta una volta sola."

## Al termine

Genera tutti i file, verifica che il JSON sia valido, e apri la pagina in locale (es. `python3 -m http.server`) per controllare visivamente che tutto funzioni prima di consegnare: filtri, apertura/chiusura dialog progetto, apertura/chiusura dialog idea, checklist cliccabile, dialog "Piano di volo" dal bottone "+".
````
