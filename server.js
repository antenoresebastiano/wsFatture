
/*const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');*/
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import jsonServer from 'json-server';
import { CriptService } from './cript.service.js';


const app = express();
app.use(cors());

// Percorso del file persistente incluso nel deploy
const filePath = path.join(__dirname, 'assets', 'db.json');

// Carica il file in memoria
let memoryDB = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Router dinamico
let router = jsonServer.router(memoryDB);
const middlewares = jsonServer.defaults();

const criptService = new CriptService();

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

// Endpoint per ottenere i pazienti
 app.get('/api/pazienti', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'clienti.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  // Genera ID lato server
  const lista = data.map((paziente, index) => ({
    ...paziente,
    id: `P${String(index + 1).padStart(3, '0')}`
  }));

  res.json(lista);
});

app.get('/download/pazientiCript', (req, res) => {
  /*const filePath = path.join(__dirname, 'data', 'clienti.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  // Genera ID lato server
  const lista = data.map((paziente, index) => ({
    ...paziente,
    id: `P${String(index + 1).padStart(3, '0')}`
  }));

  // 🔐 Cripta la lista
  const encrypted = criptService.encrypt(JSON.stringify(lista));

  // Imposta intestazioni per il download
  res.setHeader('Content-Disposition', 'attachment; filename="pazienti.enc"');
  res.setHeader('Content-Type', 'application/octet-stream');

  // Invia il file criptato
  res.send(encrypted);*/

  const filePath = path.join(__dirname, 'data', 'clientiEncript.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  // Genera ID lato server
const lista = data.map((paziente, index) => {
  
  // Cripta ogni campo dell’oggetto
  const encryptedFields = Object.fromEntries(
    Object.entries(paziente).map(([key, value]) => [
      key,
      criptService.encrypt(String(value))
    ])
  );

  return {
    ...encryptedFields,
    id: `P${String(index + 1).padStart(3, '0')}`
  };
});


  res.json(lista);
  
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


