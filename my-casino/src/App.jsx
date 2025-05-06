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
          <Route path="/" element={<Roulette />} />

          <Route path="/mise" element={<Mise />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;