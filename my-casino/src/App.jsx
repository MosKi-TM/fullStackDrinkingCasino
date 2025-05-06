import { useState } from 'react';
import Roulette from './component/Roulette';
import Mise from './component/Mise';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(null); // null = page d'accueil
  const [username, setUsername] = useState('');
  const [admin, setAdmin] = useState(false);

  return (
    <div className="app-container">
      {activePage === null && (
        <div className="home">
          <h1>Bienvenue au Casino</h1>
          <input
          type="text"
          placeholder="Enter username"
          value={username}
          className='userName'
          onChange={(e) => {
              setUsername(e.target.value)
              if(e.target.value == 'admin'){
                  setAdmin(true);
              }
          }}
        />
          {admin && <button onClick={() => setActivePage('roulette')}>Accéder à la Roulette</button>}
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
          <Mise username={username} admin={admin}/>
        </>
      )}
    </div>
  );
}

export default App;
