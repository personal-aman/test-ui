import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import MainPage from './MainPage';

function App() {
  const isAuthenticated = true; // Change this to false to test the login functionality

  return (
      <div className="App">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/main" /> : <Login />} />
          <Route path="/main" element={isAuthenticated ? <MainPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
  );
}

export default App;