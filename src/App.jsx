import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import AuthProvider from './hooks/useAuth'; 
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Commandes from './pages/Commandes';
import Depenses from './pages/Depenses';
import Equipage from './pages/Equipage';
import Tresors from './pages/Tresors';
import Equipe from './pages/Equipe';
import Ventes from './pages/Ventes';
import Catalogue from './pages/Catalogue';
import JournalCaisse from './pages/JournalCaisse';
import EquipageStats from './pages/EquipageStats';
import Boutique from './pages/Boutique';
import Panier from './pages/Panier';
import Planning from './pages/Planning'; // ✅ Import Planning

// Pages admin
import AdminProduits from './pages/Admin/AdminProduits';

// Pages client web
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientDashboard from './pages/ClientDashboard';

// Hook personnalisé pour la plateforme native
import { useNativePlatform } from './hooks/useNativePlatform';

function App() {
  const { isNative, platform } = useNativePlatform();

  useEffect(() => {
    const initNativeApp = async () => {
      // Uniquement si on est en mode natif (iOS/Android)
      if (isNative) {
        try {
          // 1. Cacher le splash screen
          await SplashScreen.hide();
          
          // 2. Configurer la status bar
          await StatusBar.setStyle({ style: 'LIGHT' });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
          
          // 3. Désactiver le zoom par pincement
          document.addEventListener('gesturestart', (e) => e.preventDefault());
          
          // 4. Ajouter une classe CSS pour le mode natif
          document.body.classList.add('native-app');
          
          // 5. Désactiver le scroll "bounce" sur iOS
          if (platform === 'ios') {
            document.body.style.overscrollBehavior = 'none';
          }
          
          console.log(`✅ App native initialisée sur ${platform}`);
        } catch (error) {
          console.error('Erreur initialisation native:', error);
        }
      }
    };

    initNativeApp();
  }, [isNative, platform]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Routes PUBLIQUES (sans Layout) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/panier" element={<Panier />} />
            
            {/* Routes client web */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/register" element={<ClientRegister />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />

            {/* Routes ERP PROTÉGÉES AVEC LAYOUT */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/commandes" element={
              <ProtectedRoute>
                <Layout>
                  <Commandes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/catalogue" element={
              <ProtectedRoute>
                <Layout>
                  <Catalogue />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipage" element={
              <ProtectedRoute>
                <Layout>
                  <Equipage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tresors" element={
              <ProtectedRoute>
                <Layout>
                  <Tresors />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/depenses" element={
              <ProtectedRoute>
                <Layout>
                  <Depenses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ventes" element={
              <ProtectedRoute>
                <Layout>
                  <Ventes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipe" element={
              <ProtectedRoute>
                <Layout>
                  <Equipe />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/journal-caisse" element={
              <ProtectedRoute>
                <Layout>
                  <JournalCaisse />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipage-stats" element={
              <ProtectedRoute>
                <Layout>
                  <EquipageStats />
                </Layout>
              </ProtectedRoute>
            } />

            {/* ✅ Route PLANNING - CORRIGÉE avec Layout et ProtectedRoute */}
            <Route path="/planning" element={
              <ProtectedRoute>
                <Layout>
                  <Planning />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route ADMIN */}
            <Route path="/admin/produits" element={
              <ProtectedRoute>
                <Layout>
                  <AdminProduits />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirection 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;