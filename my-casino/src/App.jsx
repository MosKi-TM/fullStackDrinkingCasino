import { useState } from 'react';
import Roulette from './component/Roulette';
import Mise from './component/Mise';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(null); // null = page d'accueil

  return (
    <div className="app-container">
      {activePage === null && (
        <div className="home">
          <h1>Bienvenue au Casino</h1>
          <button onClick={() => setActivePage('roulette')}>Accéder à la Roulette</button>
          <button onClick={() => setActivePage('mise')}>Accéder à la Mise</button>
        </div>
      )}

      {activePage === 'roulette' && (
        <>
          <button onClick={() => setActivePage(null)}>← Retour</button>
          <Roulette />
        </>
      )}

      {activePage === 'mise' && (
        <>
          <button onClick={() => setActivePage(null)}>← Retour</button>
          <Mise />
        </>
      )}
    </div>
  );
}

export default App;
