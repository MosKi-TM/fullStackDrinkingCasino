import './Mise.css';
import { useState, useEffect } from 'react';
import { sendMise, spinRoulette } from '../apiUsage';

export default function Mise({ username, admin, socket }) {
  const [response, setResponse] = useState('');
  const [mise, setMise] = useState(0);
  const [recipientList, setRecipientList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [timer, setTimer] = useState(15);
  const [drinkCount, setDrinkCount] = useState(0);
  const [currentDrink, setCurrentDrink] = useState(0);
  const [animateMise, setAnimateMise] = useState(false);
  const [animateDrink, setAnimateDrink] = useState(false);
  const [animateCurrent, setAnimateCurrent] = useState(false);
  const [pendingData, setPendingData] = useState({})
  useEffect(() => {
    setAnimateMise(true);
    const timeout = setTimeout(() => setAnimateMise(false), 300);
    return () => clearTimeout(timeout);
  }, [mise]);
  
  useEffect(() => {
    setAnimateDrink(true);
    const timeout = setTimeout(() => setAnimateDrink(false), 300);
    return () => clearTimeout(timeout);
  }, [drinkCount]);
  
  useEffect(() => {
    setAnimateCurrent(true);
    const timeout = setTimeout(() => setAnimateCurrent(false), 300);
    return () => clearTimeout(timeout);
  }, [currentDrink]);
  

  useEffect(() => {
    if (showPopup) {

      setTimer(15); // reset timer when popup is shown
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowPopup(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showPopup]);


  useEffect(() => {
    //if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'select_recipient') {
        setRecipientList(data.playerList.filter(name => name !== username)); // exclude self
        setShowPopup(true);
      }

      if(data.type == 'drinking'){
        if(data.drinksCount[username]){
          setDrinkCount(data.drinksCount[username]);
        }

        if(data.scoreboard[username]){
          setCurrentDrink(data.scoreboard[username])
        }
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
      <div className="stats-container">
  <div className={`stat-card ${animateDrink ? 'animated-scale' : ''}`}>
    <div className="stat-label">Bu</div>
    <div className="stat-value">{drinkCount - currentDrink}</div>
  </div>
  
  <div className={`stat-card ${animateMise ? 'animated-scale' : ''}`}>
    <div className="stat-label">Mise</div>
    <div className="stat-value">{mise}</div>
  </div>

  <div className={`stat-card ${animateCurrent ? 'animated-scale' : ''}`}>
    <div className="stat-label">À boire</div>
    <div className="stat-value">{currentDrink}</div>
  </div>
</div>
        <button onClick={() => addToMise(1)}>+1</button>
        <button onClick={() => addToMise(2)}>+2</button>
        <button onClick={() => addToMise(5)}>+5</button>
      </div>

      <button onClick={() => handleSend('red')}>Rouge</button>
      <button onClick={() => handleSend('green')}>Vert</button>
      <button onClick={() => handleSend('blue')}>Noir</button>

      {false && (
        <div className="mise-controls">
          <button onClick={spinRoulette}>Spin Roulette</button>
        </div>
      )}

      <p>{response}</p>

      {showPopup && (
  <div className="popup-overlay">
    <div className="popup-window">
      <h3>Choisissez à qui donner vos gorgées :</h3>

      <div className="timer-bar-container">
      <div
        className="timer-bar-fill"
        style={{ width: `${(timer / 15) * 100}%` }}
      ></div>
    </div>

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
