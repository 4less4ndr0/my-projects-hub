# Projects Hub

Landing page personale per tracciare lo stato di ogni progetto lungo il suo volo — **Imbarco → Decollo → Quota di crociera → Atterraggio** — più un hangar per le idee grezze non ancora validate.

## Come funziona

Tutti i contenuti vivono in [`data.json`](data.json). Non c'è build né backend: `index.html` legge quel file e disegna le card.

```json
{
  "projects": [
    {
      "id": "slug-univoco",
      "name": "Nome progetto",
      "description": "Una riga di descrizione",
      "stage": "ideation | wip | shipment | revenue",
      "updated": "YYYY-MM-DD",
      "summary": "Ultimo stato in una frase, mostrato sulla card",
      "stages": {
        "ideation": {
          "updated": "YYYY-MM-DD",
          "answers": ["risposta 1", "risposta 2", "risposta 3", "risposta 4"],
          "deliverables": [{ "text": "Cosa va fatto in questa fase", "done": false }]
        },
        "wip": {
          "updated": "YYYY-MM-DD",
          "answers": ["risposta 1", "risposta 2", "risposta 3"],
          "deliverables": [{ "text": "Cosa va fatto in questa fase", "done": false }]
        }
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

`stages` ha una chiave per ogni fase raggiunta — `ideation` (Imbarco), `wip` (Decollo), `shipment` (Quota di crociera), `revenue` (Atterraggio); i nomi delle chiavi restano questi in inglese per compatibilità col codice, le etichette in italiano sono solo visive. Le fasi non ancora raggiunte si omettono — il dialog di dettaglio mostrerà per quelle solo le domande di riferimento (col badge "Prossima tappa"), senza risposta. Le domande di ogni fase (e i riferimenti al framework da cui vengono) vivono in `INTAKE_QUESTIONS` dentro [`script.js`](script.js), non in `data.json`: le risposte devono seguire lo stesso ordine.

`deliverables` è opzionale ma consigliato **per ogni fase**, non solo per `wip`: è la checklist concreta di quella fase, cliccabile nel dialog (lo stato spuntato/non spuntato si salva nel browser).

## Pubblicazione

Sito statico servito via GitHub Pages dal branch `main` (cartella root): **https://4less4ndr0.github.io/my-projects-hub/**
