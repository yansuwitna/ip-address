const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS store (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).run();

// API to get all data at once
app.get('/api/store/all', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM store').all();
    const data = {};
    rows.forEach(row => {
      data[row.key] = JSON.parse(row.value);
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API to get a specific key
app.get('/api/store/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM store WHERE key = ?').get(req.params.key);
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read key' });
  }
});

// API to save a specific key
app.post('/api/store/:key', (req, res) => {
  try {
    const valueStr = JSON.stringify(req.body);
    db.prepare('INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)').run(req.params.key, valueStr);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save key' });
  }
});

// API to clear all storage
app.delete('/api/store/all', (req, res) => {
  try {
    db.prepare('DELETE FROM store').run();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to wipe data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
