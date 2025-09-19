import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Service Worker für PWA (nur in Production)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('Neue Version verfügbar! Jetzt aktualisieren?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// In Development: Service Worker entfernen
if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ Development: Service Worker entfernt');
    }
  });
}

// Cache komplett löschen bei Development
if (process.env.NODE_ENV === 'development') {
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        caches.delete(name);
        console.log('🗑️ Browser-Cache gelöscht:', name);
      });
    });
  }
  
  // Zusätzlich: localStorage Version-Check (nur für Browser-Cache)
  const currentVersion = '1.0.0'; // Feste Version statt Date.now()
  const lastVersion = localStorage.getItem('peakform-version');
  
  if (lastVersion && lastVersion !== currentVersion) {
    console.log('🔄 Neue App-Version erkannt - nur Browser-Cache wird geleert');
    // Nur Browser-Caches löschen, localStorage behalten!
    // KEINE localStorage.clear() mehr!
  }
  
  localStorage.setItem('peakform-version', currentVersion);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
