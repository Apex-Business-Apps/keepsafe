import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './routes/home.jsx';
import Items from './routes/items.jsx';
import Settings from './routes/settings.jsx';
import Billing from './routes/billing.jsx';
import { api } from './lib/api.js';

// Core Web Vitals logging
function logCoreWebVitals() {
  // Log LCP (Largest Contentful Paint)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    const lcp = lastEntry.startTime;
    const lcpVerdict = lcp <= 2500 ? 'OK' : 'Needs work';
    console.log(`LCP: ${lcp.toFixed(1)}ms (${lcpVerdict})`);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Log CLS (Cumulative Layout Shift)
  new PerformanceObserver((entryList) => {
    let clsValue = 0;
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    const clsVerdict = clsValue <= 0.1 ? 'OK' : 'Needs work';
    console.log(`CLS: ${clsValue.toFixed(3)} (${clsVerdict})`);
  }).observe({ entryTypes: ['layout-shift'] });

  // Log INP (Interaction to Next Paint) - using FID as approximation
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const inp = entry.processingStart - entry.startTime;
      const inpVerdict = inp <= 200 ? 'OK' : 'Needs work';
      console.log(`INP: ${inp.toFixed(1)}ms (${inpVerdict})`);
    }
  }).observe({ entryTypes: ['first-input'] });
}

// PWA Install prompt
function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallHint(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowInstallHint(false);
  };

  if (!showInstallHint) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000
    }}>
      <span style={{ fontSize: '14px' }}>Install KeepSafe for easy access</span>
      <div>
        <button
          onClick={() => setShowInstallHint(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            marginRight: '8px',
            cursor: 'pointer'
          }}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            backgroundColor: 'white',
            color: '#2563eb',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log Core Web Vitals on first load
    if (document.readyState === 'complete') {
      logCoreWebVitals();
    } else {
      window.addEventListener('load', logCoreWebVitals);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Check for existing auth token
    const token = localStorage.getItem('keepsafe_token');
    if (token) {
      api.setToken(token);
      setIsAuthenticated(true);
    } else {
      // Auto-login with demo token for MVP
      handleDemoLogin();
    }
    
    setLoading(false);
  }, []);

  const handleDemoLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('keepsafe_token', token);
        api.setToken(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('keepsafe_token');
    api.setToken(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Loading KeepSafe...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        padding: '16px'
      }}>
        <h1 style={{ marginBottom: '16px' }}>Welcome to KeepSafe</h1>
        <p style={{ marginBottom: '24px', textAlign: 'center', color: '#666' }}>
          Your home inventory and recall guardian
        </p>
        <button
          onClick={handleDemoLogin}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}

export default App;