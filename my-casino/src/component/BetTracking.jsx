import React, { useState, useEffect } from 'react';

// Assuming WebSocket is used to listen to bets
const BetTracking = () => {
  const [bets, setBets] = useState({ red: [], green: [], blue: [] });

  useEffect(() => {
    // Example WebSocket setup, modify based on your backend
    const socket = new WebSocket('ws://localhost:4000'); // Connect to your WebSocket server

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data); // Receive the bet data

      // Assuming the data is like: { name: 'John', betAmount: 100, color: 'red' }
      const { name, betAmount, color } = data;

      // Update the state based on the received bet
      setBets((prevBets) => ({
        ...prevBets,
        [color]: [...prevBets[color], { name, betAmount }],
      }));
    };

    return () => {
      socket.close(); // Clean up the socket connection when the component unmounts
    };
  }, []);

  return (
    <div className='roulette-wrapper'>
      <div className='selector'></div>
      <div className='wheel'>
        <div className='row'>
          {/* You can map out cards or other roulette visuals here */}
        </div>
      </div>

      {/* Display the bets */}
      <div className='bets-container'>
        {['red', 'green', 'blue'].map((color) => (
          <div key={color} className={`bet-box ${color}`}>
            <h3>{color.charAt(0).toUpperCase() + color.slice(1)} Bets</h3>
            {bets[color].length === 0 ? (
              <p>No bets placed yet!</p>
            ) : (
              bets[color].map((bet, index) => (
                <div key={index} className='bet-item'>
                  <span>{bet.name}</span>: <span>{bet.betAmount} chips</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BetTracking;
