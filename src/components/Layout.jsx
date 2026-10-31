// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import ChatWidget from './chat/ChatWidget';
import NotificationBell from './NotificationBell';

// ✅ Clé pour le localStorage
const SIDEBAR_STATE_KEY = 'sidebar_state';

export default function Layout({ children }) {
  const location = useLocation();
  const { profile, loading } = useAuth();

  // ✅ LOGS DE DÉBOGAGE
  console.log('📐 ===== Layout =====');
  console.log('📐 location:', location.pathname);
  console.log('📐 profile:', profile);
  console.log('📐 loading:', loading);
  console.log('📐 children:', children);

  // ✅ Récupérer l'état de la sidebar depuis localStorage
  const getInitialSidebarState = () => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return false;
    
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  };

  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // ✅ Sauvegarder l'état dans localStorage
  const setSidebarState = (state) => {
    setSidebarOpen(state);
    if (window.innerWidth >= 1024) {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(state));
    }
  };

  // ✅ Détection mobile + desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (saved !== null) {
          setSidebarOpen(saved === 'true');
        } else {
          setSidebarOpen(true);
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Fermer la sidebar sur mobile quand on change de page
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // ✅ Toggle sidebar (appelé par le bouton)
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarState(newState);
  };

  // ✅ Fermer la sidebar (appelé par Sidebar)
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // 🔄 AFFICHAGE DU LOADER PENDANT LE CHARGEMENT
  if (loading) {
    console.log('⏳ Layout: Chargement en cours...');
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A1628]">
        <div className="w-10 h-10 border-2 border-[#F0C75E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔒 REDIRECTION VERS LOGIN SI PAS DE PROFIL
  if (!profile) {
    console.log('🔴 Layout: Pas de profil, redirection vers /login');
    return children;
  }

  console.log('✅ Layout: Profil trouvé -', profile.full_name);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#071325] to-[#0A1628]">
      {/* ✅ Sidebar - peut être complètement cachée */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={toggleSidebar}
      />
      
      {/* ✅ Contenu principal avec marge adaptée */}
      <main 
        className={`
          flex-1 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? 'lg:ml-[270px]' : 'lg:ml-0'}
          bg-[#071325]/50
          w-full
          backdrop-blur-sm
        `}
      >
        {/* ✅ Barre supérieure améliorée avec effet glass */}
        <header className="sticky top-0 z-40 bg-[#071325]/80 backdrop-blur-xl border-b border-[#1A3A6B]/30 px-4 py-3 flex items-center justify-between">
          {/* ✅ Bouton toggle amélioré */}
          <button
            onClick={toggleSidebar}
            className={`
              p-2.5 rounded-xl transition-all duration-200
              ${sidebarOpen 
                ? 'bg-[#F0C75E]/10 text-[#F0C75E] hover:bg-[#F0C75E]/20' 
                : 'bg-[#0D1F3C] text-gray-400 hover:text-white hover:bg-[#1A3A6B]'
              }
              border border-[#1A3A6B]/30
              hover:scale-105 active:scale-95
              shadow-lg
            `}
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className="material-symbols-outlined text-xl">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
          
          {/* Titre de la page */}
          <div className="hidden md:flex items-center gap-2 text-white">
            <span className="text-sm font-medium text-gray-400">
              {location.pathname === '/' ? 'Accueil' : 
               location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 🔔 Notifications */}
            {!loading && profile && (
              <NotificationBell />
            )}
            
            {/* ✅ Profil amélioré */}
            {!loading && profile && (
              <div className="flex items-center gap-3 bg-[#0D1F3C]/50 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-[#1A3A6B]/30 hover:border-[#F0C75E]/20 transition-all duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0C75E] to-[#d4aa3a] flex items-center justify-center text-xs font-bold text-[#071325] shadow-lg shadow-[#F0C75E]/20">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block font-medium">
                  {profile.full_name}
                </span>
                <span className="text-[10px] text-gray-500 hidden lg:block">
                  {profile.role || 'Utilisateur'}
                </span>
              </div>
            )}
          </div>
        </header>
        
        {/* ✅ Contenu de la page avec animation */}
        <div className="p-4 lg:p-6 w-full animate-fadeIn">
          {children}
        </div>
        
        {/* Chat Widget */}
        {!loading && profile && (
          <ErrorBoundary>
            <ChatWidget />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}