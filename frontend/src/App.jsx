import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OrbitVisualization from './pages/OrbitVisualization';
import AIPredictionPage from './pages/AIPredictionPage';
import DebrisMonitoring from './pages/DebrisMonitoring';
import SatelliteAnalytics from './pages/SatelliteAnalytics';
import SystemLogs from './pages/SystemLogs';
import Navbar from './components/Common/Navbar';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      <main className="app-shell">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#00ff88',
            border: '1px solid #00ff88',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/visualization" element={
          <ProtectedRoute>
            <OrbitVisualization />
          </ProtectedRoute>
        } />
        <Route path="/ai-prediction" element={
          <ProtectedRoute>
            <AIPredictionPage />
          </ProtectedRoute>
        } />
        <Route path="/debris" element={
          <ProtectedRoute>
            <DebrisMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <SatelliteAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/logs" element={
          <ProtectedRoute>
            <SystemLogs />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
