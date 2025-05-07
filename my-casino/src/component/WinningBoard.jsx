import './WinningBoard.css';
import { useRef, useEffect, useState } from 'react';

const avatarColors = {};

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#845EC2'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function WinningBoard({ drinkData, setDrinkResults}) {
  // Trier les joueurs par nombre de gorgées (du plus grand au plus petit)
  const sortedDrinkData = Object.entries(drinkData).sort((a, b) => b[1] - a[1]);
     const [winningBoardTimer, setWinningBoardTimer] = useState(0);
    
      useEffect(() => {
        if (Object.keys(drinkData).length > 0) {
          setWinningBoardTimer(30);
          const interval = setInterval(() => {
            setWinningBoardTimer((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setDrinkResults({}); // Hide the WinningBoard after 30s
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(interval);
        }
      }, []);

  return (
    <div className="winning-board">
        <div className="timer-bar-container">
      <div
        className="timer-bar-fill"
        style={{ width: `${(winningBoardTimer / 30) * 100}%` }}
      ></div>
    </div>
      <h2>🍻 Gorgées à boire</h2>
      {sortedDrinkData.length === 0 ? (
        <p>Aucun joueur n’a reçu de gorgées.</p>
      ) : (
        <ul>
          {sortedDrinkData.map(([name, amount], index) => {
            if (!avatarColors[name]) {
                avatarColors[name] = getRandomColor();
              }
              const avatarColor = avatarColors[name];
            
            
            return(
            <li style={{ display:'flex', alignItems:'center' }} key={index}>
              <div className="avatar" style={{ backgroundColor: avatarColor }}>
                      {name.charAt(0).toUpperCase()}
                    </div> <strong>{name}</strong>: {amount} gorgées
            </li>
          )})}
        </ul>
      )}
    </div>
  );
}
