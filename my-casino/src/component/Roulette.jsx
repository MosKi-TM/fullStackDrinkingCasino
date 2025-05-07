import React, { useRef, useState, useEffect } from 'react';
import './Roulette.css';
import WinningBoard from './WinningBoard';

const avatarColors = {};

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#845EC2'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const frcolor = {red:'Rouge', green:'Vert', blue:'Noir'}
const winning_color = {red:'red', green:'green', blue:'black'}

export default function Roulette({socket}) {
  const rowRef = useRef(null);
  const [bets, setBets] = useState({ red: [], green: [], blue: [] });

  const [winners, setWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [rollResult, setRollResult] = useState(null);
  const [pendingRollData, setPendingRollData] = useState(null);
  const [drinkResults, setDrinkResults] = useState({});

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;
  
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data)
      // Handle the roll message (spin result)
      if (data.type === 'roll') {
        spinWheel(data.value, data);
        setDrinkResults({});
        setIsTimerActive(false);
      }

      // Handle the bets update message
      if (data.type === 'bets') {
        setBets(data.bets); // Update the bets state when a new bet is placed
        console.log(data)
      }

      if (data.type === 'drinking') {
        console.log()
        console.log(data.scoreboard)
        setDrinkResults(data.scoreboard || {});
        console.log(drinkResults);
        setTimeLeft(38);
        setIsTimerActive(true);
      }
    };

    //return () => socket.close(); // Clean up the WebSocket connection
  }, [socket]);

  const spinWheel = (roll, data) => {
    const order = [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4];
    const position = order.indexOf(roll);

    const rows = 12;
    const cardWidth = 75 + 3 * 2; // 75px + 6px margin
    const landingPosition = (rows * 15 * cardWidth) + (position * cardWidth);
    const randomize = Math.floor(Math.random() * 75) - (75 / 2);
    const finalPosition = landingPosition + randomize;

    const bezier = {
      x: Math.floor(Math.random() * 50) / 100,
      y: Math.floor(Math.random() * 20) / 100,
    };

    const row = rowRef.current;

    if (row) {
      row.style.transitionTimingFunction = `cubic-bezier(0, ${bezier.x}, ${bezier.y}, 1)`;
      row.style.transitionDuration = '6s';
      row.style.transform = `translate3d(-${finalPosition}px, 0, 0)`;

      setTimeout(() => {
        row.style.transitionTimingFunction = '';
        row.style.transitionDuration = '';
        const resetTo = -(position * cardWidth + randomize);
        row.style.transform = `translate3d(${resetTo}px, 0, 0)`;
        console.log('update winners')
          setWinners(data.winners || []);
          setLosers(data.losers || []);
          setRollResult({
            value: data.value,
            color: data.color
          });
        }, 6000);
    }
  };

  const cards = [
    { number: 1, color: 'red' },
    { number: 14, color: 'black' },
    { number: 2, color: 'red' },
    { number: 13, color: 'black' },
    { number: 3, color: 'red' },
    { number: 12, color: 'black' },
    { number: 4, color: 'red' },
    { number: 0, color: 'green' },
    { number: 11, color: 'black' },
    { number: 5, color: 'red' },
    { number: 10, color: 'black' },
    { number: 6, color: 'red' },
    { number: 9, color: 'black' },
    { number: 7, color: 'red' },
    { number: 8, color: 'black' },
  ];

  const repeatedCards = Array.from({ length: 29 }, () => cards).flat();

  return (
  <div className='game-wrapper'>
    {Object.keys(drinkResults).length > 0 && <WinningBoard drinkData={drinkResults} setDrinkResults={setDrinkResults}/>}

    <div className="timer-bar-container">
      <div
        className="timer-bar-fill"
        style={{ width: `${(timeLeft / 40) * 100}%` }}
      ></div>
    </div>

    <div className="roulette-wrapper">
      <div className="selector"></div>
      <div className="wheel">
        <div className="row" ref={rowRef}>
          {repeatedCards.map((card, index) => (
            <div key={index} className={`card ${card.color}`}>
              {card.number}
            </div>
          ))}
        </div>
      </div>

      
    </div>
    {/* Display the bets */}
    <div className="bets-container">
        {['red', 'green', 'blue'].map((color) => (
          <div key={color} className={`bet-box ${color}`}>
            <h3>Pari {frcolor[color]} </h3>
            {bets[color].length === 0 ? (
              <p>No bets placed yet!</p>
            ) : (
              bets[color].map((bet, index) => {
                if (!avatarColors[bet.name]) {
                  avatarColors[bet.name] = getRandomColor();
                }
                const avatarColor = avatarColors[bet.name];
              
                return (
                  <div key={index} className="bet-item">
                    <div className="avatar" style={{ backgroundColor: avatarColor }}>
                      {bet.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="bet-text">
                      {bet.name}: <span>{bet.mise} gorgées</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
