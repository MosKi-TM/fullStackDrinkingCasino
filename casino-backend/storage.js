const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'bets.json');

function readBets() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { red: [], green: [], blue: [] }; // default if file doesn't exist or is invalid
  }
}

function writeBets(bets) {
  fs.writeFileSync(filePath, JSON.stringify(bets, null, 2));
}

module.exports = { readBets, writeBets };
