import { useState, useEffect } from 'react';
import Roulette from './component/Roulette';
import Mise from './component/Mise';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(null); // null = page d'accueil
  const [username, setUsername] = useState('');
  const [admin, setAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);

   useEffect(() => {
        //const socket = new WebSocket('ws://localhost:4000');

        const socket = new WebSocket('wss://fullstackdrinkingcasino-backend.onrender.com');
        setWs(socket);

        socket.onopen = () => {
            setIsConnected(true);
            console.log('Connected to WebSocket server');
        };

        socket.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const handleSetUsername = () => {
      if (ws && username) {
          const message = JSON.stringify({
              type: 'set-username',
              username: username,
          });
          ws.send(message); // Send the username to the server
      }
  };
  
  return (
    <div className="app-container">
      {activePage === null && (
        <div className="home">
          <h1>Bienvenue au Casino</h1>
          {isConnected ? (
                <div>
                    <h2>Connected to WebSocket</h2>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) =>{ 
                          setUsername(e.target.value)
                          if(e.target.value == 'admin'){
                            setAdmin(true);
                            
                          }
                          //handleSetUsername();
                        }}
                    />
                </div>
            ) : (
                <h2>Connecting...</h2>
            )}
          {admin && <button onClick={() => {
            handleSetUsername();
            setActivePage('roulette')}}>Accéder à la Roulette</button>}
          <button onClick={() => {
            handleSetUsername();
            setActivePage('mise')}}>Accéder à la Mise</button>
        </div>
      )}

      {activePage === 'roulette' && (
        <>
          <button onClick={() => setActivePage(null)}>← Retour</button>
          <Roulette socket={ws}/>
        </>
      )}

      {activePage === 'mise' && (
        <>
          <button onClick={() => setActivePage(null)}>← Retour</button>
          <Mise username={username} admin={admin} socket={ws}/>
        </>
      )}
    </div>
  );
}

export default App;
