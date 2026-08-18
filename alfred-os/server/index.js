import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 4317;

// Middleware
app.use(express.json());

// Serve static files (production build)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API endpoints (placeholder)
app.get('/api/status', (req, res) => {
  res.json({ status: 'alfred-online', timestamp: new Date().toISOString() });
});

app.get('/api/vault', (req, res) => {
  res.json({ notes: [] });
});

app.get('/api/agents', (req, res) => {
  res.json({ squads: [] });
});

// WebSocket handler
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(JSON.stringify({ echo: message }));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Alfred OS Server running on http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
});
