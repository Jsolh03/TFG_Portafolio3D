import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import DynamicCVPage from './pages/DynamicCVPage';
import DevPortal from './pages/DevPortal';
import Landing from './pages/Landing';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dev" element={<DevPortal />} />
            <Route path="/cv/:userId" element={<DynamicCVPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}
