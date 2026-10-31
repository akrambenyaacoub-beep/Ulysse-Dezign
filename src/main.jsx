// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ✅ Ignorer les erreurs de connexion des extensions Chrome
// Ces erreurs sont causées par les extensions et n'affectent pas votre application
if (typeof window !== 'undefined') {
  // 1. Filtrer les erreurs console
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    // Ignorer les erreurs liées aux extensions
    if (message.includes('Could not establish connection') || 
        message.includes('Receiving end does not exist') ||
        message.includes('Extension context invalidated') ||
        message.includes('Extension id') ||
        message.includes('chrome-extension')) {
      return; // Ignorer silencieusement
    }
    originalError.apply(console, args);
  };

  // 2. Ignorer les erreurs non capturées liées aux extensions
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message?.toString() || '';
    const stack = event.reason?.stack?.toString() || '';
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Extension context invalidated') ||
        stack.includes('chrome-extension')) {
      event.preventDefault();
      return;
    }
  });

  // 3. Ignorer les erreurs DOM liées aux extensions
  window.addEventListener('error', (event) => {
    const message = event.message?.toString() || '';
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Extension context invalidated') ||
        message.includes('chrome-extension')) {
      event.preventDefault();
      return;
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);