# Projects Hub

Landing page personale per tracciare lo stato di ogni progetto: **Ideation → Work in progress → Shipment → Revenue**, più un bacino di idee grezze non ancora validate.

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
      "notes": "Ultimo stato in una frase",
      "revenue": { "status": "none | early | growing", "amount": "", "notes": "" },
      "links": [{ "label": "Repo", "url": "https://..." }]
    }
  ],
  "ideas": [
    { "id": "slug", "title": "Titolo idea", "note": "Nota grezza", "added": "YYYY-MM-DD" }
  ]
}
```

## Pubblicazione

Sito statico servito via GitHub Pages dal branch `main` (cartella root): **https://4less4ndr0.github.io/my-projects-hub/**
