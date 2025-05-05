// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcastRoll() {
  const roll = Math.floor(Math.random() * 15);
  const message = JSON.stringify({ type: 'roll', value: roll });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected.');
  ws.send(JSON.stringify({ type: 'connected' }));
});

setInterval(broadcastRoll, 15000); // Roll every 5 seconds

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});