const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const app = express();
app.use(cors());

// Percorso del file persistente incluso nel deploy
const filePath = path.join(__dirname, 'assets', 'db.json');

// Carica il file in memoria
let memoryDB = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Router dinamico
let router = jsonServer.router(memoryDB);
const middlewares = jsonServer.defaults();

// Funzione per ricreare il router quando memoryDB cambia
function reloadRouter() {
  router = jsonServer.router(memoryDB);
}

// SOLO i tuoi endpoint usano express.json()
app.use('/update', express.json());
app.use('/backup', express.json());

// 1️⃣ Backup
app.get('/backup', (req, res) => {
  res.json(memoryDB);
});

// 2️⃣ Update
app.post('/update', (req, res) => {
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Il file JSON deve essere un oggetto." });
  }

  memoryDB = req.body;
  reloadRouter();
  res.json({ ok: true, message: "Dati aggiornati in memoria" });
});

// JSON Server NON deve usare express.json()
app.use('/', middlewares, (req, res, next) => {
  router(req, res, next);
});

// Avvio server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});