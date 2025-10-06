import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./utils/webVitals";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize Core Web Vitals monitoring
initWebVitals();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('%c[PWA] ✓ Service Worker registered', 'color: #10b981; font-weight: bold;');
        console.log('[PWA] Scope:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
        
        // Install prompt handling
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          console.log('%c[PWA] ✓ Install prompt available', 'color: #10b981; font-weight: bold;');
        });
      })
      .catch(error => {
        console.error('[PWA] ✗ Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
