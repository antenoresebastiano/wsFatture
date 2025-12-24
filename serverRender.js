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

// 1️⃣ Endpoint per scaricare il file attuale (backup)
app.get('/backup', (req, res) => {
  res.json(memoryDB);
});

// 2️⃣ Endpoint per aggiornare il file in memoria
app.post('/update', (req, res) => {
  memoryDB = req.body;
  res.json({ ok: true, message: "Dati aggiornati in memoria" });
});

// 3️⃣ JSON Server che usa la memoria invece del file
const router = jsonServer.router(memoryDB);
app.use('/api', router);

// Avvio server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});