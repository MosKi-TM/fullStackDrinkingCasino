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

  const [drinkCount, setDrinkCount] = useState({});

  const [centerIndex, setCenterIndex] = useState(null);
  const animationFrameRef = useRef();
  
  const startTrackingCenterCard = () => {
    const row = rowRef.current;
    if (!row) return;
  
    const cardWidth = 75 + 3 * 2;
    const containerWidth = row.parentElement.offsetWidth;
  
    const update = () => {
      // Extract current transform value
      const transform = window.getComputedStyle(row).transform;
      if (transform !== 'none') {
        const matrix = new WebKitCSSMatrix(transform);
        const translateX = Math.abs(matrix.m41);
  
        // Center of the container
        const centerX = translateX + containerWidth / 2;
  
        // Determine which card is visually centered
        const index = Math.floor(centerX / cardWidth);
        setCenterIndex(index);
      }
  
      animationFrameRef.current = requestAnimationFrame(update);
    };
  
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(update);
  };
  
  const stopTrackingCenterCard = () => {
    cancelAnimationFrame(animationFrameRef.current);
  };

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
        setDrinkCount(data.drinksCount ||{})
        
        console.log(drinkResults);
        setTimeLeft(38);
        setIsTimerActive(true);
        setRollResult(null)
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
      startTrackingCenterCard();
      row.style.transitionTimingFunction = `cubic-bezier(0, ${bezier.x}, ${bezier.y}, 1)`;
      row.style.transitionDuration = '6s';
      row.style.transform = `translate3d(-${finalPosition}px, 0, 0)`;

      setTimeout(() => {
        stopTrackingCenterCard();
        row.style.transitionTimingFunction = '';
        row.style.transitionDuration = '';
        const resetTo = -(position * cardWidth + randomize);

        const containerWidth = row.parentElement.offsetWidth;
        const centerX = Math.abs(resetTo) + containerWidth / 2;
        const finalIndex = Math.floor(centerX / cardWidth);
        setCenterIndex(finalIndex % repeatedCards.length); // Keep it big

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
  
  const topDrinkers = Object.entries(drinkCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
  return (
  <div className='game-wrapper'>
    <div className="leaderboard">
    <h3>Top 10 Buveurs</h3>
    <ol>
      {
        
      topDrinkers.map(([name, count], index) => (
        <li key={index}>
          {name}: {count} 🍻
        </li>
      ))}
    </ol>
  </div>

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
            <div
              key={index}
              className={`card ${card.color} ${index === centerIndex ? 'active' : ''}`}
            >
              {card.number}
            </div>
          ))}
          </div>
      </div>

      
    </div>
    {/* Display the bets */}
    <div className="bets-container">
  {['red', 'green', 'blue'].map((color) => {
    const isWinningColor = rollResult?.color === color;
    const isResultDisplayed = !!rollResult;
    const isDrinking = Object.keys(drinkResults).length > 0;

    const betBoxClass = `bet-box ${color} ${
      isResultDisplayed && !isDrinking
        ? isWinningColor
          ? 'winner-highlight'
          : 'blurred'
        : ''
    }`;

    return (
      <div key={color} className={betBoxClass}>
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
                <div
                  className="avatar"
                  style={{ backgroundColor: avatarColor }}
                >
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
    );
  })}
</div>

    </div>
  );
}
