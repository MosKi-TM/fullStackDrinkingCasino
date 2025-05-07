const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { readBets, writeBets, saveData, loadData } = require('./storage');

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

let isSpinning = false;

// Store pending selections
let pendingSelections = {};
let users = {}; // To track users by socket.id
let clients = {};

let storedData = loadData();
storedData.users = [];
storedData.clients = [];
saveData(storedData);
storedData.drinksCount
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

// Function to broadcast roulette roll result along with winners and losers
function broadcastRoll() {
  isSpinning = true;
  const bets = readBets();
  const roll = Math.floor(Math.random() * 15); // Random number between 0 and 14
  const rollColor = determineColor(roll);
  
  // Determine winners and losers
  let mises = {
    red: bets.red.filter(bet => bet.mise > 0),
    green: bets.green.filter(bet => bet.mise > 0),
    blue: bets.blue.filter(bet => bet.mise > 0),
  };
  
  // Determine winners
  const winners = mises[rollColor].map(bet => ({
    name: bet.name,
    mise: rollColor === 'green' ? bet.mise * 8 : bet.mise * 2,
    couleur: rollColor,
  }));

  // Collect losers (everyone who didn't bet on the winning color)
  const losers = [];
  Object.keys(mises).forEach(color => {
    if (color !== rollColor) {
      mises[color].forEach(bet => {
        losers.push({
          name: bet.name,
          mise: color === 'green' ? bet.mise * 6 : bet.mise,
          couleur: color,
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


  setTimeout(() => {
    isSpinning = false;
    winners.forEach(winner => {
      const client = storedData.clients[winner.name]; // Assuming `clients` is a map of connected clients
      
      if (client) {
        console.log('client send win');
  
        // Create a set to collect unique player names who have placed bets
        const playerSet = new Set();
        
        // Filter out bets with mise > 0 for each color and add the names to the set
        Object.keys(mises).forEach(color => {
          mises[color].forEach(bet => {
            playerSet.add(bet.name); // Use Set to ensure names are unique
          });
        });
        // Convert the set to an array for the player list
        const playerList = Array.from(playerSet);
  
        // Send the player list to the client
        client.send(JSON.stringify({ type: 'select_recipient', playerList }));
  
        // Clear pending selection for the winner
        storedData.pendingSelections[winner.name] = null;
  
        // Save updated data to storage
        saveData(storedData);
      }
    });
  }, 6000);

  // Wait 15 seconds, then send result
  setTimeout(() => {
    const scoreboard = {};

    for (const winner of winners) {
      const selected = storedData.pendingSelections[winner.name];
      if (selected) {
        scoreboard[selected] = (scoreboard[selected] || 0) + winner.mise;
        storedData.drinksCount[selected] = (storedData.drinksCount[selected] || 0) + winner.mise;
      } else {
        // fallback: give drinks to yourself if no selection
        scoreboard[winner.name] = (scoreboard[winner.name] || 0) + winner.mise;
        storedData.drinksCount[winner.name] = (storedData.drinksCount[winner.name] || 0) + winner.mise;
      }
    }

    // Add drinks drunk by losers (they drink themselves)
    for (const loser of losers) {
      scoreboard[loser.name] = (scoreboard[loser.name] || 0) + loser.mise;
      storedData.drinksCount[loser.name] =  (storedData.drinksCount[loser.name] || 0) + loser.mise;
    }

    saveData(storedData);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'drinking', scoreboard, drinksCount: storedData.drinksCount}));
      }
    });

  }, 21000);

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

   // You can assign socket ID directly to the WebSocket instance
  const socketId = ws._socket.remoteAddress + ':' + ws._socket.remotePort;

  // When the client sends a message to set the username
  ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'set-username') {
          storedData.users[socketId] = data.username; // Store the username
          storedData.clients[data.username] = ws;
          saveData(storedData);
          console.log(`Username set for ${socketId}: ${data.username}`);
      }

      if (data.type === 'give_to') {
        if(pendingSelections[data.from] == null)
          storedData.pendingSelections[data.from] = data.to;
        saveData(storedData);
      }
  });
 
  // Handle disconnection
  ws.on('close', () => {
      console.log(`User disconnected: ${socketId}`);
      delete storedData.clients[storedData.users[socketId]];
      delete storedData.users[socketId]; // Clean up user info on disconnect
      saveData(storedData); // Save the data after user disconnect
  });
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

  if(!isSpinning){

    const bets = readBets();
    bets[couleur].push({ name, mise });
    writeBets(bets);
    broadcastBets();

    return res.json({ message: 'Mise bien reçu', data: { name, mise, couleur } });
  }else{
    return res.json({ message: 'Roulette En cours !', data: { name, mise, couleur } });
  }
});

app.get('/spin', (req, res) => {
  broadcastRoll();
  return res.json({ message: 'Spinning the wheel' });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
