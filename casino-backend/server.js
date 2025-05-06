// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let bets = {
  red: [],
  green: [],
  blue: [],
};

// Helper function to broadcast updated bets to all WebSocket clients
function broadcastBets() {
  const message = JSON.stringify({
    type: 'bets',
    bets,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log(message)
    }
  });
}

// Helper function to broadcast roulette roll
function broadcastRoll() {
  const roll = Math.floor(Math.random() * 15);
  const message = JSON.stringify({ type: 'roll', value: roll });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  bets = {
    red: [],
    green: [],
    blue: [],
  };

  setTimeout(broadcastBets, 6000);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected.');
  ws.send(JSON.stringify({ type: 'connected' }));

  // Send current bets to the new client
  ws.send(JSON.stringify({ type: 'bets', bets }));
});

// Route for placing bets
app.post('/mise', (req, res) => {
  const { name, mise, couleur } = req.body;

  if (!name || !mise || !couleur) {
    return res.status(400).json({ message: 'Invalid data, please include name, mise, and couleur.' });
  }

  // Validate the color
  if (!['red', 'green', 'blue'].includes(couleur)) {
    return res.status(400).json({ message: 'Invalid color. Please choose between red, green, or blue.' });
  }

  console.log(mise)
  // Add the bet to the appropriate color
  bets[couleur].push({ name, mise });

  // Broadcast the updated bets to all WebSocket clients
  broadcastBets();

  return res.json({ message: 'Mise bien reçu', data: { name, mise, couleur } });
});

// Simulate the roulette spin every 15 seconds
setInterval(broadcastRoll, 15000); // Spin every 15 seconds

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
