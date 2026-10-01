import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrasi Service Worker untuk PWA Offline & PWABuilder
if ('serviceWorker' in navigator && import.meta.env.MODE !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker terdaftar:', reg.scope);
      })
      .catch((err) => {
        console.log('PWA Service Worker gagal:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
