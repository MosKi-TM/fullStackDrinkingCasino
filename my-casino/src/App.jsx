import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Updated imports
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Roulette from './component/Roulette'
import './App.css'
import Mise from './component/Mise'


function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Updated Route component for React Router v6 */}
          <Route path="/roulette" element={<Roulette />} />

          <Route path="/mise" element={<Mise />} />

          {/* Optionally, set a default route if needed */}
          <Route path="/" element={<h2>Welcome to the Roulette and Mise Game</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;