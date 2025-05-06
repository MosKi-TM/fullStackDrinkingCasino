import './Mise.css';
import { useState } from 'react';
import { sendMise } from '../apiUsage';

export default function Mise() {
  const [response, setResponse] = useState('');
  const [username, setUsername] = useState('');
  const [mise, setMise] = useState(0); // numeric state

  const handleSend = (color) => {
    if (!username || mise <= 0) {
      setResponse('Please enter a username and add a mise.');
      return;
    }

    sendMise(response, setResponse, {
      name: username,
      mise: mise,
      couleur: color,
    });
  };

  const addToMise = (amount) => {
    setMise((prev) => prev + amount);
  };

  return (
    <div className='mise-wrapper'>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className="mise-controls">
        <p>Mise: {mise}</p>
        <button onClick={() => addToMise(1)}>+1</button>
        <button onClick={() => addToMise(2)}>+2</button>
        <button onClick={() => addToMise(5)}>+5</button>
      </div>

      <button onClick={() => handleSend('red')}>Rouge</button>
      <button onClick={() => handleSend('green')}>Vert</button>
      <button onClick={() => handleSend('blue')}>Bleu</button>

      <p>{response}</p>
    </div>
  );
}
