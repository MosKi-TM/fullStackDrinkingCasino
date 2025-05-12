import { useState, useEffect, useRef, useCallback } from 'react';
import Roulette from './component/Roulette';
import Mise from './component/Mise';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(null); // null = page d'accueil
  const [username, setUsername] = useState('');
  const [admin, setAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const pendingUsernameRef = useRef('');

  useEffect(() => {
    let reconnectInterval = 3000;
    let shouldAttemptReconnect = true;

    const connectWebSocket = () => {
      //const socket = new WebSocket('ws://localhost:4000');
      const socket = new WebSocket('wss://fullstackdrinkingcasino-backend.onrender.com');
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('✅ Connected to WebSocket server');

        // Resend the username if it was set before
        if (pendingUsernameRef.current) {
          socket.send(JSON.stringify({
            type: 'set-username',
            username: pendingUsernameRef.current,
          }));
          console.log('🔁 Resent username after reconnect:', pendingUsernameRef.current);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from WebSocket server');
        if (shouldAttemptReconnect) {
          setTimeout(connectWebSocket, reconnectInterval);
        }
      };

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
        socket.close();
      };
    };

    connectWebSocket();

    return () => {
      shouldAttemptReconnect = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSetUsername = useCallback(() => {
    if (username) {
      pendingUsernameRef.current = username; // Save the username for reconnects
      const socket = wsRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'set-username',
          username,
        }));
        console.log('✅ Sent username:', username);
      }
    }
  }, [username]);

  return (
    <div className="app-container">
      {activePage === null && (
        <div className="home">
          <h1>Bienvenue au Casino</h1>
          {isConnected ? (
            <div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  const value = e.target.value;
                  setUsername(value);
                  if (value === 'admin') {
                    setAdmin(true);
                  }
                }}
              />
              <div>
              <button onClick={() => {
                handleSetUsername();
                setActivePage('roulette');
              }}>Accéder à la Roulette</button>
              <button onClick={() => {
                handleSetUsername();
                setActivePage('mise');
              }}>Accéder à la Mise</button>
            </div>
            </div>
            
          ) : (
            <h2>Connecting...</h2>
          )}
          
        </div>
      )}

      {activePage === 'roulette' && (
        <>
          <Roulette socket={wsRef.current} />
        </>
      )}

      {activePage === 'mise' && (
        <>
          <Mise username={username} admin={admin} socket={wsRef.current} />
        </>
      )}
    </div>
  );
}

export default App;
