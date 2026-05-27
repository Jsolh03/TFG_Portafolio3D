import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import DynamicCVPage from './pages/DynamicCVPage';
import DevPortal from './pages/DevPortal';
import Landing from './pages/Landing';
import LegalPage from './pages/LegalPage';
import CookieBanner from './components/ui/CookieBanner';
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
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/legal/:doc" element={<LegalPage />} />
          </Routes>
          <CookieBanner />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}
