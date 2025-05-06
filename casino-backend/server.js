const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { readBets, writeBets } = require('./storage');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
// Initialize bets object for red, green, and blue colors
let bets = {
  red: [],
  green: [],
  blue: [],
};

// Helper function to broadcast updated bets to all WebSocket clients
function broadcastBets() {
  const bets = readBets();
  const message = JSON.stringify({ type: 'bets', bets });
  console.log(bets);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
// Helper function to broadcast roulette roll result along with winners and losers
function broadcastRoll() {
  const bets = readBets();
  const roll = Math.floor(Math.random() * 15); // Random number between 0 and 14
  const rollColor = determineColor(roll);
  
  // Determine winners and losers
  let mises = {
    red: bets.red.filter(bet => bet.mise > 0),
    green: bets.green.filter(bet => bet.mise > 0),
    blue: bets.blue.filter(bet => bet.mise > 0),
  };
  
  
  // Determine winners and losers
  const winners = mises[rollColor].map(bet => ({
    name: bet.name,
    mise: rollColor === 'green' ? bet.mise * 8 : bet.mise*2,
    couleur: rollColor
  }));

  // Collect losers (everyone who didn't bet on the winning color)
  const losers = [];
  Object.keys(mises).forEach(color => {
    if (color !== rollColor) {
      mises[color].forEach(bet => {
        losers.push({
          name: bet.name,
          mise: color === 'green' ? bet.mise * 6 : bet.mise,
          couleur: color
        });
      });
    }
  });
  
  

  // Broadcast the roll and results
  const message = JSON.stringify({
    type: 'roll',
    value: roll,
    color: rollColor,
    winners: winners,
    losers: losers,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  // Reset the bets after the round
  writeBets({ red: [], green: [], blue: [] });
  setTimeout(broadcastBets, 6000);
}

// Function to determine the color based on the roll value
function determineColor(roll) {
  const cards = [
    { number: 1, color: 'red' },
    { number: 14, color: 'blue' },
    { number: 2, color: 'red' },
    { number: 13, color: 'blue' },
    { number: 3, color: 'red' },
    { number: 12, color: 'blue' },
    { number: 4, color: 'red' },
    { number: 0, color: 'green' },
    { number: 11, color: 'blue' },
    { number: 5, color: 'red' },
    { number: 10, color: 'blue' },
    { number: 6, color: 'red' },
    { number: 9, color: 'blue' },
    { number: 7, color: 'red' },
    { number: 8, color: 'blue' },
  ];

  const card = cards.find(c => c.number === roll % 15);
  return card ? card.color : 'unknown';
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

  if (!['red', 'green', 'blue'].includes(couleur)) {
    return res.status(400).json({ message: 'Invalid color.' });
  }

  const bets = readBets();
  bets[couleur].push({ name, mise });
  writeBets(bets);
  broadcastBets();

  return res.json({ message: 'Mise bien reçu', data: { name, mise, couleur } });
});

app.get('/spin',  (req, res) => {
  broadcastRoll()
  return res.json({ message: 'Spinning the wheel'});
})

// Simulate the roulette spin every 15 seconds
//setInterval(broadcastRoll, 15000); // Roll every 15 seconds

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
