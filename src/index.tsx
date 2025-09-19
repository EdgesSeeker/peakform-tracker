import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Service Worker deaktiviert um Cache-Probleme zu vermeiden
// Für Production kann es wieder aktiviert werden
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
*/

// Bestehende Service Worker entfernen
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ Service Worker entfernt');
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
