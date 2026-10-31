// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ============================================================
// PERMISSIONS PAR ROUTE
// ============================================================
const ROUTE_PERMISSIONS = {
  '/dashboard': ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user'],
  '/catalogue': ['admin', 'gestionnaire', 'technicien', 'designer', 'agent_financier', 'imprimeur'],
  '/clients': ['admin', 'gestionnaire', 'commercial', 'designer', 'imprimeur'],
  '/fournisseurs': ['admin', 'gestionnaire', 'commercial'],
  '/journal-caisse': ['admin', 'gestionnaire', 'comptable', 'agent_financier'],
  '/devis': ['admin', 'gestionnaire', 'commercial', 'designer'],
  '/factures': ['admin', 'gestionnaire', 'commercial', 'comptable', 'agent_financier'],
  '/commandes': ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur'],
  '/depenses': ['admin', 'gestionnaire', 'comptable', 'agent_financier'],
  '/ventes': ['admin', 'gestionnaire', 'commercial', 'agent_financier'],
  '/equipage': ['admin', 'gestionnaire', 'commercial', 'comptable', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user'],
  '/equipage-stats': ['admin'],
  '/tresors': ['admin', 'gestionnaire', 'comptable'],
  '/equipe': ['admin', 'gestionnaire'],
  '/parametres': ['admin'],
  '/utilisateurs': ['admin'],
  '/rapports': ['admin', 'comptable', 'agent_financier'],
  '/mouvements-stock': ['admin', 'gestionnaire'],
  '/inventaire': ['admin', 'gestionnaire'],
  '/planning': ['admin', 'gestionnaire', 'commercial', 'technicien', 'designer', 'agent_financier', 'imprimeur', 'user'],
};

const ROLE_REDIRECTS = {
  admin: '/dashboard',
  gestionnaire: '/dashboard',
  commercial: '/clients',
  comptable: '/journal-caisse',
  technicien: '/catalogue',
  designer: '/clients',
  agent_financier: '/commandes',
  imprimeur: '/catalogue',
  user: '/dashboard',
};

// ============================================================
// COMPOSANT PROTECTED ROUTE
// ============================================================
export default function ProtectedRoute({ children }) {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // ⏳ CHARGEMENT
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A1628]">
        <div className="w-10 h-10 border-2 border-[#F0C75E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔒 PAS DE PROFIL → REDIRECTION VERS LOGIN
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // 🏠 PAGE D'ACCUEIL
  const userRole = profile?.role || profile?.type || profile?.niveau || 'user';

  if (currentPath === '/') {
    const redirectTo = ROLE_REDIRECTS[userRole] || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  // ✅ VÉRIFIER SI CHILDREN EXISTE
  if (!children) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A1628]">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#F0C75E] mb-4">Erreur de rendu</h1>
          <p className="text-gray-400">Le contenu de la page n'a pas été chargé.</p>
        </div>
      </div>
    );
  }

  // 🛡️ VÉRIFICATION DES PERMISSIONS
  const allowedRoles = ROUTE_PERMISSIONS[currentPath];
  
  if (!allowedRoles) {
    return children;
  }

  if (!allowedRoles.includes(userRole)) {
    const redirectTo = ROLE_REDIRECTS[userRole] || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}