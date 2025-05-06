import './Mise.css';
import { useState, useEffect } from 'react';
import { sendMise, spinRoulette } from '../apiUsage';

export default function Mise({ username, admin, socket }) {
  const [response, setResponse] = useState('');
  const [mise, setMise] = useState(0);
  const [recipientList, setRecipientList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    //if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'select_recipient') {
        setRecipientList(data.playerList.filter(name => name !== username)); // exclude self
        setShowPopup(true);
      }
    };

    socket.addEventListener('message', handleMessage);
    //return () => socket.removeEventListener('message', handleMessage);
  }, [socket, username]);

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
    setMise(0);
  };

  const addToMise = (amount) => {
    setMise((prev) => prev + amount);
  };

  const selectRecipient = (recipient) => {
    if (socket) {
      console.log('send', {
        type: 'give_to',
        from: username,
        to: recipient,
      })
      socket.send(JSON.stringify({
        type: 'give_to',
        from: username,
        to: recipient,
      }));
    }
    setShowPopup(false);
  };

  return (
    <div className='mise-wrapper'>
      <div className="mise-controls">
        <p>Mise: {mise}</p>
        <button onClick={() => addToMise(1)}>+1</button>
        <button onClick={() => addToMise(2)}>+2</button>
        <button onClick={() => addToMise(5)}>+5</button>
      </div>

      <button onClick={() => handleSend('red')}>Rouge</button>
      <button onClick={() => handleSend('green')}>Vert</button>
      <button onClick={() => handleSend('blue')}>Noir</button>

      {admin && (
        <div className="mise-controls">
          <button onClick={spinRoulette}>Spin Roulette</button>
        </div>
      )}

      <p>{response}</p>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-window">
            <h3>Choisissez à qui donner vos gorgées :</h3>
            {recipientList.length === 0 ? (
              <p>Aucun joueur disponible</p>
            ) : (
              recipientList.map((name, index) => (
                <button key={index} onClick={() => selectRecipient(name)}>
                  {name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
