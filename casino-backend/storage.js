const fs = require('fs');
const path = require('path');

// Define paths for storage files
const betsFilePath = path.join(__dirname, 'bets.json');
const dataFilePath = path.join(__dirname, 'data.json');

// Bets storage functions
function readBets() {
  try {
    const data = fs.readFileSync(betsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { red: [], green: [], blue: [] }; // default if file doesn't exist or is invalid
  }
}

function writeBets(bets) {
  try {
    fs.writeFileSync(betsFilePath, JSON.stringify(bets, null, 2));
  } catch (err) {
    console.error('Error saving bets:', err);
  }
}

// Data storage functions (for users, clients, and pendingSelections)
function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(data);
    } else {
      return { pendingSelections: {}, users: {}, clients: {} }; // default structure
    }
  } catch (err) {
    console.error('Error loading data:', err);
    return { pendingSelections: {}, users: {}, clients: {} }; // default structure
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

module.exports = { readBets, writeBets, loadData, saveData };
