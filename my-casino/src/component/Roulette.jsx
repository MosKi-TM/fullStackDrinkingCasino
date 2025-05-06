import React, { useRef, useState, useEffect } from 'react';
import './Roulette.css';

export default function Roulette() {
  const rowRef = useRef(null);
  const [bets, setBets] = useState({ red: [], green: [], blue: [] });

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle the roll message (spin result)
      if (data.type === 'roll') {
        spinWheel(data.value);
      }

      // Handle the bets update message
      if (data.type === 'bets') {
        setBets(data.bets); // Update the bets state when a new bet is placed
      }
    };

    return () => socket.close(); // Clean up the WebSocket connection
  }, []);

  const spinWheel = (roll) => {
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

  return (<>
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
            <h3>{color.charAt(0).toUpperCase() + color.slice(1)} Bets</h3>
            {bets[color].length === 0 ? (
              <p>No bets placed yet!</p>
            ) : (
              bets[color].map((bet, index) => (
                <div key={index} className="bet-item">
                  <span>{bet.name}</span>: <span>{bet.mise} gorgées</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </>
  );
}
