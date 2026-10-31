// src/utils/preload.js

// Liste des pages à précharger
const pages = {
  dashboard: () => import('../pages/Dashboard'),
  clients: () => import('../pages/Clients'),
  commandes: () => import('../pages/Commandes'),
  equipage: () => import('../pages/Equipage'),
  journalCaisse: () => import('../pages/JournalCaisse'),
 
  catalogue: () => import('../pages/Catalogue'),
  depenses: () => import('../pages/Depenses'),
  tresors: () => import('../pages/Tresors'),
  ventes: () => import('../pages/Ventes'),
  equipe: () => import('../pages/Equipe'),
};

// Précharger une page
export function preloadPage(pageName) {
  if (pages[pageName]) {
    pages[pageName]();
  }
}

// Précharger toutes les pages au chargement initial
export function preloadAllPages() {
  Object.values(pages).forEach(loader => loader());
}