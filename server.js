const express = require('express');
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const app = express();
app.use(express.json());

// Percorso del file persistente incluso nel deploy
const filePath = path.join(__dirname, 'assets', 'db.json');

// Carica il file in memoria
let memoryDB = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Router dinamico
let router = jsonServer.router(memoryDB);

// Middleware JSON Server
const middlewares = jsonServer.defaults();
app.use(middlewares);

// Funzione per ricreare il router quando memoryDB cambia
function reloadRouter() {
  router = jsonServer.router(memoryDB);
}

// 1️⃣ Endpoint per scaricare il file attuale (backup)
app.get('/backup', (req, res) => {
  res.json(memoryDB);
});

// 2️⃣ Endpoint per aggiornare il file in memoria
app.post('/update', (req, res) => {
  // Validazione: deve essere un oggetto
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Il file JSON deve essere un oggetto (non un array)."
    });
  }

  memoryDB = req.body;
  reloadRouter(); // 🔥 Ricrea il router
  res.json({ ok: true, message: "Dati aggiornati in memoria" });
});

// 3️⃣ JSON Server che usa la memoria invece del file
app.use('/', (req, res, next) => {
  router(req, res, next);
});

// Avvio server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});