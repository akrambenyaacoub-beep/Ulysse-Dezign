// src/components/Sidebar.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

// ============================================================
// CONFIGURATION DES MENUS
// ============================================================
const MENU_STRUCTURE = [
  {
    id: 'main',
    label: 'Principal',
    icon: 'home',
    roles: ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user'],
    items: [
      { 
        path: '/dashboard', 
        label: 'Tableau de bord', 
        icon: 'dashboard',
        roles: ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user']
      },
      { 
        path: '/equipage', 
        label: '👷 Équipage', 
        icon: 'groups',
        roles: ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user'],
        priority: true
      },
      { 
        path: '/equipage-stats', 
        label: '📊 Stats Équipage', 
        icon: 'analytics',
        roles: ['admin']
      },
      { 
        path: '/planning', 
        label: '📅 Planning', 
        icon: 'event_note',
        roles: ['admin', 'gestionnaire', 'commercial', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user']
      },
    ]
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: 'storefront',
    roles: ['admin', 'gestionnaire', 'commercial', 'designer', 'agent_financier', 'imprimeur'],
    items: [
      { path: '/clients', label: '👥 Clients', icon: 'people', roles: ['admin', 'gestionnaire', 'commercial', 'designer', 'imprimeur'] },
      { path: '/commandes', label: '📦 Commandes', icon: 'shopping_cart', roles: ['admin', 'gestionnaire', 'commercial', 'designer', 'agent_financier', 'imprimeur'] },
      { path: '/ventes', label: '💰 Ventes', icon: 'trending_up', roles: ['admin', 'gestionnaire', 'commercial', 'agent_financier'] },
      { path: '/factures', label: '🧾 Factures', icon: 'description', roles: ['admin', 'gestionnaire', 'commercial', 'comptable', 'agent_financier'] },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'account_balance',
    roles: ['admin', 'gestionnaire', 'comptable', 'agent_financier'],
    items: [
      { path: '/journal-caisse', label: '📒 Journal de caisse', icon: 'receipt', roles: ['admin', 'gestionnaire', 'comptable', 'agent_financier'] },
      { path: '/depenses', label: '💸 Dépenses', icon: 'money_off', roles: ['admin', 'gestionnaire', 'comptable', 'agent_financier'] },
      { path: '/tresors', label: '🏦 Trésorerie', icon: 'savings', roles: ['admin', 'gestionnaire', 'comptable'] },
    ]
  },
  {
    id: 'production',
    label: 'Production',
    icon: 'brush',
    roles: ['admin', 'gestionnaire', 'technicien', 'designer', 'imprimeur'],
    items: [
      { path: '/catalogue', label: '📦 Catalogue', icon: 'inventory_2', roles: ['admin', 'gestionnaire', 'technicien', 'designer', 'agent_financier', 'imprimeur'] },
      { path: '/equipe', label: '👥 Équipe', icon: 'people_outline', roles: ['admin', 'gestionnaire'] },
    ]
  },
  {
    id: 'boutique',
    label: '🛍️ Boutique',
    icon: 'storefront',
    roles: ['admin', 'gestionnaire', 'commercial', 'designer', 'agent_financier', 'imprimeur', 'user'],
    items: [
      { path: '/boutique', label: '🛍️ Espace Vitrine', icon: 'shopping_bag', roles: ['admin', 'gestionnaire', 'commercial', 'designer', 'agent_financier', 'imprimeur', 'user'] },
      { path: '/admin/produits', label: '📦 Gestion Produits', icon: 'inventory', roles: ['admin', 'gestionnaire'] },
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'settings',
    roles: ['admin'],
    items: []
  }
];

const ROLE_COLORS = {
  admin: 'bg-red-500/20 text-red-400',
  gestionnaire: 'bg-blue-500/20 text-blue-400',
  commercial: 'bg-green-500/20 text-green-400',
  comptable: 'bg-purple-500/20 text-purple-400',
  technicien: 'bg-orange-500/20 text-orange-400',
  designer: 'bg-pink-500/20 text-pink-400',
  agent_financier: 'bg-teal-500/20 text-teal-400',
  imprimeur: 'bg-indigo-500/20 text-indigo-400',
  user: 'bg-gray-500/20 text-gray-400',
};

const ROLE_LABELS = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  commercial: 'Commercial',
  comptable: 'Comptable',
  technicien: 'Technicien',
  designer: 'Designer',
  agent_financier: 'Agent Financier',
  imprimeur: 'Imprimeur',
  user: 'Utilisateur',
};

const ROLE_ICONS = {
  admin: '👑',
  gestionnaire: '📋',
  commercial: '🤝',
  comptable: '🧾',
  technicien: '🔧',
  designer: '🎨',
  agent_financier: '💰',
  imprimeur: '🖨️',
  user: '👤',
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState({});
  const sidebarRef = useRef(null);

  const userRole = useMemo(() => {
    return profile?.role || profile?.type || profile?.niveau || 'user';
  }, [profile]);

  const filteredMenus = useMemo(() => {
    if (!profile) return [];

    return MENU_STRUCTURE
      .filter(section => {
        const hasRole = section.roles?.includes(userRole) ?? true;
        return hasRole;
      })
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const hasItemRole = item.roles?.includes(userRole) ?? true;
          return hasItemRole;
        })
      }))
      .filter(section => section.items.length > 0);
  }, [userRole, profile]);

  useEffect(() => {
    const activeSection = filteredMenus.find(section =>
      section.items.some(item => item.path === location.pathname)
    );
    if (activeSection) {
      setExpandedSections(prev => ({
        ...prev,
        [activeSection.id]: true
      }));
    }
  }, [location.pathname, filteredMenus]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const focusable = sidebarRef.current.querySelectorAll(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0]?.focus();
    }
  }, [isOpen]);

  if (filteredMenus.length === 0) {
    return (
      <aside className={`fixed top-0 left-0 h-full w-[270px] z-50 border-r flex flex-col items-center justify-center p-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0D1F3C]/80 backdrop-blur-xl border-[#1A3A6B]/50 text-gray-400' 
          : 'bg-white/80 backdrop-blur-xl border-gray-200 text-gray-600'
      }`}>
        <span className="material-symbols-outlined text-6xl text-gray-500">lock</span>
        <p className="text-center mt-4">Accès restreint</p>
        <p className="text-sm text-gray-500 mt-1">Rôle : {ROLE_LABELS[userRole] || userRole}</p>
        <button onClick={signOut} className="mt-6 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">Déconnexion</button>
      </aside>
    );
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (section) =>
    section.items.some(item => item.path === location.pathname);

  const getRoleBadge = () => {
    const color = ROLE_COLORS[userRole] || ROLE_COLORS.user;
    const label = ROLE_LABELS[userRole] || userRole;
    const icon = ROLE_ICONS[userRole] || '👤';
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      {/* ✅ Sidebar avec EFFET GLASS MODERNE + BOUTON CACHER/AFFICHER */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-[270px] z-50
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-2xl shadow-black/30
          border-r
          ${isDark 
            ? 'bg-[#0D1F3C]/60 border-[#1A3A6B]/30 text-gray-300' 
            : 'bg-white/60 border-white/20 text-gray-700'
          }
          backdrop-blur-2xl
          backdrop-saturate-150
        `}
        role="navigation"
        aria-label="Menu principal"
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* ✅ En-tête avec logo + BOUTON CACHER/AFFICHER */}
        <div className={`flex items-center justify-between px-5 h-16 border-b flex-shrink-0 ${
          isDark ? 'border-[#1A3A6B]/20' : 'border-white/10'
        }`}>
          <Link to="/" className="flex items-center gap-3" onClick={() => onClose?.()}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F0C75E] to-[#d4aa3a] flex items-center justify-center shadow-lg shadow-[#F0C75E]/25">
              <span className="material-symbols-outlined text-[#071325] text-xl">print</span>
            </div>
            <div>
              <h1 className={`font-['Playfair_Display'] text-xl font-bold tracking-wide ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Ulysse<span className="text-[#F0C75E]">Dezign</span>
              </h1>
            </div>
          </Link>

          {/* ✅ BOUTON CACHER/AFFICHER LA SIDEBAR */}
          <button
            onClick={() => onClose?.()}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark 
                ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'
              }
            `}
            aria-label={isOpen ? 'Cacher la sidebar' : 'Afficher la sidebar'}
            title={isOpen ? 'Cacher la sidebar' : 'Afficher la sidebar'}
          >
            <span className="material-symbols-outlined text-xl">
              {isOpen ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        {/* Badge rôle */}
        <div className={`flex items-center gap-3 px-5 py-3 border-b flex-shrink-0 ${
          isDark ? 'border-[#1A3A6B]/20' : 'border-white/10'
        }`}>
          {getRoleBadge()}
          <span className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {profile?.email}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-[#F0C75E] scrollbar-track-transparent">
          {filteredMenus.map((section) => {
            const isExpanded = expandedSections[section.id] || isSectionActive(section);
            const hasActiveChild = isSectionActive(section);

            return (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${hasActiveChild 
                      ? 'text-[#F0C75E] bg-[#F0C75E]/10 border border-[#F0C75E]/20' 
                      : isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-xl flex-shrink-0">{section.icon}</span>
                    <span className="text-sm font-medium truncate">{section.label}</span>
                  </div>
                  <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className={`ml-3 pl-3 border-l space-y-0.5 py-1.5 ${
                    isDark ? 'border-[#1A3A6B]/30' : 'border-white/20'
                  }`}>
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose?.();
                          }}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg
                            transition-all duration-200 group relative
                            ${active
                              ? `text-white ${isDark ? 'bg-[#F0C75E]/20 border border-[#F0C75E]/30' : 'bg-[#F0C75E]/15 border border-[#F0C75E]/30'}`
                              : item.priority
                                ? isDark
                                  ? 'text-gray-300 hover:text-white hover:bg-white/10 border border-[#F0C75E]/10'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/30 border border-gray-200/30'
                                : isDark
                                  ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/30'
                            }
                          `}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
                          <span className="text-sm font-medium truncate">{item.label}</span>
                          {item.priority && (
                            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#F0C75E]/20 text-[#F0C75E] font-medium">⭐</span>
                          )}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#F0C75E] shadow-lg shadow-[#F0C75E]/50" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Pied de page */}
        <div className={`flex items-center justify-between gap-2 flex-shrink-0 border-t p-3 ${
          isDark ? 'border-[#1A3A6B]/20' : 'border-white/10'
        }`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/30'
            }`}
            aria-label="Changer de thème"
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-sm font-medium hidden sm:inline">
              {isDark ? 'Clair' : 'Sombre'}
            </span>
          </button>

          <button
            onClick={signOut}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              isDark 
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-medium hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}